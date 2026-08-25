from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base


class TrackingSettings(Base):
    __tablename__ = "tracking_settings"

    id = Column(Integer, primary_key=True, default=1)
    google_analytics_id = Column(String, nullable=False, default="")
    google_tag_manager_id = Column(String, nullable=False, default="")
    google_search_console_code = Column(String, nullable=False, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
