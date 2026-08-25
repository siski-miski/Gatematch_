import html
import re
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.site_settings import SiteSettings
from app.models.tracking_settings import TrackingSettings
from app.models.user import User
from app.schemas.schemas import TrackingSettingsResponse, TrackingSettingsUpdate
from app.services.tracking_injections import GA_ID_PATTERN, GTM_ID_PATTERN, SC_CODE_PATTERN, invalidate_tracking_cache

router = APIRouter(prefix="/tracking-settings", tags=["tracking-settings"])


def _require_admin(request: Request, db: Session) -> User:
    user_id = get_current_user_id(request)
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def _get_or_create(db: Session) -> TrackingSettings:
    row = db.query(TrackingSettings).first()
    if row:
        site_settings = db.query(SiteSettings).first()
        changed = False
        if site_settings:
            legacy_values = {
                "google_analytics_id": site_settings.google_analytics_id or "",
                "google_tag_manager_id": site_settings.google_tag_manager_id or "",
                "google_search_console_code": site_settings.search_console_verification_code or "",
            }
            for field, legacy_value in legacy_values.items():
                if legacy_value and not getattr(row, field):
                    setattr(row, field, legacy_value)
                    changed = True
        changed = _mirror_tracking_to_site_settings(db, row) or changed
        if changed:
            db.commit()
            db.refresh(row)
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


def _extract_search_console_code(value: str) -> str:
    trimmed = value.strip()
    if "google-site-verification" not in trimmed.lower():
        return trimmed

    match = re.search(r"""content\s*=\s*["']([^"']+)["']""", trimmed, re.IGNORECASE)
    if not match:
        return trimmed
    return html.unescape(match.group(1).strip())


def _mirror_tracking_to_site_settings(db: Session, row: TrackingSettings) -> bool:
    site_settings = db.query(SiteSettings).first()
    changed = False

    if not site_settings:
        site_settings = SiteSettings(id=1)
        db.add(site_settings)
        changed = True

    mappings = {
        "google_analytics_id": "google_analytics_id",
        "google_tag_manager_id": "google_tag_manager_id",
        "google_search_console_code": "search_console_verification_code",
    }
    for tracking_field, site_field in mappings.items():
        value = getattr(row, tracking_field) or ""
        if getattr(site_settings, site_field) != value:
            setattr(site_settings, site_field, value)
            changed = True

    return changed


def _normalize_token(value: str | None, pattern: re.Pattern, label: str, *, uppercase: bool = False, extract_meta: bool = False) -> str | None:
    if value is None:
        return None
    trimmed = _extract_search_console_code(value) if extract_meta else value.strip()
    if uppercase:
        trimmed = trimmed.upper()
    if trimmed and not pattern.fullmatch(trimmed):
        raise HTTPException(status_code=400, detail=f"Invalid {label}")
    return trimmed


@router.get("", response_model=TrackingSettingsResponse)
def get_tracking_settings(request: Request, db: Session = Depends(get_db)):
    _require_admin(request, db)
    return _get_or_create(db)


@router.put("", response_model=TrackingSettingsResponse)
def update_tracking_settings(
    data: TrackingSettingsUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request, db)
    row = _get_or_create(db)

    analytics_id = _normalize_token(data.google_analytics_id, GA_ID_PATTERN, "Google Analytics ID")
    tag_manager_id = _normalize_token(data.google_tag_manager_id, GTM_ID_PATTERN, "Google Tag Manager ID", uppercase=True)
    search_console_code = _normalize_token(data.google_search_console_code, SC_CODE_PATTERN, "Search Console verification code", extract_meta=True)

    if analytics_id is not None:
        row.google_analytics_id = analytics_id
    if tag_manager_id is not None:
        row.google_tag_manager_id = tag_manager_id
    if search_console_code is not None:
        row.google_search_console_code = search_console_code

    _mirror_tracking_to_site_settings(db, row)
    db.commit()
    db.refresh(row)
    invalidate_tracking_cache()

    return row
