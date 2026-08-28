import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, Settings, LogOut, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import { WEBSITE_LOGO_PATH } from '../../config/branding';
import UserAvatar from '../ui/UserAvatar';

const navLinks = [
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/providers', label: 'Providers' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/compliance', label: 'Trust & Compliance', hasBadge: true },
    { path: '/pricing', label: 'Pricing' },
    { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [logoLoadError, setLogoLoadError] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const handleLogout = async () => {
        try { await client.post('/auth/logout'); } catch {}
        logout();
        navigate('/');
    };

    useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 20));

    useEffect(() => {
        if (!isAuthenticated) {
            setUnreadNotifications(0);
            setUnreadMessages(0);
            return;
        }

        let cancelled = false;
        const loadBadges = async () => {
            const [notifications, conversations] = await Promise.allSettled([
                client.get('/notifications'),
                client.get('/messages/conversations'),
            ]);
            if (cancelled) return;
            if (notifications.status === 'fulfilled') setUnreadNotifications(notifications.value.data.filter((item: { is_read: boolean }) => !item.is_read).length);
            if (conversations.status === 'fulfilled') setUnreadMessages(conversations.value.data.reduce((total: number, item: { unread_count: number }) => total + item.unread_count, 0));
        };

        loadBadges();
        const interval = window.setInterval(loadBadges, 30000);
        return () => { cancelled = true; window.clearInterval(interval); };
    }, [isAuthenticated]);

    const linkStyle = (path: string): React.CSSProperties => ({
        padding: '7px 14px',
        fontSize: 14,
        fontWeight: 500,
        color: location.pathname === path ? 'var(--gold)' : 'var(--slate)',
        textDecoration: 'none',
        borderRadius: 6,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
        position: 'relative',
    });

    const logoMark: React.CSSProperties = {
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color: 'var(--navy)',
        fontFamily: "'DM Sans', sans-serif",
    };

    return (
        <>
            <motion.nav
                className="navbar-fixed"
                initial={{ y: -68 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.4)' : 'none' }}
            >
                {/* ─── Logo ─── */}
                <Link to="/" className="navbar-brand-link" style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 22, color: 'var(--white)',
                    fontWeight: 800,
                    textDecoration: 'none', marginRight: 40, flexShrink: 0,
                }}>
                    {!logoLoadError ? (
                        <img
                            src={WEBSITE_LOGO_PATH}
                            alt="Connectov logo"
                            style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                            onError={() => setLogoLoadError(true)}
                        />
                    ) : (
                        <div style={logoMark}>P</div>
                    )}
                    <span className="navbar-brand-text" style={{ letterSpacing: '-0.3px' }}>Connectov</span>
                </Link>

                {/* ─── Desktop nav links ─── */}
                <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    {navLinks.map((link) => (
                        <Link key={link.path} to={link.path} style={linkStyle(link.path)}
                            onMouseEnter={(e) => {
                                if (location.pathname !== link.path) {
                                    e.currentTarget.style.color = 'var(--white)';
                                    e.currentTarget.style.background = 'var(--border-light)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = location.pathname === link.path ? 'var(--gold)' : 'var(--slate)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {link.label}
                            {link.hasBadge && (
                                <span style={{
                                    position: 'absolute', top: 4, right: 6,
                                    width: 6, height: 6, background: 'var(--gold)', borderRadius: '50%',
                                }} />
                            )}
                        </Link>
                    ))}
                </div>

                {/* ─── Right actions ─── */}
                <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                    {isAuthenticated ? (
                        <>
                            {/* Bell */}
                            <motion.button onClick={() => navigate('/notifications')} whileHover={{ scale: 1.1 }}
                                style={{
                                    position: 'relative', width: 36, height: 36, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 8, cursor: 'pointer', color: 'var(--slate)',
                                    background: 'transparent', border: 'none',
                                }}
                            >
                                <Bell size={18} />
                                {unreadNotifications > 0 && <span style={{
                                    position: 'absolute', top: 6, right: 6,
                                    width: 7, height: 7, background: 'var(--gold)',
                                    borderRadius: '50%', border: '1.5px solid var(--navy)',
                                }} />}
                            </motion.button>

                            <motion.button
                                onClick={() => navigate('/messages')}
                                whileHover={{ scale: 1.08 }}
                                className="navbar-messenger-btn"
                                title="Messages"
                                aria-label="Open messages"
                            >
                                <MessageCircle size={16} />
                                {unreadMessages > 0 && <span className="navbar-unread-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>}
                            </motion.button>

                            {/* Dashboard , hidden on mobile */}
                            <button onClick={() => navigate('/dashboard')} className="btn-ghost desktop-only">
                                Dashboard
                            </button>

                            {/* Admin Settings — only visible to admin users */}
                            {user?.role === 'admin' && (
                                <motion.button
                                    onClick={() => navigate('/admin/settings')}
                                    className="btn-ghost desktop-only"
                                    whileHover={{ y: -1 }}
                                    title="Admin Settings"
                                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                >
                                    <Settings size={14} />
                                    Admin
                                </motion.button>
                            )}

                            {/* Post a Card */}
                            <motion.button onClick={() => navigate('/marketplace')} className="btn-primary navbar-cta" whileHover={{ y: -2 }}>
                                <span className="navbar-cta-full">Post a Card</span>
                                <span className="navbar-cta-short">Post</span>
                            </motion.button>

                            {/* Avatar */}
                            <motion.button onClick={() => navigate('/profile/me')} whileHover={{ scale: 1.08 }} style={{ border: 'none', padding: 0, borderRadius: '50%', cursor: 'pointer', background: 'transparent' }} aria-label="Open profile">
                                {user && <UserAvatar user={user} size={34} />}
                            </motion.button>

                            {/* Logout */}
                            <motion.button
                                onClick={handleLogout}
                                whileHover={{ scale: 1.1 }}
                                title="Log out"
                                style={{
                                    width: 34, height: 34, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 8, cursor: 'pointer', color: '#f87171',
                                    background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
                                }}
                            >
                                <LogOut size={15} />
                            </motion.button>
                        </>
                    ) : (
                        <>
                            {/* Sign In , hidden on very small screens */}
                            <button onClick={() => navigate('/login')} className="btn-ghost desktop-only">
                                Sign In
                            </button>
                            {/* Get Started , always visible */}
                            <motion.button onClick={() => navigate('/register')} className="btn-primary navbar-cta" whileHover={{ y: -2 }}>
                                <span className="navbar-cta-full">Get Started</span>
                                <span className="navbar-cta-short">Start</span>
                            </motion.button>
                        </>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMenuOpen((o) => !o)}
                        style={{
                            alignItems: 'center', justifyContent: 'center',
                            width: 36, height: 36, background: 'transparent',
                            border: '1px solid var(--border-light)', borderRadius: 8,
                            color: 'var(--slate)', cursor: 'pointer',
                        }}
                        className="mobile-menu-btn"
                    >
                        {menuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </motion.nav>

            {/* ─── Mobile dropdown ─── */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed', top: 68, left: 0, right: 0, zIndex: 99,
                            background: 'rgba(10,22,40,0.98)',
                            backdropFilter: 'blur(20px)',
                            borderBottom: '1px solid var(--border)',
                            padding: '16px 20px 20px',
                            display: 'flex', flexDirection: 'column', gap: 4,
                        }}
                    >
                        {navLinks.map((link) => (
                            <Link key={link.path} to={link.path}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    padding: '12px 16px', fontSize: 15, fontWeight: 500,
                                    color: location.pathname === link.path ? 'var(--gold)' : 'var(--slate)',
                                    textDecoration: 'none', borderRadius: 8,
                                    display: 'block',
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border-light)', marginTop: 8, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {isAuthenticated ? (
                                <>
                                    <button onClick={() => { navigate('/dashboard'); setMenuOpen(false); }} className="btn-primary">
                                        Dashboard
                                    </button>
                                    <button onClick={() => { navigate('/messages'); setMenuOpen(false); }} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                        <MessageCircle size={14} /> Messages {unreadMessages > 0 && <span className="navbar-mobile-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>}
                                    </button>
                                    <button onClick={() => { navigate('/notifications'); setMenuOpen(false); }} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                        <Bell size={14} /> Recent activity {unreadNotifications > 0 && <span className="navbar-mobile-badge">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
                                    </button>
                                    {user?.role === 'admin' && (
                                        <button onClick={() => { navigate('/admin/settings'); setMenuOpen(false); }} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                            <Settings size={14} /> Admin Settings
                                        </button>
                                    )}
                                    <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: '#f87171' }}>
                                        <LogOut size={14} /> Log Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="btn-ghost" style={{ flex: 1 }}>
                                        Sign In
                                    </button>
                                    <button onClick={() => { navigate('/register'); setMenuOpen(false); }} className="btn-primary" style={{ flex: 1 }}>
                                        Get Started
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
