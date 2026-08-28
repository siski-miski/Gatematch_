import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowUpRight, BarChart3, CheckCircle, Clock3, DollarSign, Download, Eye, FilePlus2, ShieldCheck, Sparkles, TrendingUp, Upload, XCircle } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import client from '../api/client';
import Footer from '../components/layout/Footer';
import UserAvatar from '../components/ui/UserAvatar';
import type { Card, DashboardStats as Stats, Deal, DealDocument, Notification, VolumeHistory } from '../types';

function KPICountUp({ end, prefix = '', suffix = '' }: { end: number; prefix?: string; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        if (end === 0) { setCount(0); return; }
        let current = 0;
        const step = end / 45;
        const timer = setInterval(() => {
            current += step;
            if (current >= end) {
                setCount(end);
                clearInterval(timer);
            } else setCount(Math.floor(current));
        }, 18);
        return () => clearInterval(timer);
    }, [end, inView]);

    return <div ref={ref} className="font-serif text-[30px] text-white-custom">{prefix}{count.toLocaleString()}{suffix}</div>;
}

const statusStyles: Record<string, string> = {
    active: 'bg-green-custom/[0.12] text-green-custom',
    pending: 'bg-gold/10 text-gold',
    countered: 'bg-gold/10 text-gold',
    review: 'bg-red-custom/10 text-red-custom',
    completed: 'bg-green-custom/[0.12] text-green-custom',
    terminated: 'bg-red-custom/10 text-red-custom',
    withdrawn: 'bg-red-custom/10 text-red-custom',
};

const statusLabels: Record<string, string> = {
    active: 'Active',
    pending: 'Pending',
    countered: 'Counter-offer',
    review: 'In review',
    completed: 'Completed',
    terminated: 'Ended',
    withdrawn: 'Withdrawn',
};

const proposalLabels: Record<string, string> = {
    pending: 'Awaiting review',
    accepted: 'Approved',
    declined: 'Needs changes',
    offer_deleted: 'Archived',
};

const complianceItems = [
    { type: 'kyc', label: 'Identity verification' },
    { type: 'kyb', label: 'Business verification' },
    { type: 'aml', label: 'AML screening' },
    { type: 'bank', label: 'Bank account' },
];

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { addToast } = useNotificationStore();
    const firstName = user?.full_name?.split(' ')[0] || 'there';
    const [stats, setStats] = useState<Stats>({ active_deals: 0, volume_processed: 0, revenue_earned: 0, trust_score: 50 });
    const [volumeData, setVolumeData] = useState<VolumeHistory[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [myCards, setMyCards] = useState<Card[]>([]);
    const [activities, setActivities] = useState<Notification[]>([]);
    const [verifications, setVerifications] = useState<{ type: string; status: string }[]>([]);
    const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
    const [counterOpen, setCounterOpen] = useState(false);
    const [counterVolume, setCounterVolume] = useState('');
    const [counterRate, setCounterRate] = useState('');
    const [counterNotes, setCounterNotes] = useState('');
    const [dealSubmitting, setDealSubmitting] = useState(false);
    const [dealDocuments, setDealDocuments] = useState<DealDocument[]>([]);
    const [documentUploading, setDocumentUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        setLoading(true);
        const responses = await Promise.allSettled([
            client.get('/dashboard/stats'),
            client.get('/dashboard/volume-history'),
            client.get('/deals'),
            client.get('/cards/mine'),
            client.get('/notifications'),
            client.get('/verifications/me'),
        ]);
        const [statsRes, volumeRes, dealsRes, cardsRes, activitiesRes, verificationsRes] = responses;
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (volumeRes.status === 'fulfilled') setVolumeData(volumeRes.value.data);
        if (dealsRes.status === 'fulfilled') setDeals(dealsRes.value.data);
        if (cardsRes.status === 'fulfilled') setMyCards(cardsRes.value.data);
        if (activitiesRes.status === 'fulfilled') setActivities(activitiesRes.value.data);
        if (verificationsRes.status === 'fulfilled') setVerifications(verificationsRes.value.data);
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const updateDeal = async (deal: Deal, action: 'accept' | 'complete' | 'withdraw') => {
        try {
            const response = await client.post(`/deals/${deal.id}/${action}`);
            setDeals((current) => current.map((item) => item.id === deal.id ? { ...item, ...response.data } : item));
            setCounterOpen(false);
            addToast(action === 'accept' ? 'Deal accepted and activated.' : action === 'complete' ? 'Completion update sent.' : 'Deal request withdrawn.', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.detail || 'Could not update the deal.', 'error');
        }
    };

    const selectDeal = async (deal: Deal) => {
        setSelectedDealId(deal.id);
        setCounterOpen(false);
        setCounterVolume(deal.monthly_volume?.toString() || '');
        setCounterRate(deal.commission_rate?.toString() || '');
        setCounterNotes(deal.notes || '');
        try {
            const response = await client.get(`/deals/${deal.id}/documents`);
            setDealDocuments(response.data);
        } catch {
            setDealDocuments([]);
        }
    };

    const uploadDealDocument = async (file: File | undefined) => {
        if (!selectedDeal || !file) return;
        if (file.size > 10 * 1024 * 1024) {
            addToast('Documents must be smaller than 10 MB.', 'error');
            return;
        }
        setDocumentUploading(true);
        try {
            const formData = new FormData();
            formData.append('document', file);
            const response = await client.post(`/deals/${selectedDeal.id}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setDealDocuments((current) => [response.data, ...current]);
            addToast('Document shared with the deal partner.', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.detail || 'Could not share the document.', 'error');
        } finally {
            setDocumentUploading(false);
        }
    };

    const submitCounter = async (deal: Deal) => {
        const monthlyVolume = counterVolume.trim() ? Number(counterVolume) : undefined;
        const commissionRate = counterRate.trim() ? Number(counterRate) : undefined;
        if (monthlyVolume !== undefined && (!Number.isFinite(monthlyVolume) || monthlyVolume <= 0)) {
            addToast('Enter a valid monthly volume.', 'error');
            return;
        }
        if (commissionRate !== undefined && (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100)) {
            addToast('Commission must be between 0 and 100%.', 'error');
            return;
        }
        if (monthlyVolume === undefined && commissionRate === undefined && !counterNotes.trim()) {
            addToast('Add at least one updated term.', 'error');
            return;
        }
        setDealSubmitting(true);
        try {
            const response = await client.put(`/deals/${deal.id}/terms`, {
                ...(monthlyVolume !== undefined ? { monthly_volume: monthlyVolume } : {}),
                ...(commissionRate !== undefined ? { commission_rate: commissionRate } : {}),
                ...(counterNotes.trim() ? { notes: counterNotes.trim() } : {}),
            });
            setDeals((current) => current.map((item) => item.id === deal.id ? { ...item, ...response.data } : item));
            setCounterOpen(false);
            addToast('Counter-offer sent for review.', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.detail || 'Could not send the counter-offer.', 'error');
        } finally {
            setDealSubmitting(false);
        }
    };

    const deleteCard = async (id: number) => {
        try {
            await client.delete(`/cards/${id}`);
            setMyCards((current) => current.map((card) => card.id === id ? { ...card, is_active: false, proposal_status: 'offer_deleted' } : card));
            addToast('Listing archived.', 'success');
        } catch {
            addToast('Could not archive this listing.', 'error');
        }
    };

    const activeDeals = deals.filter((deal) => deal.status === 'active');
    const pendingDeals = deals.filter((deal) => deal.status === 'pending' || deal.status === 'countered');
    const reviewDeals = deals.filter((deal) => deal.status === 'review');
    const completedDeals = deals.filter((deal) => deal.status === 'completed');
    const selectedDeal = deals.find((deal) => deal.id === selectedDealId) || null;
    const selectedStage = selectedDeal?.status === 'completed' ? 3 : selectedDeal?.status === 'active' || selectedDeal?.status === 'review' ? 2 : selectedDeal?.status === 'countered' ? 1 : 0;
    const completedChecks = complianceItems.filter((item) => verifications.some((verification) => verification.type === item.type && verification.status === 'approved')).length;
    const chartHasData = volumeData.some((item) => item.volume > 0);

    const kpis = [
        { label: 'Active deals', value: stats.active_deals, hint: activeDeals.length ? `${activeDeals.length} currently running` : 'Start your first deal', icon: <Activity size={17} />, color: 'var(--green)' },
        { label: 'Processed volume', value: Math.round(stats.volume_processed / 1000), prefix: '$', suffix: 'K', hint: stats.volume_processed ? 'Across active and completed deals' : 'No volume recorded yet', icon: <TrendingUp size={17} />, color: '#4da8ff' },
        { label: 'Provider revenue', value: Math.round(stats.revenue_earned), prefix: '$', hint: stats.revenue_earned ? 'Based on your deal rates' : 'Earn when a deal is active', icon: <DollarSign size={17} />, color: 'var(--gold)' },
        { label: 'Trust score', value: stats.trust_score, hint: stats.trust_score >= 80 ? 'Strong profile' : 'Complete verification to grow', icon: <ShieldCheck size={17} />, color: 'var(--gold)' },
    ];

    if (loading) {
        return (
            <div className="page-wrapper">
                <div style={{ flex: 1, minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)' }}>Loading your workspace…</div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <main className="dashboard-shell">
                <section className="dashboard-welcome">
                    <div className="dashboard-welcome-copy">
                        {user && <UserAvatar user={user} size={54} />}
                        <div>
                            <div className="dashboard-eyebrow">Your Connectov workspace</div>
                            <h1 className="dashboard-title">Good to see you, {firstName}</h1>
                            <p className="dashboard-subtitle">Track your capacity, deal progress, and next steps from one place.</p>
                        </div>
                    </div>
                    <div className="dashboard-actions">
                        <Link to="/marketplace" className="dashboard-secondary-action"><Eye size={15} /> Browse marketplace</Link>
                        <Link to="/marketplace" className="dashboard-primary-action"><FilePlus2 size={15} /> Post a listing</Link>
                    </div>
                </section>

                <section className="dashboard-kpi-grid">
                    {kpis.map((kpi, index) => (
                        <motion.div key={kpi.label} className="dashboard-kpi-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
                            <div className="dashboard-kpi-top"><span style={{ color: kpi.color }}>{kpi.icon}</span><span>{kpi.label}</span></div>
                            <KPICountUp end={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
                            <div className="dashboard-kpi-hint">{kpi.hint}</div>
                        </motion.div>
                    ))}
                </section>

                <section className="dashboard-main-grid">
                    <motion.div className="dashboard-panel dashboard-chart-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <div className="dashboard-panel-heading">
                            <div><div className="dashboard-panel-title">Volume movement</div><div className="dashboard-panel-caption">Monthly volume from your active and completed deals</div></div>
                            <div className="dashboard-chart-total">${(stats.volume_processed / 1000).toFixed(0)}K <span>total</span></div>
                        </div>
                        {chartHasData ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={volumeData} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="dashboardVolumeGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c9a84c" stopOpacity={0.42} /><stop offset="100%" stopColor="#c9a84c" stopOpacity={0.02} /></linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
                                    <XAxis dataKey="month" tick={{ fill: '#8892A4', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fill: '#8892A4', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${Number(value) / 1000}K`} width={45} />
                                    <Tooltip contentStyle={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }} formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Volume']} />
                                    <Area type="monotone" dataKey="volume" stroke="#c9a84c" strokeWidth={2.5} fill="url(#dashboardVolumeGradient)" dot={{ fill: '#c9a84c', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dashboard-empty-chart"><TrendingUp size={28} /><span>Your volume graph will come alive after your first active deal.</span><Link to="/marketplace">Find capacity <ArrowUpRight size={13} /></Link></div>
                        )}
                    </motion.div>

                    <motion.div className="dashboard-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
                        <div className="dashboard-panel-heading"><div><div className="dashboard-panel-title">Deal pipeline</div><div className="dashboard-panel-caption">Where your opportunities stand</div></div><BarChart3 size={18} className="text-gold" /></div>
                        <div className="dashboard-pipeline">
                            {[
                                { label: 'Active', count: activeDeals.length, color: '#29D38A' },
                                { label: 'Pending', count: pendingDeals.length, color: '#c9a84c' },
                                { label: 'In review', count: reviewDeals.length, color: '#f87171' },
                                { label: 'Completed', count: completedDeals.length, color: '#4da8ff' },
                            ].map((item) => (
                                <div key={item.label} className="dashboard-pipeline-row"><div className="dashboard-pipeline-label"><span style={{ background: item.color }} />{item.label}<strong>{item.count}</strong></div><div className="dashboard-pipeline-track"><div style={{ width: `${deals.length ? Math.max(item.count / deals.length * 100, item.count ? 8 : 0) : 0}%`, background: item.color }} /></div></div>
                            ))}
                        </div>
                        <div className="dashboard-pipeline-footer"><Sparkles size={14} className="text-gold" /><span>{deals.length ? 'Keep your pipeline moving with clear next steps.' : 'Your first deal will appear here.'}</span></div>
                    </motion.div>
                </section>

                <section className="dashboard-content-grid">
                    <motion.div className="dashboard-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <div className="dashboard-panel-heading"><div><div className="dashboard-panel-title">Your deals</div><div className="dashboard-panel-caption">Recent partnership activity</div></div><Link to="/marketplace" className="dashboard-panel-link">Find more <ArrowUpRight size={13} /></Link></div>
                        {deals.length ? deals.slice(0, 5).map((deal) => {
                            const otherParty = deal.provider_id === user?.id ? deal.seeker_name : deal.provider_name;
                            return <div key={deal.id} className={`dashboard-deal-row ${selectedDealId === deal.id ? 'selected' : ''}`} onClick={() => selectDeal(deal)}><div className="dashboard-deal-icon"><Activity size={15} /></div><div className="dashboard-deal-copy"><strong>{deal.card_title || 'Structured partnership'}</strong><span>{otherParty || 'Marketplace partner'} · {deal.monthly_volume ? `$${(deal.monthly_volume / 1000).toFixed(0)}K/mo` : 'Volume to be agreed'}</span></div><div className="dashboard-deal-actions"><span className={`dashboard-status ${statusStyles[deal.status] || statusStyles.pending}`}>{statusLabels[deal.status] || deal.status}</span>{deal.action_required === 'respond' && <button onClick={(event) => { event.stopPropagation(); updateDeal(deal, 'accept'); }} className="dashboard-inline-action">Accept</button>}{deal.action_required === 'complete' && <button onClick={(event) => { event.stopPropagation(); updateDeal(deal, 'complete'); }} className="dashboard-inline-action success">Request completion</button>}</div></div>;
                        }) : <div className="dashboard-simple-empty">No deals yet. Explore verified capacity to get started.</div>}
                        {selectedDeal && <div className="dashboard-deal-workspace">
                            <div className="dashboard-workspace-heading"><div><div className="dashboard-panel-title">Deal workspace</div><div className="dashboard-panel-caption">Review the terms and complete each step together.</div></div><span className={`dashboard-status ${statusStyles[selectedDeal.status] || statusStyles.pending}`}>{statusLabels[selectedDeal.status] || selectedDeal.status}</span></div>
                            <div className="dashboard-deal-timeline">{['Request sent', 'Terms agreed', 'Active', 'Completed'].map((label, index) => <div key={label} className={`dashboard-deal-step ${index <= selectedStage ? 'done' : ''} ${index === selectedStage && selectedDeal.status !== 'completed' ? 'current' : ''}`}><span>{index < selectedStage || selectedDeal.status === 'completed' ? <CheckCircle size={13} /> : index + 1}</span><small>{label}</small></div>)}</div>
                            <div className="dashboard-terms-grid"><div><span>Monthly volume</span><strong>{selectedDeal.monthly_volume ? `$${selectedDeal.monthly_volume.toLocaleString()}` : 'To be agreed'}</strong></div><div><span>Commission</span><strong>{selectedDeal.commission_rate != null ? `${selectedDeal.commission_rate}%` : 'To be agreed'}</strong></div><div><span>Next step</span><strong>{selectedDeal.action_required === 'respond' ? 'Your response' : selectedDeal.action_required === 'waiting' ? 'Partner response' : selectedDeal.action_required === 'confirm_completion' ? 'Confirm completion' : selectedDeal.action_required === 'complete' ? 'Request completion' : 'No action'}</strong></div></div>
                            {selectedDeal.notes && <p className="dashboard-deal-note">“{selectedDeal.notes}”</p>}
                            <div className="dashboard-documents"><div className="dashboard-documents-heading"><div><strong>Shared documents</strong><span>Exchange files securely with this deal partner.</span></div><label className="dashboard-upload-document"><Upload size={13} /> {documentUploading ? 'Uploading…' : 'Share document'}<input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx" disabled={documentUploading} onChange={(event) => { uploadDealDocument(event.target.files?.[0]); event.currentTarget.value = ''; }} /></label></div>{dealDocuments.length ? <div className="dashboard-document-list">{dealDocuments.map((document) => <button type="button" key={document.id} className="dashboard-document-row" onClick={() => window.open(`${client.defaults.baseURL}/deals/${selectedDeal.id}/documents/${document.id}/download`, '_blank', 'noopener,noreferrer')}><span>{document.file_name}<small>{document.uploader_name || 'Deal participant'} · {new Date(document.created_at).toLocaleDateString()}</small></span><Download size={14} /></button>)}</div> : <p className="dashboard-documents-empty">No documents shared yet.</p>}</div>
                            <div className="dashboard-workspace-actions">{selectedDeal.action_required === 'respond' && <><button onClick={() => updateDeal(selectedDeal, 'accept')} className="dashboard-inline-action">Accept terms</button><button onClick={() => setCounterOpen((open) => !open)} className="dashboard-inline-action">{counterOpen ? 'Close counter' : 'Counter-offer'}</button></>}{selectedDeal.action_required === 'waiting' && <span className="dashboard-next-step">Waiting for the other participant</span>}{selectedDeal.action_required === 'confirm_completion' && <button onClick={() => updateDeal(selectedDeal, 'complete')} className="dashboard-inline-action success">Confirm completion</button>}{selectedDeal.action_required === 'complete' && <button onClick={() => updateDeal(selectedDeal, 'complete')} className="dashboard-inline-action success">Request completion</button>}{(selectedDeal.status === 'pending' || selectedDeal.status === 'countered') && <button onClick={() => updateDeal(selectedDeal, 'withdraw')} className="dashboard-inline-action muted">Withdraw</button>}</div>
                            {selectedDeal.status === 'completed' && <button type="button" onClick={() => { const partnerId = selectedDeal.provider_id === user?.id ? selectedDeal.seeker_id : selectedDeal.provider_id; navigate(`/messages?deal_id=${selectedDeal.id}&card_id=${selectedDeal.card_id}&counterpart_id=${partnerId}`); }} className="dashboard-contact-partner">Contact partner</button>}
                            {counterOpen && <div className="dashboard-counter-form"><div className="dashboard-counter-grid"><label>Monthly volume<input value={counterVolume} onChange={(event) => setCounterVolume(event.target.value)} type="number" min="1" placeholder="e.g. 25000" /></label><label>Commission rate<input value={counterRate} onChange={(event) => setCounterRate(event.target.value)} type="number" min="0" max="100" step="0.01" placeholder="e.g. 2.4" /></label></div><label>Message<textarea value={counterNotes} onChange={(event) => setCounterNotes(event.target.value)} rows={2} placeholder="Explain what changed or add a question" /></label><button disabled={dealSubmitting} onClick={() => submitCounter(selectedDeal)} className="dashboard-inline-action">{dealSubmitting ? 'Sending…' : 'Send counter-offer'}</button></div>}
                        </div>}
                    </motion.div>

                    <motion.div className="dashboard-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}>
                        <div className="dashboard-panel-heading"><div><div className="dashboard-panel-title">Listing health</div><div className="dashboard-panel-caption">Your submissions and visibility</div></div><Link to="/profile/me" className="dashboard-panel-link">Manage <ArrowUpRight size={13} /></Link></div>
                        {myCards.length ? myCards.slice(0, 5).map((card) => <div key={card.id} className="dashboard-listing-row"><div className={`dashboard-listing-mark ${card.is_active && card.proposal_status === 'accepted' ? 'live' : ''}`} /> <div className="dashboard-deal-copy"><strong>{card.title}</strong><span>{card.operation_type || (card.type === 'offer' ? 'Public offer' : 'Public request')} · <Eye size={11} /> {card.views_count}</span></div><span className={`dashboard-status ${card.proposal_status === 'accepted' && card.is_active ? 'bg-green-custom/[0.12] text-green-custom' : card.proposal_status === 'declined' ? 'bg-red-custom/10 text-red-custom' : 'bg-gold/10 text-gold'}`}>{card.is_active && card.proposal_status === 'accepted' ? 'Live' : proposalLabels[card.proposal_status || 'pending']}</span><button onClick={() => deleteCard(card.id)} title="Archive listing" className="dashboard-archive-action"><XCircle size={14} /></button></div>) : <div className="dashboard-simple-empty">You have no listings yet. Post your first offer or request.</div>}
                    </motion.div>
                </section>

                <section className="dashboard-bottom-grid">
                    <motion.div className="dashboard-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}>
                        <div className="dashboard-panel-heading"><div><div className="dashboard-panel-title">Trust readiness</div><div className="dashboard-panel-caption">Complete your profile to unlock stronger matches</div></div><div className="dashboard-readiness-score">{completedChecks}/{complianceItems.length}</div></div>
                        <div className="dashboard-progress"><div style={{ width: `${completedChecks / complianceItems.length * 100}%` }} /></div>
                        <div className="dashboard-checklist">{complianceItems.map((item) => { const check = verifications.find((verification) => verification.type === item.type); const approved = check?.status === 'approved'; return <div key={item.type} className="dashboard-check-row"><span className={approved ? 'done' : check?.status === 'pending' ? 'pending' : ''}>{approved ? <CheckCircle size={14} /> : check?.status === 'pending' ? <Clock3 size={14} /> : <ShieldCheck size={14} />}</span><span>{item.label}</span><strong>{approved ? 'Complete' : check?.status === 'pending' ? 'Pending' : 'Not started'}</strong></div>; })}</div>
                    </motion.div>

                    <motion.div className="dashboard-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}>
                        <div className="dashboard-panel-heading"><div><div className="dashboard-panel-title">Recent activity</div><div className="dashboard-panel-caption">Your latest account updates</div></div><Link to="/notifications" className="dashboard-panel-link">View all <ArrowUpRight size={13} /></Link></div>
                        {activities.length ? activities.slice(0, 5).map((activity) => <div key={activity.id} className="dashboard-activity-row"><span className={activity.is_read ? '' : 'unread'} /><div><strong>{activity.message}</strong><small>{new Date(activity.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</small></div></div>) : <div className="dashboard-simple-empty">Notifications about proposals, deals, and verification will appear here.</div>}
                    </motion.div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
