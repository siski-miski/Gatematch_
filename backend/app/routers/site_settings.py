import urllib.request
import urllib.parse
import json
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db, SessionLocal
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.site_settings import SiteSettings, DEFAULT_FAQS
from app.models.tracking_settings import TrackingSettings
from app.services.tracking_injections import invalidate_tracking_cache
from app.schemas.schemas import ContactSettingsResponse, ContactSettingsUpdate

router = APIRouter(prefix="/site-settings", tags=["site-settings"])

DEFAULT_INTEGRATION_SNIPPETS = [
    {"type": "google_analytics", "placement": "head", "enabled": False, "placeholder": "Google Analytics ID"},
    {"type": "google_tag_manager", "placement": "head_and_body", "enabled": False, "placeholder": "Google Tag Manager ID"},
    {"type": "search_console", "placement": "head", "enabled": False, "placeholder": "Search Console verification code"},
    {"type": "custom_header", "placement": "head", "enabled": False, "placeholder": "Custom header scripts"},
    {"type": "custom_body", "placement": "body_start", "enabled": False, "placeholder": "Custom body scripts"},
    {"type": "custom_footer", "placement": "body_end", "enabled": False, "placeholder": "Custom footer scripts"},
]

DEFAULT_LEGAL_PAGES = {
    "privacy": {"default": {"title": "Privacy Policy", "html": "", "updated_at": None}},
    "terms": {"default": {"title": "Terms of Service", "html": "", "updated_at": None}},
    "cookies": {"default": {"title": "Cookie Policy", "html": "", "updated_at": None}},
}

DEFAULT_LEGAL_DOCUMENTS = [
    {
        "id": "privacy",
        "slug": "privacy",
        "title": "Privacy Policy",
        "html": "",
        "markdown": "",
        "updated_at": None,
        "show_in_footer": True,
        "is_system": True,
    },
    {
        "id": "terms",
        "slug": "terms",
        "title": "Terms of Service",
        "html": "",
        "markdown": "",
        "updated_at": None,
        "show_in_footer": True,
        "is_system": True,
    },
    {
        "id": "cookies",
        "slug": "cookies",
        "title": "Cookie Policy",
        "html": "",
        "markdown": "",
        "updated_at": None,
        "show_in_footer": True,
        "is_system": True,
    },
]

def _build_legal_documents_from_pages(pages: dict, default_locale: str):
    if not isinstance(pages, dict):
        return []

    documents = []
    locale_key = (default_locale or "en").lower()
    for slug, locales in pages.items():
        if not isinstance(locales, dict):
            continue
        content = locales.get(locale_key) or locales.get("default") or {}
        title = content.get("title") or slug.replace("-", " ").title()
        documents.append({
            "id": slug,
            "slug": slug,
            "title": title,
            "html": content.get("html") or "",
            "markdown": "",
            "updated_at": content.get("updated_at"),
            "show_in_footer": True,
            "is_system": slug in {"privacy", "terms", "cookies"},
        })
    return documents

def _geocode_address(address: str):
    """Geocode address using Nominatim API via standard urllib."""
    try:
        url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(address)}&format=json&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Gatematch/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            if data and len(data) > 0:
                return float(data[0]['lat']), float(data[0]['lon'])
    except Exception as e:
        print(f"Geocoding error: {e}")
    return None, None


def _process_contact_location(settings_id: int, address_snapshot: str):
    db = SessionLocal()
    try:
        row = db.query(SiteSettings).filter(SiteSettings.id == settings_id).first()
        if not row or row.contact_offices != address_snapshot:
            return

        lat, lon = _geocode_address(address_snapshot)
        row.latitude = lat
        row.longitude = lon

        if lat is not None and lon is not None:
            row.contact_location_status = "ready"
            row.contact_location_error = None
        else:
            row.contact_location_status = "error"
            row.contact_location_error = "We could not resolve this address right now. Please try again later or refine the address."

        db.commit()
    except Exception as exc:
        db.rollback()
        row = db.query(SiteSettings).filter(SiteSettings.id == settings_id).first()
        if row and row.contact_offices == address_snapshot:
            row.contact_location_status = "error"
            row.contact_location_error = "Location lookup is temporarily unavailable. Please try again later."
            db.commit()
    finally:
        db.close()

def _get_or_create(db: Session) -> SiteSettings:
    """Return the singleton settings row, creating it with defaults if absent."""
    row = db.query(SiteSettings).first()
    needs_commit = False
    if not row:
        row = SiteSettings(
            id=1,
            contact_faqs=DEFAULT_FAQS,
            contact_location_status="idle",
            integration_snippets=DEFAULT_INTEGRATION_SNIPPETS,
            legal_pages=DEFAULT_LEGAL_PAGES,
            legal_documents=DEFAULT_LEGAL_DOCUMENTS,
            legal_localization_enabled=False,
            legal_default_locale="en",
        )
        db.add(row)
        db.commit()
        db.refresh(row)
    if not row.contact_location_status:
        row.contact_location_status = "ready" if row.latitude is not None and row.longitude is not None else "idle"
    if row.integration_snippets is None:
        row.integration_snippets = DEFAULT_INTEGRATION_SNIPPETS
    if row.legal_pages is None:
        row.legal_pages = DEFAULT_LEGAL_PAGES
    if row.legal_documents is None or not isinstance(row.legal_documents, list) or len(row.legal_documents) == 0:
        from_pages = _build_legal_documents_from_pages(row.legal_pages or DEFAULT_LEGAL_PAGES, row.legal_default_locale)
        row.legal_documents = from_pages if from_pages else DEFAULT_LEGAL_DOCUMENTS
        needs_commit = True
    if not row.legal_default_locale:
        row.legal_default_locale = "en"
        needs_commit = True
    if _sync_tracking_columns(db, row):
        needs_commit = True
    if needs_commit:
        db.commit()
        db.refresh(row)
    return row


def _sync_tracking_columns(db: Session, row: SiteSettings) -> bool:
    tracking_row = db.query(TrackingSettings).first()
    if not tracking_row:
        return False

    changed = False
    mappings = {
        "google_analytics_id": "google_analytics_id",
        "google_tag_manager_id": "google_tag_manager_id",
        "google_search_console_code": "search_console_verification_code",
    }
    for tracking_field, site_field in mappings.items():
        tracking_value = getattr(tracking_row, tracking_field) or ""
        site_value = getattr(row, site_field) or ""
        if tracking_value == site_value:
            continue
        if tracking_value:
            setattr(row, site_field, tracking_value)
        elif site_value:
            setattr(tracking_row, tracking_field, site_value)
        else:
            continue
        changed = True

    return changed


@router.get("/contact", response_model=ContactSettingsResponse)
def get_contact_settings(db: Session = Depends(get_db)):
    return _get_or_create(db)


@router.put("/contact", response_model=ContactSettingsResponse)
def update_contact_settings(
    data: ContactSettingsUpdate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(request)
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    row = _get_or_create(db)
    update = data.model_dump(exclude_unset=True)

    # Serialize FaqItem objects to plain dicts for JSON storage
    if "contact_faqs" in update and update["contact_faqs"] is not None:
        update["contact_faqs"] = [
            item if isinstance(item, dict) else item.model_dump()
            for item in update["contact_faqs"]
        ]

    if "integration_snippets" in update and update["integration_snippets"] is None:
        update["integration_snippets"] = DEFAULT_INTEGRATION_SNIPPETS
    if "legal_pages" in update and update["legal_pages"] is None:
        update["legal_pages"] = DEFAULT_LEGAL_PAGES
    if "legal_documents" in update and update["legal_documents"] is None:
        update["legal_documents"] = DEFAULT_LEGAL_DOCUMENTS

    for field, value in update.items():
        setattr(row, field, value)

    tracking_updates = {}
    if "google_analytics_id" in update:
        tracking_updates["google_analytics_id"] = update.get("google_analytics_id") or ""
    if "google_tag_manager_id" in update:
        tracking_updates["google_tag_manager_id"] = update.get("google_tag_manager_id") or ""
    if "search_console_verification_code" in update:
        tracking_updates["google_search_console_code"] = update.get("search_console_verification_code") or ""

    if tracking_updates:
        tracking_row = db.query(TrackingSettings).first()
        if not tracking_row:
            tracking_row = TrackingSettings(id=1)
            db.add(tracking_row)
        for field, value in tracking_updates.items():
            setattr(tracking_row, field, value)

    should_geocode = "contact_offices" in update
    if should_geocode:
        row.latitude = None
        row.longitude = None
        row.contact_location_status = "processing"
        row.contact_location_error = None

    db.commit()
    db.refresh(row)

    if tracking_updates:
        invalidate_tracking_cache()

    if should_geocode:
        background_tasks.add_task(_process_contact_location, row.id, row.contact_offices)

    return row
