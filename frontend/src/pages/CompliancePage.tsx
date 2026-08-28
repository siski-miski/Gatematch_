import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CreditCard, FileText, Building, Scale, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Footer from '../components/layout/Footer';

const complianceCards = [
    { icon: <CreditCard size={36} className="text-gold" />, title: 'KYC / KYB Verification', desc: 'Every individual and business is verified before accessing the marketplace. Identity, corporate registration, and UBO confirmed.' },
    { icon: <FileText size={36} className="text-gold" />, title: 'AML Screening', desc: 'All members are screened against global sanctions lists, PEP databases, and adverse media. Continuous monitoring on active deals.' },
    { icon: <FileText size={36} className="text-gold" />, title: 'Legal Deal Templates', desc: 'All deals use standardized legal frameworks including sub-merchant agreements, revenue sharing contracts, and chargeback liability clauses.' },
    { icon: <Building size={36} className="text-gold" />, title: 'Escrow Protection', desc: 'Security deposits are held by Connectov during the deal. Released on SLA compliance. Forfeited on material breach , real skin in the game.' },
    { icon: <Scale size={36} className="text-gold" />, title: 'Dispute Resolution', desc: 'Our compliance team mediates disputes between parties. Structured timeline. Written decision. Binding within the platform framework.' },
    { icon: <Search size={36} className="text-gold" />, title: 'Ongoing Monitoring', desc: 'Active deals are reviewed quarterly. Chargeback ratios, volume anomalies, and fraud signals trigger automatic compliance reviews.' },
];

const faqs = [
    { q: 'Is it legal for a provider to let others process through them?', a: 'Yes, under the right legal structure. Providers on Connectov operate under compliant sub-merchant or reseller agreements, which are authorized by card networks and financial regulators. Our deal templates are designed to ensure compliance with applicable regulations.' },
    { q: 'What happens if a seeker causes a chargeback issue?', a: 'Deal agreements include chargeback liability caps and rolling reserve clauses. Security deposits cover initial exposure. Connectov mediates disputes and can terminate deals that breach SLA thresholds.' },
    { q: 'How does Connectov verify providers are legitimate?', a: 'We verify corporate registration, processing history, bank statements, and where applicable, licensing documentation. Providers must demonstrate real operational capacity before listing on the marketplace.' },
    { q: 'What industries are permitted on the platform?', a: 'Connectov maintains a published Acceptable Use Policy. Prohibited categories include unlicensed financial services, certain adult content, and activities illegal in the provider\'s jurisdiction. Edge cases are reviewed by our compliance team.' },
];

export default function CompliancePage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="page-wrapper">
            <div className="content-page">
                <div className="content-page-inner">
                    <motion.div
                        className="page-hero-shell"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                    >
                        <div className="page-kicker">Trust & Compliance</div>
                        <div className="page-title">Built for a regulated market, not a loophole</div>
                        <div className="page-copy">Every member, deal, and live processing relationship on Connectov sits inside a compliance framework with verification, monitoring, contractual structure, and dispute controls.</div>
                        <div className="page-meta-row">
                            <div className="page-meta-pill">KYC and KYB required</div>
                            <div className="page-meta-pill">Ongoing AML screening</div>
                            <div className="page-meta-pill">Escrow-backed enforcement</div>
                        </div>
                    </motion.div>

                    <div className="content-grid-three" style={{ marginBottom: 28 }}>
                        {complianceCards.map((card, i) => (
                            <motion.div
                                key={i}
                                className="surface-card p-7 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <div className="mb-4 flex justify-center">{card.icon}</div>
                                <div className="text-[20px] font-bold tracking-[-0.03em] text-white-custom mb-2">{card.title}</div>
                                <div className="text-[13px] text-slate-custom leading-relaxed">{card.desc}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="soft-panel" style={{ padding: 28, maxWidth: 860 }}>
                        <div className="text-[24px] font-bold tracking-[-0.03em] text-white-custom mb-2">Frequently asked questions</div>
                        <div className="text-[13px] text-slate-custom mb-4">Common questions about marketplace legality, liability, verification, and acceptable use.</div>
                        {faqs.map((faq, i) => (
                            <div key={i} className="border-b border-border-light last:border-b-0">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between py-5 text-[15px] font-semibold text-white-custom text-left bg-transparent border-none cursor-pointer"
                                >
                                    {faq.q}
                                    {openFaq === i ? <ChevronUp size={16} className="text-slate-custom" /> : <ChevronDown size={16} className="text-slate-custom" />}
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.24 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="text-[13px] text-slate-custom leading-relaxed pb-5">{faq.a}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
