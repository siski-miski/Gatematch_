from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Iterable
from urllib.parse import quote
from xml.sax.saxutils import escape

from fastapi import Request, Response
from sqlalchemy.orm import Session

from app.models.site_settings import SiteSettings

SYSTEM_LEGAL_PATHS = {
    "privacy": "/privacy",
    "terms": "/terms",
    "cookies": "/cookies",
}

STATIC_ROUTES = [
    {"path": "/", "changefreq": "weekly", "priority": "1.0"},
    {"path": "/marketplace", "changefreq": "daily", "priority": "0.9"},
    {"path": "/providers", "changefreq": "weekly", "priority": "0.8"},
    {"path": "/how-it-works", "changefreq": "monthly", "priority": "0.7"},
    {"path": "/compliance", "changefreq": "monthly", "priority": "0.7"},
    {"path": "/pricing", "changefreq": "monthly", "priority": "0.7"},
    {"path": "/contact", "changefreq": "monthly", "priority": "0.6"},
    {"path": "/privacy", "changefreq": "monthly", "priority": "0.5"},
    {"path": "/terms", "changefreq": "monthly", "priority": "0.5"},
    {"path": "/cookies", "changefreq": "monthly", "priority": "0.5"},
]

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def _site_origin(request: Request) -> str:
    forwarded_proto = request.headers.get("x-forwarded-proto")
    forwarded_host = request.headers.get("x-forwarded-host")
    proto = (forwarded_proto or request.url.scheme or "https").split(",")[0].strip()
    host = (forwarded_host or request.headers.get("host") or request.url.netloc).split(",")[0].strip()
    return f"{proto}://{host}".rstrip("/")


def _format_lastmod(value: Any) -> str | None:
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).date().isoformat()
        except ValueError:
            return value[:10] if re.fullmatch(r"\d{4}-\d{2}-\d{2}.*", value) else None
    return None


def _legal_document_routes(documents: Iterable[dict[str, Any]]) -> list[dict[str, str]]:
    routes: list[dict[str, str]] = []
    seen_paths: set[str] = set()

    for document in documents:
        slug = str(document.get("slug") or "").strip().lower()
        if not slug or not SLUG_PATTERN.fullmatch(slug):
            continue

        path = SYSTEM_LEGAL_PATHS.get(slug, f"/legal/{quote(slug)}")
        if path in seen_paths:
            continue

        route = {
            "path": path,
            "changefreq": "monthly",
            "priority": "0.5",
        }
        lastmod = _format_lastmod(document.get("updated_at"))
        if lastmod:
            route["lastmod"] = lastmod

        routes.append(route)
        seen_paths.add(path)

    return routes


def build_sitemap_xml(db: Session, request: Request) -> str:
    origin = _site_origin(request)
    row = db.query(SiteSettings).first()
    legal_documents = row.legal_documents if row and isinstance(row.legal_documents, list) else []

    routes = [*STATIC_ROUTES, *_legal_document_routes(legal_documents)]
    seen_paths: set[str] = set()
    url_entries: list[str] = []

    for route in routes:
        path = route["path"]
        if path in seen_paths:
            continue
        seen_paths.add(path)

        loc = f"{origin}{path}"
        parts = [
            "  <url>",
            f"    <loc>{escape(loc)}</loc>",
        ]
        if route.get("lastmod"):
            parts.append(f"    <lastmod>{escape(route['lastmod'])}</lastmod>")
        if route.get("changefreq"):
            parts.append(f"    <changefreq>{escape(route['changefreq'])}</changefreq>")
        if route.get("priority"):
            parts.append(f"    <priority>{escape(route['priority'])}</priority>")
        parts.append("  </url>")
        url_entries.append("\n".join(parts))

    return "\n".join([
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        *url_entries,
        "</urlset>",
        "",
    ])


def sitemap_response(db: Session, request: Request, download: bool = False) -> Response:
    headers = {"Cache-Control": "no-store"}
    if download:
        headers["Content-Disposition"] = 'attachment; filename="sitemap.xml"'

    return Response(
        content=build_sitemap_xml(db, request),
        media_type="application/xml",
        headers=headers,
    )
