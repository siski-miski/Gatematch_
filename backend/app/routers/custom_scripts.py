from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.custom_script import CustomScript
from app.models.user import User
from app.schemas.schemas import CustomScriptCreate, CustomScriptResponse, CustomScriptUpdate
from app.services.tracking_injections import invalidate_tracking_cache

router = APIRouter(prefix="/custom-scripts", tags=["custom-scripts"])

MAX_SCRIPT_LENGTH = 20000


def _require_admin(request: Request, db: Session) -> User:
    user_id = get_current_user_id(request)
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def _validate_content(content: str) -> str:
    trimmed = content.strip()
    if not trimmed:
        raise HTTPException(status_code=400, detail="Script content cannot be empty")
    if len(trimmed) > MAX_SCRIPT_LENGTH:
        raise HTTPException(status_code=400, detail="Script content is too large")
    if "\x00" in trimmed:
        raise HTTPException(status_code=400, detail="Script content contains invalid characters")
    return trimmed


@router.get("", response_model=list[CustomScriptResponse])
def list_custom_scripts(
    request: Request,
    location: str | None = None,
    db: Session = Depends(get_db),
):
    _require_admin(request, db)
    query = db.query(CustomScript)
    if location:
        if location not in {"header", "body", "footer"}:
            raise HTTPException(status_code=400, detail="Invalid location")
        query = query.filter(CustomScript.location == location)
    return query.order_by(CustomScript.created_at.asc(), CustomScript.id.asc()).all()


@router.post("", response_model=CustomScriptResponse)
def create_custom_script(
    data: CustomScriptCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request, db)
    content = _validate_content(data.content)
    script = CustomScript(location=data.location, content=content)
    db.add(script)
    db.commit()
    db.refresh(script)
    invalidate_tracking_cache()
    return script


@router.put("/{script_id}", response_model=CustomScriptResponse)
def update_custom_script(
    script_id: int,
    data: CustomScriptUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request, db)
    script = db.query(CustomScript).filter(CustomScript.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    script.content = _validate_content(data.content)
    db.commit()
    db.refresh(script)
    invalidate_tracking_cache()
    return script


@router.delete("/{script_id}")
def delete_custom_script(
    script_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request, db)
    script = db.query(CustomScript).filter(CustomScript.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    db.delete(script)
    db.commit()
    invalidate_tracking_cache()
    return {"message": "Script deleted"}
