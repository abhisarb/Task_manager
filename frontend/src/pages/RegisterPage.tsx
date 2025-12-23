import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import socketService from '../services/socket.service';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setLoading(true);
            setError('');
            const response = await authService.register(data.email, data.password, data.name);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            socketService.connect(response.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#1d2125] overflow-hidden relative">

            {/* Unified Background */}
            <div className="absolute inset-0 z-0 bg-grid-pattern overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-[#579dff] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-[#ae2e24] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-[#164b35] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Left Side - Register Form */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10"
            >
                <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-[#ffffff]/5">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#b6c2cf] mb-2 flex items-center gap-2">
                            <span className="bg-[#579dff] text-[#1d2125] p-1 rounded text-2xl">TM</span> Task Manager
                        </h1>
                        <p className="text-[#9fadbc]">Create your account to get started.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#ae2e24]/10 border border-[#ae2e24]/20 text-[#ae2e24] px-4 py-3 rounded-lg mb-6"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#b6c2cf]">Full Name</label>
                            <input
                                type="text"
                                {...register('name')}
                                className="input-field bg-[#1d2125]/50 backdrop-blur-sm focus:bg-[#1d2125]/80"
                                placeholder="John Doe"
                            />
                            {errors.name && (
                                <p className="text-[#ae2e24] text-xs mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#b6c2cf]">Email</label>
                            <input
                                type="email"
                                {...register('email')}
                                className="input-field bg-[#1d2125]/50 backdrop-blur-sm focus:bg-[#1d2125]/80"
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p className="text-[#ae2e24] text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#b6c2cf]">Password</label>
                            <input
                                type="password"
                                {...register('password')}
                                className="input-field bg-[#1d2125]/50 backdrop-blur-sm focus:bg-[#1d2125]/80"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="text-[#ae2e24] text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#b6c2cf]">Confirm Password</label>
                            <input
                                type="password"
                                {...register('confirmPassword')}
                                className="input-field bg-[#1d2125]/50 backdrop-blur-sm focus:bg-[#1d2125]/80"
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && (
                                <p className="text-[#ae2e24] text-xs mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-2.5 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-[#1d2125]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-[#9fadbc]">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#579dff] hover:text-[#85b8ff] font-semibold hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Feature Showcase with Animations */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center z-10">
                <div className="relative p-12 text-center max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-bold text-[#b6c2cf] mb-6">Join the Productivity Revolution</h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-[#9fadbc] mb-8"
                    >
                        Start organizing your life and work with the best tools available.
                    </motion.p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-4 rounded-lg border border-[#ffffff]/5">
                            <h3 className="text-[#579dff] font-bold text-xl mb-1">10k+</h3>
                            <p className="text-sm text-[#9fadbc]">Active Users</p>
                        </div>
                        <div className="glass-card p-4 rounded-lg border border-[#ffffff]/5">
                            <h3 className="text-[#ae2e24] font-bold text-xl mb-1">50k+</h3>
                            <p className="text-sm text-[#9fadbc]">Tasks Completed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
