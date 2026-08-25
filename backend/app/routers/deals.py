import os
import uuid
from datetime import date, datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.card import Card
from app.models.deal import Deal
from app.models.deal_document import DealDocument
from app.models.notification import Notification
from app.models.user import User
from app.schemas.schemas import DealCreate, DealDocumentResponse, DealResponse, DealStatusUpdate, DealTermsUpdate

router = APIRouter(prefix="/deals", tags=["deals"])


def _get_deal(deal_id: int, user_id: int, db: Session) -> Deal:
    deal = db.query(Deal).filter(
        Deal.id == deal_id,
        (Deal.provider_id == user_id) | (Deal.seeker_id == user_id),
    ).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


def _deal_response(deal: Deal, user_id: int, db: Session) -> DealResponse:
    provider = db.query(User).filter(User.id == deal.provider_id).first()
    seeker = db.query(User).filter(User.id == deal.seeker_id).first()
    card = db.query(Card).filter(Card.id == deal.card_id).first()
    response = DealResponse.model_validate(deal)
    response.provider_name = provider.full_name if provider else None
    response.seeker_name = seeker.full_name if seeker else None
    response.card_title = card.title if card else None

    if deal.status in {"pending", "countered"}:
        response.action_required = "respond" if deal.last_action_by != user_id else "waiting"
    elif deal.status == "active":
        response.action_required = "complete"
    elif deal.status == "review":
        response.action_required = "confirm_completion" if deal.last_action_by != user_id else "waiting"
    return response


def _add_notification(db: Session, user_id: int, message: str) -> None:
    db.add(Notification(user_id=user_id, type="deal", message=message))


def _document_response(document: DealDocument, db: Session) -> DealDocumentResponse:
    uploader = db.query(User).filter(User.id == document.uploaded_by).first()
    response = DealDocumentResponse.model_validate(document)
    response.uploader_name = uploader.full_name if uploader else None
    return response


@router.get("", response_model=List[DealResponse])
def list_deals(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    deals = db.query(Deal).filter(
        (Deal.provider_id == user_id) | (Deal.seeker_id == user_id),
    ).order_by(Deal.created_at.desc()).all()
    return [_deal_response(deal, user_id, db) for deal in deals]


@router.post("", response_model=DealResponse)
def create_deal(data: DealCreate, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    user = db.query(User).filter(User.id == user_id).first()
    card = db.query(Card).filter(Card.id == data.card_id).first()
    if not user or not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Complete verification before starting a deal")
    if card.user_id == user_id:
        raise HTTPException(status_code=400, detail="You cannot start a deal with your own listing")
    if not card.is_active and card.proposal_status != "accepted":
        raise HTTPException(status_code=400, detail="This listing is not available for a deal")

    provider_id = card.user_id if card.type == "offer" else user_id
    seeker_id = user_id if card.type == "offer" else card.user_id
    if data.provider_id is not None and data.provider_id != provider_id:
        raise HTTPException(status_code=400, detail="The selected provider does not match this listing")

    provider = db.query(User).filter(User.id == provider_id).first()
    seeker = db.query(User).filter(User.id == seeker_id).first()
    if not provider or not seeker:
        raise HTTPException(status_code=404, detail="Deal participant not found")
    if not provider.is_verified or not seeker.is_verified:
        raise HTTPException(status_code=403, detail="Both participants must be verified before starting a deal")

    existing = db.query(Deal).filter(
        Deal.card_id == card.id,
        Deal.provider_id == provider_id,
        Deal.seeker_id == seeker_id,
        Deal.status.in_(["pending", "countered", "active", "review"]),
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="A deal already exists for this listing")

    commission_rate = data.commission_rate if data.commission_rate is not None else card.commission_rate
    deal = Deal(
        provider_id=provider_id,
        seeker_id=seeker_id,
        card_id=card.id,
        monthly_volume=data.monthly_volume,
        commission_rate=commission_rate,
        notes=data.notes,
        status="pending",
        initiator_id=user_id,
        last_action_by=user_id,
        terms_history=[{
            "action": "request",
            "user_id": user_id,
            "monthly_volume": data.monthly_volume,
            "commission_rate": commission_rate,
            "notes": data.notes,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }],
    )
    db.add(deal)
    other_user_id = provider_id if user_id == seeker_id else seeker_id
    _add_notification(db, other_user_id, f"A new deal request was created for {card.title}.")
    db.commit()
    db.refresh(deal)
    return _deal_response(deal, user_id, db)


@router.get("/{deal_id}/documents", response_model=List[DealDocumentResponse])
def list_deal_documents(deal_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    _get_deal(deal_id, user_id, db)
    documents = db.query(DealDocument).filter(DealDocument.deal_id == deal_id).order_by(DealDocument.created_at.desc()).all()
    return [_document_response(document, db) for document in documents]


@router.post("/{deal_id}/documents", response_model=DealDocumentResponse)
async def upload_deal_document(
    deal_id: int,
    request: Request,
    document: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(request)
    deal = _get_deal(deal_id, user_id, db)
    if deal.status in {"withdrawn", "terminated"}:
        raise HTTPException(status_code=400, detail="Documents cannot be exchanged on a closed deal")

    file_name = os.path.basename(document.filename or "document")
    extension = os.path.splitext(file_name)[1].lower()
    if extension not in {".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx", ".xls", ".xlsx"}:
        raise HTTPException(status_code=400, detail="Use a PDF, image, Word, or Excel document")

    content = await document.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Documents must be smaller than 10 MB")

    directory = os.path.join("uploads", "deals", str(deal_id))
    os.makedirs(directory, exist_ok=True)
    file_path = os.path.join(directory, f"{uuid.uuid4().hex}_{file_name}")
    with open(file_path, "wb") as saved_file:
        saved_file.write(content)

    saved_document = DealDocument(
        deal_id=deal_id,
        uploaded_by=user_id,
        file_name=file_name,
        file_path=file_path,
        content_type=document.content_type,
    )
    db.add(saved_document)
    other_user_id = deal.seeker_id if deal.provider_id == user_id else deal.provider_id
    _add_notification(db, other_user_id, "A new document was shared on one of your deals.")
    db.commit()
    db.refresh(saved_document)
    return _document_response(saved_document, db)


@router.get("/{deal_id}/documents/{document_id}/download")
def download_deal_document(deal_id: int, document_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    _get_deal(deal_id, user_id, db)
    document = db.query(DealDocument).filter(DealDocument.id == document_id, DealDocument.deal_id == deal_id).first()
    if not document or not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(document.file_path, media_type=document.content_type or "application/octet-stream", filename=document.file_name)


@router.put("/{deal_id}/terms", response_model=DealResponse)
def counter_deal_terms(deal_id: int, data: DealTermsUpdate, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    deal = _get_deal(deal_id, user_id, db)
    if deal.status not in {"pending", "countered"}:
        raise HTTPException(status_code=400, detail="Terms can only be changed before a deal is active")
    if deal.last_action_by == user_id:
        raise HTTPException(status_code=409, detail="Wait for the other participant to respond first")

    updates = data.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Add at least one term before sending a counter-offer")
    for field, value in updates.items():
        setattr(deal, field, value)

    history = list(deal.terms_history or [])
    history.append({"action": "counter_offer", "user_id": user_id, **updates, "created_at": datetime.now(timezone.utc).isoformat()})
    deal.terms_history = history
    deal.status = "countered"
    deal.last_action_by = user_id
    other_user_id = deal.seeker_id if deal.provider_id == user_id else deal.provider_id
    _add_notification(db, other_user_id, "The deal terms were updated. Review the counter-offer in your dashboard.")
    db.commit()
    db.refresh(deal)
    return _deal_response(deal, user_id, db)


@router.post("/{deal_id}/accept", response_model=DealResponse)
def accept_deal(deal_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    deal = _get_deal(deal_id, user_id, db)
    if deal.status not in {"pending", "countered"}:
        raise HTTPException(status_code=400, detail="Only pending deal terms can be accepted")
    if deal.last_action_by == user_id:
        raise HTTPException(status_code=409, detail="The other participant must respond to your terms")

    deal.status = "active"
    deal.start_date = deal.start_date or date.today()
    other_user_id = deal.seeker_id if deal.provider_id == user_id else deal.provider_id
    _add_notification(db, other_user_id, "Your deal request was accepted. The partnership is now active.")
    db.commit()
    db.refresh(deal)
    return _deal_response(deal, user_id, db)


@router.post("/{deal_id}/withdraw", response_model=DealResponse)
def withdraw_deal(deal_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    deal = _get_deal(deal_id, user_id, db)
    if deal.status not in {"pending", "countered"}:
        raise HTTPException(status_code=400, detail="Only pending deals can be withdrawn")

    deal.status = "withdrawn"
    deal.end_date = date.today()
    other_user_id = deal.seeker_id if deal.provider_id == user_id else deal.provider_id
    _add_notification(db, other_user_id, "A pending deal was withdrawn.")
    db.commit()
    db.refresh(deal)
    return _deal_response(deal, user_id, db)


@router.post("/{deal_id}/complete", response_model=DealResponse)
def complete_deal(deal_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    deal = _get_deal(deal_id, user_id, db)
    other_user_id = deal.seeker_id if deal.provider_id == user_id else deal.provider_id

    if deal.status == "active":
        deal.status = "review"
        deal.last_action_by = user_id
        _add_notification(db, other_user_id, "The other participant requested deal completion. Please confirm it.")
    elif deal.status == "review":
        if deal.last_action_by == user_id:
            raise HTTPException(status_code=409, detail="Waiting for the other participant to confirm completion")
        deal.status = "completed"
        deal.end_date = date.today()
        card = db.query(Card).filter(Card.id == deal.card_id).first()
        if card:
            card.is_active = False
            card.proposal_status = "completed"
        _add_notification(db, other_user_id, "The deal was completed by both participants.")
    else:
        raise HTTPException(status_code=400, detail="Only active deals can be completed")

    db.commit()
    db.refresh(deal)
    return _deal_response(deal, user_id, db)


@router.put("/{deal_id}/status", response_model=DealResponse)
def update_deal_status(deal_id: int, data: DealStatusUpdate, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    deal = _get_deal(deal_id, user_id, db)
    allowed_transitions = {
        "active": {"review", "terminated"},
        "review": {"active", "terminated"},
    }
    if data.status not in allowed_transitions.get(deal.status, set()):
        raise HTTPException(status_code=400, detail=f"Cannot move a {deal.status} deal to {data.status}")

    deal.status = data.status
    if data.status == "terminated":
        deal.end_date = date.today()
    other_user_id = deal.seeker_id if deal.provider_id == user_id else deal.provider_id
    _add_notification(db, other_user_id, f"Deal status changed to {data.status}.")
    db.commit()
    db.refresh(deal)
    return _deal_response(deal, user_id, db)
