import os
import re
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.verification_html_file import VerificationHtmlFile
from app.schemas.schemas import VerificationHtmlFileResponse

router = APIRouter(prefix="/verification-html", tags=["verification-html"])

UPLOAD_DIR = "uploads/verification_html"
MAX_FILE_BYTES = 64 * 1024
FILENAME_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,200}\.html$")
ALLOWED_CONTENT_TYPES = {"text/html", "text/plain", "application/octet-stream"}


def _require_admin(request: Request, db: Session) -> User:
    user_id = get_current_user_id(request)
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def _public_url(request: Request, filename: str) -> str:
    base = str(request.base_url).rstrip("/")
    return f"{base}/{filename}"


def _validate_filename(filename: str) -> str:
    sanitized = os.path.basename(filename)
    if not FILENAME_PATTERN.fullmatch(sanitized):
        raise HTTPException(status_code=400, detail="Invalid verification filename")
    return sanitized


def _validate_payload(filename: str, upload: UploadFile, content: bytes) -> str:
    if upload.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid content type")
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="File is too large")
    text = content.decode("utf-8", errors="ignore").strip()
    if "<" in text or ">" in text:
        raise HTTPException(status_code=400, detail="HTML markup is not allowed in verification files")
    expected = f"google-site-verification: {filename}"
    if expected not in text:
        raise HTTPException(status_code=400, detail="Verification content must match the filename")
    return text


@router.get("", response_model=list[VerificationHtmlFileResponse])
def list_verification_files(request: Request, db: Session = Depends(get_db)):
    _require_admin(request, db)
    rows = db.query(VerificationHtmlFile).order_by(VerificationHtmlFile.created_at.desc()).all()
    return [
        VerificationHtmlFileResponse(
            id=row.id,
            filename=row.filename,
            public_url=_public_url(request, row.filename),
            created_at=row.created_at,
        )
        for row in rows
    ]


@router.post("/upload", response_model=VerificationHtmlFileResponse)
async def upload_verification_file(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    _require_admin(request, db)
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    filename = _validate_filename(file.filename)
    content = await file.read()
    _validate_payload(filename, file, content)

    existing = db.query(VerificationHtmlFile).filter(VerificationHtmlFile.filename == filename).first()
    if existing:
        raise HTTPException(status_code=409, detail="A verification file with this name already exists")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    storage_path = os.path.join(UPLOAD_DIR, filename)

    try:
        with open(storage_path, "xb") as handle:
            handle.write(content)
    except FileExistsError:
        raise HTTPException(status_code=409, detail="File already exists on disk")

    row = VerificationHtmlFile(filename=filename, storage_path=storage_path)
    db.add(row)
    db.commit()
    db.refresh(row)

    return VerificationHtmlFileResponse(
        id=row.id,
        filename=row.filename,
        public_url=_public_url(request, row.filename),
        created_at=row.created_at,
    )


@router.delete("/{file_id}")
def delete_verification_file(
    file_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request, db)
    row = db.query(VerificationHtmlFile).filter(VerificationHtmlFile.id == file_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Verification file not found")

    if row.storage_path and os.path.exists(row.storage_path):
        os.remove(row.storage_path)

    db.delete(row)
    db.commit()

    return {"message": "Verification file deleted"}
