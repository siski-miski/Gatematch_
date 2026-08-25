from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.engine import Engine
from sqlalchemy import inspect, text
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    company_name = Column(String, nullable=True)
    role = Column(String, nullable=False, default="seeker")  # provider | seeker | both | admin
    country = Column(String, nullable=True)
    plan = Column(String, nullable=False, default="explorer")  # explorer | professional | enterprise
    trust_score = Column(Integer, default=50)
    is_verified = Column(Boolean, default=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


def ensure_user_columns(engine: Engine) -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    if "avatar_url" not in existing_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR NULL"))
