import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin, Clock, Send, Phone } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Footer from '../components/layout/Footer';
import LocationMap from '../components/ui/LocationMap';
import { useNotificationStore } from '../store/notificationStore';
import client from '../api/client';

interface ContactSettings {
    contact_whatsapp: string;
    contact_email: string;
    contact_hours: string;
    contact_offices: string;
    contact_sales_href: string;
    contact_faqs: { q: string; a: string }[];
    latitude?: number | null;
    longitude?: number | null;
    contact_location_status?: string | null;
    contact_location_error?: string | null;
}

const DEFAULT_SETTINGS: ContactSettings = {
    contact_whatsapp: '1234567890',
    contact_email: 'support@Gatematch.io',
    contact_hours: 'Mon – Fri, 9am – 7pm CET',
    contact_offices: 'Paris · London · Dubai',
    contact_sales_href: '#',
    contact_faqs: [
        { q: 'How quickly can I get a deal activated?', a: 'Most deals go live within 48–72 hours of both parties signing the term sheet, subject to KYB verification.' },
        { q: 'Is Gatematch regulated?', a: 'Gatematch operates as an infrastructure marketplace, not a payment processor. Regulatory compliance sits with the licensed providers on the platform.' },
        { q: 'What happens if a deal goes wrong?', a: 'Professional and Enterprise plans include escrow protection and structured dispute resolution with our compliance team.' },
        { q: 'Can I list multiple gateway types?', a: 'Yes — providers can post unlimited cards on the Professional plan, covering different corridors, currencies, and processing types.' },
    ],
};

export default function ContactPage() {
    const { addToast } = useNotificationStore();
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);

    const { data: s = DEFAULT_SETTINGS } = useQuery<ContactSettings>({
        queryKey: ['site-settings-contact'],
        queryFn: () => client.get('/site-settings/contact').then((r) => r.data),
        staleTime: 60_000,
        refetchInterval: (query) => (query.state.data?.contact_location_status === 'processing' ? 3000 : false),
        refetchIntervalInBackground: true,
    });

    const locationStatus = s.contact_location_status ?? ((s.latitude != null && s.longitude != null) ? 'ready' : 'idle');

    const channels = [
        {
            icon: MessageCircle,
            label: 'WhatsApp',
            value: 'Chat with us instantly',
            sub: 'Typically replies in < 5 min',
            color: '#25D366',
            href: `https://wa.me/${s.contact_whatsapp}`,
        },
        {
            icon: Mail,
            label: 'Email',
            value: s.contact_email,
            sub: 'Response within 24 hours',
            color: '#4da8ff',
            href: `mailto:${s.contact_email}`,
        },
        {
            icon: Phone,
            label: 'Sales',
            value: 'Book a call',
            sub: 'Enterprise & custom plans',
            color: 'var(--gold)',
            href: s.contact_sales_href,
        },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            addToast('Please fill in all required fields.', 'error');
            return;
        }
        setSending(true);
        await new Promise((r) => setTimeout(r, 900));
        setSending(false);
        addToast("Message sent! We'll get back to you shortly.", 'success');
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="page-wrapper">
            <div className="content-page">
                <div className="content-page-inner">
                    <motion.div
                        className="page-hero-shell centered"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                    >
                        <div className="page-kicker">Get in Touch</div>
                        <div className="page-title centered">We're here to help you move faster</div>
                        <div className="page-copy centered">Whether you have a technical question, need compliance guidance, or want to explore Enterprise options — reach out through any channel below.</div>
                        <div className="page-meta-row">
                            <div className="page-meta-pill"><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />{s.contact_hours}</div>
                            <div className="page-meta-pill"><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />{s.contact_offices}</div>
                        </div>
                    </motion.div>

                    {/* Channel cards */}
                    <div className="contact-channels-grid">
                        {channels.map((ch, i) => (
                            <motion.a
                                key={ch.label}
                                href={ch.href}
                                target={ch.href.startsWith('http') ? '_blank' : undefined}
                                rel="noopener noreferrer"
                                className="contact-channel-card"
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -4 }}
                            >
                                <div className="contact-channel-icon" style={{ background: `${ch.color}18`, color: ch.color }}>
                                    <ch.icon size={22} />
                                </div>
                                <div className="contact-channel-label">{ch.label}</div>
                                <div className="contact-channel-value">{ch.value}</div>
                                <div className="contact-channel-sub">{ch.sub}</div>
                            </motion.a>
                        ))}
                    </div>

                    {/* Form + FAQ */}
                    <div className="contact-body-grid">
                        <motion.div
                            className="contact-form-card"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="contact-form-heading">
                                <Send size={18} style={{ color: 'var(--gold)' }} />
                                <span>Send us a message</span>
                            </div>
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="contact-form-row">
                                    <div className="contact-field">
                                        <label>Full name <span className="contact-required">*</span></label>
                                        <input name="name" value={form.name} onChange={handleChange} placeholder="Jean-Marc Dupont" />
                                    </div>
                                    <div className="contact-field">
                                        <label>Email <span className="contact-required">*</span></label>
                                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" />
                                    </div>
                                </div>
                                <div className="contact-field">
                                    <label>Subject</label>
                                    <select name="subject" value={form.subject} onChange={handleChange}>
                                        <option value="">Select a topic</option>
                                        <option value="onboarding">Onboarding & KYB</option>
                                        <option value="deal">Deal structuring</option>
                                        <option value="billing">Billing & plans</option>
                                        <option value="technical">Technical issue</option>
                                        <option value="enterprise">Enterprise inquiry</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="contact-field">
                                    <label>Message <span className="contact-required">*</span></label>
                                    <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Describe your question or issue in detail..." />
                                </div>
                                <motion.button
                                    type="submit"
                                    disabled={sending}
                                    className="contact-submit"
                                    whileHover={{ y: -1, boxShadow: '0 12px 28px rgba(201,168,76,0.3)' }}
                                >
                                    {sending ? 'Sending…' : 'Send message'}
                                </motion.button>
                            </form>
                        </motion.div>

                        {/* FAQ */}
                        <motion.div
                            className="contact-faq"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="contact-faq-heading">Frequently asked</div>
                            <div className="contact-faq-list">
                                {s.contact_faqs.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        className="contact-faq-item"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.07 }}
                                    >
                                        <div className="contact-faq-q">{item.q}</div>
                                        <div className="contact-faq-a">{item.a}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Interactive Map */}
                    <LocationMap
                        latitude={s.latitude}
                        longitude={s.longitude}
                        address={s.contact_offices}
                        locationStatus={locationStatus}
                        locationError={s.contact_location_error ?? null}
                    />

                </div>
            </div>
            <Footer />
        </div>
    );
}
