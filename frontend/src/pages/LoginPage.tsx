import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import client from '../api/client';

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    const { addToast } = useNotificationStore();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            const res = await client.post('/auth/login', data);
            setUser(res.data);
            addToast('Welcome back!', 'success');
            navigate('/dashboard');
        } catch (err: any) {
            addToast(err.response?.data?.detail || 'Login failed', 'error');
        }
    };

    return (
        <div className="content-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
                className="w-full max-w-md bg-navy-mid border border-border-light rounded-2xl p-8"
                style={{ position: 'relative', zIndex: 1, boxShadow: '0 24px 64px rgba(2, 8, 20, 0.34)' }}
            >
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-light rounded-xl flex items-center justify-center mx-auto mb-4">
                        <LogIn size={24} className="text-navy" />
                    </div>
                    <h1 className="font-serif text-2xl text-white-custom mb-2">Welcome back</h1>
                    <p className="text-sm text-slate-custom">Sign in to your Gatematch account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    <div>
                        <label className="text-xs font-semibold text-slate-custom uppercase tracking-wider mb-2 block">Email</label>
                        <div className="flex items-center gap-3 bg-navy border border-border-light rounded-lg px-4 py-3 focus-within:border-border-gold transition-colors">
                            <Mail size={16} className="text-slate-custom" />
                            <input {...register('email')} type="email" placeholder="you@company.com" className="bg-transparent border-none outline-none flex-1 text-sm text-white-custom font-[DM_Sans] placeholder:text-slate-custom" />
                        </div>
                        {errors.email && <p className="text-red-custom text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-custom uppercase tracking-wider mb-2 block">Password</label>
                        <div className="flex items-center gap-3 bg-navy border border-border-light rounded-lg px-4 py-3 focus-within:border-border-gold transition-colors">
                            <Lock size={16} className="text-slate-custom" />
                            <input {...register('password')} type="password" placeholder="••••••••" className="bg-transparent border-none outline-none flex-1 text-sm text-white-custom font-[DM_Sans] placeholder:text-slate-custom" />
                        </div>
                        {errors.password && <p className="text-red-custom text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-xs text-gold no-underline hover:text-gold-light">Forgot password?</Link>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="auth-submit-button"
                        whileHover={{ y: -1, boxShadow: '0 18px 32px rgba(201,168,76,0.32)' }}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                </form>

                <p className="text-center text-sm text-slate-custom mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-text-link">Create one</Link>
                </p>
            </div>
        </div>
    );
}
