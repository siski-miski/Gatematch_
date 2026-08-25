import { motion } from 'framer-motion';
import Footer from '../components/layout/Footer';
import LegalDocumentShell from '../components/layout/LegalDocumentShell';

export default function PrivacyPolicyPage() {
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
                    <h1 className="legal-title">Privacy Policy</h1>
                    <p className="legal-updated">Last updated: March 1, 2026</p>
                </motion.div>
            </section>

            <motion.section
                className="legal-body"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
            >
                <LegalDocumentShell slug="privacy" title="Privacy Policy" fallbackUpdatedLabel="Last updated: March 1, 2026">

                    <h2>1. Introduction</h2>
                    <p>
                        Gatematch Technologies Ltd. ("Gatematch", "we", "our", or "us") is committed to protecting the privacy
                        of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal
                        information when you use our platform, website, and related services (collectively, the "Service").
                    </p>
                    <p>
                        By accessing or using the Service, you agree to the terms of this Privacy Policy. If you do not agree,
                        please do not use the Service.
                    </p>

                    <h2>2. Information We Collect</h2>
                    <h3>2.1 Information You Provide</h3>
                    <ul>
                        <li><strong>Account information:</strong> Name, email address, company name, country, role, and business registration details provided during registration.</li>
                        <li><strong>KYC/KYB verification data:</strong> Government-issued identification, corporate registration documents, UBO (Ultimate Beneficial Owner) information, and AML screening results collected for compliance purposes.</li>
                        <li><strong>Deal and transaction data:</strong> Information related to deals structured on the platform, including volume targets, pricing terms, SLA parameters, and dispute records.</li>
                        <li><strong>Communications:</strong> Messages exchanged through the platform, support requests, and feedback.</li>
                    </ul>

                    <h3>2.2 Information Collected Automatically</h3>
                    <ul>
                        <li><strong>Usage data:</strong> Pages visited, features used, search queries, card views, and interaction patterns.</li>
                        <li><strong>Device data:</strong> IP address, browser type, operating system, device identifiers, and screen resolution.</li>
                        <li><strong>Cookies and tracking:</strong> We use cookies and similar technologies as described in our Cookie Policy.</li>
                    </ul>

                    <h2>3. How We Use Your Information</h2>
                    <p>We use collected information to:</p>
                    <ul>
                        <li>Operate, maintain, and improve the Service.</li>
                        <li>Verify your identity and perform KYC/KYB checks in compliance with applicable regulations.</li>
                        <li>Calculate and maintain Trust Scores based on verified inputs and deal outcomes.</li>
                        <li>Match providers and seekers based on capacity, geography, volume, and compliance status.</li>
                        <li>Process and monitor deals, including escrow management and dispute resolution.</li>
                        <li>Communicate with you about your account, deals, and service updates.</li>
                        <li>Detect, prevent, and address fraud, security threats, and policy violations.</li>
                        <li>Comply with legal obligations, including AML/CFT requirements.</li>
                    </ul>

                    <h2>4. How We Share Your Information</h2>
                    <p>We may share your information with:</p>
                    <ul>
                        <li><strong>Counterparties:</strong> Limited profile and compliance information is shared with potential deal counterparties to facilitate matching and due diligence.</li>
                        <li><strong>Verification providers:</strong> Third-party KYC/KYB and AML screening services.</li>
                        <li><strong>Payment processors:</strong> As necessary to process platform fees and escrow payments.</li>
                        <li><strong>Legal and regulatory authorities:</strong> When required by law, regulation, or valid legal process.</li>
                        <li><strong>Service providers:</strong> Trusted third parties who assist in operating the platform (hosting, analytics, communications), bound by confidentiality obligations.</li>
                    </ul>
                    <p>We do not sell your personal information to third parties.</p>

                    <h2>5. Data Retention</h2>
                    <p>
                        We retain your information for as long as your account is active and for a reasonable period thereafter to
                        comply with legal obligations, resolve disputes, and enforce our agreements. KYC/KYB records are retained
                        for a minimum of 5 years following account closure, as required by applicable anti-money laundering regulations.
                    </p>

                    <h2>6. Data Security</h2>
                    <p>
                        We implement industry-standard security measures, including encryption in transit and at rest, access controls,
                        regular security audits, and incident response procedures. However, no method of transmission over the Internet
                        is 100% secure, and we cannot guarantee absolute security.
                    </p>

                    <h2>7. Your Rights</h2>
                    <p>Depending on your jurisdiction, you may have the right to:</p>
                    <ul>
                        <li>Access the personal data we hold about you.</li>
                        <li>Request correction of inaccurate data.</li>
                        <li>Request deletion of your data (subject to legal retention requirements).</li>
                        <li>Object to or restrict certain processing activities.</li>
                        <li>Request portability of your data.</li>
                        <li>Withdraw consent where processing is based on consent.</li>
                    </ul>
                    <p>To exercise these rights, contact us at <strong>privacy@Gatematch.io</strong>.</p>

                    <h2>8. International Transfers</h2>
                    <p>
                        Your information may be transferred to and processed in countries other than your country of residence.
                        We ensure that appropriate safeguards are in place, including Standard Contractual Clauses approved by the
                        European Commission, where applicable.
                    </p>

                    <h2>9. Children's Privacy</h2>
                    <p>
                        The Service is not directed to individuals under 18. We do not knowingly collect personal information
                        from minors. If you believe we have collected information from a minor, please contact us immediately.
                    </p>

                    <h2>10. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of material changes by posting
                        the updated policy on our website and, where appropriate, by email. Your continued use of the Service
                        after any changes constitutes acceptance of the revised policy.
                    </p>

                    <h2>11. Contact</h2>
                    <p>
                        For questions or concerns about this Privacy Policy or our data practices, contact us at:
                    </p>
                    <p>
                        <strong>Gatematch Technologies Ltd.</strong><br />
                        Email: privacy@Gatematch.io<br />
                        Data Protection Officer: dpo@Gatematch.io
                    </p>
                </LegalDocumentShell>
            </motion.section>

            <Footer />
        </div>
    );
}
