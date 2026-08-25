import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';

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
    contact_email?: string;
    contact_offices?: string;
    contact_whatsapp?: string;
    legal_documents?: LegalDocument[];
};

const platformLinks = [
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/providers', label: 'Providers' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/pricing', label: 'Pricing' },
];
const trustLinks = [
    { path: '/compliance', label: 'Compliance Center' },
    { path: '/compliance', label: 'Trust Scores' },
    { path: '/compliance', label: 'AML Policy' },
    { path: '/compliance', label: 'Acceptable Use' },
];
const companyLinks = [
    { path: '#', label: 'About' },
    { path: '#', label: 'Blog' },
    { path: '#', label: 'Careers' },
    { path: '#', label: 'Contact' },
];

const LEGAL_PATHS: Record<string, string> = {
    privacy: '/privacy',
    terms: '/terms',
    cookies: '/cookies',
};

const FALLBACK_LEGAL_LINKS = [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' },
];

function FooterCol({ title, links }: { title: string; links: { path: string; label: string }[] }) {
    return (
        <div className="site-footer-col">
            <div className="site-footer-col-title">{title}</div>
            <div className="site-footer-col-links">
                {links.map((link, i) => (
                    <Link key={i} to={link.path} className="site-footer-link">
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function Footer() {
    const { data } = useQuery<SiteSettings>({
        queryKey: ['site-settings-contact'],
        queryFn: () => client.get('/site-settings/contact').then((r) => r.data),
        staleTime: 60_000,
    });

    const legalLinks = useMemo(() => {
        const docs = data?.legal_documents ?? [];
        if (!docs.length) return FALLBACK_LEGAL_LINKS;
        return docs
            .filter((doc) => doc.show_in_footer !== false)
            .map((doc) => ({
                label: doc.title || doc.slug,
                path: LEGAL_PATHS[doc.slug] || `/legal/${doc.slug}`,
            }));
    }, [data]);

    const address = data?.contact_offices || 'Paris, London, Dubai';
    const phone = data?.contact_whatsapp || '1234567890';
    const email = data?.contact_email || 'support@Gatematch.io';

    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <div className="site-footer-grid">
                    <div className="site-footer-brand-block">
                        <div className="site-footer-logo">Gatematch</div>
                        <div className="site-footer-desc">
                        The trusted marketplace for payment infrastructure. Connecting providers and seekers
                        , compliantly, transparently, at scale.
                        </div>
                        <div className="site-footer-contact">
                            <div className="site-footer-contact-item">
                                <span className="site-footer-contact-label">Address</span>
                                <span className="site-footer-contact-value">{address}</span>
                            </div>
                            <div className="site-footer-contact-item">
                                <span className="site-footer-contact-label">Phone</span>
                                <a className="site-footer-contact-link" href={`tel:${phone}`}>
                                    {phone}
                                </a>
                            </div>
                            <div className="site-footer-contact-item">
                                <span className="site-footer-contact-label">Email</span>
                                <a className="site-footer-contact-link" href={`mailto:${email}`}>
                                    {email}
                                </a>
                            </div>
                        </div>
                    </div>
                    <FooterCol title="Platform" links={platformLinks} />
                    <FooterCol title="Trust" links={trustLinks} />
                    <FooterCol title="Company" links={companyLinks} />
                </div>

                <div className="site-footer-bottom">
                    <div className="site-footer-copy">© 2026 Gatematch Technologies Ltd. All rights reserved.</div>
                    <div className="site-footer-bottom-links">
                    {legalLinks.map((l) => (
                        <Link key={l.path} to={l.path} className="site-footer-link">{l.label}</Link>
                    ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
