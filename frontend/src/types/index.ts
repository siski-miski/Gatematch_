export interface User {
    id: number;
    email: string;
    full_name: string;
    company_name: string | null;
    role: 'provider' | 'seeker' | 'both' | 'admin';
    country: string | null;
    plan: 'explorer' | 'professional' | 'enterprise';
    trust_score: number;
    is_verified: boolean;
    avatar_url: string | null;
    created_at: string;
}

export interface SignupConfig {
    signup_allowed: boolean;
    signup_block_message: string;
    contact_whatsapp: string;
}

export interface Card {
    id: number;
    user_id: number;
    type: 'offer' | 'request';
    operation_type: 'rent' | 'sell' | null;
    title: string;
    description: string;
    gateway_type: string | null;
    regions: string[];
    industries: string[];
    currencies: string[];
    pricing_model: 'percentage' | 'fixed' | 'negotiable' | null;
    commission_rate: number | null;
    fixed_fee: number | null;
    min_volume: number | null;
    max_volume: number | null;
    risk_tolerance: string | null;
    is_active: boolean;
    proposal_status: string | null;
    views_count: number;
    created_at: string;
    updated_at: string;
    provider_name: string | null;
    provider_company: string | null;
    provider_trust_score: number | null;
    provider_is_verified: boolean | null;
}

export interface Deal {
    id: number;
    provider_id: number;
    seeker_id: number;
    card_id: number;
    status: 'pending' | 'countered' | 'active' | 'completed' | 'terminated' | 'withdrawn' | 'review';
    monthly_volume: number | null;
    commission_rate: number | null;
    start_date: string | null;
    end_date: string | null;
    notes: string | null;
    initiator_id: number | null;
    last_action_by: number | null;
    terms_history: Record<string, unknown>[];
    action_required: 'respond' | 'waiting' | 'complete' | 'confirm_completion' | null;
    created_at: string;
    provider_name: string | null;
    seeker_name: string | null;
    card_title: string | null;
}

export interface DealDocument {
    id: number;
    deal_id: number;
    uploaded_by: number;
    file_name: string;
    content_type: string | null;
    created_at: string;
    uploader_name: string | null;
}

export interface Notification {
    id: number;
    user_id: number;
    type: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface DashboardStats {
    active_deals: number;
    volume_processed: number;
    revenue_earned: number;
    trust_score: number;
}

export interface VolumeHistory {
    month: string;
    volume: number;
}

export interface FilterState {
    cardType: string | null;
    regions: string[];
    paymentMethods: string[];
    industries: string[];
    trustScore: number | null;
    verifiedOnly: boolean;
    maxVolume: number;
    search: string;
    sort: string;
    page: number;
}

export interface MessageItem {
    id: number;
    card_id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    is_read: boolean;
    created_at: string;
    sender_name: string | null;
}

export interface MessageConversation {
    conversation_key: string;
    card_id: number;
    card_title: string | null;
    other_user_id: number;
    other_user_name: string | null;
    other_user_company: string | null;
    last_sender_id: number;
    last_message: string;
    last_message_at: string | null;
    unread_count: number;
}
