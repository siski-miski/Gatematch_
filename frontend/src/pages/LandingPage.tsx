import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Search, CheckCircle, FileText, Zap, Shield, TrendingUp, Lock, Scale, ShieldCheck, ScanSearch, Globe, ArrowLeftRight, Fingerprint, BadgeCheck, History, Mail, DollarSign, Repeat, /*Star*/ } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Footer from '../components/layout/Footer';

/* ── Animated counter ── */
function Counter({ end, prefix = '', suffix = '' }: { end: number; prefix?: string; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        let s = 0;
        const step = end / 60;
        const t = setInterval(() => {
            s += step;
            if (s >= end) { setCount(end); clearInterval(t); }
            else setCount(Math.floor(s));
        }, 16);
        return () => clearInterval(t);
    }, [inView, end]);
    return <div ref={ref}>{prefix}{count.toLocaleString()}{suffix}</div>;
}

const steps = [
    { n: '01', label: 'Discover', icon: <Search size={22} style={{ color: 'var(--gold)' }} />, desc: 'Providers post infrastructure they offer on gateways like Stripe, ShopifyPayment, PayPal, Payoneer, or Braintree. Seekers post what they need. Filter by geography, industry, volume, and pricing model.' },
    { n: '02', label: 'Verify', icon: <CheckCircle size={22} style={{ color: 'var(--gold)' }} />, desc: 'All parties are KYC/KYB verified before any introduction. Compliance scores are calculated and visible. No anonymous actors.' },
    { n: '03', label: 'Structure', icon: <FileText size={22} style={{ color: 'var(--gold)' }} />, desc: 'Use our standardized deal templates , revenue split, volume caps, chargeback liability, SLAs. Reviewed, not just handshakes.' },
    { n: '04', label: 'Activate', icon: <Zap size={22} style={{ color: 'var(--gold)' }} />, desc: 'Deals are monitored through your dashboard. Performance metrics, dispute resolution, and renewal management , all in one place.' },
    { n: '05', label: 'Protect', icon: <Shield size={22} style={{ color: 'var(--gold)' }} />, desc: 'Platform holds security deposits. Disputes are managed by our Compliance team. Financial stakes ensure accountability on both sides.' },
    { n: '06', label: 'Grow', icon: <TrendingUp size={22} style={{ color: 'var(--gold)' }} />, desc: 'Every successful deal builds your Trust Score. Higher scores unlock better matches, lower fees, and access to premium card listings.' },
];

const trustItems = [
    { icon: Lock,       label: 'KYC/KYB Verified Members' },
    { icon: Scale,      label: 'Legally Structured Deals' },
    { icon: ShieldCheck, label: 'Dispute Escrow Protection' },
    { icon: ScanSearch, label: 'AML Screened Parties' },
    { icon: Globe,      label: '60+ Countries Covered' },
];

const reviews = [
    {
        name: 'Marcus T.', company: 'EuroCart Ltd', role: 'Head of Payments', stars: 5,
        text: 'Found a compliant Stripe processor in the EU in under 4 days. The deal template alone saved us weeks of legal back-and-forth. This platform is a genuine game-changer.',
        avatar: 'MT', flag: '🇩🇪', date: 'Feb 2026',
        photo: '/assets/reviews/marcus-t.png',
    },
    {
        name: 'Priya N.', company: 'Nexpay Solutions', role: 'CEO', stars: 5,
        text: 'We listed our ShopifyPayment gateway capacity and received 8 qualified applications in the first week. KYB checks ensure every counterpart is legitimate. Outstanding.',
        avatar: 'PN', flag: '🇬🇧', date: 'Jan 2026',
        photo: '/assets/reviews/priya-n.png',
    },
    {
        name: 'João R.', company: 'BrasilTech', role: 'CFO', stars: 5,
        text: 'Accessing EU payment rails through PayPal and Checkout.com from Brazil used to take months of bank applications. Connectov made it happen in 11 days.',
        avatar: 'JR', flag: '🇧🇷', date: 'Mar 2026',
        photo: '/assets/reviews/joao-r.png',
    },
    {
        name: 'Alice B.', company: 'ClearPath Commerce', role: 'Payments Lead', stars: 5,
        text: 'The compliance framework is exactly what we needed for our Shopify Payments integration. Escrow protection gave both sides the confidence to move fast. Highly recommended.',
        avatar: 'AB', flag: '🇫🇷', date: 'Feb 2026',
        photo: '/assets/reviews/alice-b.png',
    },
    {
        name: 'Dmitri V.', company: 'FintechHub EU', role: 'CTO', stars: 5,
        text: 'Outstanding platform. We closed 6 deals this quarter across Stripe, ShopifyPayment, and Payoneer , the standardised deal templates made every single one go smoothly.',
        avatar: 'DV', flag: '🇵🇱', date: 'Mar 2026',
        photo: '/assets/reviews/dmitri-v.png',
    },
    {
        name: 'Sarah K.', company: 'Nomad Payments', role: 'BD Director', stars: 5,
        text: 'Finally a marketplace that takes compliance seriously across gateways like Worldpay, Braintree, and Square. The trust scores and AML screening filter quality partners from the noise.',
        avatar: 'SK', flag: '🇺🇸', date: 'Jan 2026',
        photo: '/assets/reviews/sarah-k.png',
    },
];

const liveActivities = [
    'Atlas Financial matched with a SaaS company via ShopifyPayment acquiring in Kenya · $48K/mo deal · 2 min ago',
    'Novex Payments opened Stripe capacity for a Nordic DTC brand on Shopify · 7 min ago',
    'QantPay received a Checkout.com redundancy request from a UK travel operator · 12 min ago',
    'Safex Europe activated backup PayPal processing for an EU merchant · 18 min ago',
    'BrightRoute cleared Payoneer KYB review and unlocked provider outreach · 23 min ago',
    'MENA ShopifyPayment acquiring card viewed by 14 qualified seekers in the last hour',
];

const trustArchitecture = [
    { label: 'Identity', value: 30, icon: <Fingerprint size={18} style={{ color: 'var(--gold)' }} />, detail: 'KYC, KYB, UBO verification' },
    { label: 'Deal History', value: 30, icon: <History size={18} style={{ color: 'var(--gold)' }} />, detail: 'Successful activations and renewals' },
    { label: 'Compliance', value: 25, icon: <BadgeCheck size={18} style={{ color: 'var(--gold)' }} />, detail: 'AML monitoring and documentation quality' },
    { label: 'Dispute Record', value: 15, icon: <Scale size={18} style={{ color: 'var(--gold)' }} />, detail: 'Chargeback behavior and dispute outcomes' },
];

const trustScoreMetrics = [
    { label: 'Profile completion', value: '97.8%' },
    { label: 'Monitoring cadence', value: '24/7' },
    { label: 'Avg dispute close', value: '11d' },
    { label: 'Renewal rate', value: '89%' },
    { label: 'Escrow coverage', value: '$2.1M' },
    { label: 'Data freshness', value: '< 1h' },
    { label: 'SLA hit rate', value: '99.1%' },
    { label: 'Chargeback variance', value: '-18%' },
];

const featuredCards = [
    { type: 'Offer', title: 'ShopifyPayment acquiring for GCC and Africa corridors', provider: 'Atlas Financial FZ', metrics: 'Up to $500K/mo · 1.9% from', tags: ['ShopifyPayment', 'MENA', 'Africa', 'Cross-border'] },
    { type: 'Request', title: 'US Stripe or Braintree access for LATAM SaaS subscriptions', provider: 'BrightRoute Inc.', metrics: '$200K target volume · negotiable', tags: ['Stripe', 'Braintree', 'SaaS', 'North America'] },
    { type: 'Offer', title: 'Shopify Payments & Checkout.com redundancy for DTC brands', provider: 'Safex Europe GmbH', metrics: '72h activation · fixed-fee option', tags: ['Shopify', 'Checkout.com', 'EU', 'eCommerce'] },
    { type: 'Offer', title: 'High-risk travel acquiring with PayPal & Worldpay rails', provider: 'QantPay Solutions', metrics: 'Up to $500K/mo · 3.5%', tags: ['PayPal', 'Worldpay', 'Travel', 'High Risk'] },
];

const spotlightStories = [
    {
        id: '01',
        title: 'The Geo-Locked SaaS',
        subtitle: 'Nairobi to London , Stripe & ShopifyPayment card acceptance activation',
        problem: 'Cross-border subscriptions on Stripe were blocked by corridor and sponsorship limits.',
        solution: 'Matched to a London sponsor bank via a compliant, pre-verified Connectov provider with ShopifyPayment acquiring access.',
        processed: '$120K',
        calendarDays: 4,
        timelineLabel: 'Global Rail Access',
        outcome: 'EUR and USD acceptance via Stripe and ShopifyPayment went live without local banking delays.',
        imageClass: 'case-geo-network',
        glow: '#3EA4FF',
        chartPoints: [12, 14, 16, 18, 20, 28, 34, 42, 44, 58, 74, 96],
    },
    {
        id: '02',
        title: 'The Redundancy Seeker',
        subtitle: 'Primary Checkout.com rail failure with instant PayPal failover',
        problem: 'Peak-season risk exposure with no tested secondary processing via PayPal or Worldpay.',
        solution: 'Split-routing template with instant PayPal backup activation and monitored Checkout.com failover.',
        processed: '$86K',
        calendarDays: 3,
        timelineLabel: 'Failover Safety',
        outcome: '0 checkout downtime during switch, with automatic route fallback across both gateways.',
        imageClass: 'case-redundancy-split',
        glow: '#29D38A',
        chartPoints: [10, 12, 15, 17, 18, 22, 26, 40, 62, 68, 73, 82],
    },
    {
        id: '03',
        title: 'The PSP with Idle Capacity',
        subtitle: 'Unused Payoneer & Shopify Payments capacity converted into signed volume',
        problem: 'A licensed PSP had spare Payoneer payout and Shopify gateway infrastructure but no efficient BD distribution.',
        solution: 'Listed verified capacity on Connectov and closed qualified demand with standardized terms.',
        processed: '$210K',
        calendarDays: 4,
        timelineLabel: 'Capacity Monetization',
        outcome: '12 qualified leads in Q1 with 4 signed active deals across Payoneer and Shopify Payments.',
        imageClass: 'case-capacity-center',
        glow: '#D8B24F',
        chartPoints: [14, 17, 21, 22, 24, 29, 36, 45, 57, 63, 78, 92],
    },
];

const TRUST_CONNECTOR_IMAGE = '/assets/trust-connector.png';

// const pricingPlans = [
//     {
//         tier: 'For Seekers', name: 'Explorer',
//         desc: 'For businesses exploring their first payment infrastructure partnership.',
//         originalPrice: '$10', price: '$0', period: '/ mo', cycle: 'Free forever · No credit card needed', featured: false,
//         features: [
//             { text: 'Browse all public cards', active: true },
//             { text: 'Post 1 request card', active: true },
//             { text: 'Basic KYC verification', active: true },
//             { text: '1 active deal', active: true },
//             { text: 'No deal templates', active: false },
//             { text: 'No compliance score', active: false },
//         ],
//         cta: 'Get Started Free',
//     },
//     {
//         tier: 'For Providers & Seekers', name: 'Professional',
//         desc: 'For serious operators who need structured, protected deals and full marketplace access.',
//         originalPrice: '$299', price: '$149', period: '/ mo', cycle: '+ 0.4% platform commission on active deals', featured: true,
//         features: [
//             { text: 'Unlimited card listings', active: true },
//             { text: 'Full KYB verification + Trust Score', active: true },
//             { text: 'Standardized deal templates', active: true },
//             { text: 'Escrow & dispute protection', active: true },
//             { text: '10 active deals', active: true },
//             { text: 'Priority compliance support', active: true },
//             { text: 'Performance dashboard', active: true },
//         ],
//         cta: 'Start Professional',
//     },
//     {
//         tier: 'For PSPs & Acquirers', name: 'Enterprise',
//         desc: 'For payment service providers and acquirers managing high deal volume with custom compliance needs.',
//         originalPrice: null, price: 'Custom', period: '', cycle: 'Volume-based commission · Dedicated support', featured: false,
//         features: [
//             { text: 'Everything in Professional', active: true },
//             { text: 'Unlimited deals', active: true },
//             { text: 'Dedicated compliance officer', active: true },
//             { text: 'Custom deal templates', active: true },
//             { text: 'SLA monitoring & alerts', active: true },
//             { text: 'White-label deal portal', active: true },
//             { text: 'API access for deal management', active: true },
//         ],
//         cta: 'Contact Sales',
//     },
// ];

/* ── Globe Network Canvas ── */

// Payment platform logos as SVG data strings (inline, white/gold coloured)
const ORBIT_LOGOS = [
    // PayPal
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z" fill="rgba(201,168,76,0.9)"/></svg>`,
    // Stripe
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" fill="rgba(201,168,76,0.9)"/></svg>`,
    // Bitcoin
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z" fill="rgba(201,168,76,0.9)"/></svg>`,
    // Shopify
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z" fill="rgba(201,168,76,0.9)"/></svg>`,
    // Alipay
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.695 15.07c3.426 1.158 4.203 1.22 4.203 1.22V3.846c0-2.124-1.705-3.845-3.81-3.845H3.914C1.808.001.102 1.722.102 3.846v16.31c0 2.123 1.706 3.845 3.813 3.845h16.173c2.105 0 3.81-1.722 3.81-3.845v-.157s-6.19-2.602-9.315-4.119c-2.096 2.602-4.8 4.181-7.607 4.181-4.75 0-6.361-4.19-4.112-6.949.49-.602 1.324-1.175 2.617-1.497 2.025-.502 5.247.313 8.266 1.317a16.796 16.796 0 0 0 1.341-3.302H5.781v-.952h4.799V6.975H4.77v-.953h5.81V3.591s0-.409.411-.409h2.347v2.84h5.744v.951h-5.744v1.704h4.69a19.453 19.453 0 0 1-1.986 5.06c1.424.52 2.702 1.011 3.654 1.333m-13.81-2.032c-.596.06-1.71.325-2.321.869-1.83 1.608-.735 4.55 2.968 4.55 2.151 0 4.301-1.388 5.99-3.61-2.403-1.182-4.438-2.028-6.637-1.809" fill="rgba(201,168,76,0.9)"/></svg>`,
    // Square
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.01 0A4.01 4.01 0 000 4.01v15.98c0 2.21 1.8 4 4.01 4.01h15.98C22.2 24 24 22.2 24 19.99V4A4.01 4.01 0 0019.99 0H4zm1.62 4.36h12.74c.7 0 1.26.57 1.26 1.27v12.74c0 .7-.56 1.27-1.26 1.27H5.63c-.7 0-1.26-.57-1.26-1.27V5.63a1.27 1.27 0 011.26-1.27zm3.83 4.35a.73.73 0 00-.73.73v5.09c0 .4.32.72.72.72h5.1a.73.73 0 00.73-.72V9.44a.73.73 0 00-.73-.73h-5.1Z" fill="rgba(201,168,76,0.9)"/></svg>`,
    // Apple Pay
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.15 4.318a42.16 42.16 0 0 0-.454.003c-.15.005-.303.013-.452.04a1.44 1.44 0 0 0-1.06.772c-.07.138-.114.278-.14.43-.028.148-.037.3-.04.45A10.2 10.2 0 0 0 0 6.222v11.557c0 .07.002.138.003.207.004.15.013.303.04.452.027.15.072.291.142.429a1.436 1.436 0 0 0 .63.63c.138.07.278.115.43.142.148.027.3.036.45.04l.208.003h20.194l.207-.003c.15-.004.303-.013.452-.04.15-.027.291-.071.428-.141a1.432 1.432 0 0 0 .631-.631c.07-.138.115-.278.141-.43.027-.148.036-.3.04-.45.002-.07.003-.138.003-.208l.001-.246V6.221c0-.07-.002-.138-.004-.207a2.995 2.995 0 0 0-.04-.452 1.446 1.446 0 0 0-1.2-1.201 3.022 3.022 0 0 0-.452-.04 10.448 10.448 0 0 0-.453-.003zm4.71 3.7c-.3.016-.668.199-.88.456-.191.22-.36.58-.316.918.338.03.675-.169.888-.418.205-.258.345-.603.308-.955zm2.207.42v5.493h.852v-1.877h1.18c1.078 0 1.835-.739 1.835-1.812 0-1.07-.742-1.805-1.808-1.805zm.852.719h.982c.739 0 1.161.396 1.161 1.089 0 .692-.422 1.092-1.164 1.092h-.979zm-3.154.3c-.45.01-.83.28-1.05.28-.235 0-.593-.264-.981-.257a1.446 1.446 0 0 0-1.23.747c-.527.908-.139 2.255.374 2.995.249.366.549.769.944.754.373-.014.52-.242.973-.242.454 0 .586.242.98.235.41-.007.667-.366.915-.733.286-.417.403-.82.41-.841-.007-.008-.79-.308-.797-1.209-.008-.754.615-1.113.644-1.135-.352-.52-.9-.578-1.09-.593a1.123 1.123 0 0 0-.092-.002zm8.204.397c-.99 0-1.606.533-1.652 1.256h.777c.072-.358.369-.586.845-.586.502 0 .803.266.803.711v.309l-1.097.064c-.951.054-1.488.484-1.488 1.184 0 .72.548 1.207 1.332 1.207.526 0 1.032-.281 1.264-.727h.019v.659h.788v-2.76c0-.803-.62-1.317-1.591-1.317zm1.94.072l1.446 4.009c0 .003-.073.24-.073.247-.125.41-.33.571-.711.571-.069 0-.206 0-.267-.015v.666c.06.011.267.019.335.019.83 0 1.226-.312 1.568-1.283l1.5-4.214h-.868l-1.012 3.259h-.015l-1.013-3.26zm-1.167 2.189v.316c0 .521-.45.917-1.024.917-.442 0-.731-.228-.731-.579 0-.342.278-.56.769-.593z" fill="rgba(201,168,76,0.9)"/></svg>`,
    // Woo
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.118 8.895c-.562 0-.928.183-1.255.797l-1.49 2.811v-2.496c0-.745-.353-1.111-1.007-1.111s-.928.222-1.255.85l-1.412 2.757v-2.47c0-.797-.327-1.137-1.124-1.137H.954C.34 8.895 0 9.183 0 9.706s.327.837.928.837h.667v3.15c0 .889.601 1.412 1.464 1.412s1.255-.34 1.686-1.137l.941-1.765v1.49c0 .876.575 1.412 1.451 1.412s1.203-.301 1.699-1.137l2.17-3.66c.471-.798.144-1.413-.901-1.413zm4.078 0c-1.778 0-3.124 1.321-3.124 3.112s1.359 3.098 3.124 3.098 3.111-1.32 3.124-3.098c0-1.791-1.359-3.112-3.124-3.112m0 4.301c-.667 0-1.124-.497-1.124-1.19s.458-1.203 1.124-1.203 1.124.51 1.124 1.203-.444 1.19-1.124 1.19m6.68-4.301c-1.765 0-3.124 1.32-3.124 3.111s1.359 3.098 3.124 3.098S24 13.784 24 12.006s-1.359-3.111-3.124-3.111m0 4.301c-.68 0-1.111-.497-1.111-1.19s.444-1.203 1.111-1.203S22 11.313 22 12.006s-.444 1.19-1.124 1.19" fill="rgba(201,168,76,0.9)"/></svg>`,
];

function svgToImage(svgStr: string): HTMLImageElement {
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    return img;
}

function GlobeNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        if (!ctx) return;

        const DPR = Math.min(window.devicePixelRatio || 1, 2);
        const SIZE = 720;
        canvas.width = SIZE * DPR;
        canvas.height = SIZE * DPR;
        ctx.scale(DPR, DPR);
        const W = SIZE, H = SIZE;
        const cx = W / 2, cy = H / 2;
        const R = 220;

        // Pre-load logo images
        const logoImgs = ORBIT_LOGOS.map(svgToImage);

        // ── Gateway nodes (specific payment hub locations with major coordinates) ──
        const gateways = [
            { lat: 40.7, lon: -74.0 },   // New York
            { lat: 51.5, lon: -0.1 },    // London
            { lat: 35.7, lon: 139.7 },   // Tokyo
            { lat: 22.3, lon: 114.2 },   // Hong Kong
            { lat: 1.3, lon: 103.8 },    // Singapore
            { lat: 48.9, lon: 2.3 },     // Paris
            { lat: 55.8, lon: 37.6 },    // Moscow
            { lat: -33.9, lon: 18.4 },   // Cape Town
            { lat: 25.2, lon: 55.3 },    // Dubai
            { lat: 19.1, lon: 72.9 },    // Mumbai
            { lat: 37.6, lon: -122.4 },  // San Francisco
            { lat: -23.5, lon: -46.6 },  // São Paulo
        ];

        // ── Background fill nodes ──
        const fillNodes: { lat: number; lon: number; pulse: number; speed: number }[] = [];
        for (let lat = -70; lat <= 70; lat += 18) {
            const n = Math.round(10 * Math.cos((lat * Math.PI) / 180));
            for (let i = 0; i < n; i++) {
                fillNodes.push({
                    lat: lat + (Math.random() - 0.5) * 10,
                    lon: (i / n) * 360 + (Math.random() - 0.5) * 20,
                    pulse: Math.random() * Math.PI * 2,
                    speed: 0.01 + Math.random() * 0.02,
                });
            }
        }

        // ── Active data arcs (pairs of gateway indices) ──
        const arcPairs = [
            [0, 1], [1, 4], [4, 2], [2, 3], [0, 5],
            [5, 8], [8, 9], [9, 4], [6, 5], [10, 0],
            [11, 0], [11, 5], [7, 8], [3, 9],
        ];
        // Each arc has an animated "particle" travelling along it
        const arcParticles = arcPairs.map(() => ({ t: Math.random(), speed: 0.003 + Math.random() * 0.003 }));

        // ── Orbiting logo rings ──
        // Two orbital planes at different inclinations and radii
        const orbitPlanes = [
            { inclination: 22, radius: R + 78, speed: 0.0028, count: 4, offset: 0 },
            { inclination: -16, radius: R + 112, speed: -0.0018, count: 4, offset: Math.PI / 4 },
        ];
        const orbitAngles = orbitPlanes.map((p) =>
            Array.from({ length: p.count }, (_, i) => p.offset + (i / p.count) * Math.PI * 2)
        );

        let rotation = 0;
        let frame = 0;
        let animId: number;

        function project(lat: number, lon: number, rot: number) {
            const phi = (lat * Math.PI) / 180;
            const theta = ((lon + rot) * Math.PI) / 180;
            const x3 = R * Math.cos(phi) * Math.sin(theta);
            const y3 = R * Math.sin(phi);
            const z3 = R * Math.cos(phi) * Math.cos(theta);
            return { x: cx + x3, y: cy - y3, z: z3, visible: z3 > -R * 0.1 };
        }

        // Compute a great-circle arc point at fraction t between two 3D points
        function arcPoint(p1: {lat:number;lon:number}, p2: {lat:number;lon:number}, t: number, rot: number) {
            const toRad = (d: number) => (d * Math.PI) / 180;
            const phi1 = toRad(p1.lat), lam1 = toRad(p1.lon + rot);
            const phi2 = toRad(p2.lat), lam2 = toRad(p2.lon + rot);
            // 3D unit vectors on the sphere
            const ax = Math.cos(phi1) * Math.sin(lam1), ay = Math.sin(phi1), az = Math.cos(phi1) * Math.cos(lam1);
            const bx = Math.cos(phi2) * Math.sin(lam2), by = Math.sin(phi2), bz = Math.cos(phi2) * Math.cos(lam2);
            // Slerp
            const dot = Math.max(-1, Math.min(1, ax * bx + ay * by + az * bz));
            const omega = Math.acos(dot);
            if (omega < 0.0001) return { x: cx + ax * R, y: cy - ay * R, z: az * R, visible: az * R > -R * 0.1 };
            const s0 = Math.sin((1 - t) * omega) / Math.sin(omega);
            const s1 = Math.sin(t * omega) / Math.sin(omega);
            // Lift the arc above the surface at midpoint
            const liftFactor = 1 + 0.4 * Math.sin(t * Math.PI);
            const rx = (s0 * ax + s1 * bx) * R * liftFactor;
            const ry = (s0 * ay + s1 * by) * R * liftFactor;
            const rz = (s0 * az + s1 * bz) * R * liftFactor;
            return { x: cx + rx, y: cy - ry, z: rz, visible: rz > -R * 0.1 };
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            rotation += 0.07;
            frame++;

            // ── Deep sphere interior glow ──
            const innerGlow = ctx.createRadialGradient(cx - R * 0.15, cy - R * 0.15, R * 0.05, cx, cy, R);
            innerGlow.addColorStop(0, 'rgba(201,168,76,0.14)');
            innerGlow.addColorStop(0.45, 'rgba(201,168,76,0.07)');
            innerGlow.addColorStop(0.85, 'rgba(10,22,40,0.6)');
            innerGlow.addColorStop(1, 'rgba(10,22,40,0)');
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.fillStyle = innerGlow;
            ctx.fill();

            // ── Outer atmosphere halo ──
            const haloGrad = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.22);
            haloGrad.addColorStop(0, 'rgba(201,168,76,0.10)');
            haloGrad.addColorStop(0.5, 'rgba(201,168,76,0.04)');
            haloGrad.addColorStop(1, 'rgba(201,168,76,0)');
            ctx.beginPath();
            ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
            ctx.fillStyle = haloGrad;
            ctx.fill();

            // ── Latitude grid rings ──
            [-60, -40, -20, 0, 20, 40, 60].forEach((lat) => {
                const phi = (lat * Math.PI) / 180;
                const rLat = R * Math.cos(phi);
                const yCtr = cy - R * Math.sin(phi);
                ctx.beginPath();
                ctx.ellipse(cx, yCtr, rLat, rLat * 0.19, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(201,168,76,0.22)';
                ctx.lineWidth = 1.05;
                ctx.stroke();
            });

            // ── Longitude meridians ──
            for (let lon = 0; lon < 360; lon += 30) {
                ctx.beginPath();
                let first = true;
                for (let lat = -88; lat <= 88; lat += 3) {
                    const p = project(lat, lon, rotation);
                    if (!p.visible) { first = true; continue; }
                    if (first) { ctx.moveTo(p.x, p.y); first = false; }
                    else ctx.lineTo(p.x, p.y);
                }
                const alpha = 0.16 + 0.09 * Math.sin(((lon + rotation * 0.5) * Math.PI) / 180);
                ctx.strokeStyle = `rgba(201,168,76,${alpha.toFixed(3)})`;
                ctx.lineWidth = 0.95;
                ctx.stroke();
            }

            // ── Connection edges between fill nodes ──
            const projected = fillNodes.map((n) => ({ ...project(n.lat, n.lon, rotation), pulse: n.pulse, speed: n.speed }));
            for (let i = 0; i < projected.length; i++) {
                const a = projected[i];
                if (!a.visible) continue;
                for (let j = i + 1; j < projected.length; j++) {
                    const b = projected[j];
                    if (!b.visible) continue;
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 90) continue;
                    const alpha = (1 - dist / 90) * 0.28;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(201,168,76,${alpha.toFixed(3)})`;
                    ctx.lineWidth = 0.65;
                    ctx.stroke();
                }
            }

            // ── Gateway node dots (big hubs, always visible) ──
            const gwProjected = gateways.map((g) => project(g.lat, g.lon, rotation));

            // Draw gateway connections (only visible pairs)
            arcPairs.forEach(([ai, bi], idx) => {
                const a = gwProjected[ai], b = gwProjected[bi];
                if (!a.visible && !b.visible) return;

                // Draw the full arc path
                ctx.beginPath();
                let arcFirst = true;
                const steps = 40;
                for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const pt = arcPoint(gateways[ai], gateways[bi], t, rotation);
                    if (!pt.visible) { arcFirst = true; continue; }
                    if (arcFirst) { ctx.moveTo(pt.x, pt.y); arcFirst = false; }
                    else ctx.lineTo(pt.x, pt.y);
                }
                ctx.strokeStyle = 'rgba(201,168,76,0.34)';
                ctx.lineWidth = 1.15;
                ctx.stroke();

                // ── Travelling data-beam particle along arc ──
                const particle = arcParticles[idx];
                particle.t = (particle.t + particle.speed) % 1;
                const pp = arcPoint(gateways[ai], gateways[bi], particle.t, rotation);
                if (pp.visible) {
                    // Glow trail
                    for (let trail = 0; trail < 6; trail++) {
                        const tt = particle.t - trail * 0.02;
                        if (tt < 0) continue;
                        const tp = arcPoint(gateways[ai], gateways[bi], tt, rotation);
                        if (!tp.visible) continue;
                        const trailAlpha = (1 - trail / 6) * 0.55;
                        ctx.beginPath();
                        ctx.arc(tp.x, tp.y, 1.8 - trail * 0.2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(232,201,122,${trailAlpha.toFixed(3)})`;
                        ctx.fill();
                    }
                    // Head dot
                    ctx.beginPath();
                    ctx.arc(pp.x, pp.y, 2.4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,235,160,0.9)';
                    ctx.fill();
                }
            });

            // Draw gateway hub nodes on top
            gwProjected.forEach((g, i) => {
                if (!g.visible) return;
                const depth = (g.z + R) / (2 * R);
                const t = frame * 0.02 + i;
                const pulse = 0.5 + 0.5 * Math.sin(t);

                // Outer pulse ring (breathing)
                const pr = 7 + pulse * 6;
                const ringAlpha = 0.08 + 0.14 * pulse;
                ctx.beginPath();
                ctx.arc(g.x, g.y, pr, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(201,168,76,${ringAlpha.toFixed(3)})`;
                ctx.lineWidth = 1.2;
                ctx.stroke();

                // Inner glow fill
                const gwGlow = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, 6);
                gwGlow.addColorStop(0, `rgba(255,240,180,${(0.6 + 0.3 * depth).toFixed(3)})`);
                gwGlow.addColorStop(1, 'rgba(201,168,76,0)');
                ctx.beginPath();
                ctx.arc(g.x, g.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = gwGlow;
                ctx.fill();

                // Core dot
                ctx.beginPath();
                ctx.arc(g.x, g.y, 2.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,245,190,${(0.7 + 0.25 * depth).toFixed(3)})`;
                ctx.fill();
            });

            // ── Fill nodes (smaller background dots) ──
            projected.forEach((p, i) => {
                if (!p.visible) return;
                const depth = (p.z + R) / (2 * R);
                const pf = 0.5 + 0.5 * Math.sin(p.pulse);
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.0 + depth * 1.0, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201,168,76,${(0.2 + depth * 0.35 + pf * 0.1).toFixed(3)})`;
                ctx.fill();
                fillNodes[i].pulse += fillNodes[i].speed;
            });

            // ── Globe border ring ──
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(201,168,76,0.28)';
            ctx.lineWidth = 1.55;
            ctx.stroke();

            // ── Orbiting logo icons ──
            orbitPlanes.forEach((plane, pi) => {
                const incRad = (plane.inclination * Math.PI) / 180;
                orbitAngles[pi].forEach((_angle, li) => {
                    orbitAngles[pi][li] += plane.speed;
                    const ang = orbitAngles[pi][li];
                    const logoIdx = pi * plane.count + li;
                    const img = logoImgs[logoIdx % logoImgs.length];

                    // Orbit ellipse: x=cos(angle)*r, y=sin(angle)*r*cos(inclination)
                    const ox = Math.cos(ang) * plane.radius;
                    const oy = Math.sin(ang) * plane.radius * Math.cos(incRad);
                    const oz = Math.sin(ang) * plane.radius * Math.sin(incRad); // "depth" for fade

                    const sx = cx + ox;
                    const sy = cy + oy;

                    // Depth-based opacity: front = 1.0, back = 0.15
                    const depthFactor = (oz + plane.radius) / (2 * plane.radius);
                    const opacity = 0.15 + depthFactor * 0.75;

                    const iconSize = 34;
                    const pad = 10;
                    if (!img.complete) return;
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    // Dim background pill
                    ctx.beginPath();
                    ctx.roundRect(sx - iconSize / 2 - pad, sy - iconSize / 2 - pad, iconSize + pad * 2, iconSize + pad * 2, 10);
                    ctx.fillStyle = `rgba(17,34,64,${(0.65 + depthFactor * 0.3).toFixed(3)})`;
                    ctx.strokeStyle = `rgba(201,168,76,${(0.25 + depthFactor * 0.4).toFixed(3)})`;
                    ctx.lineWidth = 1.2;
                    ctx.fill();
                    ctx.stroke();
                    ctx.drawImage(img, sx - iconSize / 2, sy - iconSize / 2, iconSize, iconSize);
                    ctx.restore();
                });
            });

            animId = requestAnimationFrame(draw);
        }

        draw();
        return () => {
            cancelAnimationFrame(animId);
            logoImgs.forEach(() => {}); // cleanup blobs handled by GC
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="hero-globe"
            style={{
                width: 'clamp(340px, 42vw, 720px)',
                height: 'clamp(340px, 42vw, 720px)',
                opacity: 1,
                pointerEvents: 'none',
                flexShrink: 0,
            }}
        />
    );
}

/* ── Steps Accordion ── */
function StepsAccordion() {
    const [active, setActive] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <motion.div
            ref={ref}
            className="process-panel"
            initial={{ opacity: 0, y: 30, scale: 0.985 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Desktop: horizontal expanding cards */}
            <div className="steps-accordion-desktop">
                {steps.map((step, i) => {
                    const isActive = active === i;
                    return (
                        <div
                            key={step.n}
                            onMouseEnter={() => setActive(i)}
                            onFocus={() => setActive(i)}
                            tabIndex={0}
                            style={{
                                flex: isActive ? '1 1 0%' : '0 0 72px',
                                overflow: 'hidden',
                                transition: 'flex 0.45s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s, box-shadow 0.25s',
                                background: 'var(--navy-mid)',
                                border: `1px solid ${isActive ? 'rgba(201,168,76,0.4)' : 'var(--border-light)'}`,
                                borderRadius: 18,
                                cursor: 'default',
                                position: 'relative',
                                minWidth: 72,
                                height: 380,
                                boxShadow: isActive ? '0 12px 40px rgba(201,168,76,0.12)' : 'none',
                                opacity: inView ? 1 : 0,
                                transform: inView ? 'none' : 'translateY(24px)',
                            }}
                        >
                            {/* ─ Collapsed view: rotated vertical label ─ */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isActive ? 0 : 1,
                                transition: 'opacity 0.2s',
                                pointerEvents: 'none',
                            }}>
                                <div style={{
                                    transform: 'rotate(-90deg)',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '1px' }}>{step.n}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{step.label}</span>
                                </div>
                            </div>

                            {/* ─ Expanded view ─ */}
                            <div style={{
                                opacity: isActive ? 1 : 0,
                                transition: 'opacity 0.3s 0.1s',
                                padding: '36px 32px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minWidth: 260,
                            }}>
                                {/* Top */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                                        <span style={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: 52,
                                            fontWeight: 800,
                                            letterSpacing: '-0.05em',
                                            color: 'rgba(201,168,76,0.12)',
                                            lineHeight: 1,
                                        }}>{step.n}</span>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 12,
                                            background: 'rgba(201,168,76,0.08)',
                                            border: '1px solid rgba(201,168,76,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {step.icon}
                                        </div>
                                    </div>
                                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--white)', marginBottom: 14, lineHeight: 1.15 }}>
                                        {step.label}
                                    </div>
                                    <div style={{ fontSize: 13.5, color: 'var(--slate)', lineHeight: 1.7 }}>
                                        {step.desc}
                                    </div>
                                </div>
                                {/* Bottom step indicator */}
                                <div style={{ display: 'flex', gap: 5, marginTop: 28 }}>
                                    {steps.map((_, j) => (
                                        <div key={j} style={{
                                            height: 3, flex: 1, borderRadius: 99,
                                            background: j === i
                                                ? 'var(--gold)'
                                                : j < i
                                                    ? 'rgba(201,168,76,0.35)'
                                                    : 'var(--border-light)',
                                            transition: 'background 0.3s',
                                        }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile: vertical stack ─ all expanded */}
            <div className="steps-accordion-mobile">
                {steps.map((step, i) => (
                    <div
                        key={step.n}
                        style={{
                            background: 'var(--navy-mid)',
                            border: '1px solid var(--border-light)',
                            borderRadius: 16,
                            padding: '24px 22px',
                            display: 'flex',
                            gap: 16,
                            alignItems: 'flex-start',
                            opacity: inView ? 1 : 0,
                            transform: inView ? 'none' : 'translateY(16px)',
                            transition: `opacity 0.4s ${i * 0.06}s, transform 0.4s ${i * 0.06}s`,
                        }}
                    >
                        <div style={{
                            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                            background: 'rgba(201,168,76,0.08)',
                            border: '1px solid rgba(201,168,76,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {step.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '1px', marginBottom: 4 }}>
                                {step.n} / {step.label.toUpperCase()}
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--white)', marginBottom: 8 }}>{step.label}</div>
                            <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.65 }}>{step.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function TrustpilotReviewerAvatar({
    photo,
    initials,
    name,
}: {
    photo: string;
    initials: string;
    name: string;
}) {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            flexShrink: 0,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 12,
            color: 'var(--navy)',
        }}>
            {!imageFailed ? (
                <img
                    src={photo}
                    alt={`${name} profile`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setImageFailed(true)}
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}

function SectionReveal({
    children,
    className,
    style,
}: {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}) {
    const revealRef = useRef<HTMLElement | null>(null);

    return (
        <motion.section
            ref={revealRef}
            className={className ? `section-reveal snap-section ${className}` : 'section-reveal snap-section'}
            style={style}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.section>
    );
}

function UseCaseSpotlights() {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActive((p) => (p === spotlightStories.length - 1 ? 0 : p + 1));
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    const activeStory = spotlightStories[active];

    const maxPoint = Math.max(...activeStory.chartPoints);
    const chartWidth = 280;
    const chartHeight = 92;
    const chartStep = chartWidth / (activeStory.chartPoints.length - 1);

    const chartPath = activeStory.chartPoints
        .map((value, index) => {
            const x = index * chartStep;
            const y = chartHeight - (value / maxPoint) * chartHeight;
            return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');

    const areaPath = `${chartPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    const goPrev = () => setActive((p) => (p === 0 ? spotlightStories.length - 1 : p - 1));
    const goNext = () => setActive((p) => (p === spotlightStories.length - 1 ? 0 : p + 1));

    return (
        <section className="ucs-hero">
            {/* background layers */}
            <div className="ucs-bg-stack">
                {spotlightStories.map((story, i) => (
                    <motion.div
                        key={story.id}
                        className={`ucs-bg-layer ${story.imageClass}`}
                        animate={{ opacity: i === active ? 1 : 0 }}
                        transition={{ duration: 0.6 }}
                    />
                ))}
            </div>

            <div className="ucs-hero-overlay" />

            <div className="ucs-hero-content">
                {/* header */}
                <div className="ucs-header">
                    <div className="ucs-eyebrow">Use Case Spotlights</div>
                    <h2 className="ucs-heading" style={{ color: activeStory.glow, textShadow: `0 4px 12px ${activeStory.glow}45`, maxWidth: 1480}}>
                        Concrete stories for operators on both sides of the marketplace.
                    </h2>
                </div>

                {/* main card */}
                <motion.div
                    key={`card-${activeStory.id}`}
                    className="ucs-card"
                    style={{ boxShadow: `0 30px 80px ${activeStory.glow}22` }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <div className="ucs-card-grid">
                        {/* left: narrative */}
                        <div className="ucs-narrative">
                            <div className="ucs-case-id">{activeStory.id}</div>
                            <div className="ucs-kicker">{activeStory.subtitle}</div>
                            <h3 className="ucs-title">{activeStory.title}</h3>

                            <div className="ucs-ps-table">
                                <div className="ucs-ps-row">
                                    <span className="ucs-ps-label">Problem</span>
                                    <span className="ucs-ps-value">{activeStory.problem}</span>
                                </div>
                                <div className="ucs-ps-row">
                                    <span className="ucs-ps-label">Solution</span>
                                    <span className="ucs-ps-value">{activeStory.solution}</span>
                                </div>
                            </div>

                            <div className="ucs-outcome">{activeStory.outcome}</div>
                        </div>

                        {/* right: live data */}
                        <div className="ucs-live">
                            <div className="ucs-live-label">Live Data Card</div>
                            <div className="ucs-live-amount">{activeStory.processed} processed</div>

                            <div className="ucs-chart-wrap">
                                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="ucs-chart-svg">
                                    <motion.path
                                        d={areaPath}
                                        fill={`url(#ucsArea-${activeStory.id})`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.42 }}
                                    />
                                    <motion.path
                                        d={chartPath}
                                        fill="none"
                                        stroke={activeStory.glow}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.75, ease: 'easeOut' }}
                                    />
                                    <defs>
                                        <linearGradient id={`ucsArea-${activeStory.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={activeStory.glow} stopOpacity="0.35" />
                                            <stop offset="100%" stopColor={activeStory.glow} stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            <div className="ucs-countdown-label">Activation Countdown</div>
                            <div className="ucs-countdown-row">
                                {Array.from({ length: activeStory.calendarDays }).map((_, index) => (
                                    <motion.div
                                        key={`${activeStory.id}-day-${index}`}
                                        className="ucs-day"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, delay: index * 0.07 }}
                                    >
                                        D{index + 1}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* navigation */}
                <div className="ucs-nav">
                    <button type="button" className="ucs-nav-btn" onClick={goPrev} aria-label="Previous case">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>

                    <div className="ucs-dots">
                        {spotlightStories.map((story, i) => (
                            <button
                                key={story.id}
                                type="button"
                                className={`ucs-dot${active === i ? ' active' : ''}`}
                                onClick={() => setActive(i)}
                                aria-label={`Case ${story.id}`}
                            >
                                <span className="ucs-dot-label">{story.timelineLabel}</span>
                            </button>
                        ))}
                    </div>

                    <button type="button" className="ucs-nav-btn" onClick={goNext} aria-label="Next case">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                </div>
            </div>
        </section>
    );
}

    export default function LandingPage() {
    const [showTrustConnector, setShowTrustConnector] = useState(true);
    const { isAuthenticated } = useAuthStore();

    return (
        <div className="page-wrapper landing-page-wrapper">

            {/* ── Hero ── */}
            <section className="hero-section snap-section" style={{
                position: 'relative',
                padding: 'clamp(80px, 10vh, 120px) clamp(16px, 5vw, 64px) clamp(60px, 8vh, 100px)',
                overflowX: 'clip',
                overflowY: 'visible',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(24px, 4vw, 60px)',
                minHeight: 'min(640px, 100svh)',
            }}>
                {/* Floating gradient orbs */}
                <div style={{
                    position: 'absolute', top: '-160px', left: '40%',
                    width: 700, height: 700, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 60%)',
                    animation: 'float-orb 14s ease-in-out infinite',
                    pointerEvents: 'none',
                }} />

                {/* Globe , left side */}
                <GlobeNetwork />

                {/* Text , right side */}
                <div className="hero-copy" style={{ flex: '1 1 auto', minWidth: 0, position: 'relative', zIndex: 1 }}>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}
                    >
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 16px', borderRadius: 999,
                            border: '1px solid rgba(201,168,76,0.28)',
                            background: 'rgba(201,168,76,0.06)',
                        }}>
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: 'var(--gold)', display: 'inline-block',
                                animation: 'pulse-dot 2s ease-in-out infinite',
                            }} />
                            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--gold)' }}>
                                Payment Infrastructure Marketplace
                            </span>
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                        style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 'clamp(36px, 4.5vw, 62px)',
                            fontWeight: 800,
                            lineHeight: 1.08,
                            color: 'var(--white)',
                            marginBottom: 24,
                            letterSpacing: '-1.5px',
                        }}
                    >
                        Connect to{' '}
                        <span style={{
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>global</span>
                        {' '}payment rails.
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.22 }}
                        style={{
                            fontSize: 'clamp(15px, 1.6vw, 17px)',
                            color: 'var(--slate)',
                            lineHeight: 1.75,
                            maxWidth: 1080,
                            marginBottom: 40,
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}
                    >
                        Connectov matches businesses who need access to gateways like Stripe, PayPal, ShopifyPayment, or Shopify Payments with verified providers who have capacity , securely, compliantly, transparently.
                    </motion.p>

                    {/* CTA buttons */}
                    <motion.div
                        className="hero-cta-row"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.36 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'flex-start' }}
                    >
                        <Link to="/marketplace" style={{ textDecoration: 'none' }}>
                            <motion.button
                                className="btn-primary"
                                style={{ padding: '13px 28px', fontSize: 15 }}
                                whileHover={{ y: -3, boxShadow: '0 14px 36px rgba(201,168,76,0.45)' }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Browse the Marketplace →
                            </motion.button>
                        </Link>
                        <Link to="/how-it-works" style={{ textDecoration: 'none' }}>
                            <motion.button
                                className="btn-ghost"
                                style={{ padding: '12px 24px', fontSize: 15 }}
                                whileHover={{ y: -2, borderColor: 'rgba(201,168,76,0.6)', color: 'var(--white)' }}
                                whileTap={{ scale: 0.97 }}
                            >
                                How It Works
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="hero-stats-row"
                        style={{
                            display: 'flex', gap: 'clamp(20px, 4vw, 36px)', marginTop: 56, flexWrap: 'wrap', justifyContent: 'flex-start',
                            paddingTop: 40, borderTop: '1px solid var(--border-light)',
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.6 }}
                    >
                        {[
                            { label: 'Verified Providers', end: 340, suffix: '+' },
                            { label: 'Volume Facilitated', end: 2, prefix: '$', suffix: '.4B' },
                            { label: 'Deal Success Rate', end: 98, suffix: '.2%' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--white)', lineHeight: 1, letterSpacing: '-0.5px' }}>
                                    <Counter end={stat.end} prefix={stat.prefix} suffix={stat.suffix} />
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 5, letterSpacing: '0.2px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.66, duration: 0.45, ease: 'easeOut' }}
                        className="hero-live-activity"
                    >
                        <div className="hero-live-activity-header">
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
                                    Live Activity
                                </div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.02em' }}>
                                    What is happening on Connectov right now
                                </div>
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--off-white)', fontSize: 12, fontWeight: 600 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                                Live feed
                            </div>
                        </div>
                        <div className="hero-live-track-wrap">
                            <div className="hero-live-track">
                                {[...liveActivities, ...liveActivities].map((item, index) => (
                                    <div key={index} className="hero-live-chip">
                                        <span className="activity-chip-dot" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Trust Strip (reverse ticker) ── */}
            <div style={{
                borderBottom: '1px solid var(--border-light)',
                overflow: 'hidden',
                background: 'rgba(201,168,76,0.03)',
                padding: '11px 0',
            }}>
                <div className="ticker-track-reverse" style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                    {[...trustItems, ...trustItems, ...trustItems].map(({ icon: Icon, label }, i) => (
                        <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            fontSize: 12, fontWeight: 500, color: 'var(--slate)',
                            whiteSpace: 'nowrap', padding: '0 32px',
                            borderRight: '1px solid var(--border-light)',
                        }}>
                            <Icon size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            <SectionReveal style={{ padding: '96px clamp(20px, 5vw, 60px) 92px' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.42, ease: 'easeOut' }}
                        style={{ marginBottom: 32 }}
                    >
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
                            The Two-Sided Problem
                        </div>
                        <h2 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--white)', marginBottom: 12, maxWidth: 1760 }}>
                            One side has underused infrastructure. The other side cannot access the rails they need.
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--slate)', maxWidth: 640, lineHeight: 1.8 }}>
                            Connectov exists because both of these conditions happen at the same time. Most visitors understand the product as soon as they see the mismatch clearly.
                        </p>
                    </motion.div>

                    <div className="problem-bridge-grid">
                        <motion.div className="problem-side-card" initial={{ opacity: 0, x: -22 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
                                For Providers
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--white)', marginBottom: 14, lineHeight: 1.08 }}>
                                You have payment infrastructure sitting underused.
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.8 }}>
                                Licensed capacity on Stripe, ShopifyPayment, Checkout.com, or Payoneer , extra onboarding bandwidth, unused corridors, or backup routing that is too valuable to leave idle.
                            </div>
                        </motion.div>

                        <motion.div className="problem-bridge-center" initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.32, delay: 0.08 }}>
                            <div className="problem-bridge-badge">Connectov</div>
                            <ArrowLeftRight size={28} style={{ color: 'var(--gold)' }} />
                            <div style={{ fontSize: 13, color: 'var(--slate)', textAlign: 'center', lineHeight: 1.7 }}>
                                Verification, structure, and trust between both sides.
                            </div>
                        </motion.div>

                        <motion.div className="problem-side-card" initial={{ opacity: 0, x: 22 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4, delay: 0.04 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
                                For Seekers
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--white)', marginBottom: 14, lineHeight: 1.08 }}>
                                You need payment access you cannot get through normal channels.
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.8 }}>
                                Banks move too slowly, corridors on PayPal or Worldpay stay blocked, or your model needs a provider who already understands the compliance reality of platforms like Shopify, WooCommerce, or Magento.
                            </div>
                        </motion.div>
                    </div>
                </div>
            </SectionReveal>

            <SectionReveal className="trust-architecture-section">
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    {/* {showTrustConnector && (
                        <div className="trust-connector-wrap" aria-hidden="true">
                            <img
                                src={TRUST_CONNECTOR_IMAGE}
                                alt=""
                                className="trust-connector-image"
                                onError={() => setShowTrustConnector(false)}
                            />
                        </div>
                    )} */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.42, ease: 'easeOut' }}
                        style={{ marginBottom: 34 }}
                    >
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
                            Trust Architecture
                        </div>
                        <h2 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--white)', marginBottom: 12, maxWidth: 1760 }}>
                            Trust is calculated, visible, and earned over time.
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--slate)', maxWidth: 1680, lineHeight: 1.8 }}>
                            This is the platform's differentiator. We do not ask operators to trust a profile page blindly. We quantify operating quality across verification, behavior, and outcomes.
                        </p>
                    </motion.div>

                    <div className="trust-architecture-grid">
                        <div className="trust-score-shell">
                            <div className="trust-score-eyebrow" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>
                                Trust Score Formula
                            </div>
                            <div className="trust-score-value" style={{ fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.06em', color: 'var(--white)', marginBottom: 10 }}>
                                92<span style={{ color: 'var(--gold)' }}>/100</span>
                            </div>
                            <div className="trust-score-copy" style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.8, marginBottom: 24 }}>
                                A visible operating score built from verified inputs and deal outcomes, not self-reported claims.
                            </div>
                            <div className="trust-score-breakdown" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {trustArchitecture.map((pillar) => (
                                    <div key={pillar.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <span style={{ fontSize: 13, color: 'var(--off-white)', fontWeight: 600 }}>{pillar.label}</span>
                                            <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>{pillar.value}%</span>
                                        </div>
                                        <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                            <div style={{ width: `${pillar.value}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--gold), var(--gold-light))' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="trust-score-metrics">
                                {trustScoreMetrics.map((metric) => (
                                    <div key={metric.label} className="trust-score-metric-card">
                                        <div className="trust-score-metric-value">{metric.value}</div>
                                        <div className="trust-score-metric-label">{metric.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="trust-score-footnote">
                                Updated hourly from onboarding, screening, dispute, and live deal-monitoring events.
                            </div>
                        </div>

                        <div className="trust-architecture-right">
                            {showTrustConnector && (
                                <motion.div
                                    className="trust-image-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                >
                                    <div className="trust-image-card-media">
                                        <img
                                            src={TRUST_CONNECTOR_IMAGE}
                                            alt="Trust architecture illustration"
                                            className="trust-image-card-img"
                                            onError={() => setShowTrustConnector(false)}
                                        />
                                    </div>
                                    <div className="trust-image-card-copy">
                                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
                                            Trust Layer
                                        </div>
                                        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--white)', marginBottom: 10 }}>
                                            Verified identity, visible reputation, active monitoring.
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.8 }}>
                                            The image sits inside the trust system itself now, where it belongs: as part of the explanation, not as a floating connector between unrelated sections.
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div className="content-grid-two">
                                {trustArchitecture.map((pillar, index) => (
                                    <motion.div
                                        key={pillar.label}
                                        className="surface-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ delay: index * 0.07 }}
                                        style={{ padding: 24 }}
                                    >
                                        <div style={{ display: 'inline-flex', width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)', marginBottom: 16 }}>
                                            {pillar.icon}
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--white)', marginBottom: 10 }}>
                                            {pillar.label}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.8 }}>
                                            {pillar.detail}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </SectionReveal>

            {/* ── Stripe Rental & Account Sales ── */}
            <SectionReveal style={{ padding: '96px clamp(20px, 5vw, 60px) 92px', background: 'var(--navy-mid)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.42, ease: 'easeOut' }}
                        style={{ marginBottom: 48 }}
                    >
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
                            New Opportunities
                        </div>
                        <h2 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--white)', marginBottom: 14, maxWidth: 1760 }}>
                            Monetize your Stripe account or acquire one.
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--slate)', maxWidth: 620, lineHeight: 1.8 }}>
                            Whether you have an idle Stripe, PayPal, or Adyen account collecting dust, or you need immediate access to a verified gateway — Connectov now offers two new paths.
                        </p>
                    </motion.div>

                    <div className="stripe-opp-grid">
                        {/* Rent Your Account */}
                        <motion.div
                            className="stripe-opp-card"
                            initial={{ opacity: 0, y: 22 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.4 }}
                            whileHover={{ y: -4 }}
                        >
                            <div className="stripe-opp-icon rent">
                                <Repeat size={26} />
                            </div>
                            <div className="stripe-opp-label">Rent</div>
                            <h3 className="stripe-opp-title">Rent your Stripe account & earn 10% commission</h3>
                            <p className="stripe-opp-desc">
                                You keep full ownership. We connect verified seekers to process through your Stripe, PayPal, or Adyen account under a structured, compliant agreement. You earn <strong style={{ color: 'var(--white)' }}>10% commission</strong> on every transaction processed through your rails — hands-off, recurring revenue.
                            </p>
                            <ul className="stripe-opp-list">
                                <li>Your account stays in your name — full control retained</li>
                                <li>All seekers are KYB-verified and AML-screened before matching</li>
                                <li>Standardized rental agreement with liability protections</li>
                                <li>Real-time volume monitoring and automated payouts</li>
                                <li>Works with Stripe, PayPal, Adyen, Checkout.com, and more</li>
                            </ul>
                            <Link to="/register?intent=rent" style={{ textDecoration: 'none', marginTop: 'auto' }}>
                                <motion.button className="stripe-opp-cta rent" whileHover={{ y: -2 }}>
                                    Start Earning 10% →
                                </motion.button>
                            </Link>
                        </motion.div>

                        {/* Sell Your Account */}
                        <motion.div
                            className="stripe-opp-card"
                            initial={{ opacity: 0, y: 22 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.4, delay: 0.08 }}
                            whileHover={{ y: -4 }}
                        >
                            <div className="stripe-opp-icon sell">
                                <DollarSign size={26} />
                            </div>
                            <div className="stripe-opp-label">Sell</div>
                            <h3 className="stripe-opp-title">Sell your account — full legal ownership transfer</h3>
                            <p className="stripe-opp-desc">
                                Ready to exit? Sell your verified Stripe, PayPal, or gateway account to a qualified buyer through Connectov. We handle the <strong style={{ color: 'var(--white)' }}>legal ownership transfer</strong> — escrow-protected, compliance-reviewed, and fully documented.
                            </p>
                            <ul className="stripe-opp-list">
                                <li>Full legal transfer of gateway account ownership</li>
                                <li>Buyer is KYB-verified before transaction proceeds</li>
                                <li>Connectov escrow protects both buyer and seller</li>
                                <li>Compliance team reviews and documents the transfer</li>
                                <li>Valuation based on account age, volume history, and standing</li>
                            </ul>
                            <Link to="/register?intent=sell" style={{ textDecoration: 'none', marginTop: 'auto' }}>
                                <motion.button className="stripe-opp-cta sell" whileHover={{ y: -2 }}>
                                    List Your Account →
                                </motion.button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </SectionReveal>

            <SectionReveal style={{ padding: '96px clamp(20px, 5vw, 60px) 88px' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.42, ease: 'easeOut' }}
                        style={{ marginBottom: 34 }}
                    >
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
                            Live Marketplace Preview
                        </div>
                        <h2 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--white)', marginBottom: 12, maxWidth: 1560 }}>
                            A marketplace preview featuring Payoneer card acquiring, PayPal payouts, and Shopify Payments onboarding.
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--slate)', maxWidth: 1650, lineHeight: 1.8 }}>
                            Visitors can see real supply-side value across major gateways immediately. We show enough to create urgency and enough redaction to preserve access for signed-up operators.
                        </p>
                    </motion.div>

                    <div className="content-grid-two">
                        {featuredCards.map((card, index) => (
                            <motion.div
                                key={card.title}
                                className="surface-card marketplace-preview-card"
                                initial={{ opacity: 0, y: 22 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: index * 0.08 }}
                                style={{ padding: 26 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999, background: card.type === 'Offer' ? 'rgba(26,158,110,0.12)' : 'rgba(201,168,76,0.1)', border: `1px solid ${card.type === 'Offer' ? 'rgba(26,158,110,0.24)' : 'rgba(201,168,76,0.22)'}`, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: card.type === 'Offer' ? 'var(--green)' : 'var(--gold)' }}>
                                        {card.type}
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--slate)' }}>Verified provider</span>
                                </div>
                                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--white)', lineHeight: 1.15, marginBottom: 12 }}>
                                    {card.title}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 16 }}>{card.provider}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
                                    {card.tags.map((tag) => (
                                        <span key={tag} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.03)', fontSize: 11, color: 'var(--slate)' }}>{tag}</span>
                                    ))}
                                </div>
                                <div className="preview-card-redacted">
                                    <div style={{ filter: 'blur(6px)', opacity: 0.65 }}>
                                        <div style={{ fontSize: 14, color: 'var(--white)', marginBottom: 8 }}>{card.metrics}</div>
                                        <div style={{ fontSize: 12, color: 'var(--slate)' }}>Direct contact, volume details, and live compliance notes hidden.</div>
                                    </div>
                                    <div className="preview-card-overlay">
                                        <Lock size={18} style={{ color: 'var(--gold)' }} />
                                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>{isAuthenticated ? 'View on Marketplace' : 'Sign up to connect'}</div>
                                        <Link to={isAuthenticated ? '/marketplace' : '/login'} style={{ textDecoration: 'none' }}>
                                            <button className="btn-primary" style={{ padding: '10px 16px', borderRadius: 12 }}>{isAuthenticated ? 'View details' : 'Unlock details'}</button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </SectionReveal>

            <UseCaseSpotlights />

            {/* ── How It Works ── */}
            <SectionReveal className="process-section" style={{ padding: '100px clamp(20px, 5vw, 60px)' }}>
                <div className="process-orb process-orb-left" />
                <div className="process-orb process-orb-right" />
                <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        style={{ marginBottom: 52 }}
                    >
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
                            The Process
                        </div>
                        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--white)', marginBottom: 12 }}>
                            Simple. Structured. Secure.
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--slate)', maxWidth: 480 }}>
                            Every deal on Connectov , whether it involves Stripe, PayPal, ShopifyPayment, Payoneer, or Checkout.com , follows a 6-step process designed to protect both sides.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.18 }}
                        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <StepsAccordion />
                    </motion.div>
                </div>
            </SectionReveal>

            {/* ── Trustpilot Reviews ── */}
            <SectionReveal style={{
                padding: '100px clamp(20px, 5vw, 60px)',
                background: 'var(--navy-mid)',
                borderTop: '1px solid var(--border-light)',
                borderBottom: '1px solid var(--border-light)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: 64 }}
                    >
                        {/* Trustpilot logo */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
                            <div style={{ display: 'flex', gap: 3 }}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span key={i} style={{
                                        width: 30, height: 30, background: '#00B67A',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: 4,
                                    }}>
                                        <span style={{ color: 'white', fontSize: 17, lineHeight: 1 }}>★</span>
                                    </span>
                                ))}
                            </div>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.04em' }}>
                                Trustpilot
                            </span>
                        </div>

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 10 }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <span key={i} style={{ color: '#00B67A', fontSize: 26 }}>★</span>
                            ))}
                            <span style={{ fontWeight: 700, fontSize: 22, color: 'var(--white)', marginLeft: 8 }}>4.8</span>
                            <span style={{ fontSize: 15, color: 'var(--slate)', marginLeft: 4 }}>out of 5</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--slate)' }}>Based on 312 verified reviews</div>
                    </motion.div>

                    {/* Review cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                        {reviews.map((r, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                style={{
                                    background: 'var(--navy)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 16,
                                    padding: '26px 28px',
                                    display: 'flex', flexDirection: 'column',
                                }}
                                whileHover={{ y: -4, borderColor: 'rgba(201,168,76,0.22)' }}
                            >
                                {/* Stars */}
                                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                                    {Array.from({ length: r.stars }).map((_, j) => (
                                        <span key={j} style={{ color: '#00B67A', fontSize: 16 }}>★</span>
                                    ))}
                                </div>

                                {/* Review text */}
                                <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.68, marginBottom: 24, flex: 1 }}>
                                    "{r.text}"
                                </p>

                                {/* Author */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <TrustpilotReviewerAvatar photo={r.photo} initials={r.avatar} name={r.name} />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{r.flag} {r.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 2 }}>{r.role} · {r.company}</div>
                                    </div>
                                    <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--slate)' }}>{r.date}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </SectionReveal>

            {/* ── Pricing ── */}
            {/* <SectionReveal style={{ padding: '96px clamp(20px, 5vw, 60px) 92px' }}>
                <div style={{ maxWidth: 1240, margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        style={{ textAlign: 'center', marginBottom: 48 }}
                    >
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
                            Plans
                        </div>
                        <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--white)', marginBottom: 14, maxWidth: 650, margin: '0 auto 14px' }}>
                            Transparent pricing for discovery, deals, and scale
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--slate)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
                            No hidden setup cost. Connectov charges only when a relationship is active and value is already moving through the platform.
                        </p>
                    </motion.div>

                    <div className="lp-pricing-grid">
                        {pricingPlans.map((plan, i) => (
                            <motion.div
                                key={i}
                                className={`lp-pricing-card${plan.featured ? ' featured' : ''}`}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
                                whileHover={{ y: -4 }}
                            >
                                {plan.featured && (
                                    <div className="lp-pricing-badge">Most Popular</div>
                                )}

                                <div className="lp-pricing-tier">{plan.tier}</div>
                                <div className="lp-pricing-name">{plan.name}</div>
                                <div className="lp-pricing-desc">{plan.desc}</div>

                                <div className="lp-pricing-price-block">
                                    {plan.originalPrice && <span className="lp-pricing-original">{plan.originalPrice}</span>}
                                    <span className="lp-pricing-price">{plan.price}</span>
                                    {plan.period && <span className="lp-pricing-period">{plan.period}</span>}
                                </div>
                                <div className="lp-pricing-cycle">{plan.cycle}</div>

                                <div className="lp-pricing-features">
                                    <div className="lp-pricing-features-label">What you get</div>
                                    {plan.features.map((feat, j) => (
                                        <div key={j} className={`lp-pricing-feat${feat.active ? '' : ' inactive'}`}>
                                            <Star size={12} style={{ color: feat.active ? 'var(--gold)' : 'var(--navy-light)', flexShrink: 0, marginTop: 2 }} />
                                            <span>{feat.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link to="/pricing" style={{ textDecoration: 'none', marginTop: 'auto' }}>
                                    <motion.button
                                        className={`lp-pricing-cta${plan.featured ? ' featured' : ''}`}
                                        whileHover={plan.featured ? { y: -2, boxShadow: '0 10px 28px rgba(201,168,76,0.34)' } : { y: -1 }}
                                    >
                                        {plan.cta}
                                    </motion.button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'var(--slate)', maxWidth: 680, margin: '28px auto 0', lineHeight: 1.7 }}>
                        All plans include marketplace discovery, compliance tooling, and 24/7 fraud monitoring. Platform commission is charged only on volume processed through active Connectov deals.
                    </div>
                </div>
            </SectionReveal> */}

            <SectionReveal style={{ padding: '96px clamp(20px, 5vw, 60px) 110px' }}>
                <div className="newsletter-shell">
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
                            Early Access
                        </div>
                        <div style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--white)', marginBottom: 12, lineHeight: 1.04 }}>
                            Join 1,200 payment operators on the waitlist.
                        </div>
                        <div style={{ fontSize: 15, color: 'var(--slate)', lineHeight: 1.8, maxWidth: 560 }}>
                            Get launch updates, featured deals, and early access to premium provider inventory before broader rollout.
                        </div>
                    </div>
                    <div className="newsletter-form-shell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'var(--off-white)' }}>
                            <Mail size={16} style={{ color: 'var(--gold)' }} />
                            <span style={{ fontSize: 13, fontWeight: 600 }}>One email. No friction.</span>
                        </div>
                        <div className="newsletter-form-row">
                            <input type="email" placeholder="you@company.com" className="input-field" style={{ minHeight: 52, borderRadius: 14 }} />
                            <button className="btn-primary" style={{ minHeight: 52, padding: '0 22px', borderRadius: 14, fontWeight: 800 }}>
                                Join Waitlist
                            </button>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 12 }}>
                            Weekly launch notes, no spam, unsubscribe anytime.
                        </div>
                    </div>
                </div>
            </SectionReveal>

            <Footer />
        </div>
    );
}
