import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Star, Shield, LogIn, Mail, Lock, X, Globe, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import Footer from '../components/layout/Footer';

const providers = [
    { initials: 'AT', name: 'Atlas Financial FZ', desc: 'Licensed PSP specializing in MENA and Africa corridors. Adyen sub-acquiring rights. 5 years operating history with zero chargebacks.', tags: ['Adyen', 'MENA', 'Africa', 'USD/EUR/AED'], trust: 97, deals: 28, disputes: 0, rate: '1.9%', from: true, elite: true, country: 'UAE' },
    { initials: 'NV', name: 'Novex Payments Ltd', desc: 'EU-based PSP with PayPal and Stripe reseller capacity. eCommerce and SaaS focus. Compliant sub-merchant agreements.', tags: ['PayPal', 'Stripe', 'EU', 'SaaS'], trust: 94, deals: 12, disputes: 1, rate: '2.8%', from: true, elite: false, country: 'France' },
    { initials: 'QP', name: 'QantPay Solutions', desc: 'High-risk specialist acquirer. Travel, ticketing, digital subscriptions. Rolling reserve model. EU/US dual licensing.', tags: ['High-Risk', 'Travel', 'EU/US', 'Rolling Reserve'], trust: 91, deals: 19, disputes: 2, rate: '3.5%', from: true, elite: false, country: 'Germany' },
    { initials: 'SX', name: 'Safex Europe GmbH', desc: 'Backup and overflow processing for EU eCommerce. Fast 72-hour onboarding. Fixed-fee model. No volume minimums.', tags: ['Redundancy', 'EU', 'eCommerce', 'Fixed Fee'], trust: 86, deals: 7, disputes: 0, rate: '€0.35', from: false, elite: false, country: 'Austria' },
    { initials: 'BR', name: 'BrightRoute Inc.', desc: 'US-based payment facilitator for SaaS and digital goods. Stripe Connect integration. Fast merchant underwriting.', tags: ['Stripe', 'US', 'SaaS', 'Digital Goods'], trust: 92, deals: 34, disputes: 1, rate: '2.5%', from: true, elite: true, country: 'USA' },
    { initials: 'CP', name: 'ClearPay Global', desc: 'Multi-currency acquiring across Asia-Pacific. WeChat Pay, Alipay, and local card schemes. Settlement in 12 currencies.', tags: ['APAC', 'WeChat', 'Alipay', 'Multi-Currency'], trust: 89, deals: 15, disputes: 0, rate: '2.2%', from: true, elite: false, country: 'Singapore' },
    { initials: 'PX', name: 'PayNexus LATAM', desc: 'Local payment methods specialist for Brazil, Mexico, and Colombia. PIX, OXXO, Boleto, PSE. USD settlement available.', tags: ['LATAM', 'PIX', 'OXXO', 'Local Methods'], trust: 85, deals: 9, disputes: 1, rate: '3.1%', from: true, elite: false, country: 'Brazil' },
    { initials: 'FS', name: 'FinShield Technologies', desc: 'Crypto on-ramp/off-ramp with full KYC/AML compliance. BTC, ETH, USDT, USDC. API-first integration. 24h settlement.', tags: ['Crypto', 'On-Ramp', 'Global', 'API-First'], trust: 88, deals: 22, disputes: 0, rate: '1.5%', from: true, elite: false, country: 'Switzerland' },
    { initials: 'WP', name: 'WirePay Continental', desc: 'SEPA and SWIFT wire transfer specialist. B2B payments, invoice factoring, and treasury management for EU corporates.', tags: ['SEPA', 'SWIFT', 'B2B', 'EU'], trust: 93, deals: 41, disputes: 0, rate: '€0.25', from: false, elite: true, country: 'Netherlands' },
    { initials: 'MK', name: 'MerchantKing Africa', desc: 'Pan-African payment gateway. Mobile money integration (M-Pesa, MTN, Orange). 28 countries covered with local settlement.', tags: ['Africa', 'Mobile Money', 'M-Pesa', 'MTN'], trust: 82, deals: 6, disputes: 1, rate: '3.8%', from: true, elite: false, country: 'Kenya' },
];

const avatarColors = [
    'from-[#1A9E6E] to-[#7EC8A3]',
    'from-[#4F8EF7] to-[#7EC8E3]',
    'from-gold to-gold-pale',
    'from-[#4FC4CF] to-[#7EE8F0]',
    'from-[#7C4FE0] to-[#C17FED]',
    'from-[#F7934F] to-[#F7D14F]',
    'from-[#E04F7C] to-[#ED7FA3]',
    'from-[#1A9E6E] to-[#7EC8A3]',
    'from-[#4F8EF7] to-[#7EC8E3]',
    'from-gold to-gold-pale',
];

const stats = [
    { icon: Shield, value: '340+', label: 'Verified Providers' },
    { icon: Globe, value: '60+', label: 'Countries Covered' },
    { icon: Star, value: '92', label: 'Avg Trust Score' },
];

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
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #29D38A, #7EC8A3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <LogIn size={22} style={{ color: 'var(--navy)' }} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.03em', marginBottom: 6 }}>Sign in to continue</div>
                    <div style={{ fontSize: 13, color: 'var(--slate)' }}>Log in to view provider details and connect.</div>
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
                    <motion.button type="submit" disabled={submitting} className="mkt-modal-submit" whileHover={{ y: -1, boxShadow: '0 12px 28px rgba(41,211,138,0.28)' }}>
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                </form>
                <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--slate)' }}>
                    Don't have an account?{' '}<Link to="/register" style={{ color: '#29D38A', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function ProvidersPage() {
    const { isAuthenticated } = useAuthStore();
    const [showLoginModal, setShowLoginModal] = useState(false);

    const requireAuth = () => {
        if (!isAuthenticated) { setShowLoginModal(true); }
    };

    return (
        <div className="page-wrapper">
            {/* Hero */}
            <section className="prov-hero">
                <div className="prov-hero-bg" />
                <div className="prov-hero-inner">
                    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                        <div className="prov-kicker">Infrastructure Providers</div>
                        <h1 className="prov-title">Verified provider directory for live payment capacity</h1>
                        <p className="prov-subtitle">All providers are KYB verified, AML screened, and continuously rated by performance, dispute history, and corridor reliability.</p>
                    </motion.div>
                    <motion.div className="prov-stats" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
                        {stats.map((s) => (
                            <div key={s.label} className="prov-stat">
                                <s.icon size={20} style={{ color: '#29D38A' }} />
                                <div>
                                    <div className="prov-stat-value">{s.value}</div>
                                    <div className="prov-stat-label">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Provider Grid */}
            <section className="prov-list">
                <div className="prov-grid-inner">
                    {providers.map((p, i) => (
                        <motion.div
                            key={i}
                            className="prov-card-v2"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: i * 0.04, duration: 0.3 }}
                            whileHover={{ y: -4 }}
                            onClick={requireAuth}
                            style={{ cursor: 'pointer' }}
                        >
                            {p.elite && <div className="prov-elite-badge"><Award size={11} /> Elite</div>}

                            <div className="prov-card-v2-top">
                                <div className={`prov-avatar-v2 bg-gradient-to-br ${avatarColors[i % avatarColors.length]}`}>
                                    {p.initials}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="prov-card-v2-name" style={!isAuthenticated ? { filter: 'blur(5px)', userSelect: 'none' } : undefined}>
                                        {isAuthenticated ? p.name : p.name}
                                    </div>
                                    <div className="prov-card-v2-meta">
                                        <CheckCircle size={11} style={{ color: '#29D38A' }} />
                                        <span>Verified</span>
                                        <span className="prov-card-v2-dot" />
                                        <span>{p.country}</span>
                                    </div>
                                </div>
                                <div className="prov-card-v2-rate">
                                    <span className="prov-rate-num">{p.rate}</span>
                                    <span className="prov-rate-sub">{p.from ? 'from' : 'per txn'}</span>
                                </div>
                            </div>

                            <p className="prov-card-v2-desc">{p.desc}</p>

                            <div className="prov-card-v2-tags">
                                {p.tags.map((tag, j) => <span key={j} className="prov-tag-v2">{tag}</span>)}
                            </div>

                            <div className="prov-card-v2-bottom">
                                <div className="prov-trust-bar-v2">
                                    <div className="prov-trust-fill-v2" style={{ width: `${p.trust}%` }} />
                                </div>
                                <div className="prov-card-v2-stats">
                                    <span>Trust <strong>{p.trust}</strong></span>
                                    <span>{p.deals} deals</span>
                                    <span>{p.disputes} disputes</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {!isAuthenticated && (
                <section style={{ textAlign: 'center', padding: '40px 20px 80px' }}>
                    <div style={{ fontSize: 15, color: 'var(--slate)', marginBottom: 16 }}>Sign in to view full provider details, contact information, and connect directly.</div>
                    <motion.button
                        className="btn-primary"
                        style={{ padding: '14px 32px', borderRadius: 14, fontSize: 15 }}
                        whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(201,168,76,0.3)' }}
                        onClick={() => setShowLoginModal(true)}
                    >
                        Sign in to unlock
                    </motion.button>
                </section>
            )}

            <AnimatePresence>
                {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
