import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.site_settings import ensure_site_settings_columns
from app.models.user import ensure_user_columns
from app.models.deal import ensure_deal_columns
from app.models import custom_script as _custom_script  # noqa: F401
from app.models import tracking_settings as _tracking_settings  # noqa: F401
from app.models import verification_html_file as _verification_html_file  # noqa: F401
from app.models import deal_document as _deal_document  # noqa: F401
from app.routers import auth, cards, dashboard, deals, messages, notifications, site_settings, users, verifications
from app.routers import custom_scripts, ssr, tracking_settings, verification_html


Base.metadata.create_all(bind=engine)
ensure_site_settings_columns(engine)
ensure_user_columns(engine)
ensure_deal_columns(engine)


def seed_admin():
    """Create the configured admin account on first startup."""
    db = SessionLocal()
    try:
        from app.models.user import User

        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not existing:
            db.add(User(
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                full_name=settings.ADMIN_FULLNAME,
                company_name="Connectov",
                role="admin",
                plan="enterprise",
                trust_score=100,
                is_verified=True,
            ))
            db.commit()
            print(f"[SEED] Admin account created: {settings.ADMIN_EMAIL}")
        else:
            print(f"[SEED] Admin account already exists: {settings.ADMIN_EMAIL}")
    finally:
        db.close()


seed_admin()

os.makedirs("uploads/verifications", exist_ok=True)
os.makedirs("uploads/verification_html", exist_ok=True)
os.makedirs("uploads/deals", exist_ok=True)

app = FastAPI(title="Connectov API", version="1.0.0")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cards.router)
app.include_router(deals.router)
app.include_router(notifications.router)
app.include_router(dashboard.router)
app.include_router(site_settings.router)
app.include_router(verifications.router)
app.include_router(messages.router)
app.include_router(tracking_settings.router)
app.include_router(custom_scripts.router)
app.include_router(verification_html.router)
app.include_router(ssr.router)


@app.get("/")
def root():
    return {"message": "Connectov API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}