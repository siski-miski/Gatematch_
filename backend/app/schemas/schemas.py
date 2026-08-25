from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


# ── Auth ──
class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    full_name: str
    company_name: Optional[str] = None
    role: str = Field(pattern="^(provider|seeker|both|admin)$")
    country: Optional[str] = None
    plan: str = Field(default="explorer", pattern="^(explorer|professional|enterprise)$")


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupConfigResponse(BaseModel):
    signup_allowed: bool
    signup_block_message: str
    contact_whatsapp: str


# ── User ──
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    company_name: Optional[str]
    role: str
    country: Optional[str]
    plan: str
    trust_score: int
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    country: Optional[str] = None
    plan: Optional[str] = Field(default=None, pattern="^(explorer|professional|enterprise)$")


# ── Card ──
class CardCreate(BaseModel):
    type: str = Field(pattern="^(offer|request)$")
    operation_type: Optional[str] = Field(default=None, pattern="^(rent|sell)$")
    title: str
    description: str
    gateway_type: Optional[str] = None
    regions: List[str] = Field(default_factory=list)
    industries: List[str] = Field(default_factory=list)
    currencies: List[str] = Field(default_factory=list)
    pricing_model: Optional[str] = None
    commission_rate: Optional[float] = None
    fixed_fee: Optional[float] = None
    min_volume: Optional[float] = None
    max_volume: Optional[float] = None
    risk_tolerance: Optional[str] = None


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    gateway_type: Optional[str] = None
    regions: Optional[List[str]] = None
    industries: Optional[List[str]] = None
    currencies: Optional[List[str]] = None
    pricing_model: Optional[str] = None
    commission_rate: Optional[float] = None
    fixed_fee: Optional[float] = None
    min_volume: Optional[float] = None
    max_volume: Optional[float] = None
    risk_tolerance: Optional[str] = None
    operation_type: Optional[str] = Field(default=None, pattern="^(rent|sell)$")


class CardResponse(BaseModel):
    id: int
    user_id: int
    type: str
    operation_type: Optional[str] = None
    title: str
    description: str
    gateway_type: Optional[str]
    regions: List[str]
    industries: List[str]
    currencies: List[str]
    pricing_model: Optional[str]
    commission_rate: Optional[float]
    fixed_fee: Optional[float]
    min_volume: Optional[float]
    max_volume: Optional[float]
    risk_tolerance: Optional[str]
    is_active: bool
    proposal_status: Optional[str] = None
    views_count: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    # Joined fields
    provider_name: Optional[str] = None
    provider_company: Optional[str] = None
    provider_trust_score: Optional[int] = None
    provider_is_verified: Optional[bool] = None

    class Config:
        from_attributes = True


# ── Deal ──
class DealCreate(BaseModel):
    card_id: int
    provider_id: Optional[int] = None
    monthly_volume: Optional[float] = Field(default=None, gt=0)
    commission_rate: Optional[float] = Field(default=None, ge=0, le=100)
    notes: Optional[str] = Field(default=None, max_length=2000)


class DealTermsUpdate(BaseModel):
    monthly_volume: Optional[float] = Field(default=None, gt=0)
    commission_rate: Optional[float] = Field(default=None, ge=0, le=100)
    notes: Optional[str] = Field(default=None, max_length=2000)


class DealStatusUpdate(BaseModel):
    status: str = Field(pattern="^(active|terminated|review)$")


class DealResponse(BaseModel):
    id: int
    provider_id: int
    seeker_id: int
    card_id: int
    status: str
    monthly_volume: Optional[float]
    commission_rate: Optional[float]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    notes: Optional[str]
    initiator_id: Optional[int] = None
    last_action_by: Optional[int] = None
    terms_history: List[Dict[str, Any]] = Field(default_factory=list)
    action_required: Optional[str] = None
    created_at: Optional[datetime]
    # Joined
    provider_name: Optional[str] = None
    seeker_name: Optional[str] = None
    card_title: Optional[str] = None

    class Config:
        from_attributes = True


# ── Notification ──
class DealDocumentResponse(BaseModel):
    id: int
    deal_id: int
    uploaded_by: int
    file_name: str
    content_type: Optional[str]
    created_at: Optional[datetime]
    uploader_name: Optional[str] = None

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    message: str
    is_read: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Dashboard ──
class DashboardStats(BaseModel):
    active_deals: int
    volume_processed: float
    revenue_earned: float
    trust_score: int


class VolumeHistory(BaseModel):
    month: str
    volume: float


# ── Site Settings ──
class FaqItem(BaseModel):
    q: str
    a: str


class LegalDocument(BaseModel):
    id: str
    slug: str
    title: str
    html: str = ""
    markdown: Optional[str] = None
    updated_at: Optional[str] = None
    show_in_footer: bool = True
    is_system: Optional[bool] = False


class ContactSettingsResponse(BaseModel):
    contact_whatsapp: str
    contact_email: str
    contact_hours: str
    contact_offices: str
    contact_sales_href: str
    contact_faqs: List[FaqItem]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_location_status: Optional[str] = None
    contact_location_error: Optional[str] = None
    google_analytics_id: str = ""
    google_tag_manager_id: str = ""
    search_console_verification_code: str = ""
    custom_header_scripts: str = ""
    custom_footer_scripts: str = ""
    integration_snippets: List[Dict[str, Any]] = Field(default_factory=list)
    legal_pages: Dict[str, Any] = Field(default_factory=dict)
    legal_documents: List[LegalDocument] = []
    legal_localization_enabled: bool = False
    legal_default_locale: str = "en"

    class Config:
        from_attributes = True


class ContactSettingsUpdate(BaseModel):
    contact_whatsapp: Optional[str] = None
    contact_email: Optional[str] = None
    contact_hours: Optional[str] = None
    contact_offices: Optional[str] = None
    contact_sales_href: Optional[str] = None
    contact_faqs: Optional[List[FaqItem]] = None
    google_analytics_id: Optional[str] = None
    google_tag_manager_id: Optional[str] = None
    search_console_verification_code: Optional[str] = None
    custom_header_scripts: Optional[str] = None
    custom_footer_scripts: Optional[str] = None
    integration_snippets: Optional[List[Dict[str, Any]]] = None
    legal_pages: Optional[Dict[str, Any]] = None
    legal_documents: Optional[List[LegalDocument]] = None
    legal_localization_enabled: Optional[bool] = None
    legal_default_locale: Optional[str] = None


# ── Tracking & Verification ──
class TrackingSettingsResponse(BaseModel):
    google_analytics_id: str = ""
    google_tag_manager_id: str = ""
    google_search_console_code: str = ""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TrackingSettingsUpdate(BaseModel):
    google_analytics_id: Optional[str] = None
    google_tag_manager_id: Optional[str] = None
    google_search_console_code: Optional[str] = None


class CustomScriptResponse(BaseModel):
    id: int
    location: str
    content: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CustomScriptCreate(BaseModel):
    location: str = Field(pattern="^(header|body|footer)$")
    content: str


class CustomScriptUpdate(BaseModel):
    content: str


class VerificationHtmlFileResponse(BaseModel):
    id: int
    filename: str
    public_url: str
    created_at: Optional[datetime] = None


# ── Verification ──
class VerificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    document_type: Optional[str]
    document_side: Optional[str]
    document_path: Optional[str]
    status: str
    rejection_reason: Optional[str]
    submitted_at: Optional[datetime]
    reviewed_at: Optional[datetime]

    class Config:
        from_attributes = True


class AdminVerificationResponse(VerificationResponse):
    user_email: Optional[str] = None
    user_full_name: Optional[str] = None


class VerificationReviewRequest(BaseModel):
    status: str = Field(pattern="^(approved|rejected)$")
    rejection_reason: Optional[str] = None


# ── Message ──
class MessageCreate(BaseModel):
    card_id: int
    receiver_id: int
    content: str


class MessageResponse(BaseModel):
    id: int
    card_id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: Optional[datetime]
    sender_name: Optional[str] = None

    class Config:
        from_attributes = True


class MessageConversationResponse(BaseModel):
    conversation_key: str
    card_id: int
    card_title: Optional[str] = None
    other_user_id: int
    other_user_name: Optional[str] = None
    other_user_company: Optional[str] = None
    last_sender_id: int
    last_message: str
    last_message_at: Optional[datetime] = None
    unread_count: int
