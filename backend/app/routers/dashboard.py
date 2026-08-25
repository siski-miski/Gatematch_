from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date, datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.deal import Deal
from app.models.user import User
from app.schemas.schemas import DashboardStats, VolumeHistory

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    user = db.query(User).filter(User.id == user_id).first()

    active_deals = db.query(Deal).filter(
        ((Deal.provider_id == user_id) | (Deal.seeker_id == user_id)),
        Deal.status == "active",
    ).count()

    volume_result = db.query(func.coalesce(func.sum(Deal.monthly_volume), 0)).filter(
        ((Deal.provider_id == user_id) | (Deal.seeker_id == user_id)),
        Deal.status.in_(["active", "completed"]),
    ).scalar()

    revenue_result = db.query(func.coalesce(func.sum(
        Deal.monthly_volume * Deal.commission_rate / 100,
    ), 0)).filter(
        Deal.provider_id == user_id,
        Deal.status.in_(["active", "completed"]),
    ).scalar()
    revenue = float(revenue_result or 0)

    return DashboardStats(
        active_deals=active_deals,
        volume_processed=float(volume_result or 0),
        revenue_earned=round(revenue, 2),
        trust_score=user.trust_score if user else 50,
    )


@router.get("/volume-history", response_model=List[VolumeHistory])
def get_volume_history(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    now = datetime.now(timezone.utc)

    deals = db.query(Deal).filter(
        ((Deal.provider_id == user_id) | (Deal.seeker_id == user_id)),
        Deal.status.in_(["active", "completed"]),
    ).all()

    current_month = date(now.year, now.month, 1)
    months = []
    for offset in range(6, -1, -1):
        month_index = current_month.year * 12 + current_month.month - 1 - offset
        year, month_number = divmod(month_index, 12)
        month_start = date(year, month_number + 1, 1)
        volume = 0.0
        for deal in deals:
            deal_date = deal.start_date or (deal.created_at.date() if deal.created_at else None)
            if deal_date and deal_date.year == month_start.year and deal_date.month == month_start.month:
                volume += float(deal.monthly_volume or 0)
        months.append(VolumeHistory(month=month_start.strftime("%b"), volume=volume))

    return months
