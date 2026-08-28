from sqlalchemy import Column, Integer, String, JSON, Float, Text, Boolean
from sqlalchemy.engine import Engine
from sqlalchemy import inspect, text
from app.core.database import Base

DEFAULT_FAQS = [
    {"q": "How quickly can I get a deal activated?", "a": "Most deals go live within 48–72 hours of both parties signing the term sheet, subject to KYB verification."},
    {"q": "Is Connectov regulated?", "a": "Connectov operates as an infrastructure marketplace, not a payment processor. Regulatory compliance sits with the licensed providers on the platform."},
    {"q": "What happens if a deal goes wrong?", "a": "Professional and Enterprise plans include escrow protection and structured dispute resolution with our compliance team."},
    {"q": "Can I list multiple gateway types?", "a": "Yes — providers can post unlimited cards on the Professional plan, covering different corridors, currencies, and processing types."},
]


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, default=1)
    contact_whatsapp = Column(String, nullable=False, default="1234567890")
    contact_email = Column(String, nullable=False, default="support@Connectov.io")
    contact_hours = Column(String, nullable=False, default="Mon – Fri, 9am – 7pm CET")
    contact_offices = Column(String, nullable=False, default="Paris · London · Dubai")
    contact_sales_href = Column(String, nullable=False, default="#")
    contact_faqs = Column(JSON, nullable=False, default=list)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    contact_location_status = Column(String, nullable=False, default="idle")
    contact_location_error = Column(String, nullable=True)
    google_analytics_id = Column(String, nullable=False, default="")
    google_tag_manager_id = Column(String, nullable=False, default="")
    search_console_verification_code = Column(String, nullable=False, default="")
    custom_header_scripts = Column(Text, nullable=False, default="")
    custom_footer_scripts = Column(Text, nullable=False, default="")
    integration_snippets = Column(JSON, nullable=False, default=list)
    legal_pages = Column(JSON, nullable=False, default=dict)
    legal_documents = Column(JSON, nullable=False, default=list)
    legal_localization_enabled = Column(Boolean, nullable=False, default=False)
    legal_default_locale = Column(String, nullable=False, default="en")


def ensure_site_settings_columns(engine: Engine) -> None:
    inspector = inspect(engine)
    if "site_settings" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("site_settings")}

    with engine.begin() as connection:
        if "contact_location_status" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN contact_location_status VARCHAR NOT NULL DEFAULT 'idle'"))
            connection.execute(text("UPDATE site_settings SET contact_location_status = 'idle' WHERE contact_location_status IS NULL"))
        if "contact_location_error" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN contact_location_error VARCHAR NULL"))
        if "google_analytics_id" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN google_analytics_id VARCHAR NOT NULL DEFAULT ''"))
        if "google_tag_manager_id" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN google_tag_manager_id VARCHAR NOT NULL DEFAULT ''"))
        if "search_console_verification_code" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN search_console_verification_code VARCHAR NOT NULL DEFAULT ''"))
        if "custom_header_scripts" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN custom_header_scripts TEXT NOT NULL DEFAULT ''"))
        if "custom_footer_scripts" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN custom_footer_scripts TEXT NOT NULL DEFAULT ''"))
        if "integration_snippets" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN integration_snippets JSON NOT NULL DEFAULT '[]'"))
        if "legal_pages" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN legal_pages JSON NOT NULL DEFAULT '{}'"))
        if "legal_documents" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN legal_documents JSON NOT NULL DEFAULT '[]'"))
        if "legal_localization_enabled" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN legal_localization_enabled BOOLEAN NOT NULL DEFAULT 0"))
        if "legal_default_locale" not in existing_columns:
            connection.execute(text("ALTER TABLE site_settings ADD COLUMN legal_default_locale VARCHAR NOT NULL DEFAULT 'en'"))
