import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Building, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import client from '../api/client';
import type { SignupConfig } from '../types';
import { COUNTRIES } from '../config/formOptions';

const planOptions = [
    {
        key: 'explorer' as const,
        tier: 'For Seekers', name: 'Explorer',
        desc: 'Explore your first payment infrastructure partnership.',
        originalPrice: '$10', price: '$0', period: '/ mo',
        features: ['Browse all public cards', 'Post 1 request card', 'Basic KYC verification', '1 active deal'],
    },
    {
        key: 'professional' as const,
        tier: 'For Providers & Seekers', name: 'Professional',
        desc: 'Structured, protected deals and full marketplace access.',
        originalPrice: '$299', price: '$149', period: '/ mo',
        features: ['Unlimited card listings', 'Full KYB + Trust Score', 'Deal templates & escrow', '10 active deals', 'Priority support'],
        popular: true,
    },
    {
        key: 'enterprise' as const,
        tier: 'For PSPs & Acquirers', name: 'Enterprise',
        desc: 'High volume with custom compliance needs.',
        originalPrice: null, price: 'Custom', period: '',
        features: ['Everything in Professional', 'Unlimited deals', 'Dedicated compliance officer', 'API access'],
    },
];

const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    full_name: z.string().min(1, 'Full name is required'),
    company_name: z.string().optional(),
    role: z.enum(['provider', 'seeker', 'both']),
    country: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setUser } = useAuthStore();
    const { addToast } = useNotificationStore();
    const [step, setStep] = useState<1 | 2>(1);
    const [signupConfig, setSignupConfig] = useState<SignupConfig | null>(null);
    const [signupConfigError, setSignupConfigError] = useState(false);

    useEffect(() => {
        client.get<SignupConfig>('/auth/config')
            .then((res) => setSignupConfig(res.data))
            .catch(() => setSignupConfigError(true));
    }, []);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: 'seeker' },
    });

    const selectedRole = watch('role');
    const signupAllowed = signupConfig?.signup_allowed === true;
    const signupBlocked = signupConfig?.signup_allowed === false;

    const onSubmit = async (data: RegisterForm) => {
        if (!signupConfig) {
            addToast('Signup settings could not be loaded. Please refresh and try again.', 'error');
            return;
        }
        if (!signupAllowed) {
            addToast(signupConfig.signup_block_message, 'error');
            return;
        }

        try {
            const { email, password, full_name, company_name, role, country } = data;
            const payload = { email, password, full_name, company_name, role, country };
            const res = await client.post('/auth/register', { ...payload, plan: 'explorer' });
            setUser(res.data);
            addToast('Account created! Now choose your plan.', 'success');
            setStep(2);
        } catch (err: any) {
            addToast(err.response?.data?.detail || 'Registration failed', 'error');
        }
    };

    const handlePlanSelect = (plan: 'explorer' | 'professional' | 'enterprise') => {
        if (plan === 'explorer') {
            const intent = searchParams.get('intent');
            navigate(intent === 'rent' || intent === 'sell' ? `/marketplace?operation=${intent}` : '/dashboard');
            return;
        }

        addToast('Contact sales to activate a paid plan.', 'info');
        navigate('/contact');
    };

    const InputField = ({ name, label, icon: Icon, type = 'text', placeholder }: any) => (
        <div>
            <label className="text-xs font-semibold text-slate-custom uppercase tracking-wider mb-2 block">{label}</label>
            <div className="flex items-center gap-3 bg-navy border border-border-light rounded-lg px-4 py-3 focus-within:border-border-gold transition-colors">
                <Icon size={16} className="text-slate-custom" />
                <input {...register(name)} type={type} placeholder={placeholder} className="bg-transparent border-none outline-none flex-1 text-sm text-white-custom font-[DM_Sans] placeholder:text-slate-custom" />
            </div>
            {errors[name as keyof RegisterForm] && <p className="text-red-custom text-xs mt-1">{(errors[name as keyof RegisterForm] as any)?.message}</p>}
        </div>
    );

    return (
        <div className="content-page register-page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 4vw, 40px)' }}>
            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-lg"
                    >
                        <div
                            className="bg-navy-mid border border-border-light rounded-2xl p-8"
                            style={{ position: 'relative', zIndex: 1, boxShadow: '0 24px 64px rgba(2, 8, 20, 0.34)' }}
                        >
                            <div className="text-center mb-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-light rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <UserPlus size={24} className="text-navy" />
                                </div>
                                <h1 className="font-serif text-2xl text-white-custom mb-2">Create your account</h1>
                                <p className="text-sm text-slate-custom">Join the Connectov marketplace</p>
                            </div>

                            {signupConfig && signupBlocked && (
                                <div style={{
                                    border: '1px solid rgba(201,168,76,0.35)',
                                    background: 'rgba(201,168,76,0.08)',
                                    borderRadius: 12,
                                    padding: '12px 14px',
                                    marginBottom: 16,
                                }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
                                        Signups Temporarily Disabled
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--off-white)', lineHeight: 1.6, marginBottom: 8 }}>
                                        {signupConfig.signup_block_message}
                                    </p>
                                    <a
                                        href={`https://wa.me/${signupConfig.contact_whatsapp}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
                                    >
                                        Contact us on WhatsApp
                                    </a>
                                </div>
                            )}

                            {/* Step indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, justifyContent: 'center' }}>
                                <div className="reg-step-dot active">1</div>
                                <div style={{ width: 32, height: 1, background: 'var(--border-light)' }} />
                                <div className="reg-step-dot">2</div>
                            </div>

                            {signupConfigError && (
                                <div style={{ color: '#f87171', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
                                    Signup settings could not be loaded. Please refresh and try again.
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                                {/* Role Selection */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-custom uppercase tracking-wider mb-3 block">I am a</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['provider', 'seeker', 'both'] as const).map((role) => (
                                            <label
                                                key={role}
                                                className={`flex items-center justify-center py-3 rounded-lg border cursor-pointer transition-all text-sm font-medium capitalize ${selectedRole === role
                                                    ? 'border-gold bg-gold/10 text-gold'
                                                    : 'border-border-light text-slate-custom hover:border-border-gold'
                                                    }`}
                                            >
                                                <input {...register('role')} type="radio" value={role} className="hidden" />
                                                {role}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField name="full_name" label="Full Name" icon={User} placeholder="Jean-Marc Dupont" />
                                    <InputField name="company_name" label="Company" icon={Building} placeholder="Acme Inc." />
                                </div>
                                <InputField name="email" label="Email" icon={Mail} type="email" placeholder="you@company.com" />
                                <div>
                                    <label className="text-xs font-semibold text-slate-custom uppercase tracking-wider mb-2 block">Country</label>
                                    <div className="flex items-center gap-3 bg-navy border border-border-light rounded-lg px-4 py-3 focus-within:border-border-gold transition-colors">
                                        <Globe size={16} className="text-slate-custom" />
                                        <select {...register('country')} className="bg-transparent border-none outline-none flex-1 text-sm text-white-custom font-[DM_Sans]">
                                            <option value="">Select your country</option>
                                            {COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
                                        </select>
                                    </div>
                                    {errors.country && <p className="text-red-custom text-xs mt-1">{errors.country.message}</p>}
                                </div>
                                <InputField name="password" label="Password" icon={Lock} type="password" placeholder="Min. 8 characters" />
                                <InputField name="confirmPassword" label="Confirm Password" icon={Lock} type="password" placeholder="Repeat password" />

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting || signupConfig === null}
                                    className="auth-submit-button mt-2"
                                    whileHover={{ y: -1, boxShadow: '0 18px 32px rgba(201,168,76,0.32)' }}
                                    onClick={signupBlocked ? (e) => {
                                        e.preventDefault();
                                        if (signupConfig) addToast(signupConfig.signup_block_message, 'error');
                                    } : undefined}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    {isSubmitting
                                        ? 'Creating account...'
                                        : signupConfig === null
                                            ? 'Checking availability...'
                                            : signupAllowed
                                            ? (<>Continue to Plans <ArrowRight size={16} /></>)
                                            : 'Signups are currently paused'}
                                </motion.button>
                            </form>

                            <p className="text-center text-sm text-slate-custom mt-6">
                                Already have an account?{' '}
                                <Link to="/login" className="auth-text-link">Sign in</Link>
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="reg-plan-wrapper"
                    >
                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <CheckCircle size={24} style={{ color: 'var(--navy)' }} />
                            </div>
                            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--white)', marginBottom: 8 }}>Choose your plan</h1>
                            <p style={{ fontSize: 14, color: 'var(--slate)', maxWidth: 420, margin: '0 auto' }}>Your account is ready. Select a plan to get started.</p>

                            {/* Step indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, justifyContent: 'center' }}>
                                <div className="reg-step-dot completed">✓</div>
                                <div style={{ width: 32, height: 1, background: 'var(--gold)' }} />
                                <div className="reg-step-dot active">2</div>
                            </div>
                        </div>

                        <div className="reg-plan-grid">
                            {planOptions.map((plan) => (
                                <motion.div
                                    key={plan.key}
                                    className={`reg-plan-card${plan.popular ? ' popular' : ''}`}
                                    whileHover={{ y: -4 }}
                                    onClick={() => handlePlanSelect(plan.key)}
                                >
                                    {plan.popular && <div className="reg-plan-badge">Most Popular</div>}
                                    <div className="reg-plan-tier">{plan.tier}</div>
                                    <div className="reg-plan-name">{plan.name}</div>
                                    <div className="reg-plan-desc">{plan.desc}</div>

                                    <div className="reg-plan-price-row">
                                        {plan.originalPrice && <span className="reg-plan-original">{plan.originalPrice}</span>}
                                        <span className="reg-plan-price">{plan.price}</span>
                                        {plan.period && <span className="reg-plan-period">{plan.period}</span>}
                                    </div>

                                    <div className="reg-plan-features">
                                        {plan.features.map((feat) => (
                                            <div key={feat} className="reg-plan-feat">
                                                <CheckCircle size={13} style={{ color: plan.popular ? 'var(--gold)' : '#29D38A', flexShrink: 0, marginTop: 2 }} />
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <motion.button
                                        className={`reg-plan-cta${plan.popular ? ' popular' : ''}`}
                                        whileHover={{ y: -1 }}
                                    >
                                        Select {plan.name}
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
