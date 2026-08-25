import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Clock3, MessageCircle } from 'lucide-react';
import client from '../api/client';
import Footer from '../components/layout/Footer';
import type { Notification } from '../types';

function notificationIcon(type: string) {
    if (type === 'deal' || type === 'proposal') return <CheckCircle size={17} />;
    if (type === 'message') return <MessageCircle size={17} />;
    return <Bell size={17} />;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        try {
            const response = await client.get('/notifications');
            setNotifications(response.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadNotifications(); }, []);

    const markRead = async (notification: Notification) => {
        if (notification.is_read) return;
        await client.put(`/notifications/${notification.id}/read`);
        setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
    };

    return (
        <div className="page-wrapper">
            <main className="notifications-shell">
                <div className="notifications-heading">
                    <div className="dashboard-eyebrow">Your Gatematch workspace</div>
                    <h1 className="notifications-title">Recent activity</h1>
                    <p className="notifications-subtitle">Stay on top of deal updates, proposal decisions, and account activity.</p>
                </div>
                <section className="notifications-panel">
                    {loading ? <div className="notifications-empty">Loading activity...</div> : notifications.length === 0 ? (
                        <div className="notifications-empty"><Clock3 size={22} /><span>No updates yet. Activity will appear here as your workspace changes.</span></div>
                    ) : notifications.map((notification) => (
                        <button key={notification.id} type="button" onClick={() => markRead(notification)} className={`notification-row${notification.is_read ? '' : ' unread'}`}>
                            <span className="notification-icon">{notificationIcon(notification.type)}</span>
                            <span className="notification-copy"><strong>{notification.message}</strong><small>{new Date(notification.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</small></span>
                            {!notification.is_read && <span className="notification-dot" />}
                        </button>
                    ))}
                </section>
            </main>
            <Footer />
        </div>
    );
}
