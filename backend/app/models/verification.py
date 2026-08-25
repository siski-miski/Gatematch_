from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from app.core.database import Base


class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # kyc | kyb | aml | bank
    document_type = Column(String, nullable=True)  # passport | id_card | driver_license | business_reg
    document_side = Column(String, nullable=True)  # front | back
    document_path = Column(String, nullable=True)
    status = Column(String, nullable=False, default="pending")  # pending | approved | rejected
    rejection_reason = Column(String, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
