from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import os
import uuid
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.verification import Verification
from app.models.user import User
from app.schemas.schemas import VerificationResponse, AdminVerificationResponse, VerificationReviewRequest

UPLOAD_DIR = "uploads/verifications"

router = APIRouter(prefix="/verifications", tags=["verifications"])


@router.get("/me", response_model=List[VerificationResponse])
def get_my_verifications(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    return db.query(Verification).filter(Verification.user_id == user_id).order_by(Verification.submitted_at.desc()).all()


@router.post("/submit", response_model=VerificationResponse)
async def submit_verification(
    request: Request,
    document: UploadFile = File(...),
    type: str = Form("kyc"),
    document_type: str = Form("id_card"),
    document_side: str = Form("front"),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(request)

    # Check if there's already a pending verification of this type + side
    existing = db.query(Verification).filter(
        Verification.user_id == user_id,
        Verification.type == type,
        Verification.document_side == document_side,
        Verification.status == "pending",
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"You already have a pending {document_side} document for this verification type")

    # Save file
    ext = os.path.splitext(document.filename or ".bin")[1]
    filename = f"{user_id}_{document_side}_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    content = await document.read()
    with open(filepath, "wb") as f:
        f.write(content)

    verification = Verification(
        user_id=user_id,
        type=type,
        document_type=document_type,
        document_side=document_side,
        document_path=filepath,
        status="pending",
    )
    db.add(verification)
    db.commit()
    db.refresh(verification)
    return verification


# ── Admin endpoints ──

@router.get("/admin/all", response_model=List[AdminVerificationResponse])
def admin_list_verifications(
    request: Request,
    status: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(request)
    admin = db.query(User).filter(User.id == user_id).first()
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    query = db.query(Verification, User).join(User, Verification.user_id == User.id)
    if status:
        query = query.filter(Verification.status == status)
    if type:
        query = query.filter(Verification.type == type)
    query = query.order_by(Verification.submitted_at.desc())

    results = []
    for v, u in query.all():
        data = AdminVerificationResponse.model_validate(v).model_dump()
        data["user_email"] = u.email
        data["user_full_name"] = u.full_name
        results.append(AdminVerificationResponse(**data))
    return results


@router.put("/admin/{verification_id}/review")
def admin_review_verification(
    verification_id: int,
    body: VerificationReviewRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(request)
    admin = db.query(User).filter(User.id == user_id).first()
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    verification = db.query(Verification).filter(Verification.id == verification_id).first()
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")

    verification.status = body.status
    verification.rejection_reason = body.rejection_reason if body.status == "rejected" else None
    verification.reviewed_at = datetime.now(timezone.utc)

    # If approved and it's a KYC verification, mark user as verified
    if body.status == "approved" and verification.type == "kyc":
        target_user = db.query(User).filter(User.id == verification.user_id).first()
        if target_user:
            target_user.is_verified = True

    db.commit()
    return {"message": f"Verification {body.status}"}


@router.get("/admin/{verification_id}/download")
def admin_download_document(
    verification_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(request)
    admin = db.query(User).filter(User.id == user_id).first()
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    verification = db.query(Verification).filter(Verification.id == verification_id).first()
    if not verification or not verification.document_path:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.exists(verification.document_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        verification.document_path,
        filename=os.path.basename(verification.document_path),
        media_type="application/octet-stream",
    )
