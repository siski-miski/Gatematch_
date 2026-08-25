import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const schema = z.object({ email: z.string().email('Invalid email') });

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = () => setSent(true);

    return (
        <div className="content-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="w-full max-w-md bg-navy-mid border border-border-light rounded-2xl p-8" style={{ position: 'relative', zIndex: 1, boxShadow: '0 24px 64px rgba(2, 8, 20, 0.34)' }}>
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-light rounded-xl flex items-center justify-center mx-auto mb-4"><Mail size={24} className="text-navy" /></div>
                    <h1 className="font-serif text-2xl text-white-custom mb-2">{sent ? 'Check your email' : 'Reset password'}</h1>
                    <p className="text-sm text-slate-custom">{sent ? 'We sent you a reset link.' : 'Enter your email to receive a reset link.'}</p>
                </div>
                {!sent && (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <div>
                            <div className="flex items-center gap-3 bg-navy border border-border-light rounded-lg px-4 py-3 focus-within:border-border-gold transition-colors">
                                <Mail size={16} className="text-slate-custom" />
                                <input {...register('email')} type="email" placeholder="you@company.com" className="bg-transparent border-none outline-none flex-1 text-sm text-white-custom font-[DM_Sans] placeholder:text-slate-custom" />
                            </div>
                            {errors.email && <p className="text-red-custom text-xs mt-1">{errors.email.message as string}</p>}
                        </div>
                        <motion.button type="submit" className="auth-submit-button" whileHover={{ y: -1, boxShadow: '0 18px 32px rgba(201,168,76,0.32)' }}>
                            Send Reset Link
                        </motion.button>
                    </form>
                )}
                <p className="text-center text-sm text-slate-custom mt-6">
                    <Link to="/login" className="auth-text-link flex items-center justify-center gap-1"><ArrowLeft size={14} /> Back to login</Link>
                </p>
            </div>
        </div>
    );
}
