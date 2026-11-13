import React, { useState } from 'react';
import { ShieldCheck, X, Zap, Lock, Mail, ArrowRight } from 'lucide-react';
import { authService, isSupabaseConfigured } from '../services/supabase';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            if (isLogin) {
                const { data, error } = await authService.signIn(email, password);
                if (error) throw error;
                if (data?.user) {
                    onAuthSuccess(data.user);
                    onClose();
                }
            } else {
                const { data, error } = await authService.signUp(email, password);
                if (error) throw error;
                if (data?.user) {
                    if (!data.session && isSupabaseConfigured) {
                        setSuccessMsg('Account created. Please check your email to confirm registration or sign in directly.');
                    } else {
                        onAuthSuccess(data.user);
                        onClose();
                    }
                }
            }
        } catch (err) {
            setErrorMsg(err.message || 'Authentication error. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoSignIn = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const { data } = await authService.signInAsDemo();
            onAuthSuccess(data.user);
            onClose();
        } catch (err) {
            setErrorMsg('Could not log in with demo account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 120,
            padding: '20px'
        }}>
            <div style={{
                background: '#0d131f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '420px',
                padding: '32px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
                position: 'relative',
                color: '#f8fafc'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <X size={18} />
                </button>

                {/* Brand & Heading */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        color: '#fff',
                        boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                        <ShieldCheck size={22} strokeWidth={2.2} />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.3px' }}>
                        {isLogin ? 'Sign In to SubShield' : 'Create Workspace'}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                        {isLogin ? 'Access your subscription defense portfolio' : 'Activate 24/7 AI financial protection'}
                    </p>

                    {/* Supabase status indicator */}
                    <div style={{
                        marginTop: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        color: isSupabaseConfigured ? '#34d399' : '#818cf8',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        border: isSupabaseConfigured ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSupabaseConfigured ? '#10b981' : '#6366f1' }}></span>
                        {isSupabaseConfigured ? 'Supabase Auth Engine' : 'Sandbox Authentication Mode'}
                    </div>
                </div>

                {errorMsg && (
                    <div style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        color: '#fb7185',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        marginBottom: '16px'
                    }}>
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        marginBottom: '16px'
                    }}>
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="you@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: '#121826',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '13.5px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: '#121826',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '13.5px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '11px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: loading ? 'wait' : 'pointer',
                            marginTop: '6px',
                            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
                        }}
                    >
                        {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Free Account')}
                    </button>
                </form>

                {/* Instant Demo Sign-In */}
                <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                        Evaluating or testing without creating credentials?
                    </p>
                    <button
                        type="button"
                        onClick={handleDemoSignIn}
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: '#121826',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#e2e8f0',
                            padding: '9px',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        <Zap size={14} color="#818cf8" />
                        <span>Instant Demo Evaluation Access</span>
                    </button>
                </div>

                {/* Toggle Login / Signup */}
                <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12.5px', color: '#94a3b8' }}>
                    {isLogin ? (
                        <>
                            Don't have an account?{' '}
                            <span 
                                onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }} 
                                style={{ color: '#818cf8', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Sign Up
                            </span>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <span 
                                onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }} 
                                style={{ color: '#818cf8', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Sign In
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
