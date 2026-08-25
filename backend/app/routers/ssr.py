import os
import re
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.verification_html_file import VerificationHtmlFile
from app.services.sitemap import sitemap_response
from app.services.tracking_injections import (
    get_cached_tracking_injections,
    get_index_template,
    inject_tracking_into_template,
)

router = APIRouter()

VERIFICATION_FILENAME_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,200}\.html$")
VERIFICATION_DIR = os.path.abspath("uploads/verification_html")


def _safe_verification_path(storage_path: str) -> bool:
    if not storage_path:
        return False
    absolute = os.path.abspath(storage_path)
    return absolute.startswith(VERIFICATION_DIR + os.sep)


@router.get("/sitemap.xml", include_in_schema=False)
def download_sitemap(request: Request, download: bool = False, db: Session = Depends(get_db)):
    return sitemap_response(db, request, download=download)


@router.get("/ssr/render", include_in_schema=False)
def render_ssr(request: Request, path: str = "/", db: Session = Depends(get_db)):
    if path == "/sitemap.xml":
        return sitemap_response(db, request)

    if path.endswith(".html"):
        filename = os.path.basename(path)
        if VERIFICATION_FILENAME_PATTERN.fullmatch(filename):
            row = db.query(VerificationHtmlFile).filter(VerificationHtmlFile.filename == filename).first()
            if row and row.storage_path and _safe_verification_path(row.storage_path) and os.path.exists(row.storage_path):
                return FileResponse(row.storage_path, media_type="text/html", filename=row.filename)

    template_html = get_index_template()
    if not template_html:
        raise HTTPException(status_code=503, detail="SSR template unavailable")

    injections = get_cached_tracking_injections(db)
    rendered = inject_tracking_into_template(template_html, injections)

    return Response(content=rendered, media_type="text/html", headers={"Cache-Control": "no-store"})
