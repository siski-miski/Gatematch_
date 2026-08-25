from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base


class VerificationHtmlFile(Base):
    __tablename__ = "verification_html_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False, unique=True, index=True)
    storage_path = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
