import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, PenLine, Save, X } from 'lucide-react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import RichTextEditor from '../ui/RichTextEditor';
import { htmlToMarkdown, markdownToHtml } from '../../utils/markdown';

type LegalContent = {
    title?: string;
    html?: string;
    updated_at?: string | null;
};

type LegalDocument = {
    id: string;
    slug: string;
    title: string;
    html: string;
    markdown?: string | null;
    updated_at?: string | null;
    show_in_footer: boolean;
    is_system?: boolean;
};

type SiteSettings = {
    legal_documents?: LegalDocument[];
    legal_pages?: Record<string, Record<string, LegalContent>>;
    legal_localization_enabled?: boolean;
    legal_default_locale?: string;
};

type LegalDocumentShellProps = {
    slug: string;
    title?: string;
    fallbackUpdatedLabel: string;
    children?: ReactNode;
};

function detectLocale(settings?: SiteSettings) {
    if (settings?.legal_localization_enabled) {
        const browserLocale = typeof navigator !== 'undefined' ? navigator.language : '';
        return (browserLocale.split('-')[0] || settings.legal_default_locale || 'en').toLowerCase();
    }
    return (settings?.legal_default_locale || 'en').toLowerCase();
}

function slugToTitle(value: string) {
    return value
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
}


export default function LegalDocumentShell({ slug, title, fallbackUpdatedLabel, children }: LegalDocumentShellProps) {
    const { user } = useAuthStore();
    const { addToast } = useNotificationStore();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [draftTitle, setDraftTitle] = useState('');
    const [draftHtml, setDraftHtml] = useState('');
    const [draftMarkdown, setDraftMarkdown] = useState('');
    const [editorMode, setEditorMode] = useState<'rich' | 'markdown'>('rich');
    const [saving, setSaving] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const { data } = useQuery<SiteSettings>({
        queryKey: ['site-settings-contact'],
        queryFn: () => client.get('/site-settings/contact').then((r) => r.data),
        staleTime: 60_000,
    });

    const locale = useMemo(() => detectLocale(data), [data]);
    const documents = data?.legal_documents ?? [];
    const legalDocument = documents.find((item) => item.slug === slug);
    const legacyContent = data?.legal_pages?.[slug]?.[locale] ?? data?.legal_pages?.[slug]?.default;
    const resolvedTitle = (legalDocument?.title || legacyContent?.title || title || slugToTitle(slug)).trim();
    const preferDocument = Boolean(legalDocument?.updated_at || legalDocument?.html?.trim() || legalDocument?.markdown?.trim());
    const documentMarkdown = legalDocument?.markdown?.trim() || '';
    const contentHtml = preferDocument
        ? (documentMarkdown ? markdownToHtml(documentMarkdown) : legalDocument?.html || '')
        : legacyContent?.html ?? '';
    const updatedAt = preferDocument ? legalDocument?.updated_at || null : legacyContent?.updated_at || null;
    const hasRemoteContent = Boolean(contentHtml?.trim());
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (isEditing) return;
        setDraftTitle(resolvedTitle || slugToTitle(slug));
        setDraftHtml(contentHtml || '');
        const markdownSeed = documentMarkdown || htmlToMarkdown(contentHtml || '');
        setDraftMarkdown(markdownSeed);
        setEditorMode(documentMarkdown ? 'markdown' : 'rich');
    }, [contentHtml, documentMarkdown, isEditing, resolvedTitle, slug]);

    useEffect(() => {
        const label = resolvedTitle || title || slugToTitle(slug);
        document.title = `${label} | Gatematch`;
    }, [resolvedTitle, slug, title]);

    const handleCancel = () => {
        setIsEditing(false);
        setDraftTitle(resolvedTitle || slugToTitle(slug));
        setDraftHtml(contentHtml || '');
        const markdownSeed = documentMarkdown || htmlToMarkdown(contentHtml || '');
        setDraftMarkdown(markdownSeed);
        setEditorMode(documentMarkdown ? 'markdown' : 'rich');
    };

    const startEditing = () => {
        const initialHtml = contentHtml?.trim() ? contentHtml : (contentRef.current?.innerHTML || '');
        const initialMarkdown = documentMarkdown || htmlToMarkdown(initialHtml);
        setDraftTitle(resolvedTitle || slugToTitle(slug));
        setDraftHtml(initialHtml);
        setDraftMarkdown(initialMarkdown);
        setEditorMode(documentMarkdown ? 'markdown' : 'rich');
        setIsEditing(true);
    };

    const handleModeChange = (mode: 'rich' | 'markdown') => {
        if (mode === editorMode) return;
        if (mode === 'markdown' && !draftMarkdown.trim()) {
            setDraftMarkdown(htmlToMarkdown(draftHtml));
        }
        if (mode === 'rich' && draftMarkdown.trim()) {
            setDraftHtml(markdownToHtml(draftMarkdown));
        }
        setEditorMode(mode);
    };

    const handleSave = async () => {
        if (!isAdmin) return;
        setSaving(true);
        try {
            const now = new Date().toISOString();
            const existing = documents.find((item) => item.slug === slug);
            const htmlToSave = editorMode === 'markdown'
                ? (draftMarkdown.trim() ? markdownToHtml(draftMarkdown) : draftHtml)
                : draftHtml;
            const markdownToSave = editorMode === 'markdown' ? draftMarkdown : htmlToMarkdown(draftHtml);
            const nextDoc: LegalDocument = {
                id: existing?.id || slug,
                slug,
                title: draftTitle.trim() || resolvedTitle || slugToTitle(slug),
                html: htmlToSave,
                markdown: markdownToSave,
                updated_at: now,
                show_in_footer: existing?.show_in_footer ?? true,
                is_system: existing?.is_system ?? ['privacy', 'terms', 'cookies'].includes(slug),
            };
            const nextDocuments = existing
                ? documents.map((item) => (item.slug === slug ? { ...item, ...nextDoc } : item))
                : [...documents, nextDoc];

            await client.put('/site-settings/contact', { legal_documents: nextDocuments });
            queryClient.invalidateQueries({ queryKey: ['site-settings-contact'] });
            addToast('Legal document saved.', 'success');
            setIsEditing(false);
        } catch {
            addToast('Failed to save legal document.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const renderedContent = hasRemoteContent ? (
        <div className="legal-content legal-content-remote" lang={locale}>
            {resolvedTitle ? <h2>{resolvedTitle}</h2> : null}
            {updatedAt ? <p className="legal-updated">Last updated: {new Date(updatedAt).toLocaleDateString()}</p> : <p className="legal-updated">{fallbackUpdatedLabel}</p>}
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
    ) : (
        <div className="legal-content" lang={locale} ref={contentRef}>
            {children || <p>No document has been published yet.</p>}
        </div>
    );

    return (
        <div className="legal-doc-shell">
            {isAdmin && (
                <div className="legal-doc-toolbar">
                    {!isEditing ? (
                        <div className="legal-edit-actions">
                            <Link className="legal-edit-btn muted" to={`/admin/settings?section=site&document=${encodeURIComponent(slug)}`}>
                                <ExternalLink size={14} /> Admin
                            </Link>
                            <button className="legal-edit-btn" type="button" onClick={startEditing}>
                                <PenLine size={14} /> Edit
                            </button>
                        </div>
                    ) : (
                        <div className="legal-edit-actions">
                            <button className="legal-edit-btn" type="button" onClick={handleSave} disabled={saving}>
                                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button className="legal-edit-btn muted" type="button" onClick={handleCancel} disabled={saving}>
                                <X size={14} /> Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
            {isEditing ? (
                <div className="legal-editor">
                    <div className="legal-editor-head">
                        <div>
                            <div className="legal-editor-kicker">Editing /{slug}</div>
                            <div className="legal-editor-heading">{draftTitle || resolvedTitle || slugToTitle(slug)}</div>
                        </div>
                        <div className="legal-editor-format">{editorMode === 'markdown' ? 'Markdown source' : 'Rich text source'}</div>
                    </div>
                    <div className="legal-editor-field">
                        <label>Document title</label>
                        <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Document title" />
                    </div>
                    <div className="legal-editor-toolbar">
                        <button
                            type="button"
                            className={`legal-editor-tab${editorMode === 'rich' ? ' active' : ''}`}
                            onClick={() => handleModeChange('rich')}
                        >
                            Rich text
                        </button>
                        <button
                            type="button"
                            className={`legal-editor-tab${editorMode === 'markdown' ? ' active' : ''}`}
                            onClick={() => handleModeChange('markdown')}
                        >
                            Markdown
                        </button>
                    </div>
                    {editorMode === 'markdown' ? (
                        <div className="legal-markdown">
                            <div className="legal-markdown-split">
                                <div className="legal-markdown-pane">
                                    <textarea
                                        value={draftMarkdown}
                                        onChange={(event) => setDraftMarkdown(event.target.value)}
                                        placeholder="Write markdown here..."
                                        rows={12}
                                    />
                                    <div className="legal-markdown-hint">Markdown compiles to the same legal page styling. Use # headings, **bold**, [links](https://...), lists, quotes, tables, and fenced code blocks.</div>
                                </div>
                                <div className="legal-markdown-preview-wrap">
                                    <div className="legal-preview-label">Preview</div>
                                    <div className="legal-markdown-preview legal-content legal-content-remote" dangerouslySetInnerHTML={{ __html: markdownToHtml(draftMarkdown) }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <RichTextEditor value={draftHtml} onChange={setDraftHtml} placeholder="Write the legal document content here..." />
                    )}
                </div>
            ) : (
                renderedContent
            )}
        </div>
    );
}
