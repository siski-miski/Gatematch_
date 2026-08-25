import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, Bookmark, SlidersHorizontal, LogIn, Mail, Lock, X, Upload, ShieldAlert, Clock, AlertCircle, Plus, MessageSquare, Send, Handshake, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import type { Card } from '../types';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import Footer from '../components/layout/Footer';
import { CURRENCIES, PAYMENT_GATEWAYS } from '../config/formOptions';

const REGIONS = ['Global', 'EU', 'North America', 'LATAM', 'MENA', 'Asia', 'Africa'];
const PAYMENT_METHODS = PAYMENT_GATEWAYS;
const INDUSTRIES = ['eCommerce', 'SaaS', 'Travel', 'Digital Goods', 'High Risk'];
const TRUST_SCORES = [{ label: 'Any', value: 0 }, { label: '70+', value: 70 }, { label: '85+', value: 85 }, { label: '95+', value: 95 }];

const avatarColors = [
    'from-[#4F8EF7] to-[#7EC8E3]',
    'from-[#F7934F] to-[#F7D14F]',
    'from-[#1A9E6E] to-[#7EC8A3]',
    'from-[#7C4FE0] to-[#C17FED]',
    'from-gold to-gold-pale',
    'from-[#4FC4CF] to-[#7EE8F0]',
];

interface MessageItem {
    id: number;
    card_id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    is_read: boolean;
    created_at: string;
    sender_name: string | null;
}

/* ── Login Modal ── */
function LoginModal({ onClose }: { onClose: () => void }) {
    const { setUser } = useAuthStore();
    const { addToast } = useNotificationStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Please fill in all fields.'); return; }
        setSubmitting(true);
        try {
            const res = await client.post('/auth/login', { email, password });
            setUser(res.data);
            addToast('Welcome back!', 'success');
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        }
        setSubmitting(false);
    };

    return (
        <motion.div className="mkt-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose}>
            <motion.div className="mkt-modal" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()}>
                <button type="button" className="mkt-modal-close" onClick={onClose}><X size={18} /></button>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <LogIn size={22} style={{ color: 'var(--navy)' }} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.03em', marginBottom: 6 }}>Sign in to continue</div>
                    <div style={{ fontSize: 13, color: 'var(--slate)' }}>Log in to interact with listings and post cards.</div>
                </div>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--slate)', marginBottom: 6, display: 'block' }}>Email</label>
                        <div className="mkt-modal-input-wrap"><Mail size={15} style={{ color: 'var(--slate)', flexShrink: 0 }} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="mkt-modal-input" /></div>
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--slate)', marginBottom: 6, display: 'block' }}>Password</label>
                        <div className="mkt-modal-input-wrap"><Lock size={15} style={{ color: 'var(--slate)', flexShrink: 0 }} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mkt-modal-input" /></div>
                    </div>
                    {error && <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 14px' }}>{error}</div>}
                    <motion.button type="submit" disabled={submitting} className="mkt-modal-submit" whileHover={{ y: -1, boxShadow: '0 12px 28px rgba(201,168,76,0.32)' }}>
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                </form>
                <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--slate)' }}>
                    Don't have an account?{' '}<Link to="/register" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ── Verification Modal ── */
function VerificationModal({ onClose }: { onClose: () => void }) {
    const { addToast } = useNotificationStore();
    const [verifications, setVerifications] = useState<{ type: string; status: string; document_side?: string; rejection_reason?: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [docType, setDocType] = useState('id_card');
    const [fileFront, setFileFront] = useState<File | null>(null);
    const [fileBack, setFileBack] = useState<File | null>(null);

    useEffect(() => {
        client.get('/verifications/me').then((r) => setVerifications(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const kycFront = verifications.find((v) => v.type === 'kyc' && v.document_side === 'front');
    const kyc = kycFront || verifications.find((v) => v.type === 'kyc');
    const isPending = kyc?.status === 'pending';
    const isRejected = kyc?.status === 'rejected';
    const notStarted = !kyc;
    const needsBack = docType !== 'passport' && docType !== 'business_reg';

    const handleUpload = async () => {
        if (!fileFront) { addToast('Please select a front document.', 'error'); return; }
        if (needsBack && !fileBack) { addToast('Please select a back document.', 'error'); return; }
        setUploading(true);
        try {
            const frontData = new FormData();
            frontData.append('document', fileFront);
            frontData.append('type', 'kyc');
            frontData.append('document_type', docType);
            frontData.append('document_side', 'front');
            await client.post('/verifications/submit', frontData, { headers: { 'Content-Type': 'multipart/form-data' } });

            if (needsBack && fileBack) {
                const backData = new FormData();
                backData.append('document', fileBack);
                backData.append('type', 'kyc');
                backData.append('document_type', docType);
                backData.append('document_side', 'back');
                await client.post('/verifications/submit', backData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            addToast('Documents submitted for review!', 'success');
            onClose();
        } catch (err: any) {
            addToast(err.response?.data?.detail || 'Upload failed.', 'error');
        }
        setUploading(false);
    };

    const selectStyle: React.CSSProperties = { width: '100%', background: 'var(--navy)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--white)', fontFamily: "'DM Sans', sans-serif" };
    const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--slate)', marginBottom: 6, display: 'block' };
    const fileLabel: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--navy)', border: '1px dashed var(--border-light)', borderRadius: 12, cursor: 'pointer' };

    return (
        <motion.div className="mkt-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div className="mkt-modal" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: 0.22 }} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <button type="button" className="mkt-modal-close" onClick={onClose}><X size={18} /></button>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: isPending ? 'rgba(201,168,76,0.12)' : isRejected ? 'rgba(248,113,113,0.12)' : 'rgba(77,168,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        {isPending ? <Clock size={22} style={{ color: 'var(--gold)' }} /> : isRejected ? <AlertCircle size={22} style={{ color: '#f87171' }} /> : <ShieldAlert size={22} style={{ color: '#4da8ff' }} />}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.03em', marginBottom: 6 }}>
                        {isPending ? 'Verification in progress' : isRejected ? 'Verification rejected' : 'Identity verification required'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.5 }}>
                        {isPending ? "Your documents are being reviewed. This usually takes 24–48 hours."
                            : isRejected ? `Rejected${kyc?.rejection_reason ? `: ${kyc.rejection_reason}` : '. Please re-upload.'}`
                                : 'To post cards and initiate deals, verify your identity first.'}
                    </div>
                </div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 20, color: 'var(--slate)', fontSize: 13 }}>Loading…</div>
                ) : isPending ? (
                    <motion.button onClick={onClose} className="mkt-modal-submit" style={{ background: 'var(--navy-mid)', color: 'var(--slate)', border: '1px solid var(--border-light)' }}>Got it, I'll wait</motion.button>
                ) : (notStarted || isRejected) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Document type</label>
                            <select value={docType} onChange={(e) => setDocType(e.target.value)} style={selectStyle}>
                                <option value="id_card">National ID Card</option>
                                <option value="passport">Passport</option>
                                <option value="driver_license">Driver's License</option>
                                <option value="business_reg">Business Registration</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>{needsBack ? 'Front side' : 'Document'}</label>
                            <label style={fileLabel}>
                                <Upload size={18} style={{ color: 'var(--slate)' }} />
                                <span style={{ fontSize: 13, color: fileFront ? 'var(--white)' : 'var(--slate)' }}>{fileFront ? fileFront.name : 'Click to select file (JPG, PNG, PDF)'}</span>
                                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFileFront(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                            </label>
                        </div>
                        {needsBack && (
                            <div>
                                <label style={labelStyle}>Back side</label>
                                <label style={fileLabel}>
                                    <Upload size={18} style={{ color: 'var(--slate)' }} />
                                    <span style={{ fontSize: 13, color: fileBack ? 'var(--white)' : 'var(--slate)' }}>{fileBack ? fileBack.name : 'Click to select file (JPG, PNG, PDF)'}</span>
                                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFileBack(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                                </label>
                            </div>
                        )}
                        <motion.button onClick={handleUpload} disabled={uploading || !fileFront} className="mkt-modal-submit" whileHover={{ y: -1 }}>
                            {uploading ? 'Uploading…' : 'Submit for review'}
                        </motion.button>
                    </div>
                ) : null}
            </motion.div>
        </motion.div>
    );
}

/* ── Card Detail Modal ── */
function CardDetailModal({ card, onClose }: { card: Card; onClose: () => void }) {
    const { user, isAuthenticated } = useAuthStore();
    const { addToast } = useNotificationStore();
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [msgInput, setMsgInput] = useState('');
    const [sending, setSending] = useState(false);
    const [dealOpen, setDealOpen] = useState(false);
    const [dealStep, setDealStep] = useState<1 | 2>(1);
    const [dealVolume, setDealVolume] = useState('');
    const [dealRate, setDealRate] = useState(card.commission_rate?.toString() || '');
    const [dealNotes, setDealNotes] = useState('');
    const [dealSubmitting, setDealSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isOwnCard = user?.id === card.user_id;

    useEffect(() => {
        if (!isAuthenticated || isOwnCard) return;
        client.get('/messages', { params: { card_id: card.id } })
            .then((r) => setMessages(r.data))
            .catch(() => {});
    }, [card.id, isAuthenticated, isOwnCard]);

    const sendMessage = async () => {
        if (!msgInput.trim() || sending) return;
        setSending(true);
        try {
            const res = await client.post('/messages', {
                card_id: card.id,
                receiver_id: card.user_id,
                content: msgInput.trim(),
            });
            setMessages((prev) => [...prev, res.data]);
            setMsgInput('');
        } catch (err: any) {
            addToast(err.response?.data?.detail || 'Failed to send message.', 'error');
        }
        setSending(false);
    };

    const requestDeal = async () => {
        if (dealVolume && Number(dealVolume) <= 0) {
            addToast('Monthly volume must be greater than zero.', 'error');
            return;
        }
        if (dealRate && (Number(dealRate) < 0 || Number(dealRate) > 100)) {
            addToast('Commission must be between 0 and 100%.', 'error');
            return;
        }
        setDealSubmitting(true);
        try {
            await client.post('/deals', {
                card_id: card.id,
                monthly_volume: dealVolume ? Number(dealVolume) : null,
                commission_rate: dealRate ? Number(dealRate) : null,
                notes: dealNotes.trim() || null,
            });
            addToast('Deal request sent. You will be notified when the provider responds.', 'success');
            setDealOpen(false);
            setDealStep(1);
            setDealVolume('');
            setDealRate(card.commission_rate?.toString() || '');
            setDealNotes('');
        } catch (err: any) {
            addToast(err.response?.data?.detail || 'Could not start the deal.', 'error');
        }
        setDealSubmitting(false);
    };

    const providerInitials = (card.provider_company || card.provider_name || 'PB')
        .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <motion.div className="mkt-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose}>
            <motion.div className="cdm" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()}>
                <button type="button" className="mkt-modal-close" onClick={onClose}><X size={18} /></button>

                <div className="cdm-header">
                    <span className={`mkt-type-pill ${card.type}`}>{card.type === 'offer' ? 'Offer' : 'Request'}</span>
                    <span className="cdm-views">{card.views_count} views</span>
                </div>
                <h2 className="cdm-title">{card.title}</h2>

                <div className="cdm-tabs">
                    <button className={`cdm-tab${activeTab === 'info' ? ' active' : ''}`} onClick={() => setActiveTab('info')}>Details</button>
                    {!isOwnCard && isAuthenticated && (
                        <button className={`cdm-tab${activeTab === 'chat' ? ' active' : ''}`} onClick={() => setActiveTab('chat')}>
                            Messages {messages.length > 0 && `(${messages.length})`}
                        </button>
                    )}
                </div>

                {activeTab === 'info' && (
                    <div className="cdm-body">
                        <p className="cdm-desc">{card.description}</p>
                        <div className="cdm-grid">
                            {card.gateway_type && <div className="cdm-field"><span>Gateway</span><strong>{card.gateway_type}</strong></div>}
                            {card.regions?.length > 0 && <div className="cdm-field"><span>Regions</span><strong>{card.regions.join(', ')}</strong></div>}
                            {card.industries?.length > 0 && <div className="cdm-field"><span>Industries</span><strong>{card.industries.join(', ')}</strong></div>}
                            {card.currencies?.length > 0 && <div className="cdm-field"><span>Currencies</span><strong>{card.currencies.join(', ')}</strong></div>}
                            {card.pricing_model && <div className="cdm-field"><span>Pricing Model</span><strong style={{ textTransform: 'capitalize' }}>{card.pricing_model}</strong></div>}
                            {card.pricing_model === 'percentage' && card.commission_rate != null && (
                                <div className="cdm-field"><span>Commission</span><strong>{card.commission_rate}%</strong></div>
                            )}
                            {card.pricing_model === 'fixed' && card.fixed_fee != null && (
                                <div className="cdm-field"><span>Fixed Fee</span><strong>€{card.fixed_fee.toFixed(2)}</strong></div>
                            )}
                            {card.min_volume != null && <div className="cdm-field"><span>Min Volume</span><strong>${card.min_volume.toLocaleString()}/mo</strong></div>}
                            {card.max_volume != null && <div className="cdm-field"><span>Max Volume</span><strong>${card.max_volume.toLocaleString()}/mo</strong></div>}
                            {card.risk_tolerance && <div className="cdm-field"><span>Risk Tolerance</span><strong style={{ textTransform: 'capitalize' }}>{card.risk_tolerance}</strong></div>}
                        </div>
                        <div className="cdm-provider">
                            <div className="cdm-provider-header">Provider</div>
                            <div className="cdm-provider-info">
                                <div className="cdm-provider-avatar">{providerInitials}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="cdm-provider-name">{card.provider_company || card.provider_name}</div>
                                    {card.provider_is_verified && <span className="cdm-verified"><CheckCircle size={10} /> Verified</span>}
                                </div>
                                {card.provider_trust_score != null && (
                                    <div className="cdm-trust-score">Trust: <strong>{card.provider_trust_score}</strong></div>
                                )}
                            </div>
                        </div>
                        {!isOwnCard && isAuthenticated && (
                            <button className="cdm-chat-btn" onClick={() => setActiveTab('chat')}>
                                <MessageSquare size={16} /> Contact Provider
                            </button>
                        )}
                        {!isAuthenticated && (
                            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--slate)', padding: '12px', background: 'var(--navy)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                                Sign in to contact this provider
                            </div>
                        )}
                        {!isOwnCard && isAuthenticated && (
                            <div style={{ marginTop: 12 }}>
                                {!dealOpen ? (
                                    <button
                                        className="cdm-chat-btn"
                                        onClick={() => setDealOpen(true)}
                                        style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--gold)', borderColor: 'rgba(201,168,76,0.35)' }}
                                    >
                                        <Handshake size={16} /> {card.type === 'offer' ? 'Request a deal' : 'Offer capacity'}
                                    </button>
                                ) : (
                                    <div className="cdm-deal-panel">
                                        <div className="cdm-deal-heading"><div className="cdm-deal-icon"><Handshake size={17} /></div><div><strong>Start a structured deal</strong><span>{dealStep === 1 ? 'Step 1 of 2 · Define the commercial terms.' : 'Step 2 of 2 · Review before sending.'}</span></div></div>
                                        <div className="cdm-deal-steps"><span className="active">1 <small>Terms</small></span><i /><span className={dealStep === 2 ? 'active' : ''}>2 <small>Review</small></span></div>
                                        <div className="cdm-deal-card-summary"><span>{card.type === 'offer' ? 'Requesting capacity from' : 'Offering capacity to'}</span><strong>{card.provider_company || card.provider_name}</strong><small>{card.gateway_type || 'Payment infrastructure'} · {card.regions?.join(', ') || 'Global coverage'}</small></div>
                                        {dealStep === 1 ? (
                                            <>
                                                <div className="cdm-deal-field"><label htmlFor="deal-volume">Expected monthly volume <em>Optional</em></label><div className="cdm-deal-input-wrap"><span>$</span><input id="deal-volume" type="number" min="1" value={dealVolume} onChange={(e) => setDealVolume(e.target.value)} placeholder="e.g. 25000" /></div><small>Use your expected processed volume in USD.</small></div>
                                                <div className="cdm-deal-field"><label htmlFor="deal-rate">Target commission <em>Optional</em></label><div className="cdm-deal-input-wrap"><input id="deal-rate" type="number" min="0" max="100" step="0.01" value={dealRate} onChange={(e) => setDealRate(e.target.value)} placeholder={card.commission_rate ? String(card.commission_rate) : 'e.g. 2.8'} /><span>%</span></div><small>The listing rate is prefilled when available and can be negotiated.</small></div>
                                                <div className="cdm-deal-actions"><button className="cdm-deal-cancel" onClick={() => setDealOpen(false)}>Cancel</button><button className="cdm-deal-submit" onClick={() => setDealStep(2)}>Review request <ArrowRight size={15} /></button></div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="cdm-deal-review"><div><span>Monthly volume</span><strong>{dealVolume ? `$${Number(dealVolume).toLocaleString()}` : 'To be agreed'}</strong></div><div><span>Commission</span><strong>{dealRate ? `${dealRate}%` : 'To be agreed'}</strong></div><div className="wide"><span>Your message</span><strong>{dealNotes.trim() || 'No additional notes'}</strong></div></div>
                                                <div className="cdm-deal-field"><label htmlFor="deal-notes">Message to the partner <em>Optional</em></label><textarea id="deal-notes" value={dealNotes} onChange={(e) => setDealNotes(e.target.value)} placeholder="Describe your corridor, business model, timing, or questions…" rows={3} /><small>Your request will start as Pending. The other participant can accept or counter.</small></div>
                                                <div className="cdm-deal-actions"><button className="cdm-deal-cancel" onClick={() => setDealStep(1)}>Back</button><button className="cdm-deal-submit" onClick={requestDeal} disabled={dealSubmitting}><Handshake size={15} />{dealSubmitting ? 'Sending request…' : 'Send deal request'}</button></div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'chat' && !isOwnCard && (
                    <div className="cdm-chat">
                        <div className="cdm-messages">
                            {messages.length === 0 ? (
                                <div className="cdm-no-messages">No messages yet. Start the conversation!</div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className={`cdm-message ${msg.sender_id === user?.id ? 'own' : 'other'}`}>
                                        <div className="cdm-message-content">{msg.content}</div>
                                        <div className="cdm-message-meta">
                                            {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="cdm-input-row">
                            <input
                                value={msgInput}
                                onChange={(e) => setMsgInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                placeholder="Type a message… (Enter to send)"
                                className="cdm-input"
                            />
                            <button onClick={sendMessage} disabled={sending || !msgInput.trim()} className="cdm-send-btn">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

const PLAN_CARD_LIMITS: Record<string, number> = { explorer: 1, professional: 10, enterprise: 999 };

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return <span onClick={onClick} className={`mkt-chip${active ? ' active' : ''}`}>{label}</span>;
}

function FormChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return <span onClick={onClick} className={`mkt-chip${active ? ' active' : ''}`} style={{ fontSize: 12, padding: '4px 10px' }}>{label}</span>;
}

/* ── Create Card Modal ── */
function CreateCardModal({ onClose, onCreated, initialOperation = 'offer' }: { onClose: () => void; onCreated: () => void; initialOperation?: 'offer' | 'request' | 'sell' | 'rent' }) {
    const { addToast } = useNotificationStore();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        operation: initialOperation,
        title: '', description: '', gateway_type: '',
        regions: [] as string[], industries: [] as string[], currencies: [] as string[], gateway_other: '',
        pricing_model: 'percentage', commission_rate: '', fixed_fee: '',
        min_volume: '', max_volume: '',
    });

    const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));
    const toggleArray = (field: 'regions' | 'industries' | 'currencies', val: string) =>
        setForm((f) => ({ ...f, [field]: f[field].includes(val) ? f[field].filter((v) => v !== val) : [...f[field], val] }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) { addToast('Title and description are required.', 'error'); return; }
        if (!form.gateway_type) { addToast('Select a payment gateway.', 'error'); return; }
        if (form.gateway_type === 'Other' && !form.gateway_other.trim()) { addToast('Tell us which payment gateway you use.', 'error'); return; }
        setSubmitting(true);
        try {
            const isPrivateOperation = form.operation === 'sell' || form.operation === 'rent';
            const mappedType = form.operation === 'sell' ? 'offer' : form.operation === 'rent' ? 'request' : form.operation;
            await client.post('/cards', {
                type: mappedType,
                operation_type: isPrivateOperation ? form.operation : null,
                title: form.title.trim(),
                description: form.description.trim(),
                gateway_type: form.gateway_type === 'Other' ? form.gateway_other.trim() : form.gateway_type,
                regions: form.regions, industries: form.industries,
                currencies: form.currencies,
                pricing_model: form.pricing_model,
                commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : null,
                fixed_fee: form.fixed_fee ? parseFloat(form.fixed_fee) : null,
                min_volume: form.min_volume ? parseFloat(form.min_volume) : null,
                max_volume: form.max_volume ? parseFloat(form.max_volume) : null,
            });
            addToast(isPrivateOperation
                ? 'Private operation submitted. Admin will validate it before activation.'
                : 'Card submitted for review! Admin will approve it shortly.', 'success');
            onCreated();
            onClose();
        } catch (err: any) {
            addToast(err.response?.data?.detail || 'Failed to create card.', 'error');
        }
        setSubmitting(false);
    };

    const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'var(--navy)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 14, color: 'var(--white)', fontFamily: "'DM Sans', sans-serif" };

    return (
        <motion.div className="mkt-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div className="mkt-modal" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: 0.22 }} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' }}>
                <button type="button" className="mkt-modal-close" onClick={onClose}><X size={18} /></button>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Plus size={22} style={{ color: 'var(--navy)' }} />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.03em' }}>Post a Card</div>
                    <div style={{ fontSize: 13, color: 'var(--slate)' }}>Choose one of 4 operations. Offer/Request are public marketplace cards. Sell/Rent are private and admin-validated.</div>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                        {([
                            { value: 'offer', label: 'Public Offer' },
                            { value: 'request', label: 'Public Request' },
                            { value: 'sell', label: 'Private Sell' },
                            { value: 'rent', label: 'Private Rent' },
                        ] as const).map((op) => (
                            <span key={op.value} onClick={() => set('operation', op.value)} className={`mkt-chip${form.operation === op.value ? ' active' : ''}`} style={{ textAlign: 'center', padding: '8px 12px', cursor: 'pointer' }}>
                                {op.label}
                            </span>
                        ))}
                    </div>
                    <div><label className="ccm-label">Title *</label><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. PayPal EU Gateway — eCommerce" style={inputStyle} /></div>
                    <div><label className="ccm-label">Description *</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Describe your offer or request in detail..." style={{ ...inputStyle, resize: 'vertical' as const }} /></div>
                    <div>
                        <label className="ccm-label">Payment gateway *</label>
                        <select value={form.gateway_type} onChange={(e) => set('gateway_type', e.target.value)} style={inputStyle}>
                            <option value="">Select a gateway</option>
                            {PAYMENT_GATEWAYS.map((gateway) => <option key={gateway} value={gateway}>{gateway}</option>)}
                        </select>
                    </div>
                    {form.gateway_type === 'Other' && (
                        <div>
                            <label className="ccm-label">Gateway name *</label>
                            <input value={form.gateway_other} onChange={(e) => set('gateway_other', e.target.value)} placeholder="Enter the gateway name" style={inputStyle} />
                        </div>
                    )}
                    <div><label className="ccm-label">Regions</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{REGIONS.filter(r => r !== 'Global').map((r) => <FormChip key={r} label={r} active={form.regions.includes(r)} onClick={() => toggleArray('regions', r)} />)}</div></div>
                    <div><label className="ccm-label">Industries</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{INDUSTRIES.map((ind) => <FormChip key={ind} label={ind} active={form.industries.includes(ind)} onClick={() => toggleArray('industries', ind)} />)}</div></div>
                    <div><label className="ccm-label">Settlement currencies</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{CURRENCIES.map((currency) => <FormChip key={currency} label={currency} active={form.currencies.includes(currency)} onClick={() => toggleArray('currencies', currency)} />)}</div></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div><label className="ccm-label">Pricing model</label><select value={form.pricing_model} onChange={(e) => set('pricing_model', e.target.value)} style={inputStyle}><option value="percentage">Percentage</option><option value="fixed">Fixed fee</option><option value="negotiable">Negotiable</option></select></div>
                        <div><label className="ccm-label">{form.pricing_model === 'fixed' ? 'Fixed fee ($)' : 'Commission (%)'}</label><input type="number" step="0.01" value={form.pricing_model === 'fixed' ? form.fixed_fee : form.commission_rate} onChange={(e) => set(form.pricing_model === 'fixed' ? 'fixed_fee' : 'commission_rate', e.target.value)} placeholder={form.pricing_model === 'fixed' ? '0.35' : '2.8'} style={inputStyle} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div><label className="ccm-label">Min volume ($)</label><input type="number" value={form.min_volume} onChange={(e) => set('min_volume', e.target.value)} placeholder="5000" style={inputStyle} /></div>
                        <div><label className="ccm-label">Max volume ($)</label><input type="number" value={form.max_volume} onChange={(e) => set('max_volume', e.target.value)} placeholder="100000" style={inputStyle} /></div>
                    </div>
                    <motion.button type="submit" disabled={submitting} className="mkt-modal-submit" whileHover={{ y: -1, boxShadow: '0 12px 28px rgba(201,168,76,0.32)' }}>{submitting ? 'Posting…' : 'Submit Card'}</motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
}

/* ── Main Page ── */
export default function MarketplacePage() {
    const { isAuthenticated, user } = useAuthStore();
    const [searchParams] = useSearchParams();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLoadingState, setShowLoadingState] = useState(false);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [cardType, setCardType] = useState<string | null>(null);
    const [activeRegion, setActiveRegion] = useState('Global');
    const [activeIndustry, setActiveIndustry] = useState('');
    const [activePaymentMethod, setActivePaymentMethod] = useState('');
    const [activeTrust, setActiveTrust] = useState(0);
    const [savedCards, setSavedCards] = useState<Set<number>>(new Set());
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [planLimitReached, setPlanLimitReached] = useState<number | null>(null);
    const [initialOperation, setInitialOperation] = useState<'offer' | 'request' | 'sell' | 'rent'>('offer');
    const intentHandled = useRef(false);

    const requestedOperation = searchParams.get('operation');
    const requestedPrivateOperation = requestedOperation === 'rent' || requestedOperation === 'sell' ? requestedOperation : null;

    const requireVerified = (callback?: () => void) => {
        if (!isAuthenticated) { setShowLoginModal(true); return; }
        if (!user?.is_verified) { setShowVerifyModal(true); return; }
        callback?.();
    };

    const openCreateModal = (operation: 'offer' | 'request' | 'sell' | 'rent' = 'offer') => {
        setInitialOperation(operation);
        requireVerified(async () => {
            try {
                const res = await client.get('/cards/mine');
                const count = res.data.filter((card: Card) => ['pending', 'accepted'].includes(card.proposal_status || '')).length;
                const limit = PLAN_CARD_LIMITS[user?.plan || 'explorer'] || 1;
                if (count >= limit) {
                    setPlanLimitReached(limit);
                    return;
                }
                setPlanLimitReached(null);
                setShowCreateModal(true);
            } catch {
                setShowCreateModal(true);
            }
        });
    };

    useEffect(() => {
        if (!requestedPrivateOperation || !isAuthenticated || intentHandled.current) return;
        intentHandled.current = true;
        if (!user?.is_verified) {
            setShowVerifyModal(true);
            return;
        }
        openCreateModal(requestedPrivateOperation);
    }, [requestedPrivateOperation, isAuthenticated, user?.is_verified]);

    const handleCardClick = (card: Card) => {
        if (!isAuthenticated) { setShowLoginModal(true); return; }
        setSelectedCard(card);
    };

    const fetchCards = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = { sort, page: '1', limit: '20' };
            if (search) params.search = search;
            if (cardType) params.type = cardType;
            if (activeRegion && activeRegion !== 'Global') params.region = activeRegion;
            if (activeIndustry) params.industry = activeIndustry;
            if (activePaymentMethod) params.gateway_type = activePaymentMethod;
            if (activeTrust > 0) params.min_trust = String(activeTrust);
            const res = await client.get('/cards', { params });
            setCards(res.data);
        } catch {
            setCards([]);
        }
        setLoading(false);
    }, [search, sort, cardType, activeRegion, activeIndustry, activePaymentMethod, activeTrust]);

    useEffect(() => { fetchCards(); }, [fetchCards]);
    useEffect(() => {
        if (!loading) { setShowLoadingState(false); return; }
        const timer = setTimeout(() => setShowLoadingState(true), 120);
        return () => clearTimeout(timer);
    }, [loading]);

    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const toggleSave = (id: number) => setSavedCards((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });

    return (
        <div className="page-wrapper">
            <section className="mkt-hero">
                <div className="mkt-hero-inner">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mkt-hero-row">
                        <div>
                            <h1 className="mkt-hero-title">Marketplace</h1>
                            <p className="mkt-hero-sub">Browse verified cards by corridor, method, pricing, and trust score.</p>
                        </div>
                        <motion.button className="mkt-post-btn" whileHover={{ y: -1, boxShadow: '0 8px 24px rgba(201,168,76,0.28)' }} onClick={() => openCreateModal()}>+ Post a Card</motion.button>
                    </motion.div>
                    {planLimitReached !== null && (
                        <div className="mkt-plan-limit-notice">
                            You've reached your plan limit of {planLimitReached} card(s).{' '}
                            <Link to="/profile/me" className="mkt-plan-limit-upgrade-link">Upgrade</Link>{' '}
                            to post more.
                        </div>
                    )}
                    <div className="mkt-search">
                        <Search size={16} style={{ color: 'var(--slate)', flexShrink: 0 }} />
                        <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by gateway, region, currency, industry..." className="mkt-search-input" />
                        <button type="button" className="mkt-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} /> Filters</button>
                    </div>
                    <div className="mkt-quick-filters">
                        <FilterChip label="All" active={!cardType} onClick={() => setCardType(null)} />
                        <FilterChip label="Offers" active={cardType === 'offer'} onClick={() => setCardType('offer')} />
                        <FilterChip label="Requests" active={cardType === 'request'} onClick={() => setCardType('request')} />
                        <span className="mkt-filter-sep" />
                        {REGIONS.map(r => <FilterChip key={r} label={r} active={activeRegion === r} onClick={() => setActiveRegion(r)} />)}
                    </div>
                </div>
            </section>

            <section className="mkt-body">
                <div className="mkt-body-inner">
                    {filtersOpen && (
                        <motion.aside className="mkt-sidebar" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                            <div className="mkt-sidebar-title">Advanced Filters</div>
                            <div className="mkt-filter-group">
                                <div className="mkt-filter-label">Payment Method</div>
                                <div className="mkt-filter-chips">
                                    {PAYMENT_METHODS.map(m => (
                                        <FilterChip key={m} label={m} active={activePaymentMethod === m} onClick={() => setActivePaymentMethod(activePaymentMethod === m ? '' : m)} />
                                    ))}
                                </div>
                            </div>
                            <div className="mkt-filter-group">
                                <div className="mkt-filter-label">Industry</div>
                                <div className="mkt-filter-chips">
                                    {INDUSTRIES.map(ind => (
                                        <FilterChip key={ind} label={ind} active={activeIndustry === ind} onClick={() => setActiveIndustry(activeIndustry === ind ? '' : ind)} />
                                    ))}
                                </div>
                            </div>
                            <div className="mkt-filter-group">
                                <div className="mkt-filter-label">Trust Score</div>
                                <div className="mkt-filter-chips">
                                    {TRUST_SCORES.map(s => (
                                        <FilterChip key={s.label} label={s.label} active={activeTrust === s.value} onClick={() => setActiveTrust(s.value)} />
                                    ))}
                                </div>
                            </div>
                            {(activeRegion !== 'Global' || activeIndustry || activePaymentMethod || activeTrust > 0) && (
                                <button
                                    onClick={() => { setActiveRegion('Global'); setActiveIndustry(''); setActivePaymentMethod(''); setActiveTrust(0); }}
                                    style={{ width: '100%', marginTop: 8, padding: '8px', background: 'transparent', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 12, color: 'var(--slate)', cursor: 'pointer' }}
                                >
                                    Clear all filters
                                </button>
                            )}
                        </motion.aside>
                    )}

                    <div className="mkt-cards-area">
                        <div className="mkt-toolbar">
                            <div style={{ fontSize: 14, color: 'var(--slate)' }}><span style={{ color: 'var(--white)', fontWeight: 700 }}>{cards.length}</span> cards found</div>
                            <select value={sort} onChange={(e) => setSort(e.target.value)} className="mkt-sort"><option value="newest">Most Recent</option><option value="trust_score">Trust Score</option><option value="volume">Volume (High)</option><option value="commission">Commission (Low)</option></select>
                        </div>

                        {loading && showLoadingState ? (
                            <div className="mkt-skeleton-grid">{[...Array(4)].map((_, i) => <div key={i} className="mkt-skeleton" />)}</div>
                        ) : loading ? (
                            <div style={{ minHeight: 140 }} />
                        ) : (
                            <div className="mkt-card-grid">
                                {cards.map((card, i) => (
                                    <motion.div key={card.id} className="mkt-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.2 }} whileHover={{ y: -3 }} onClick={() => handleCardClick(card)} style={{ cursor: 'pointer' }}>
                                        <div className="mkt-card-header">
                                            <span className={`mkt-type-pill ${card.type}`}>{card.type === 'offer' ? 'Offer' : 'Request'}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {card.provider_is_verified && <span className="mkt-verified"><CheckCircle size={11} /> Verified</span>}
                                                <button onClick={(e) => { e.stopPropagation(); toggleSave(card.id); }} className="mkt-save-btn"><Bookmark size={14} className={savedCards.has(card.id) ? 'text-gold fill-gold' : ''} /></button>
                                            </div>
                                        </div>
                                        <div className="mkt-card-title">{card.title}</div>
                                        <div className="mkt-card-desc">{card.description}</div>
                                        <div className="mkt-card-tags">
                                            {[...(card.regions || []), ...(card.industries || [])].slice(0, 4).map((tag, j) => <span key={j} className="mkt-tag">{tag}</span>)}
                                            {card.max_volume && <span className="mkt-tag">Max ${(card.max_volume / 1000).toFixed(0)}K/mo</span>}
                                        </div>
                                        <div className="mkt-card-footer">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className={`mkt-avatar bg-gradient-to-br ${avatarColors[i % avatarColors.length]}`}>{card.provider_company ? card.provider_company.split(' ').map(w => w[0]).join('').slice(0, 2) : 'PB'}</div>
                                                <div>
                                                    <div className="mkt-provider-name">{card.provider_company || card.provider_name}</div>
                                                    <div className="mkt-provider-trust">Trust: {card.provider_trust_score}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className="mkt-price">{card.pricing_model === 'percentage' ? `${card.commission_rate}%` : card.pricing_model === 'fixed' ? `€${card.fixed_fee?.toFixed(2)}` : 'Nego.'}</div>
                                                <div className="mkt-price-label">{card.pricing_model === 'percentage' ? 'per txn' : card.pricing_model === 'fixed' ? 'flat' : 'flexible'}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <AnimatePresence>
                {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
                {showVerifyModal && <VerificationModal onClose={() => setShowVerifyModal(false)} />}
                {showCreateModal && <CreateCardModal initialOperation={initialOperation} onClose={() => setShowCreateModal(false)} onCreated={fetchCards} />}
                {selectedCard && <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
