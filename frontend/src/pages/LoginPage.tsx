import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import socketService from '../services/socket.service';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setLoading(true);
            setError('');
            const response = await authService.login(data.email, data.password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            socketService.connect(response.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
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

            {/* Left Side - Login Form (Transparent/Glass) */}
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
                        <p className="text-[#9fadbc]">Welcome back! Please enter your details.</p>
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

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#b6c2cf]">Email</label>
                            <input
                                type="email"
                                {...register('email')}
                                className="input-field bg-[#1d2125]/50 backdrop-blur-sm focus:bg-[#1d2125]/80"
                                placeholder="Enter your email"
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
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-[#9fadbc]">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[#579dff] hover:text-[#85b8ff] font-semibold hover:underline">
                            Sign up for free
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Feature Showcase (Floating on Background) */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center z-10">
                <div className="relative p-12 text-center max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b6c2cf] to-[#ffffff] mb-6 drop-shadow-sm">Manage Your Projects Efficiently</h2>
                    </motion.div>

                    <div className="space-y-6 text-left">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            className="glass-card p-5 rounded-xl flex items-start gap-4 hover:bg-[#22272b]/80 transition-all border border-[#ffffff]/10"
                        >
                            <div className="p-3 bg-[#579dff]/10 rounded-lg text-[#579dff] shadow-inner shadow-[#579dff]/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-[#b6c2cf]">Kanban Boards</h3>
                                <p className="text-sm text-[#9fadbc]">Visualize workflows with intuitive drag-and-drop columns.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            className="glass-card p-5 rounded-xl flex items-start gap-4 hover:bg-[#22272b]/80 transition-all border border-[#ffffff]/10"
                        >
                            <div className="p-3 bg-[#ae2e24]/10 rounded-lg text-[#ae2e24] shadow-inner shadow-[#ae2e24]/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-[#b6c2cf]">Calendar View</h3>
                                <p className="text-sm text-[#9fadbc]">Stay on top of deadlines with integrated calendar scheduling.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            className="glass-card p-5 rounded-xl flex items-start gap-4 hover:bg-[#22272b]/80 transition-all border border-[#ffffff]/10"
                        >
                            <div className="p-3 bg-[#5f3811]/20 rounded-lg text-[#fbeccb] shadow-inner shadow-[#5f3811]/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-[#b6c2cf]">Real-time Updates</h3>
                                <p className="text-sm text-[#9fadbc]">Collaborate instantly with live task updates and notifications.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
