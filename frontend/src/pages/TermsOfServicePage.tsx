import { motion } from 'framer-motion';
import Footer from '../components/layout/Footer';
import LegalDocumentShell from '../components/layout/LegalDocumentShell';

export default function TermsOfServicePage() {
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
                    <h1 className="legal-title">Terms of Service</h1>
                    <p className="legal-updated">Last updated: March 1, 2026</p>
                </motion.div>
            </section>

            <motion.section
                className="legal-body"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
            >
                <LegalDocumentShell slug="terms" title="Terms of Service" fallbackUpdatedLabel="Last updated: March 1, 2026">

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the Gatematch platform, website, and related services (the "Service"), you agree to be
                        bound by these Terms of Service ("Terms"). If you are using the Service on behalf of an organization, you
                        represent and warrant that you have the authority to bind that organization to these Terms.
                    </p>
                    <p>If you do not agree to these Terms, do not use the Service.</p>

                    <h2>2. Description of Service</h2>
                    <p>
                        Gatematch operates a marketplace that connects businesses seeking payment infrastructure access ("Seekers") with
                        verified payment service providers who have capacity ("Providers"). The platform facilitates discovery, due diligence,
                        deal structuring, and performance monitoring for payment infrastructure partnerships involving gateways and processors
                        such as Stripe, PayPal, Adyen, Payoneer, Checkout.com, Shopify Payments, Braintree, Worldpay, and others.
                    </p>
                    <p>
                        Gatematch is a facilitator and marketplace. We are not a party to deals negotiated between Providers and Seekers,
                        and we do not guarantee specific outcomes.
                    </p>

                    <h2>3. Eligibility and Registration</h2>
                    <ul>
                        <li>You must be at least 18 years old to use the Service.</li>
                        <li>You must provide accurate, complete, and current information during registration.</li>
                        <li>All users are subject to KYC (Know Your Customer) or KYB (Know Your Business) verification before accessing deal features.</li>
                        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                        <li>You must notify us immediately of any unauthorized access to your account.</li>
                    </ul>

                    <h2>4. User Obligations</h2>
                    <p>When using the Service, you agree to:</p>
                    <ul>
                        <li>Comply with all applicable laws and regulations, including anti-money laundering (AML) and counter-terrorism financing (CFT) laws.</li>
                        <li>Provide truthful information in card listings, deal negotiations, and profile details.</li>
                        <li>Not use the Service for any illegal, fraudulent, or deceptive purpose.</li>
                        <li>Not circumvent platform controls, including Trust Score calculations, escrow mechanisms, or verification requirements.</li>
                        <li>Not interfere with the operation of the Service or other users' access.</li>
                        <li>Not scrape, data mine, or otherwise extract data from the platform without authorization.</li>
                    </ul>

                    <h2>5. Listings and Deal Structure</h2>
                    <ul>
                        <li>Providers may post "Offer" cards describing available payment infrastructure capacity.</li>
                        <li>Seekers may post "Request" cards describing their payment access needs.</li>
                        <li>All listings must accurately represent available capacity, pricing, and terms.</li>
                        <li>Deals are structured using Gatematch's standardized templates covering revenue splits, volume caps, chargeback liability, and SLAs.</li>
                        <li>Gatematch reserves the right to remove or modify listings that violate these Terms or platform policies.</li>
                    </ul>

                    <h2>6. Trust Scores</h2>
                    <p>
                        Gatematch maintains a Trust Score system that evaluates users based on identity verification, deal history,
                        compliance record, and dispute outcomes. Trust Scores are calculated algorithmically and are intended to provide
                        transparency — they do not constitute a guarantee of any party's reliability or creditworthiness.
                    </p>

                    <h2>7. Fees and Payments</h2>
                    <ul>
                        <li><strong>Explorer (Free):</strong> Browse public cards, post 1 request card, basic KYC, 1 active deal.</li>
                        <li><strong>Professional ($149/mo):</strong> Unlimited listings, full KYB + Trust Score, deal templates, escrow protection, up to 10 active deals, plus 0.4% platform commission on active deals.</li>
                        <li><strong>Enterprise (Custom):</strong> Volume-based commission, dedicated support, unlimited deals, API access.</li>
                    </ul>
                    <p>
                        Fees are billed monthly or as otherwise agreed. All fees are non-refundable except as required by law.
                        Gatematch reserves the right to modify pricing with 30 days' notice.
                    </p>

                    <h2>8. Escrow and Dispute Resolution</h2>
                    <p>
                        For eligible deals, Gatematch may hold security deposits in escrow. Disputes are managed by the Gatematch
                        Compliance team following a documented process. While we endeavor to resolve disputes fairly, Gatematch's
                        decision is advisory unless otherwise specified in the deal terms.
                    </p>

                    <h2>9. Intellectual Property</h2>
                    <p>
                        The Service, including its design, code, content, and branding, is owned by Gatematch Technologies Ltd. and
                        protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works
                        without our prior written consent.
                    </p>
                    <p>
                        By posting content on the platform (listings, messages, reviews), you grant Gatematch a non-exclusive,
                        worldwide license to use, display, and distribute that content in connection with operating the Service.
                    </p>

                    <h2>10. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, Gatematch shall not be liable for any indirect, incidental, special,
                        consequential, or punitive damages, including loss of profits, revenue, data, or business opportunities,
                        arising out of or related to your use of the Service.
                    </p>
                    <p>
                        Gatematch's total liability to you for any claims arising from the Service shall not exceed the total
                        fees paid by you to Gatematch in the 12 months preceding the claim.
                    </p>

                    <h2>11. Disclaimer of Warranties</h2>
                    <p>
                        The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied.
                        Gatematch does not warrant that the Service will be uninterrupted, error-free, or secure. We do not endorse
                        or guarantee any Provider, Seeker, or deal facilitated through the platform.
                    </p>

                    <h2>12. Termination</h2>
                    <p>
                        We may suspend or terminate your access to the Service at any time for violation of these Terms, fraudulent
                        activity, or any other reason at our sole discretion. Upon termination, your right to use the Service ceases
                        immediately. Provisions that by their nature should survive termination (including liability limitations,
                        dispute resolution, and intellectual property) shall survive.
                    </p>

                    <h2>13. Governing Law</h2>
                    <p>
                        These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes
                        arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of
                        England and Wales.
                    </p>

                    <h2>14. Changes to Terms</h2>
                    <p>
                        We may revise these Terms at any time by posting the updated version on our website. Material changes will
                        be communicated via email or in-platform notification at least 30 days before they take effect. Continued
                        use of the Service after changes constitutes acceptance.
                    </p>

                    <h2>15. Contact</h2>
                    <p>
                        For questions about these Terms, contact us at:
                    </p>
                    <p>
                        <strong>Gatematch Technologies Ltd.</strong><br />
                        Email: legal@Gatematch.io
                    </p>
                </LegalDocumentShell>
            </motion.section>

            <Footer />
        </div>
    );
}
