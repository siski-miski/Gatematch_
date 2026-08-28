import { motion } from 'framer-motion';
import { Wrench, Globe, Handshake, ArrowRight } from 'lucide-react';
import Footer from '../components/layout/Footer';

const steps = [
    { n: '01', icon: Globe, title: 'Discover', desc: 'Browse live cards or post a request. Filter by corridor, method, volume, and trust score.' },
    { n: '02', icon: Wrench, title: 'Verify', desc: 'Connectov runs KYB/KYC checks and assigns a Trust Score to both sides before any introduction.' },
    { n: '03', icon: Handshake, title: 'Structure', desc: 'Use standardized deal templates , revenue split, volume caps, chargeback liability, SLAs.' },
    { n: '04', icon: ArrowRight, title: 'Activate', desc: 'Once terms are signed, the processing rail goes live. Connectov monitors compliance and performance.' },
];

const roles = [
    { label: 'FOR PROVIDERS', icon: <Wrench size={28} style={{ color: '#4da8ff' }} />, title: 'Monetize Your Infrastructure', desc: 'List your payment gateway, merchant account, or payout rails. Set your conditions , volume caps, industry restrictions, pricing. Earn revenue from capacity you already have.' },
    { label: 'FOR SEEKERS', icon: <Globe size={28} style={{ color: '#4da8ff' }} />, title: 'Access Payment Rails', desc: 'Find infrastructure that matches your geography, industry, and volume. Request introductions, negotiate terms, activate within days , not months of bank applications.' },
    { label: 'FOR BOTH', icon: <Handshake size={28} style={{ color: '#4da8ff' }} />, title: 'Structured, Protected Deals', desc: 'Every deal is structured with legal templates, escrow protection, and performance monitoring. Connectov stays in the relationship as the trust and compliance layer.' },
];

const useCases = [
    { bold: 'Emerging market SaaS:', text: 'Kenyan B2B software company gets access to EU Stripe sub-merchant capacity to accept USD subscriptions from European clients.' },
    { bold: 'Gateway redundancy:', text: 'UK eCommerce brand adds a backup EU processor after its primary gateway suspended account , 72-hour activation.' },
    { bold: 'Payout rails:', text: 'Creator platform with 5,000 contractors in Southeast Asia connects to a licensed PSP offering local currency payouts.' },
    { bold: 'High-risk acquiring:', text: 'Travel agency with 8% refund rate finds a specialist acquirer with experience in the vertical and tolerance for the model.' },
    { bold: 'PSP deal flow:', text: 'Payment service provider lists white-label capacity on Connectov instead of hiring a BD team , acquires 12 new sub-merchants in Q1.' },
];

export default function HowItWorksPage() {
    return (
        <div className="page-wrapper">
            {/* hero , blue-tinted */}
            <section className="hiw-hero">
                <div className="hiw-hero-bg" />
                <div className="hiw-hero-inner">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{ textAlign: 'center' }}
                    >
                        <div className="hiw-kicker">Product Guide</div>
                        <h1 className="hiw-title">How Connectov structures payment access from intro to activation</h1>
                        <p className="hiw-subtitle">Providers monetize licensed capacity. Seekers source the right rails faster. Connectov stays in the middle with templates, verification, and compliance oversight.</p>
                    </motion.div>
                </div>
            </section>

            {/* timeline steps */}
            <section className="hiw-steps">
                <div className="hiw-steps-inner">
                    <div className="hiw-timeline-line" />
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.n}
                            className="hiw-step"
                            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                        >
                            <div className="hiw-step-dot">
                                <span>{step.n}</span>
                            </div>
                            <div className="hiw-step-card">
                                <step.icon size={22} style={{ color: '#4da8ff', marginBottom: 10 }} />
                                <div className="hiw-step-title">{step.title}</div>
                                <div className="hiw-step-desc">{step.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* role cards */}
            <section className="hiw-roles">
                <div className="hiw-roles-inner">
                    <h2 className="hiw-section-heading">Who is it for?</h2>
                    <div className="hiw-roles-grid">
                        {roles.map((role, i) => (
                            <motion.div
                                key={i}
                                className="hiw-role-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: i * 0.08, duration: 0.35 }}
                                whileHover={{ y: -4 }}
                            >
                                <div className="hiw-role-label">{role.label}</div>
                                <div style={{ marginBottom: 12 }}>{role.icon}</div>
                                <div className="hiw-role-title">{role.title}</div>
                                <div className="hiw-role-desc">{role.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* use cases */}
            <section className="hiw-usecases">
                <div className="hiw-usecases-inner">
                    <h2 className="hiw-section-heading">Real-world use cases</h2>
                    <div className="hiw-uc-list">
                        {useCases.map((uc, i) => (
                            <motion.div
                                key={i}
                                className="hiw-uc-item"
                                initial={{ opacity: 0, x: -16 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: i * 0.06, duration: 0.3 }}
                            >
                                <div className="hiw-uc-dot" />
                                <div className="hiw-uc-text">
                                    <strong>{uc.bold}</strong> {uc.text}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
