import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

const plans = [
    {
        tier: 'For Seekers', name: 'Explorer', desc: 'For businesses exploring their first payment infrastructure partnership.',
        originalPrice: '$10', price: '$0', period: '/ mo', cycle: 'Free forever · No credit card needed', featured: false,
        features: [
            { text: 'Browse all public cards', active: true },
            { text: 'Post 1 request card', active: true },
            { text: 'Basic KYC verification', active: true },
            { text: '1 active deal', active: true },
            { text: 'No deal templates', active: false },
            { text: 'No compliance score', active: false },
        ],
        cta: 'Get Started Free',
    },
    {
        tier: 'For Providers & Seekers', name: 'Professional', desc: 'For serious operators who need structured, protected deals and full marketplace access.',
        originalPrice: '$299', price: '$149', period: '/ mo', cycle: '+ 0.4% platform commission on active deals', featured: true,
        features: [
            { text: 'Unlimited card listings', active: true },
            { text: 'Full KYB verification + Trust Score', active: true },
            { text: 'Standardized deal templates', active: true },
            { text: 'Escrow & dispute protection', active: true },
            { text: '10 active deals', active: true },
            { text: 'Priority compliance support', active: true },
            { text: 'Performance dashboard', active: true },
        ],
        cta: 'Start Professional',
    },
    {
        tier: 'For PSPs & Acquirers', name: 'Enterprise', desc: 'For payment service providers and acquirers managing high deal volume with custom compliance needs.',
        originalPrice: null, price: 'Custom', period: '', cycle: 'Volume-based commission · Dedicated support', featured: false,
        features: [
            { text: 'Everything in Professional', active: true },
            { text: 'Unlimited deals', active: true },
            { text: 'Dedicated compliance officer', active: true },
            { text: 'Custom deal templates', active: true },
            { text: 'SLA monitoring & alerts', active: true },
            { text: 'White-label deal portal', active: true },
            { text: 'API access for deal management', active: true },
        ],
        cta: 'Contact Sales',
    },
];

export default function PricingPage() {
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
                        <div className="page-kicker">Plans</div>
                        <div className="page-title centered">Transparent pricing for discovery, structured deals, and scale</div>
                        <div className="page-copy centered">No hidden setup cost. Gatematch charges only when a relationship is active and value is already moving through the platform.</div>
                        <div className="page-meta-row">
                            <div className="page-meta-pill">Free entry tier</div>
                            <div className="page-meta-pill">Commission only on active volume</div>
                            <div className="page-meta-pill">Compliance included on every plan</div>
                        </div>
                    </motion.div>

                    <div className="content-grid-three" style={{ maxWidth: 1080, margin: '0 auto' }}>
                        {plans.map((plan, i) => (
                            <motion.div
                                key={i}
                                className={`surface-card pricing-card rounded-[28px] relative ${plan.featured
                                    ? 'border border-gold bg-gradient-to-br from-gold/[0.08] to-navy-mid'
                                    : ''
                                    }`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -4 }}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[11px] font-bold tracking-[1px] uppercase bg-gradient-to-r from-gold to-gold-light text-navy rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                <div className="pricing-card-shell">
                                    <div className="pricing-card-top">
                                        <div className="pricing-tier-pill">{plan.tier}</div>
                                        <div className="text-[30px] font-bold tracking-[-0.04em] text-white-custom mb-2">{plan.name}</div>
                                        <div className="pricing-card-copy text-sm text-slate-custom leading-relaxed">{plan.desc}</div>
                                    </div>

                                    <div className="pricing-price-block">
                                        <div className="pricing-price-row">
                                            {plan.originalPrice && <span className="pricing-original">{plan.originalPrice}</span>}
                                            <span className="pricing-price-main">{plan.price}</span>
                                            {plan.period && <span className="pricing-price-period">{plan.period}</span>}
                                        </div>
                                        <div className="pricing-cycle-pill">{plan.cycle}</div>
                                    </div>

                                    <div className="pricing-feature-list flex flex-col gap-3">
                                        <div className="pricing-feature-heading">What you get</div>
                                    {plan.features.map((feat, j) => (
                                        <div key={j} className={`pricing-feature-item ${feat.active ? '' : 'inactive'}`}>
                                            <Star size={12} className={`mt-0.5 shrink-0 ${feat.active ? 'text-gold' : 'text-navy-light'}`} />
                                            <span>{feat.text}</span>
                                        </div>
                                    ))}
                                    </div>

                                    <div className="pricing-cta-wrap">
                                        <Link
                                            to={plan.name === 'Explorer' ? '/register' : '/contact'}
                                            className={`pricing-card-button ${plan.featured ? 'featured' : ''}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            {plan.cta}
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="page-note">
                        All plans include marketplace discovery, compliance tooling, and 24/7 fraud monitoring. Platform commission is charged only on volume processed through active Gatematch deals.
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
