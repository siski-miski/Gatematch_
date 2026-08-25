from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.core.database import Base


class CustomScript(Base):
    __tablename__ = "custom_scripts"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, nullable=False)  # header | body | footer
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
