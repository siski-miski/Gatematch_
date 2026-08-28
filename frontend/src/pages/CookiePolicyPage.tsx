import { motion } from 'framer-motion';
import Footer from '../components/layout/Footer';
import LegalDocumentShell from '../components/layout/LegalDocumentShell';

export default function CookiePolicyPage() {
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
                    <h1 className="legal-title">Cookie Policy</h1>
                    <p className="legal-updated">Last updated: March 1, 2026</p>
                </motion.div>
            </section>

            <motion.section
                className="legal-body"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
            >
                <LegalDocumentShell slug="cookies" title="Cookie Policy" fallbackUpdatedLabel="Last updated: March 1, 2026">

                    <h2>1. What Are Cookies</h2>
                    <p>
                        Cookies are small text files stored on your device when you visit a website. They are widely used to make
                        websites work efficiently and to provide information to website operators. Connectov uses cookies and
                        similar technologies (local storage, session storage) to operate, secure, and improve the Service.
                    </p>

                    <h2>2. How We Use Cookies</h2>
                    <p>We use the following categories of cookies:</p>

                    <h3>2.1 Strictly Necessary Cookies</h3>
                    <p>These cookies are essential for the Service to function. They cannot be disabled.</p>
                    <div className="legal-table">
                        <div className="legal-table-row legal-table-header">
                            <span>Cookie</span><span>Purpose</span><span>Duration</span>
                        </div>
                        <div className="legal-table-row">
                            <span>session_id</span><span>Maintains your authenticated session</span><span>Session</span>
                        </div>
                        <div className="legal-table-row">
                            <span>csrf_token</span><span>Protects against cross-site request forgery</span><span>Session</span>
                        </div>
                        <div className="legal-table-row">
                            <span>refresh_token</span><span>Enables secure session renewal</span><span>7 days</span>
                        </div>
                    </div>

                    <h3>2.2 Functional Cookies</h3>
                    <p>These cookies remember your preferences and enhance your experience.</p>
                    <div className="legal-table">
                        <div className="legal-table-row legal-table-header">
                            <span>Cookie</span><span>Purpose</span><span>Duration</span>
                        </div>
                        <div className="legal-table-row">
                            <span>locale</span><span>Remembers your language preference</span><span>1 year</span>
                        </div>
                        <div className="legal-table-row">
                            <span>sidebar_state</span><span>Remembers sidebar open/collapsed state</span><span>30 days</span>
                        </div>
                        <div className="legal-table-row">
                            <span>filters_preset</span><span>Saves marketplace filter preferences</span><span>30 days</span>
                        </div>
                    </div>

                    <h3>2.3 Analytics Cookies</h3>
                    <p>
                        These cookies help us understand how users interact with the Service, which pages are visited most,
                        and where errors occur. Data collected is aggregated and anonymous.
                    </p>
                    <div className="legal-table">
                        <div className="legal-table-row legal-table-header">
                            <span>Cookie</span><span>Purpose</span><span>Duration</span>
                        </div>
                        <div className="legal-table-row">
                            <span>_pb_analytics</span><span>Tracks page views and feature usage</span><span>1 year</span>
                        </div>
                        <div className="legal-table-row">
                            <span>_pb_session_id</span><span>Groups interactions into a single session</span><span>30 minutes</span>
                        </div>
                    </div>

                    <h3>2.4 Marketing Cookies</h3>
                    <p>
                        We do not currently use third-party marketing or advertising cookies. If this changes, we will update
                        this policy and request your consent before deploying such cookies.
                    </p>

                    <h2>3. Third-Party Cookies</h2>
                    <p>
                        Some third-party services integrated into Connectov may set their own cookies. These include:
                    </p>
                    <ul>
                        <li><strong>Stripe:</strong> Payment processing cookies for platform fee collection.</li>
                        <li><strong>Trustpilot:</strong> Review widget cookies when displaying ratings.</li>
                    </ul>
                    <p>
                        These third parties have their own privacy and cookie policies. We recommend reviewing them for details on
                        their data practices.
                    </p>

                    <h2>4. Managing Cookies</h2>
                    <p>You can control cookies through your browser settings. Most browsers allow you to:</p>
                    <ul>
                        <li>View and delete existing cookies.</li>
                        <li>Block all cookies or only third-party cookies.</li>
                        <li>Set per-site cookie preferences.</li>
                    </ul>
                    <p>
                        Please note that disabling strictly necessary cookies may prevent you from using parts of the Service,
                        particularly features that require authentication.
                    </p>
                    <p>Common browser cookie settings:</p>
                    <ul>
                        <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                        <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                        <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                        <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
                    </ul>

                    <h2>5. Do Not Track</h2>
                    <p>
                        Some browsers include a "Do Not Track" (DNT) signal. Connectov does not currently respond to DNT signals
                        because no industry-standard interpretation exists. We will update this policy if a standard is adopted.
                    </p>

                    <h2>6. Updates to This Policy</h2>
                    <p>
                        We may update this Cookie Policy periodically to reflect changes in our practices or legal requirements.
                        The "Last updated" date at the top indicates the most recent revision.
                    </p>

                    <h2>7. Contact</h2>
                    <p>
                        If you have questions about our use of cookies, contact us at:
                    </p>
                    <p>
                        <strong>Connectov Technologies Ltd.</strong><br />
                        Email: privacy@Connectov.io
                    </p>
                </LegalDocumentShell>
            </motion.section>

            <Footer />
        </div>
    );
}
