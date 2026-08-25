import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Footer from '../components/layout/Footer';
import LegalDocumentShell from '../components/layout/LegalDocumentShell';
import client from '../api/client';

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
};

function slugToTitle(value: string) {
    return value
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
}

export default function LegalDocumentPage() {
    const { slug } = useParams<{ slug: string }>();
    const { data } = useQuery<SiteSettings>({
        queryKey: ['site-settings-contact'],
        queryFn: () => client.get('/site-settings/contact').then((r) => r.data),
        staleTime: 60_000,
    });

    const document = useMemo(() => {
        if (!slug) return null;
        return data?.legal_documents?.find((item) => item.slug === slug) || null;
    }, [data, slug]);

    const heroTitle = document?.title || (slug ? slugToTitle(slug) : 'Legal Document');
    const fallbackUpdatedLabel = document?.updated_at
        ? `Last updated: ${new Date(document.updated_at).toLocaleDateString()}`
        : 'Last updated: Not published';

    if (!slug) return null;

    return (
        <div className="page-wrapper">
            <section className="legal-hero">
                <motion.div
                    className="legal-hero-inner"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <div className="legal-kicker">Legal</div>
                    <h1 className="legal-title">{heroTitle}</h1>
                    <p className="legal-updated">{fallbackUpdatedLabel}</p>
                </motion.div>
            </section>

            <motion.section
                className="legal-body"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
            >
                <LegalDocumentShell slug={slug} title={heroTitle} fallbackUpdatedLabel={fallbackUpdatedLabel}>
                    <p>This document is not available yet. Please check back later.</p>
                </LegalDocumentShell>
            </motion.section>

            <Footer />
        </div>
    );
}
