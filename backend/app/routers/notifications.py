from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.notification import Notification
from app.schemas.schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationResponse])
def list_notifications(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(50).all()


@router.put("/{notification_id}/read")
def mark_read(notification_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Marked as read"}
