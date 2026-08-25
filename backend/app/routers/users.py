from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session
import os
import uuid
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.schemas.schemas import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/me", response_model=UserResponse)
@router.patch("/me", response_model=UserResponse)
def update_me(data: UserUpdate, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update = data.model_dump(exclude_unset=True)
    if "plan" in update:
        raise HTTPException(status_code=403, detail="Plan changes require checkout or a sales review")

    for field, value in update.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    request: Request,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(request)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    extensions = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
    extension = extensions.get(image.content_type or "")
    if not extension:
        raise HTTPException(status_code=400, detail="Please upload a JPG, PNG, or WEBP image")

    content = await image.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Profile images must be smaller than 5 MB")

    upload_dir = "uploads/avatars"
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{user_id}_{uuid.uuid4().hex[:12]}{extension}"
    with open(os.path.join(upload_dir, filename), "wb") as file:
        file.write(content)

    user.avatar_url = f"/uploads/avatars/{filename}"
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
