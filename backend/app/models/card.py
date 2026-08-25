from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, func
from sqlalchemy.dialects.postgresql import ARRAY
from app.core.database import Base


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # offer | request
    operation_type = Column(String, nullable=True)  # rent | sell (internal, set by admin)
    proposal_status = Column(String, nullable=False, default="pending")  # pending | accepted | declined
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    gateway_type = Column(String, nullable=True)
    regions = Column(ARRAY(String), default=[])
    industries = Column(ARRAY(String), default=[])
    currencies = Column(ARRAY(String), default=[])
    pricing_model = Column(String, nullable=True)  # percentage | fixed | negotiable
    commission_rate = Column(Float, nullable=True)
    fixed_fee = Column(Float, nullable=True)
    min_volume = Column(Float, nullable=True)
    max_volume = Column(Float, nullable=True)
    risk_tolerance = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
