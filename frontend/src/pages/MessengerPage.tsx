import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Send, Search, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import type { Deal, MessageConversation, MessageItem } from '../types';
import Footer from '../components/layout/Footer';

function formatTimestamp(value: string | null) {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    return sameDay
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

export default function MessengerPage() {
    const [searchParams] = useSearchParams();
    const { user } = useAuthStore();
    const { addToast } = useNotificationStore();

    const [conversations, setConversations] = useState<MessageConversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<MessageConversation | null>(null);
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [composer, setComposer] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileThreadOpen, setMobileThreadOpen] = useState(false);

    const filteredConversations = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return conversations;
        return conversations.filter((conv) => {
            const name = (conv.other_user_name || '').toLowerCase();
            const company = (conv.other_user_company || '').toLowerCase();
            const card = (conv.card_title || '').toLowerCase();
            return name.includes(term) || company.includes(term) || card.includes(term);
        });
    }, [conversations, searchTerm]);

    const loadConversations = async () => {
        setLoadingConversations(true);
        try {
            const res = await client.get('/messages/conversations');
            const list: MessageConversation[] = res.data;
            setConversations(list);

            if (!activeConversation) {
                const requestedCardId = Number(searchParams.get('card_id'));
                const requestedCounterpartId = Number(searchParams.get('counterpart_id'));
                const requestedConversation = list.find((item) => item.card_id === requestedCardId && item.other_user_id === requestedCounterpartId);
                if (requestedConversation) {
                    setActiveConversation(requestedConversation);
                } else if (searchParams.get('deal_id')) {
                    const dealsResponse = await client.get('/deals');
                    const deal = (dealsResponse.data as Deal[]).find((item) => item.id === Number(searchParams.get('deal_id')));
                    if (deal) {
                        const otherIsProvider = deal.provider_id !== user?.id;
                        setActiveConversation({
                            conversation_key: `deal:${deal.id}`,
                            card_id: deal.card_id,
                            card_title: deal.card_title,
                            other_user_id: otherIsProvider ? deal.provider_id : deal.seeker_id,
                            other_user_name: otherIsProvider ? deal.provider_name : deal.seeker_name,
                            other_user_company: null,
                            last_sender_id: 0,
                            last_message: '',
                            last_message_at: null,
                            unread_count: 0,
                        });
                    } else if (list.length > 0) {
                        setActiveConversation(list[0]);
                    }
                } else if (list.length > 0) {
                    setActiveConversation(list[0]);
                }
            }
        } catch {
            addToast('Unable to load chats.', 'error');
        }
        setLoadingConversations(false);
    };

    const loadThread = async (conversation: MessageConversation) => {
        setLoadingMessages(true);
        try {
            const res = await client.get('/messages', {
                params: {
                    card_id: conversation.card_id,
                    counterpart_id: conversation.other_user_id,
                },
            });
            setMessages(res.data);
        } catch {
            addToast('Unable to load messages for this chat.', 'error');
            setMessages([]);
        }
        setLoadingMessages(false);
    };

    useEffect(() => {
        loadConversations();
        const interval = setInterval(() => {
            loadConversations();
            if (activeConversation) loadThread(activeConversation);
        }, 12000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        if (!activeConversation) {
            setMessages([]);
            return;
        }
        loadThread(activeConversation);
        if (window.innerWidth <= 900) setMobileThreadOpen(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeConversation?.conversation_key]);

    const sendMessage = async () => {
        if (!activeConversation || !composer.trim() || sending) return;
        setSending(true);
        try {
            const res = await client.post('/messages', {
                card_id: activeConversation.card_id,
                receiver_id: activeConversation.other_user_id,
                content: composer.trim(),
            });
            setMessages((prev) => [...prev, res.data]);
            setComposer('');
            loadConversations();
        } catch (err: any) {
            addToast(err.response?.data?.detail || 'Message could not be sent.', 'error');
        }
        setSending(false);
    };

    const activeTitle = activeConversation?.card_title || 'Untitled card';

    return (
        <div className="page-wrapper">
            <div className="messenger-page-shell">
                <div className="messenger-page-head">
                    <div className="messenger-page-eyebrow">Inbox</div>
                    <h1 className="messenger-page-title">Messages</h1>
                    <p className="messenger-page-sub">All incoming chats in one place. Select a thread and reply instantly.</p>
                </div>

                <div className="messenger-layout">
                    <aside className={`messenger-sidebar${mobileThreadOpen ? ' mobile-hidden' : ''}`}>
                        <div className="messenger-search-wrap">
                            <Search size={15} style={{ color: 'var(--slate)' }} />
                            <input
                                className="messenger-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by user, company, or card"
                            />
                        </div>

                        {loadingConversations ? (
                            <div className="messenger-empty-state">Loading chats...</div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="messenger-empty-state">No conversations yet.</div>
                        ) : (
                            <div className="messenger-conv-list">
                                {filteredConversations.map((conversation) => {
                                    const active = activeConversation?.conversation_key === conversation.conversation_key;
                                    const initials = (conversation.other_user_name || 'U')
                                        .split(' ')
                                        .map((word) => word[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase();

                                    return (
                                        <button
                                            key={conversation.conversation_key}
                                            type="button"
                                            className={`messenger-conv-item${active ? ' active' : ''}`}
                                            onClick={() => setActiveConversation(conversation)}
                                        >
                                            <div className="messenger-avatar">{initials}</div>
                                            <div className="messenger-conv-main">
                                                <div className="messenger-conv-top">
                                                    <span className="messenger-conv-name">{conversation.other_user_name || 'User'}</span>
                                                    <span className="messenger-conv-time">{formatTimestamp(conversation.last_message_at)}</span>
                                                </div>
                                                <div className="messenger-conv-card">{conversation.card_title || 'Card conversation'}</div>
                                                <div className="messenger-conv-snippet">{conversation.last_message}</div>
                                            </div>
                                            {conversation.unread_count > 0 && <div className="messenger-unread-pill">{conversation.unread_count}</div>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </aside>

                    <section className={`messenger-thread${mobileThreadOpen ? ' mobile-open' : ''}`}>
                        {!activeConversation ? (
                            <div className="messenger-thread-empty">
                                <MessageCircle size={22} style={{ color: 'var(--slate)' }} />
                                <span>Select a conversation to start messaging.</span>
                            </div>
                        ) : (
                            <>
                                <div className="messenger-thread-head">
                                    <button
                                        type="button"
                                        className="messenger-mobile-back"
                                        onClick={() => setMobileThreadOpen(false)}
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                    <div>
                                        <div className="messenger-thread-name">{activeConversation.other_user_name || 'User'}</div>
                                        <div className="messenger-thread-meta">
                                            {activeConversation.other_user_company || 'Independent'}
                                            {' · '}
                                            {activeTitle}
                                        </div>
                                    </div>
                                </div>

                                <div className="messenger-thread-body">
                                    {loadingMessages ? (
                                        <div className="messenger-empty-state">Loading messages...</div>
                                    ) : messages.length === 0 ? (
                                        <div className="messenger-empty-state">No messages in this conversation yet.</div>
                                    ) : (
                                        messages.map((msg) => {
                                            const own = msg.sender_id === user?.id;
                                            return (
                                                <div key={msg.id} className={`messenger-bubble-row ${own ? 'own' : 'other'}`}>
                                                    <div className="messenger-bubble">{msg.content}</div>
                                                    <div className="messenger-bubble-meta">
                                                        {msg.sender_name || (own ? 'You' : 'User')} · {formatTimestamp(msg.created_at)}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="messenger-composer">
                                    <input
                                        className="messenger-composer-input"
                                        placeholder="Type your message..."
                                        value={composer}
                                        onChange={(e) => setComposer(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                    />
                                    <button type="button" className="messenger-send" onClick={sendMessage} disabled={!composer.trim() || sending}>
                                        <Send size={15} />
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}
