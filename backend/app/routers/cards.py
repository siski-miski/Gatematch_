from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.card import Card
from app.models.user import User
from app.models.notification import Notification
from app.schemas.schemas import CardCreate, CardUpdate, CardResponse

router = APIRouter(prefix="/cards", tags=["cards"])

PLAN_CARD_LIMITS = {"explorer": 1, "professional": 10, "enterprise": 999}


# ── Static routes first (before {card_id} param routes) ──

@router.get("/mine", response_model=List[CardResponse])
def list_my_cards(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    user = db.query(User).filter(User.id == user_id).first()
    results = db.query(Card).filter(Card.user_id == user_id).order_by(desc(Card.created_at)).all()
    cards_out = []
    for card in results:
        card_dict = CardResponse.model_validate(card).model_dump()
        card_dict["provider_name"] = user.full_name
        card_dict["provider_company"] = user.company_name
        card_dict["provider_trust_score"] = user.trust_score
        card_dict["provider_is_verified"] = user.is_verified
        cards_out.append(CardResponse(**card_dict))
    return cards_out


@router.get("/admin/proposals", response_model=List[CardResponse])
def admin_list_proposals(
    request: Request,
    operation_type: Optional[str] = None,
    proposal_status: Optional[str] = None,
    unclassified: bool = False,
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(request)
    admin = db.query(User).filter(User.id == user_id).first()
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    query = db.query(Card, User).join(User, Card.user_id == User.id)
    if unclassified:
        query = query.filter(Card.operation_type.is_(None), Card.proposal_status == "pending")
    elif operation_type:
        query = query.filter(Card.operation_type == operation_type)
    else:
        # Default: show classified cards only
        query = query.filter(Card.operation_type.isnot(None))
    if proposal_status:
        query = query.filter(Card.proposal_status == proposal_status)
    query = query.order_by(desc(Card.created_at))

    cards = []
    for card, user in query.all():
        card_dict = CardResponse.model_validate(card).model_dump()
        card_dict["provider_name"] = user.full_name
        card_dict["provider_company"] = user.company_name
        card_dict["provider_trust_score"] = user.trust_score
        card_dict["provider_is_verified"] = user.is_verified
        cards.append(CardResponse(**card_dict))
    return cards


@router.put("/admin/{card_id}/proposal")
def admin_review_proposal(
    card_id: int,
    request: Request,
    status: str = Query(..., pattern="^(accepted|declined)$"),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(request)
    admin = db.query(User).filter(User.id == user_id).first()
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    previous_status = card.proposal_status
    card.proposal_status = status
    if status == "accepted":
        # rent/sell are admin-validated private operations and never public marketplace cards
        card.is_active = card.operation_type is None
    else:
        card.is_active = False
    if previous_status != status:
        operation_label = card.operation_type.capitalize() if card.operation_type else 'Card'
        message = (
            f"Your {operation_label} proposal was accepted. Connectov will guide you through the next step."
            if status == "accepted"
            else f"Your {operation_label} proposal was declined. You can update it and submit again."
        )
        db.add(Notification(user_id=card.user_id, type="proposal", message=message))
    db.commit()
    return {"message": f"Card proposal {status}"}


@router.put("/admin/{card_id}/operation")
def admin_set_operation_type(
    card_id: int,
    request: Request,
    operation_type: str = Query(..., pattern="^(rent|sell)$"),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(request)
    admin = db.query(User).filter(User.id == user_id).first()
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    card.operation_type = operation_type
    # Keep canonical mapping: rent=request, sell=offer
    card.type = "request" if operation_type == "rent" else "offer"
    if card.proposal_status == "accepted":
        card.is_active = False
    db.commit()
    return {"message": f"Card classified as {operation_type}"}


@router.get("", response_model=List[CardResponse])
def list_cards(
    type: Optional[str] = None,
    region: Optional[str] = None,
    industry: Optional[str] = None,
    gateway_type: Optional[str] = None,
    min_trust: Optional[int] = None,
    min_volume: Optional[float] = None,
    max_volume: Optional[float] = None,
    sort: Optional[str] = "newest",
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(Card, User)
        .join(User, Card.user_id == User.id)
        .filter(
            Card.is_active == True,
            Card.operation_type.is_(None),
            Card.proposal_status == "accepted",
            User.is_verified == True,
        )
    )

    if type:
        query = query.filter(Card.type == type)
    if region:
        query = query.filter(Card.regions.any(region))
    if industry:
        query = query.filter(Card.industries.any(industry))
    if gateway_type:
        query = query.filter(Card.gateway_type.ilike(f"%{gateway_type}%"))
    if min_trust is not None and min_trust > 0:
        query = query.filter(User.trust_score >= min_trust)
    if min_volume is not None:
        query = query.filter(Card.min_volume >= min_volume)
    if max_volume is not None:
        query = query.filter(Card.max_volume <= max_volume)
    if search:
        query = query.filter(
            (Card.title.ilike(f"%{search}%")) | (Card.description.ilike(f"%{search}%"))
        )

    if sort == "newest":
        query = query.order_by(desc(Card.created_at))
    elif sort == "trust_score":
        query = query.order_by(desc(User.trust_score))
    elif sort == "volume":
        query = query.order_by(desc(Card.max_volume))
    elif sort == "commission":
        query = query.order_by(asc(Card.commission_rate))
    else:
        query = query.order_by(desc(Card.created_at))

    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()

    cards = []
    for card, user in results:
        card_dict = CardResponse.model_validate(card).model_dump()
        card_dict["provider_name"] = user.full_name
        card_dict["provider_company"] = user.company_name
        card_dict["provider_trust_score"] = user.trust_score
        card_dict["provider_is_verified"] = user.is_verified
        cards.append(CardResponse(**card_dict))

    return cards


@router.post("", response_model=CardResponse)
def create_card(data: CardCreate, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    is_admin = user.role == "admin"

    # Enforce plan card limits against currently active listings.
    card_limit = PLAN_CARD_LIMITS.get(user.plan, 1)
    current_count = db.query(Card).filter(
        Card.user_id == user_id,
        Card.is_active == True,
    ).count()
    if not is_admin and current_count >= card_limit:
        raise HTTPException(
            status_code=403,
            detail=f"You have reached your plan limit of {card_limit} listing(s). Upgrade your plan to post more.",
        )

    # Normalize type/operation relation for the 4 supported user operations
    if data.operation_type == "rent" and data.type != "request":
        raise HTTPException(status_code=400, detail="Rent operation must use card type 'request'.")
    if data.operation_type == "sell" and data.type != "offer":
        raise HTTPException(status_code=400, detail="Sell operation must use card type 'offer'.")

    # Admin cards go live immediately unless operation is private (rent/sell)
    is_public_marketplace_card = data.operation_type is None
    should_activate = is_admin and is_public_marketplace_card

    # User cards always require admin validation first
    card = Card(
        **data.model_dump(),
        user_id=user_id,
        is_active=should_activate,
        proposal_status="accepted" if is_admin else "pending",
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    user = db.query(User).filter(User.id == user_id).first()
    resp = CardResponse.model_validate(card)
    resp.provider_name = user.full_name
    resp.provider_company = user.company_name
    resp.provider_trust_score = user.trust_score
    resp.provider_is_verified = user.is_verified
    return resp


# ── Parameterized routes (MUST come after static routes) ──

@router.get("/{card_id}", response_model=CardResponse)
def get_card(card_id: int, db: Session = Depends(get_db)):
    result = db.query(Card, User).join(User, Card.user_id == User.id).filter(
        Card.id == card_id,
        Card.is_active == True,
        Card.operation_type.is_(None),
        Card.proposal_status == "accepted",
        User.is_verified == True,
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="Card not found")

    card, user = result
    card.views_count += 1
    db.commit()
    db.refresh(card)

    resp = CardResponse.model_validate(card)
    resp.provider_name = user.full_name
    resp.provider_company = user.company_name
    resp.provider_trust_score = user.trust_score
    resp.provider_is_verified = user.is_verified
    return resp


@router.put("/{card_id}", response_model=CardResponse)
def update_card(card_id: int, data: CardUpdate, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    card = db.query(Card).filter(Card.id == card_id, Card.user_id == user_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found or unauthorized")

    updates = data.model_dump(exclude_unset=True)
    updates.pop("is_active", None)

    if "operation_type" in updates:
        operation_type = updates["operation_type"]
        expected_type = "request" if operation_type == "rent" else "offer"
        if card.type != expected_type:
            raise HTTPException(status_code=400, detail=f"{operation_type.capitalize()} operation must use card type '{expected_type}'.")

    for field, value in updates.items():
        setattr(card, field, value)

    card.proposal_status = "pending"
    card.is_active = False

    db.commit()
    db.refresh(card)
    return CardResponse.model_validate(card)


@router.delete("/{card_id}")
def delete_card(card_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    card = db.query(Card).filter(Card.id == card_id, Card.user_id == user_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found or unauthorized")

    card.is_active = False
    card.proposal_status = "offer_deleted"
    db.commit()
    return {"message": "Card marked as deleted and chat is now locked"}
