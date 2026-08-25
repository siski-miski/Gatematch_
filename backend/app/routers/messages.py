from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.message import Message
from app.models.notification import Notification
from app.models.user import User
from app.models.card import Card
from app.schemas.schemas import MessageCreate, MessageResponse, MessageConversationResponse

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("", response_model=List[MessageResponse])
def get_messages(
    request: Request,
    card_id: int = Query(...),
    counterpart_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    current_user_id = get_current_user_id(request)

    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    query = db.query(Message).filter(
        Message.card_id == card_id,
        or_(Message.sender_id == current_user_id, Message.receiver_id == current_user_id),
    )

    if counterpart_id is not None:
        query = query.filter(
            or_(
                (Message.sender_id == counterpart_id) & (Message.receiver_id == current_user_id),
                (Message.sender_id == current_user_id) & (Message.receiver_id == counterpart_id),
            )
        )

    messages = query.order_by(Message.created_at).all()

    # Mark received messages as read
    db.query(Message).filter(
        Message.card_id == card_id,
        Message.receiver_id == current_user_id,
        Message.is_read == False,
    ).update({"is_read": True})
    db.commit()

    result = []
    for msg in messages:
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        msg_dict = MessageResponse.model_validate(msg).model_dump()
        msg_dict["sender_name"] = sender.full_name if sender else None
        result.append(MessageResponse(**msg_dict))
    return result


@router.get("/conversations", response_model=List[MessageConversationResponse])
def get_conversations(request: Request, db: Session = Depends(get_db)):
    current_user_id = get_current_user_id(request)

    all_messages = (
        db.query(Message)
        .filter(or_(Message.sender_id == current_user_id, Message.receiver_id == current_user_id))
        .order_by(Message.created_at.desc(), Message.id.desc())
        .all()
    )

    unread_rows = (
        db.query(Message)
        .filter(Message.receiver_id == current_user_id, Message.is_read == False)
        .all()
    )

    unread_map: Dict[str, int] = {}
    for unread in unread_rows:
        other_id = unread.sender_id
        key = f"{unread.card_id}:{other_id}"
        unread_map[key] = unread_map.get(key, 0) + 1

    card_ids = list({m.card_id for m in all_messages})
    user_ids = list({
        (m.receiver_id if m.sender_id == current_user_id else m.sender_id)
        for m in all_messages
    })

    cards = db.query(Card).filter(Card.id.in_(card_ids)).all() if card_ids else []
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []

    card_by_id = {c.id: c for c in cards}
    user_by_id = {u.id: u for u in users}

    conversations: Dict[str, MessageConversationResponse] = {}
    for msg in all_messages:
        other_id = msg.receiver_id if msg.sender_id == current_user_id else msg.sender_id
        key = f"{msg.card_id}:{other_id}"
        if key in conversations:
            continue

        card = card_by_id.get(msg.card_id)
        other_user = user_by_id.get(other_id)
        card_title = "Offer deleted" if card and card.proposal_status == "offer_deleted" else (card.title if card else None)

        conversations[key] = MessageConversationResponse(
            conversation_key=key,
            card_id=msg.card_id,
            card_title=card_title,
            other_user_id=other_id,
            other_user_name=other_user.full_name if other_user else None,
            other_user_company=other_user.company_name if other_user else None,
            last_sender_id=msg.sender_id,
            last_message=msg.content,
            last_message_at=msg.created_at,
            unread_count=unread_map.get(key, 0),
        )

    return list(conversations.values())


@router.post("", response_model=MessageResponse)
def send_message(data: MessageCreate, request: Request, db: Session = Depends(get_db)):
    current_user_id = get_current_user_id(request)

    card = db.query(Card).filter(Card.id == data.card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    if card.proposal_status == "offer_deleted":
        raise HTTPException(status_code=403, detail="This chat is locked because the offer was deleted")

    if current_user_id == data.receiver_id:
        raise HTTPException(status_code=400, detail="Cannot send a message to yourself")

    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    msg = Message(
        card_id=data.card_id,
        sender_id=current_user_id,
        receiver_id=data.receiver_id,
        content=data.content.strip(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    sender = db.query(User).filter(User.id == current_user_id).first()
    db.add(Notification(
        user_id=data.receiver_id,
        type="message",
        message=f"New message from {sender.full_name if sender else 'a Gatematch member'}.",
    ))
    db.commit()
    resp = MessageResponse.model_validate(msg)
    resp.sender_name = sender.full_name if sender else None
    return resp
