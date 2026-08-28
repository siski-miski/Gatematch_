from __future__ import annotations

import html
import os
import re
import threading
import time
import urllib.request
from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.custom_script import CustomScript
from app.models.site_settings import SiteSettings
from app.models.tracking_settings import TrackingSettings

GA_ID_PATTERN = re.compile(r"^(?:G|GT|AW|DC)-[A-Za-z0-9_-]+$")
GTM_ID_PATTERN = re.compile(r"^GTM-[A-Za-z0-9]+$")
SC_CODE_PATTERN = re.compile(r"^[A-Za-z0-9._~+/=-]+$")

_INJECTION_CACHE_LOCK = threading.Lock()
_INJECTION_CACHE: Dict[str, object] = {
    "expires_at": 0.0,
    "head": "",
    "body_start": "",
    "body_end": "",
}

_TEMPLATE_CACHE_LOCK = threading.Lock()
_TEMPLATE_CACHE: Dict[str, object] = {
    "expires_at": 0.0,
    "html": "",
}


def invalidate_tracking_cache() -> None:
    with _INJECTION_CACHE_LOCK:
        _INJECTION_CACHE["expires_at"] = 0.0


def _get_or_create_tracking_settings(db: Session) -> TrackingSettings:
    row = db.query(TrackingSettings).first()
    if row:
        return row

    site_settings = db.query(SiteSettings).first()
    row = TrackingSettings(
        id=1,
        google_analytics_id=site_settings.google_analytics_id if site_settings else "",
        google_tag_manager_id=site_settings.google_tag_manager_id if site_settings else "",
        google_search_console_code=site_settings.search_console_verification_code if site_settings else "",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def _migrate_custom_scripts_if_needed(db: Session) -> None:
    existing_count = db.query(CustomScript).count()
    if existing_count > 0:
        return

    site_settings = db.query(SiteSettings).first()
    if not site_settings:
        return

    if site_settings.custom_header_scripts:
        db.add(CustomScript(location="header", content=site_settings.custom_header_scripts))
    if site_settings.custom_footer_scripts:
        db.add(CustomScript(location="footer", content=site_settings.custom_footer_scripts))
    db.commit()


def _build_google_analytics_html(analytics_id: str) -> str:
    return (
        "<!-- Google tag (gtag.js) -->\n"
        f"<script async src=\"https://www.googletagmanager.com/gtag/js?id={analytics_id}\"></script>\n\n"
        "<script>\n"
        "window.dataLayer = window.dataLayer || [];\n"
        "function gtag(){dataLayer.push(arguments);}\n"
        "gtag('js', new Date());\n\n"
        f"gtag('config', '{analytics_id}');\n"
        "</script>"
    )


def _build_gtm_head_html(tag_manager_id: str) -> str:
    return (
        "<script>\n"
        "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n"
        "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n"
        "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n"
        "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n"
        "})(window,document,'script','dataLayer','"
        + tag_manager_id
        + "');\n"
        "</script>"
    )


def _build_gtm_body_html(tag_manager_id: str) -> str:
    return (
        "<noscript>\n"
        f"<iframe src=\"https://www.googletagmanager.com/ns.html?id={tag_manager_id}\"\n"
        "height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe>\n"
        "</noscript>"
    )


def _build_search_console_meta(code: str) -> str:
    return f"<meta name=\"google-site-verification\" content=\"{html.escape(code)}\" />"


def _extract_search_console_code(value: str) -> str:
    trimmed = value.strip()
    if "google-site-verification" not in trimmed.lower():
        return trimmed

    match = re.search(r"""content\s*=\s*["']([^"']+)["']""", trimmed, re.IGNORECASE)
    if not match:
        return trimmed
    return html.unescape(match.group(1).strip())


def build_tracking_injections(db: Session) -> Dict[str, str]:
    row = _get_or_create_tracking_settings(db)
    _migrate_custom_scripts_if_needed(db)

    scripts = db.query(CustomScript).order_by(CustomScript.created_at.asc(), CustomScript.id.asc()).all()
    header_scripts = [s.content for s in scripts if s.location == "header" and s.content.strip()]
    body_scripts = [s.content for s in scripts if s.location == "body" and s.content.strip()]
    footer_scripts = [s.content for s in scripts if s.location == "footer" and s.content.strip()]

    head_parts = []
    body_start_parts = []
    body_end_parts = []

    analytics_id = (row.google_analytics_id or "").strip()
    if analytics_id and GA_ID_PATTERN.fullmatch(analytics_id):
        head_parts.append(_build_google_analytics_html(html.escape(analytics_id)))

    tag_manager_id = (row.google_tag_manager_id or "").strip()
    if tag_manager_id and GTM_ID_PATTERN.fullmatch(tag_manager_id):
        head_parts.append(_build_gtm_head_html(html.escape(tag_manager_id)))
        body_start_parts.append(_build_gtm_body_html(html.escape(tag_manager_id)))

    search_console_code = _extract_search_console_code(row.google_search_console_code or "")
    if search_console_code and SC_CODE_PATTERN.fullmatch(search_console_code):
        head_parts.append(_build_search_console_meta(search_console_code))

    if header_scripts:
        head_parts.append("\n".join(header_scripts))

    if body_scripts:
        body_start_parts.append("\n".join(body_scripts))

    if footer_scripts:
        body_end_parts.append("\n".join(footer_scripts))

    return {
        "head": "\n".join([part for part in head_parts if part]).strip(),
        "body_start": "\n".join([part for part in body_start_parts if part]).strip(),
        "body_end": "\n".join([part for part in body_end_parts if part]).strip(),
    }


def get_cached_tracking_injections(db: Session) -> Dict[str, str]:
    ttl = max(int(getattr(settings, "TRACKING_CACHE_TTL_SECONDS", 30)), 5)
    now = time.time()

    with _INJECTION_CACHE_LOCK:
        if now < float(_INJECTION_CACHE.get("expires_at", 0.0)):
            return {
                "head": str(_INJECTION_CACHE.get("head", "")),
                "body_start": str(_INJECTION_CACHE.get("body_start", "")),
                "body_end": str(_INJECTION_CACHE.get("body_end", "")),
            }

    injections = build_tracking_injections(db)

    with _INJECTION_CACHE_LOCK:
        _INJECTION_CACHE.update(
            {
                "head": injections.get("head", ""),
                "body_start": injections.get("body_start", ""),
                "body_end": injections.get("body_end", ""),
                "expires_at": now + ttl,
            }
        )

    return injections


def get_index_template() -> str:
    ttl = max(int(getattr(settings, "SSR_TEMPLATE_CACHE_TTL_SECONDS", 300)), 30)
    now = time.time()

    with _TEMPLATE_CACHE_LOCK:
        cached_html = str(_TEMPLATE_CACHE.get("html", ""))
        if cached_html and now < float(_TEMPLATE_CACHE.get("expires_at", 0.0)):
            return cached_html

    template_html = ""

    if getattr(settings, "SSR_INDEX_PATH", ""):
        template_path = settings.SSR_INDEX_PATH
        if os.path.exists(template_path):
            with open(template_path, "r", encoding="utf-8") as handle:
                template_html = handle.read()

    if not template_html and getattr(settings, "SSR_INDEX_URL", ""):
        try:
            req = urllib.request.Request(settings.SSR_INDEX_URL, headers={"User-Agent": "Connectov-ssr/1.0"})
            with urllib.request.urlopen(req, timeout=3) as response:
                template_html = response.read().decode("utf-8")
        except Exception:
            template_html = ""

    with _TEMPLATE_CACHE_LOCK:
        _TEMPLATE_CACHE.update({"html": template_html, "expires_at": now + ttl})

    return template_html


def inject_tracking_into_template(template_html: str, injections: Dict[str, str]) -> str:
    head_html = injections.get("head", "")
    body_start_html = injections.get("body_start", "")
    body_end_html = injections.get("body_end", "")

    output = template_html
    body_start_template_pattern = re.compile(
        r"""<template\b[^>]*\bid=["']ssr-body-start-integrations["'][^>]*>\s*</template>""",
        re.IGNORECASE,
    )
    body_end_template_pattern = re.compile(
        r"""<template\b[^>]*\bid=["']ssr-body-end-integrations["'][^>]*>\s*</template>""",
        re.IGNORECASE,
    )

    if "<!-- SSR_HEAD_INTEGRATIONS -->" in output:
        output = output.replace("<!-- SSR_HEAD_INTEGRATIONS -->", head_html)
    elif head_html and "</head>" in output:
        output = output.replace("</head>", f"{head_html}\n</head>", 1)

    if body_start_template_pattern.search(output):
        output = body_start_template_pattern.sub(body_start_html, output, count=1)
    elif "<!-- SSR_BODY_START_INTEGRATIONS -->" in output:
        output = output.replace("<!-- SSR_BODY_START_INTEGRATIONS -->", body_start_html)
    elif body_start_html:
        body_index = output.lower().find("<body")
        if body_index != -1:
            close_index = output.find(">", body_index)
            if close_index != -1:
                output = output[: close_index + 1] + "\n" + body_start_html + output[close_index + 1 :]

    if body_end_template_pattern.search(output):
        output = body_end_template_pattern.sub(body_end_html, output, count=1)
    elif "<!-- SSR_BODY_END_INTEGRATIONS -->" in output:
        output = output.replace("<!-- SSR_BODY_END_INTEGRATIONS -->", body_end_html)
    elif body_end_html and "</body>" in output:
        output = output.replace("</body>", f"{body_end_html}\n</body>", 1)

    return output
