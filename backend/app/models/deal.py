from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Date, Text, JSON, func
from sqlalchemy.engine import Engine
from sqlalchemy import inspect, text
from app.core.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seeker_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending | countered | active | review | completed | terminated | withdrawn
    initiator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    last_action_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    monthly_volume = Column(Float, nullable=True)
    commission_rate = Column(Float, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    terms_history = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


def ensure_deal_columns(engine: Engine) -> None:
    inspector = inspect(engine)
    if "deals" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("deals")}
    additions = {
        "initiator_id": "ALTER TABLE deals ADD COLUMN initiator_id INTEGER NULL REFERENCES users(id)",
        "last_action_by": "ALTER TABLE deals ADD COLUMN last_action_by INTEGER NULL REFERENCES users(id)",
        "terms_history": "ALTER TABLE deals ADD COLUMN terms_history JSON NOT NULL DEFAULT '[]'",
    }
    missing = [statement for column, statement in additions.items() if column not in existing_columns]
    if missing:
        with engine.begin() as connection:
            for statement in missing:
                connection.execute(text(statement))
