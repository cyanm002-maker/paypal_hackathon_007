import React, { useState } from 'react';
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
                        setSuccessMsg('Account created! Please check your email to confirm registration or sign in directly.');
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
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
        }}>
            <div style={{
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '440px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                position: 'relative',
                color: '#f9fafb'
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
                        color: '#9ca3af',
                        fontSize: '20px',
                        cursor: 'pointer',
                        padding: '4px 8px'
                    }}
                >
                    ✕
                </button>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛡️</div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f3f4f6' }}>
                        {isLogin ? 'Sign In to SubShield' : 'Create Your Defense Account'}
                    </h2>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
                        {isLogin ? 'Manage your subscriptions and stop dark patterns' : 'Activate 24/7 AI financial protection'}
                    </p>

                    {/* Supabase status indicator */}
                    <div style={{
                        marginTop: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: isSupabaseConfigured ? '#34d399' : '#60a5fa',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSupabaseConfigured ? '#10b981' : '#3b82f6' }}></span>
                        {isSupabaseConfigured ? 'Supabase Auth Ready' : 'Demo & Sandbox Mode Active'}
                    </div>
                </div>

                {errorMsg && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginBottom: '16px'
                    }}>
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginBottom: '16px'
                    }}>
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#d1d5db', marginBottom: '6px' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#d1d5db', marginBottom: '6px' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: loading ? 'wait' : 'pointer',
                            marginTop: '8px',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
                        }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Free Account')}
                    </button>
                </form>

                {/* Instant Demo Sign-in for seamless hackathon testing */}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #374151', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>
                        Evaluating or testing without creating an account?
                    </p>
                    <button
                        type="button"
                        onClick={handleDemoSignIn}
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: '#1f2937',
                            border: '1px solid #4b5563',
                            color: '#e5e7eb',
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        ⚡ 1-Click Instant Demo Sign-In
                    </button>
                </div>

                {/* Toggle Login / Signup */}
                <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
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

