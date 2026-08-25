from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, set_auth_cookies, clear_auth_cookies,
    get_current_user_id,
)
from app.core.config import settings
from app.models.user import User
from app.models.site_settings import SiteSettings
from app.schemas.schemas import RegisterRequest, LoginRequest, UserResponse, SignupConfigResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/config", response_model=SignupConfigResponse)
def get_auth_config(db: Session = Depends(get_db)):
    settings_row = db.query(SiteSettings).first()
    return SignupConfigResponse(
        signup_allowed=settings.SIGNUP_ALLOWED,
        signup_block_message=settings.SIGNUP_BLOCK_MESSAGE,
        contact_whatsapp=settings_row.contact_whatsapp if settings_row else "",
    )


@router.post("/register", response_model=UserResponse)
def register(data: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    if not settings.SIGNUP_ALLOWED:
        settings_row = db.query(SiteSettings).first()
        whatsapp_number = settings_row.contact_whatsapp if settings_row and settings_row.contact_whatsapp else "1234567890"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{settings.SIGNUP_BLOCK_MESSAGE}. WhatsApp: https://wa.me/{whatsapp_number}",
        )

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        company_name=data.company_name,
        role=data.role,
        country=data.country,
        plan=data.plan,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    set_auth_cookies(response, access_token, refresh_token)

    return user


@router.post("/login", response_model=UserResponse)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    set_auth_cookies(response, access_token, refresh_token)

    return user


@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")

    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    set_auth_cookies(response, access_token, refresh_token)

    return {"message": "Token refreshed"}


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookies(response)
    return {"message": "Logged out"}
