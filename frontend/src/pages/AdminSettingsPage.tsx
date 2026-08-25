import { motion } from 'framer-motion';
import { Settings, Plus, Trash2, Save, MessageCircle, Mail, Clock, MapPin, HelpCircle, Phone, ShieldCheck, CheckCircle, XCircle, Download, Eye, Tag, ShoppingCart, Upload, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore';
import client from '../api/client';
import RichTextEditor from '../components/ui/RichTextEditor';
import { htmlToMarkdown, markdownToHtml } from '../utils/markdown';

interface FaqItem { q: string; a: string }

interface ContactSettings {
    contact_whatsapp: string;
    contact_email: string;
    contact_hours: string;
    contact_offices: string;
    contact_sales_href: string;
    contact_faqs: FaqItem[];
}

interface LegalDocument {
    id: string;
    slug: string;
    title: string;
    html: string;
    markdown?: string | null;
    updated_at?: string | null;
    show_in_footer: boolean;
    is_system?: boolean;
}

interface SiteManagementSettings extends ContactSettings {
    legal_localization_enabled: boolean;
    legal_default_locale: string;
    legal_documents: LegalDocument[];
}

interface TrackingSettings {
    google_analytics_id: string;
    google_tag_manager_id: string;
    google_search_console_code: string;
}

interface CustomScript {
    id: number;
    location: 'header' | 'body' | 'footer';
    content: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface VerificationHtmlFile {
    id: number;
    filename: string;
    public_url: string;
    created_at?: string | null;
}

interface AdminVerification {
    id: number;
    user_id: number;
    type: string;
    document_type: string | null;
    document_side: string | null;
    document_path: string | null;
    status: string;
    rejection_reason: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    user_email: string | null;
    user_full_name: string | null;
}

interface CardProposal {
    id: number;
    user_id: number;
    type: string;
    operation_type: string | null;
    proposal_status: string | null;
    title: string;
    description: string;
    gateway_type: string | null;
    regions: string[];
    industries: string[];
    pricing_model: string | null;
    commission_rate: number | null;
    fixed_fee: number | null;
    min_volume: number | null;
    max_volume: number | null;
    views_count: number;
    created_at: string | null;
    provider_name: string | null;
    provider_company: string | null;
    provider_trust_score: number | null;
    provider_is_verified: boolean | null;
}

const DEFAULT: ContactSettings = {
    contact_whatsapp: '', contact_email: '', contact_hours: '',
    contact_offices: '', contact_sales_href: '', contact_faqs: [],
};

const DEFAULT_SITE_SETTINGS: SiteManagementSettings = {
    ...DEFAULT,
    legal_localization_enabled: false,
    legal_default_locale: 'en',
    legal_documents: [
        { id: 'privacy', slug: 'privacy', title: 'Privacy Policy', html: '', updated_at: null, show_in_footer: true, is_system: true },
        { id: 'terms', slug: 'terms', title: 'Terms of Service', html: '', updated_at: null, show_in_footer: true, is_system: true },
        { id: 'cookies', slug: 'cookies', title: 'Cookie Policy', html: '', updated_at: null, show_in_footer: true, is_system: true },
    ],
};

const DEFAULT_TRACKING_SETTINGS: TrackingSettings = {
    google_analytics_id: '',
    google_tag_manager_id: '',
    google_search_console_code: '',
};

const SIDEBAR_ITEMS = [
    { key: 'contact', label: 'Contact & Support', icon: MessageCircle },
    { key: 'site', label: 'Integrations & Legal', icon: ShieldCheck },
    { key: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { key: 'rent', label: 'Rent Proposals', icon: Tag },
    { key: 'sell', label: 'Sell Proposals', icon: ShoppingCart },
] as const;

type SectionKey = typeof SIDEBAR_ITEMS[number]['key'];

const DOC_TYPE_LABELS: Record<string, string> = {
    id_card: 'National ID', passport: 'Passport',
    driver_license: "Driver's License", business_reg: 'Business Registration',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    pending:  { bg: 'rgba(201,168,76,0.1)',  text: 'var(--gold)',  border: 'rgba(201,168,76,0.25)' },
    approved: { bg: 'rgba(34,197,94,0.1)',   text: '#22c55e',     border: 'rgba(34,197,94,0.25)' },
    rejected: { bg: 'rgba(248,113,113,0.1)', text: '#f87171',     border: 'rgba(248,113,113,0.25)' },
    accepted: { bg: 'rgba(34,197,94,0.1)',   text: '#22c55e',     border: 'rgba(34,197,94,0.25)' },
    declined: { bg: 'rgba(248,113,113,0.1)', text: '#f87171',     border: 'rgba(248,113,113,0.25)' },
};

const VERIFY_TYPE_FILTERS = [
    { value: '', label: 'All' },
    { value: 'kyc', label: 'KYC' },
    { value: 'kyb', label: 'KYB' },
    { value: 'aml', label: 'AML' },
    { value: 'bank', label: 'Bank' },
];


/* ══════════════════════════════════════════════════
   Contact Settings Section
   ══════════════════════════════════════════════════ */
function ContactSection() {
    const { addToast } = useNotificationStore();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ContactSettings>(DEFAULT);
    const [saving, setSaving] = useState(false);

    const { data, isLoading } = useQuery<ContactSettings>({
        queryKey: ['site-settings-contact'],
        queryFn: () => client.get('/site-settings/contact').then((r) => r.data),
        staleTime: 0,
    });

    useEffect(() => { if (data) setForm(data); }, [data]);

    const set = (field: keyof ContactSettings, value: string) =>
        setForm((f) => ({ ...f, [field]: value }));
    const setFaq = (i: number, key: 'q' | 'a', value: string) =>
        setForm((f) => ({ ...f, contact_faqs: f.contact_faqs.map((item, idx) => idx === i ? { ...item, [key]: value } : item) }));
    const addFaq = () => setForm((f) => ({ ...f, contact_faqs: [...f.contact_faqs, { q: '', a: '' }] }));
    const removeFaq = (i: number) => setForm((f) => ({ ...f, contact_faqs: f.contact_faqs.filter((_, idx) => idx !== i) }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await client.put('/site-settings/contact', {
                contact_whatsapp: form.contact_whatsapp,
                contact_email: form.contact_email,
                contact_hours: form.contact_hours,
                contact_offices: form.contact_offices,
                contact_sales_href: form.contact_sales_href,
                contact_faqs: form.contact_faqs,
            });
            queryClient.invalidateQueries({ queryKey: ['site-settings-contact'] });
            addToast('Settings saved successfully.', 'success');
        } catch { addToast('Failed to save settings.', 'error'); }
        finally { setSaving(false); }
    };

    if (isLoading) return <div style={{ color: 'var(--slate)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>Loading settings…</div>;

    return (
        <div className="adm-body">
            <motion.div className="adm-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="adm-section-title"><MessageCircle size={16} style={{ color: 'var(--gold)' }} /><span>Support Channels</span></div>
                <div className="adm-fields-grid">
                    <div className="adm-field"><label><MessageCircle size={13} />WhatsApp number</label><input value={form.contact_whatsapp} onChange={(e) => set('contact_whatsapp', e.target.value)} placeholder="e.g. 33612345678" /><span className="adm-field-hint">Used for the floating "Contact us" button.</span></div>
                    <div className="adm-field"><label><Mail size={13} />Support email</label><input type="email" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} placeholder="support@Gatematch.io" /></div>
                    <div className="adm-field"><label><Phone size={13} />Sales / book-a-call URL</label><input value={form.contact_sales_href} onChange={(e) => set('contact_sales_href', e.target.value)} placeholder="https://cal.com/Gatematch" /></div>
                </div>
            </motion.div>
            <motion.div className="adm-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="adm-section-title"><MapPin size={16} style={{ color: 'var(--gold)' }} /><span>Office Information</span></div>
                <div className="adm-fields-grid">
                    <div className="adm-field"><label><Clock size={13} />Support hours</label><input value={form.contact_hours} onChange={(e) => set('contact_hours', e.target.value)} placeholder="Mon – Fri, 9am – 7pm CET" /></div>
                    <div className="adm-field"><label><MapPin size={13} />Office locations</label><input value={form.contact_offices} onChange={(e) => set('contact_offices', e.target.value)} placeholder="Paris · London · Dubai" /></div>
                </div>
            </motion.div>
            <motion.div className="adm-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="adm-section-title"><HelpCircle size={16} style={{ color: 'var(--gold)' }} /><span>Frequently Asked Questions</span></div>
                <div className="adm-faq-list">
                    {form.contact_faqs.map((faq, i) => (
                        <div key={i} className="adm-faq-item">
                            <div className="adm-faq-num">{i + 1}</div>
                            <div className="adm-faq-fields">
                                <input value={faq.q} onChange={(e) => setFaq(i, 'q', e.target.value)} placeholder="Question" className="adm-faq-question" />
                                <textarea value={faq.a} onChange={(e) => setFaq(i, 'a', e.target.value)} placeholder="Answer" rows={2} className="adm-faq-answer" />
                            </div>
                            <button className="adm-faq-remove" onClick={() => removeFaq(i)} title="Remove"><Trash2 size={15} /></button>
                        </div>
                    ))}
                </div>
                <button className="adm-faq-add" onClick={addFaq}><Plus size={15} /> Add FAQ</button>
            </motion.div>
            <motion.button className="adm-save" onClick={handleSave} disabled={saving} whileHover={{ y: -1, boxShadow: '0 12px 28px rgba(201,168,76,0.3)' }}>
                <Save size={16} />{saving ? 'Saving…' : 'Save all settings'}
            </motion.button>
        </div>
    );
}


/* ══════════════════════════════════════════════════
   Site Integrations & Legal Pages Section
   ══════════════════════════════════════════════════ */
function SiteSection() {
    const { addToast } = useNotificationStore();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState<SiteManagementSettings>(DEFAULT_SITE_SETTINGS);
    const [saving, setSaving] = useState(false);
    const [tracking, setTracking] = useState<TrackingSettings>(DEFAULT_TRACKING_SETTINGS);
    const [trackingSaving, setTrackingSaving] = useState(false);
    const [headerScripts, setHeaderScripts] = useState<CustomScript[]>([]);
    const [bodyScripts, setBodyScripts] = useState<CustomScript[]>([]);
    const [footerScripts, setFooterScripts] = useState<CustomScript[]>([]);
    const [newHeaderScript, setNewHeaderScript] = useState('');
    const [newBodyScript, setNewBodyScript] = useState('');
    const [newFooterScript, setNewFooterScript] = useState('');
    const [scriptSavingId, setScriptSavingId] = useState<number | null>(null);
    const [scriptDeletingId, setScriptDeletingId] = useState<number | null>(null);
    const [verificationFiles, setVerificationFiles] = useState<VerificationHtmlFile[]>([]);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
    const [activeDocumentId, setActiveDocumentId] = useState('privacy');
    const [legalEditorMode, setLegalEditorMode] = useState<'rich' | 'markdown'>('rich');
    const sitemapUrl = `${client.defaults.baseURL || '/api'}/sitemap.xml`;

    const { data, isLoading: siteLoading } = useQuery<SiteManagementSettings>({
        queryKey: ['site-settings-contact'],
        queryFn: () => client.get('/site-settings/contact').then((r) => r.data),
        staleTime: 0,
    });

    const { data: trackingData, isLoading: trackingLoading } = useQuery<TrackingSettings>({
        queryKey: ['tracking-settings'],
        queryFn: () => client.get('/tracking-settings').then((r) => r.data),
        staleTime: 0,
    });

    const { data: scriptsData } = useQuery<CustomScript[]>({
        queryKey: ['custom-scripts'],
        queryFn: () => client.get('/custom-scripts').then((r) => r.data),
        staleTime: 0,
    });

    const { data: filesData } = useQuery<VerificationHtmlFile[]>({
        queryKey: ['verification-html-files'],
        queryFn: () => client.get('/verification-html').then((r) => r.data),
        staleTime: 0,
    });

    useEffect(() => {
        if (!data) return;
        const legal_documents = data.legal_documents?.length ? data.legal_documents : DEFAULT_SITE_SETTINGS.legal_documents;
        setForm({ ...DEFAULT_SITE_SETTINGS, ...data, legal_documents });
    }, [data]);

    useEffect(() => {
        if (!trackingData) return;
        setTracking({ ...DEFAULT_TRACKING_SETTINGS, ...trackingData });
    }, [trackingData]);

    useEffect(() => {
        if (!scriptsData) return;
        setHeaderScripts(scriptsData.filter((script) => script.location === 'header'));
        setBodyScripts(scriptsData.filter((script) => script.location === 'body'));
        setFooterScripts(scriptsData.filter((script) => script.location === 'footer'));
    }, [scriptsData]);

    useEffect(() => {
        if (!filesData) return;
        setVerificationFiles(filesData);
    }, [filesData]);

    useEffect(() => {
        if (!form.legal_documents.length) return;
        const requestedSlug = searchParams.get('document');
        if (requestedSlug) {
            const requested = form.legal_documents.find((doc) => doc.slug === requestedSlug);
            if (requested && requested.id !== activeDocumentId) {
                setActiveDocumentId(requested.id);
                return;
            }
        }
        if (!form.legal_documents.some((doc) => doc.id === activeDocumentId)) {
            setActiveDocumentId(form.legal_documents[0].id);
        }
    }, [form.legal_documents, activeDocumentId, searchParams]);

    const setTrackingField = (field: keyof TrackingSettings, value: string) =>
        setTracking((current) => ({ ...current, [field]: value }));

    const normalizeSlug = (value: string) => {
        const normalized = value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return normalized || 'document';
    };

    const ensureUniqueSlug = (value: string, docId: string) => {
        let next = value;
        let counter = 1;
        while (form.legal_documents.some((doc) => doc.slug === next && doc.id !== docId)) {
            counter += 1;
            next = `${value}-${counter}`;
        }
        return next;
    };

    const updateDocument = (id: string, patch: Partial<LegalDocument>) => {
        setForm((current) => ({
            ...current,
            legal_documents: current.legal_documents.map((doc) => doc.id === id ? { ...doc, ...patch } : doc),
        }));
    };

    const addDocument = () => {
        const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `doc-${Date.now()}`;
        const baseSlug = ensureUniqueSlug(`document-${form.legal_documents.length + 1}`, id);
        const newDoc: LegalDocument = {
            id,
            slug: baseSlug,
            title: 'New Document',
            html: '',
            updated_at: null,
            show_in_footer: false,
            is_system: false,
        };
        setForm((current) => ({
            ...current,
            legal_documents: [...current.legal_documents, newDoc],
        }));
        setActiveDocumentId(id);
    };

    const removeDocument = (id: string) => {
        setForm((current) => {
            const next = current.legal_documents.filter((doc) => doc.id !== id);
            return { ...current, legal_documents: next };
        });
        if (activeDocumentId === id) {
            const fallback = form.legal_documents.find((doc) => doc.id !== id);
            setActiveDocumentId(fallback?.id || '');
        }
    };

    const activeDocument = form.legal_documents.find((doc) => doc.id === activeDocumentId) || null;

    useEffect(() => {
        if (!activeDocument) return;
        if (activeDocument.markdown?.trim()) {
            setLegalEditorMode('markdown');
        } else {
            setLegalEditorMode('rich');
        }
    }, [activeDocument]);

    const setEditorMode = (mode: 'rich' | 'markdown') => {
        if (!activeDocument) return;
        if (mode === 'markdown' && !activeDocument.markdown?.trim()) {
            updateDocument(activeDocument.id, { markdown: htmlToMarkdown(activeDocument.html || '') });
        }
        if (mode === 'rich' && activeDocument.markdown?.trim()) {
            updateDocument(activeDocument.id, { html: markdownToHtml(activeDocument.markdown) });
        }
        setLegalEditorMode(mode);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { ...form } as Record<string, unknown>;
            [
                'google_analytics_id',
                'google_tag_manager_id',
                'search_console_verification_code',
                'custom_header_scripts',
                'custom_footer_scripts',
                'integration_snippets',
                'legal_pages',
            ].forEach((key) => { delete payload[key]; });
            await client.put('/site-settings/contact', payload);
            queryClient.invalidateQueries({ queryKey: ['site-settings-contact'] });
            addToast('Site integrations and legal content published.', 'success');
        } catch {
            addToast('Failed to save site configuration.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTracking = async () => {
        setTrackingSaving(true);
        try {
            await client.put('/tracking-settings', tracking);
            queryClient.invalidateQueries({ queryKey: ['tracking-settings'] });
            queryClient.invalidateQueries({ queryKey: ['site-settings-contact'] });
            addToast('Tracking settings updated.', 'success');
        } catch { addToast('Failed to update tracking settings.', 'error'); }
        finally { setTrackingSaving(false); }
    };

    const handleAddScript = async (location: 'header' | 'body' | 'footer') => {
        const payload = location === 'header' ? newHeaderScript : location === 'body' ? newBodyScript : newFooterScript;
        if (!payload.trim()) return;
        try {
            await client.post('/custom-scripts', { location, content: payload });
            queryClient.invalidateQueries({ queryKey: ['custom-scripts'] });
            if (location === 'header') setNewHeaderScript('');
            else if (location === 'body') setNewBodyScript('');
            else setNewFooterScript('');
            addToast('Script added.', 'success');
        } catch { addToast('Failed to add script.', 'error'); }
    };

    const handleSaveScript = async (script: CustomScript) => {
        setScriptSavingId(script.id);
        try {
            await client.put(`/custom-scripts/${script.id}`, { content: script.content });
            queryClient.invalidateQueries({ queryKey: ['custom-scripts'] });
            addToast('Script updated.', 'success');
        } catch { addToast('Failed to update script.', 'error'); }
        finally { setScriptSavingId(null); }
    };

    const handleDeleteScript = async (script: CustomScript) => {
        setScriptDeletingId(script.id);
        try {
            await client.delete(`/custom-scripts/${script.id}`);
            queryClient.invalidateQueries({ queryKey: ['custom-scripts'] });
            addToast('Script removed.', 'success');
        } catch { addToast('Failed to delete script.', 'error'); }
        finally { setScriptDeletingId(null); }
    };

    const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            await client.post('/verification-html/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            queryClient.invalidateQueries({ queryKey: ['verification-html-files'] });
            addToast('Verification file uploaded.', 'success');
        } catch { addToast('Failed to upload verification file.', 'error'); }
        finally {
            setUploadingFile(false);
            event.target.value = '';
        }
    };

    const handleDeleteFile = async (fileItem: VerificationHtmlFile) => {
        setDeletingFileId(fileItem.id);
        try {
            await client.delete(`/verification-html/${fileItem.id}`);
            queryClient.invalidateQueries({ queryKey: ['verification-html-files'] });
            addToast('Verification file deleted.', 'success');
        } catch { addToast('Failed to delete verification file.', 'error'); }
        finally { setDeletingFileId(null); }
    };

    const handleDownloadSitemap = () => {
        window.open(`${sitemapUrl}?download=1`, '_blank', 'noopener,noreferrer');
    };

    const updateScriptContent = (script: CustomScript, next: string) => {
        const updater = script.location === 'header' ? setHeaderScripts : script.location === 'body' ? setBodyScripts : setFooterScripts;
        updater((current) => current.map((item) => item.id === script.id ? { ...item, content: next } : item));
    };

    const isLoading = siteLoading || trackingLoading;

    if (isLoading) return <div style={{ color: 'var(--slate)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>Loading site settings…</div>;

    return (
        <div className="adm-body">
            <motion.div className="adm-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="adm-section-title"><ShieldCheck size={16} style={{ color: 'var(--gold)' }} /><span>Tracking & Verification</span></div>
                <div className="adm-fields-grid">
                    <div className="adm-field"><label><ShieldCheck size={13} />Google Analytics ID</label><input value={tracking.google_analytics_id} onChange={(e) => setTrackingField('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXXXX" /><span className="adm-field-hint">Injects the Google Analytics loader globally in the site head.</span></div>
                    <div className="adm-field"><label><ShieldCheck size={13} />Google Tag Manager ID</label><input value={tracking.google_tag_manager_id} onChange={(e) => setTrackingField('google_tag_manager_id', e.target.value)} placeholder="GTM-XXXXXXX" /><span className="adm-field-hint">Adds the GTM head script and body noscript fallback.</span></div>
                    <div className="adm-field"><label><ShieldCheck size={13} />Search Console verification code</label><input value={tracking.google_search_console_code} onChange={(e) => setTrackingField('google_search_console_code', e.target.value)} placeholder="google-site-verification token" /></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                    <button className="adm-vr-action-btn approve" onClick={handleSaveTracking} disabled={trackingSaving}>
                        <Save size={14} />{trackingSaving ? 'Saving…' : 'Save tracking settings'}
                    </button>
                </div>
            </motion.div>

            <motion.div className="adm-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="adm-section-title"><Settings size={16} style={{ color: 'var(--gold)' }} /><span>Custom Header Scripts</span></div>
                <div className="adm-field">
                    <label><Settings size={13} />Add header script</label>
                    <textarea value={newHeaderScript} onChange={(e) => setNewHeaderScript(e.target.value)} placeholder="Paste meta tags, scripts, or verification snippets" rows={5} />
                </div>
                <button className="adm-faq-add" onClick={() => handleAddScript('header')}><Plus size={15} /> Add header script</button>
                <div className="adm-script-list">
                    {headerScripts.length === 0 ? (
                        <div style={{ color: 'var(--slate)', fontSize: 12 }}>No header scripts yet.</div>
                    ) : headerScripts.map((script) => (
                        <div key={script.id} className="adm-script-item">
                            <textarea value={script.content} onChange={(e) => updateScriptContent(script, e.target.value)} rows={4} />
                            <div className="adm-script-actions">
                                <button className="adm-vr-action-btn" onClick={() => handleSaveScript(script)} disabled={scriptSavingId === script.id}>Save</button>
                                <button className="adm-vr-action-btn reject" onClick={() => handleDeleteScript(script)} disabled={scriptDeletingId === script.id}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div className="adm-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="adm-section-title"><Settings size={16} style={{ color: 'var(--gold)' }} /><span>Custom Body Scripts</span></div>
                <div className="adm-field">
                    <label><Settings size={13} />Add body script</label>
                    <textarea value={newBodyScript} onChange={(e) => setNewBodyScript(e.target.value)} placeholder="Paste scripts to inject after opening body tag" rows={5} />
                </div>
                <button className="adm-faq-add" onClick={() => handleAddScript('body')}><Plus size={15} /> Add body script</button>
                <div className="adm-script-list">
                    {bodyScripts.length === 0 ? (
                        <div style={{ color: 'var(--slate)', fontSize: 12 }}>No body scripts yet.</div>
                    ) : bodyScripts.map((script) => (
                        <div key={script.id} className="adm-script-item">
                            <textarea value={script.content} onChange={(e) => updateScriptContent(script, e.target.value)} rows={4} />
                            <div className="adm-script-actions">
                                <button className="adm-vr-action-btn" onClick={() => handleSaveScript(script)} disabled={scriptSavingId === script.id}>Save</button>
                                <button className="adm-vr-action-btn reject" onClick={() => handleDeleteScript(script)} disabled={scriptDeletingId === script.id}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div className="adm-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="adm-section-title"><Settings size={16} style={{ color: 'var(--gold)' }} /><span>Custom Footer Scripts</span></div>
                <div className="adm-field">
                    <label><Settings size={13} />Add footer script</label>
                    <textarea value={newFooterScript} onChange={(e) => setNewFooterScript(e.target.value)} placeholder="Paste scripts to inject before closing body" rows={5} />
                </div>
                <button className="adm-faq-add" onClick={() => handleAddScript('footer')}><Plus size={15} /> Add footer script</button>
                <div className="adm-script-list">
                    {footerScripts.length === 0 ? (
                        <div style={{ color: 'var(--slate)', fontSize: 12 }}>No footer scripts yet.</div>
                    ) : footerScripts.map((script) => (
                        <div key={script.id} className="adm-script-item">
                            <textarea value={script.content} onChange={(e) => updateScriptContent(script, e.target.value)} rows={4} />
                            <div className="adm-script-actions">
                                <button className="adm-vr-action-btn" onClick={() => handleSaveScript(script)} disabled={scriptSavingId === script.id}>Save</button>
                                <button className="adm-vr-action-btn reject" onClick={() => handleDeleteScript(script)} disabled={scriptDeletingId === script.id}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div className="adm-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="adm-section-title"><FileText size={16} style={{ color: 'var(--gold)' }} /><span>Sitemap</span></div>
                <div className="adm-sitemap-row">
                    <div>
                        <div className="adm-file-name">Dynamic sitemap.xml</div>
                        <div className="adm-field-hint">Includes public pages and all current legal documents. New documents and slug changes appear automatically.</div>
                    </div>
                    <div className="adm-script-actions">
                        <a className="adm-vr-action-btn" href={sitemapUrl} target="_blank" rel="noreferrer">
                            <Eye size={14} /> Preview
                        </a>
                        <button className="adm-vr-action-btn approve" onClick={handleDownloadSitemap}>
                            <Download size={14} /> Download sitemap.xml
                        </button>
                    </div>
                </div>
            </motion.div>

            <motion.div className="adm-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="adm-section-title"><FileText size={16} style={{ color: 'var(--gold)' }} /><span>HTML Verification File Upload</span></div>
                <div className="adm-field">
                    <label><Upload size={13} />Upload verification file</label>
                    <input type="file" accept=".html,text/html" onChange={handleUploadFile} disabled={uploadingFile} />
                    <span className="adm-field-hint">Only .html files that contain "google-site-verification: filename" are accepted.</span>
                </div>
                <div className="adm-file-list">
                    {verificationFiles.length === 0 ? (
                        <div style={{ color: 'var(--slate)', fontSize: 12 }}>No verification files uploaded yet.</div>
                    ) : verificationFiles.map((fileItem) => (
                        <div key={fileItem.id} className="adm-file-item">
                            <div className="adm-file-meta">
                                <div className="adm-file-name">{fileItem.filename}</div>
                                <a className="adm-file-url" href={fileItem.public_url} target="_blank" rel="noreferrer">{fileItem.public_url}</a>
                            </div>
                            <button className="adm-vr-action-btn reject" onClick={() => handleDeleteFile(fileItem)} disabled={deletingFileId === fileItem.id}>Delete</button>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div className="adm-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="adm-section-title"><Settings size={16} style={{ color: 'var(--gold)' }} /><span>Legal Documents</span></div>
                <div className="adm-legal-grid">
                    <div className="adm-legal-list">
                        {form.legal_documents.map((doc) => (
                            <div key={doc.id} className={`adm-legal-item${activeDocumentId === doc.id ? ' active' : ''}`} onClick={() => setActiveDocumentId(doc.id)}>
                                <div className="adm-legal-item-main">
                                    <div className="adm-legal-item-title">{doc.title || 'Untitled document'}</div>
                                    <div className="adm-legal-item-meta">/{doc.slug}{doc.is_system ? ' · System' : ''}</div>
                                </div>
                                <label className="adm-legal-toggle" onClick={(event) => event.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={doc.show_in_footer}
                                        onChange={(event) => updateDocument(doc.id, { show_in_footer: event.target.checked })}
                                    />
                                    <span>Footer</span>
                                </label>
                                {!doc.is_system && (
                                    <button
                                        className="adm-vr-action-btn reject"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            removeDocument(doc.id);
                                        }}
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                )}
                            </div>
                        ))}
                        <button className="adm-legal-add" onClick={addDocument}><Plus size={15} /> Add document</button>
                    </div>

                    <div className="adm-legal-editor">
                        {activeDocument ? (
                            <>
                                <div className="adm-fields-grid" style={{ marginBottom: 12 }}>
                                    <div className="adm-field">
                                        <label><Settings size={13} />Document title</label>
                                        <input
                                            value={activeDocument.title}
                                            onChange={(event) => updateDocument(activeDocument.id, { title: event.target.value })}
                                            placeholder="Document title"
                                        />
                                    </div>
                                    <div className="adm-field">
                                        <label><Settings size={13} />Slug</label>
                                        <input
                                            value={activeDocument.slug}
                                            onChange={(event) => {
                                                const normalized = normalizeSlug(event.target.value);
                                                const unique = ensureUniqueSlug(normalized, activeDocument.id);
                                                updateDocument(activeDocument.id, { slug: unique });
                                            }}
                                            placeholder="document-slug"
                                        />
                                    </div>
                                </div>
                                <div className="adm-field" style={{ marginBottom: 10 }}><label><Settings size={13} />Rich text content</label></div>
                                <div className="adm-legal-editor-actions">
                                    <Link className="adm-vr-action-btn" to={`/legal/${activeDocument.slug}`} target="_blank" rel="noopener noreferrer">
                                        <Eye size={14} /> View page
                                    </Link>
                                </div>
                                <div className="legal-editor-toolbar">
                                    <button
                                        type="button"
                                        className={`legal-editor-tab${legalEditorMode === 'rich' ? ' active' : ''}`}
                                        onClick={() => setEditorMode('rich')}
                                    >
                                        Rich text
                                    </button>
                                    <button
                                        type="button"
                                        className={`legal-editor-tab${legalEditorMode === 'markdown' ? ' active' : ''}`}
                                        onClick={() => setEditorMode('markdown')}
                                    >
                                        Markdown
                                    </button>
                                </div>
                                {legalEditorMode === 'markdown' ? (
                                    <div className="legal-markdown">
                                        <div className="legal-markdown-split">
                                            <div className="legal-markdown-pane">
                                                <textarea
                                                    value={activeDocument.markdown || ''}
                                                    onChange={(event) => updateDocument(activeDocument.id, {
                                                        markdown: event.target.value,
                                                        html: markdownToHtml(event.target.value),
                                                        updated_at: new Date().toISOString(),
                                                    })}
                                                    placeholder="Write markdown here..."
                                                    rows={12}
                                                />
                                                <div className="legal-markdown-hint">Markdown is saved as source and compiled into the same public legal-page styling. Supports headings, lists, links, quotes, tables, inline code, and fenced code blocks.</div>
                                            </div>
                                            <div className="legal-markdown-preview-wrap">
                                                <div className="legal-preview-label">Preview</div>
                                                <div
                                                    className="legal-markdown-preview legal-content legal-content-remote"
                                                    dangerouslySetInnerHTML={{ __html: markdownToHtml(activeDocument.markdown || '') }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <RichTextEditor
                                        value={activeDocument.html}
                                        onChange={(value) => updateDocument(activeDocument.id, { html: value, markdown: htmlToMarkdown(value), updated_at: new Date().toISOString() })}
                                        placeholder="Write the legal document content here..."
                                    />
                                )}
                                {legalEditorMode === 'rich' && (
                                    <div className="adm-card" style={{ marginTop: 14, background: 'rgba(10,22,40,0.55)' }}>
                                        <div className="adm-section-title" style={{ marginBottom: 8 }}><Eye size={16} style={{ color: 'var(--gold)' }} /><span>Live Preview</span></div>
                                        <div className="legal-content legal-content-remote" dangerouslySetInnerHTML={{ __html: activeDocument.html || '<p>No content yet.</p>' }} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ color: 'var(--slate)', fontSize: 13 }}>Select a document to edit.</div>
                        )}
                    </div>
                </div>
            </motion.div>

            <motion.button className="adm-save" onClick={handleSave} disabled={saving} whileHover={{ y: -1, boxShadow: '0 12px 28px rgba(201,168,76,0.3)' }}>
                <Save size={16} />{saving ? 'Publishing…' : 'Publish site settings'}
            </motion.button>
        </div>
    );
}


/* ══════════════════════════════════════════════════
   Verification Requests Section
   ══════════════════════════════════════════════════ */
function VerificationsSection() {
    const { addToast } = useNotificationStore();
    const [verifications, setVerifications] = useState<AdminVerification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('pending');
    const [filterType, setFilterType] = useState<string>('');
    const [reviewingId, setReviewingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchVerifications = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (filterStatus) params.status = filterStatus;
            if (filterType) params.type = filterType;
            const res = await client.get('/verifications/admin/all', { params });
            setVerifications(res.data);
        } catch (err: any) {
            console.error('Verification load error:', err?.response?.status);
            setVerifications([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchVerifications(); }, [filterStatus, filterType]);

    const handleApprove = async (id: number) => {
        setReviewingId(id);
        try {
            await client.put(`/verifications/admin/${id}/review`, { status: 'approved' });
            addToast('Verification approved.', 'success');
            fetchVerifications();
        } catch { addToast('Failed to approve.', 'error'); }
        setReviewingId(null);
    };

    const handleReject = async (id: number) => {
        setReviewingId(id);
        try {
            await client.put(`/verifications/admin/${id}/review`, { status: 'rejected', rejection_reason: rejectReason || null });
            addToast('Verification rejected.', 'success');
            setShowRejectModal(null);
            setRejectReason('');
            fetchVerifications();
        } catch { addToast('Failed to reject.', 'error'); }
        setReviewingId(null);
    };

    const handleDownload = (id: number) => {
        window.open(`${client.defaults.baseURL}/verifications/admin/${id}/download`, '_blank');
    };

    const handlePreview = (v: AdminVerification) => {
        if (!v.document_path) return;
        const ext = v.document_path.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') { handleDownload(v.id); }
        else { setPreviewUrl(`${client.defaults.baseURL}/${v.document_path}`); }
    };

    const formatDate = (d: string | null) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="adm-body">
            {/* Status filter */}
            <div className="adm-vr-filters">
                {['pending', 'approved', 'rejected', ''].map((s) => (
                    <button key={s} className={`adm-vr-filter-btn${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
                        {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
                    </button>
                ))}
            </div>

            {/* Type filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {VERIFY_TYPE_FILTERS.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setFilterType(t.value)}
                        style={{
                            padding: '4px 12px',
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            border: `1px solid ${filterType === t.value ? 'var(--gold)' : 'var(--border-light)'}`,
                            background: filterType === t.value ? 'rgba(201,168,76,0.12)' : 'transparent',
                            color: filterType === t.value ? 'var(--gold)' : 'var(--slate)',
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ color: 'var(--slate)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>Loading verifications…</div>
            ) : verifications.length === 0 ? (
                <div className="adm-card" style={{ textAlign: 'center', padding: '48px 28px' }}>
                    <ShieldCheck size={32} style={{ color: 'var(--slate)', margin: '0 auto 12px', opacity: 0.5 }} />
                    <div style={{ fontSize: 14, color: 'var(--slate)' }}>No {filterStatus || ''} {filterType.toUpperCase() || ''} verification requests.</div>
                </div>
            ) : (
                <div className="adm-vr-list">
                    {verifications.map((v, i) => {
                        const sc = STATUS_COLORS[v.status] || STATUS_COLORS.pending;
                        return (
                            <motion.div key={v.id} className="adm-vr-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <div className="adm-vr-card-header">
                                    <div className="adm-vr-user-info">
                                        <div className="adm-vr-user-name">{v.user_full_name || 'Unknown'}</div>
                                        <div className="adm-vr-user-email">{v.user_email}</div>
                                    </div>
                                    <span className="adm-vr-status" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                                    </span>
                                </div>
                                <div className="adm-vr-details">
                                    <div className="adm-vr-detail"><span className="adm-vr-detail-label">Type</span><span className="adm-vr-detail-value">{v.type.toUpperCase()}</span></div>
                                    <div className="adm-vr-detail"><span className="adm-vr-detail-label">Document</span><span className="adm-vr-detail-value">{DOC_TYPE_LABELS[v.document_type || ''] || v.document_type || '—'}</span></div>
                                    <div className="adm-vr-detail"><span className="adm-vr-detail-label">Side</span><span className="adm-vr-detail-value" style={{ textTransform: 'capitalize' }}>{v.document_side || '—'}</span></div>
                                    <div className="adm-vr-detail"><span className="adm-vr-detail-label">Submitted</span><span className="adm-vr-detail-value">{formatDate(v.submitted_at)}</span></div>
                                    {v.reviewed_at && <div className="adm-vr-detail"><span className="adm-vr-detail-label">Reviewed</span><span className="adm-vr-detail-value">{formatDate(v.reviewed_at)}</span></div>}
                                    {v.rejection_reason && <div className="adm-vr-detail" style={{ gridColumn: '1 / -1' }}><span className="adm-vr-detail-label">Rejection reason</span><span className="adm-vr-detail-value" style={{ color: '#f87171' }}>{v.rejection_reason}</span></div>}
                                </div>
                                <div className="adm-vr-actions">
                                    {v.document_path && (
                                        <>
                                            <button className="adm-vr-action-btn" onClick={() => handlePreview(v)}><Eye size={14} /> Preview</button>
                                            <button className="adm-vr-action-btn" onClick={() => handleDownload(v.id)}><Download size={14} /> Download</button>
                                        </>
                                    )}
                                    {v.status === 'pending' && (
                                        <>
                                            <button className="adm-vr-action-btn approve" onClick={() => handleApprove(v.id)} disabled={reviewingId === v.id}><CheckCircle size={14} /> Approve</button>
                                            <button className="adm-vr-action-btn reject" onClick={() => setShowRejectModal(v.id)}><XCircle size={14} /> Reject</button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {showRejectModal && (
                <div className="mkt-modal-backdrop" style={{ zIndex: 200 }} onClick={() => setShowRejectModal(null)}>
                    <div className="mkt-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--white)', marginBottom: 6 }}>Reject verification</div>
                        <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 16 }}>Optionally provide a reason so the user knows what to fix.</div>
                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Document is blurry, please re-upload..." rows={3} style={{ width: '100%', boxSizing: 'border-box', background: 'var(--navy)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', color: 'var(--white)', fontSize: 14, fontFamily: "'DM Sans', sans-serif", resize: 'vertical', marginBottom: 14 }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="adm-vr-action-btn" style={{ flex: 1 }} onClick={() => setShowRejectModal(null)}>Cancel</button>
                            <button className="adm-vr-action-btn reject" style={{ flex: 1 }} onClick={() => handleReject(showRejectModal)} disabled={reviewingId === showRejectModal}>
                                {reviewingId === showRejectModal ? 'Rejecting…' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewUrl && (
                <div className="mkt-modal-backdrop" style={{ zIndex: 200 }} onClick={() => setPreviewUrl(null)}>
                    <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, overflow: 'hidden' }}>
                        <img src={previewUrl} alt="Document preview" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12 }} />
                    </div>
                </div>
            )}
        </div>
    );
}


/* ══════════════════════════════════════════════════
   Proposals Section (Rent / Sell)
   ══════════════════════════════════════════════════ */
function ProposalsSection({ operationType }: { operationType: 'rent' | 'sell' }) {
    const { addToast } = useNotificationStore();
    const [cards, setCards] = useState<CardProposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('pending');
    const [reviewingId, setReviewingId] = useState<number | null>(null);
    const [activeMessageCard, setActiveMessageCard] = useState<CardProposal | null>(null);
    const [messageText, setMessageText] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const label = operationType === 'rent' ? 'Rent' : 'Sell';
    const desc = operationType === 'rent'
        ? 'Private rent requests. These are validated by admin and are not published on the public marketplace.'
        : 'Private sell requests. These are validated by admin and are not published on the public marketplace.';

    const fetchProposals = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = { operation_type: operationType };
            if (filterStatus) params.proposal_status = filterStatus;
            const res = await client.get('/cards/admin/proposals', { params });
            setCards(res.data);
        } catch {
            setCards([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchProposals(); }, [operationType, filterStatus]);

    const handleAccept = async (cardId: number) => {
        setReviewingId(cardId);
        try {
            await client.put(`/cards/admin/${cardId}/proposal?status=accepted`);
            addToast('Proposal validated successfully.', 'success');
            fetchProposals();
        } catch { addToast('Failed to accept proposal.', 'error'); }
        setReviewingId(null);
    };

    const handleDecline = async (cardId: number) => {
        setReviewingId(cardId);
        try {
            await client.put(`/cards/admin/${cardId}/proposal?status=declined`);
            addToast('Proposal declined.', 'success');
            fetchProposals();
        } catch { addToast('Failed to decline proposal.', 'error'); }
        setReviewingId(null);
    };

    const formatDate = (d: string | null) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const sendMessageToUser = async () => {
        if (!activeMessageCard || !messageText.trim()) return;
        setSendingMessage(true);
        try {
            await client.post('/messages', {
                card_id: activeMessageCard.id,
                receiver_id: activeMessageCard.user_id,
                content: messageText.trim(),
            });
            addToast('Message sent to user.', 'success');
            setActiveMessageCard(null);
            setMessageText('');
        } catch (err: any) {
            addToast(err.response?.data?.detail || 'Failed to send message.', 'error');
        }
        setSendingMessage(false);
    };

    return (
        <div className="adm-body">
            <div className="adm-card" style={{ padding: '16px 24px', marginBottom: 4 }}>
                <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.6 }}>{desc}</div>
            </div>

            {/* Status filter */}
            <div className="adm-vr-filters" style={{ marginBottom: 8 }}>
                {[
                    { value: 'pending', label: 'Pending' },
                    { value: 'accepted', label: 'Accepted' },
                    { value: 'declined', label: 'Declined' },
                    { value: '', label: 'All' },
                ].map((s) => (
                    <button key={s.value} className={`adm-vr-filter-btn${filterStatus === s.value ? ' active' : ''}`} onClick={() => setFilterStatus(s.value)}>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Unclassified cards widget */}
            <UnclassifiedCards onClassified={fetchProposals} />

            {loading ? (
                <div style={{ color: 'var(--slate)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>Loading {label.toLowerCase()} proposals…</div>
            ) : cards.length === 0 ? (
                <div className="adm-card" style={{ textAlign: 'center', padding: '48px 28px' }}>
                    {operationType === 'rent'
                        ? <Tag size={32} style={{ color: 'var(--slate)', margin: '0 auto 12px', opacity: 0.5 }} />
                        : <ShoppingCart size={32} style={{ color: 'var(--slate)', margin: '0 auto 12px', opacity: 0.5 }} />}
                    <div style={{ fontSize: 14, color: 'var(--slate)' }}>No {filterStatus || ''} {label.toLowerCase()} proposals.</div>
                </div>
            ) : (
                <div className="adm-vr-list">
                    {cards.map((card, i) => {
                        const ps = card.proposal_status || 'pending';
                        const sc = STATUS_COLORS[ps] || STATUS_COLORS.pending;
                        return (
                            <motion.div key={card.id} className="adm-vr-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <div className="adm-vr-card-header">
                                    <div className="adm-vr-user-info">
                                        <div className="adm-vr-user-name">{card.title}</div>
                                        <div className="adm-vr-user-email">{card.provider_company || card.provider_name} · {card.type === 'offer' ? 'Offer' : 'Request'}</div>
                                    </div>
                                    <span className="adm-vr-status" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                                        {ps.charAt(0).toUpperCase() + ps.slice(1)}
                                    </span>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.5, marginBottom: 12 }}>{card.description}</div>
                                <div className="adm-vr-details">
                                    <div className="adm-vr-detail"><span className="adm-vr-detail-label">Gateway</span><span className="adm-vr-detail-value">{card.gateway_type || '—'}</span></div>
                                    <div className="adm-vr-detail"><span className="adm-vr-detail-label">Regions</span><span className="adm-vr-detail-value">{card.regions?.join(', ') || '—'}</span></div>
                                    <div className="adm-vr-detail"><span className="adm-vr-detail-label">Pricing</span><span className="adm-vr-detail-value">{card.pricing_model === 'percentage' ? `${card.commission_rate}%` : card.pricing_model === 'fixed' ? `€${card.fixed_fee?.toFixed(2)}` : 'Negotiable'}</span></div>
                                    <div className="adm-vr-detail"><span className="adm-vr-detail-label">Volume</span><span className="adm-vr-detail-value">${(card.min_volume || 0).toLocaleString()} – ${(card.max_volume || 0).toLocaleString()}</span></div>
                                    <div className="adm-vr-detail"><span className="adm-vr-detail-label">Posted</span><span className="adm-vr-detail-value">{formatDate(card.created_at)}</span></div>
                                    <div className="adm-vr-detail"><span className="adm-vr-detail-label">Views</span><span className="adm-vr-detail-value">{card.views_count}</span></div>
                                </div>
                                {ps === 'pending' && (
                                    <div className="adm-vr-actions">
                                        <button className="adm-vr-action-btn approve" onClick={() => handleAccept(card.id)} disabled={reviewingId === card.id}>
                                            <CheckCircle size={14} /> Accept
                                        </button>
                                        <button className="adm-vr-action-btn reject" onClick={() => handleDecline(card.id)} disabled={reviewingId === card.id}>
                                            <XCircle size={14} /> Decline
                                        </button>
                                    </div>
                                )}
                                <div className="adm-vr-actions" style={{ marginTop: 8 }}>
                                    <Link to={`/profile/${card.user_id}`} className="adm-vr-action-btn" style={{ textDecoration: 'none' }}>
                                        <Eye size={14} /> View Profile
                                    </Link>
                                    <button className="adm-vr-action-btn" onClick={() => setActiveMessageCard(card)}>
                                        <MessageCircle size={14} /> Message User
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {activeMessageCard && (
                <div className="mkt-modal-backdrop" style={{ zIndex: 200 }} onClick={() => setActiveMessageCard(null)}>
                    <div className="mkt-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--white)', marginBottom: 6 }}>
                            Message {activeMessageCard.provider_name || 'User'}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 14 }}>
                            Card: {activeMessageCard.title}
                        </div>
                        <textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Write your message..."
                            rows={4}
                            style={{ width: '100%', boxSizing: 'border-box', background: 'var(--navy)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', color: 'var(--white)', fontSize: 14, fontFamily: "'DM Sans', sans-serif", resize: 'vertical', marginBottom: 14 }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="adm-vr-action-btn" style={{ flex: 1 }} onClick={() => setActiveMessageCard(null)}>Cancel</button>
                            <button className="adm-vr-action-btn approve" style={{ flex: 1 }} onClick={sendMessageToUser} disabled={sendingMessage || !messageText.trim()}>
                                {sendingMessage ? 'Sending…' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


/* ── Unclassified Cards widget ── */
function UnclassifiedCards({ onClassified }: { onClassified: () => void }) {
    const { addToast } = useNotificationStore();
    const [cards, setCards] = useState<CardProposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.get('/cards/admin/proposals', { params: { unclassified: 'true' } }).then((r) => {
            setCards(r.data as CardProposal[]);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const review = async (cardId: number, status: 'accepted' | 'declined') => {
        try {
            await client.put(`/cards/admin/${cardId}/proposal?status=${status}`);
            addToast(status === 'accepted' ? 'Card approved for the Marketplace.' : 'Card declined.', 'success');
            setCards((prev) => prev.filter((c) => c.id !== cardId));
            onClassified();
        } catch { addToast('Failed to review card.', 'error'); }
    };

    if (loading || cards.length === 0) return null;

    return (
        <motion.div className="adm-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ border: '1px solid rgba(201,168,76,0.25)', marginBottom: 12 }}>
            <div className="adm-section-title" style={{ color: 'var(--gold)' }}>
                <Tag size={16} style={{ color: 'var(--gold)' }} />
                <span>Public Cards Awaiting Review ({cards.length})</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 14 }}>Approve these public offers and requests to make them visible in the Marketplace.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cards.map((c) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--navy)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>{c.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--slate)' }}>{c.provider_company || c.provider_name} · {c.type === 'offer' ? 'Offer' : 'Request'}</div>
                        </div>
                        <button className="adm-vr-action-btn" onClick={() => review(c.id, 'declined')} style={{ fontSize: 11 }}><XCircle size={12} /> Decline</button>
                        <button className="adm-vr-action-btn approve" onClick={() => review(c.id, 'accepted')} style={{ fontSize: 11 }}><CheckCircle size={12} /> Approve</button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}


/* ══════════════════════════════════════════════════
   Main Admin Settings Page
   ══════════════════════════════════════════════════ */
export default function AdminSettingsPage() {
    const [searchParams] = useSearchParams();
    const requestedSection = searchParams.get('section');
    const initialSection: SectionKey = requestedSection && SIDEBAR_ITEMS.some((item) => item.key === requestedSection)
        ? (requestedSection as SectionKey)
        : 'contact';
    const [activeSection, setActiveSection] = useState<SectionKey>(initialSection);

    const sectionTitles: Record<SectionKey, { title: string; sub: string }> = {
        contact: { title: 'Contact & Support', sub: 'Manage contact page content, support channels, and FAQ' },
        site: { title: 'Integrations & Legal', sub: 'Configure analytics scripts and manage legal documents' },
        verifications: { title: 'Verification Requests', sub: 'Review and manage user identity verification documents' },
        rent: { title: 'Rent Proposals', sub: 'Cards from users seeking to rent payment capacity (requests)' },
        sell: { title: 'Sell Proposals', sub: 'Cards from users offering payment infrastructure (offers)' },
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'contact': return <ContactSection />;
            case 'site': return <SiteSection />;
            case 'verifications': return <VerificationsSection />;
            case 'rent': return <ProposalsSection operationType="rent" />;
            case 'sell': return <ProposalsSection operationType="sell" />;
        }
    };

    useEffect(() => {
        if (requestedSection && SIDEBAR_ITEMS.some((item) => item.key === requestedSection)) {
            setActiveSection(requestedSection as SectionKey);
        }
    }, [requestedSection]);

    return (
        <div className="content-page">
            <div className="adm-layout">
                <aside className="adm-sidebar">
                    <div className="adm-sidebar-header">
                        <Settings size={18} style={{ color: 'var(--gold)' }} />
                        <span>Admin Panel</span>
                    </div>
                    <nav className="adm-sidebar-nav">
                        {SIDEBAR_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button key={item.key} className={`adm-sidebar-item${activeSection === item.key ? ' active' : ''}`} onClick={() => setActiveSection(item.key)}>
                                    <Icon size={16} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <main className="adm-content">
                    <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                        <div className="adm-content-header">
                            <div className="adm-header-title">{sectionTitles[activeSection].title}</div>
                            <div className="adm-header-sub">{sectionTitles[activeSection].sub}</div>
                        </div>
                        {renderSection()}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
