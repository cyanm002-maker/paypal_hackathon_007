import React from 'react';
import { ShieldCheck, LogOut, Database, Sparkles, LayoutDashboard } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

export default function Navbar({ currentView, setCurrentView, user, onSignOut, onOpenAuth }) {
    return (
        <header style={{
            background: 'rgba(7, 9, 14, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            padding: '12px 28px'
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
            }}>
                {/* Brand Logo */}
                <div 
                    onClick={() => setCurrentView('landing')} 
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}
                >
                    <div style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        color: '#fff',
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(79, 70, 229, 0.45)',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                        <ShieldCheck size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.4px', color: '#f8fafc' }}>
                                Sub<span style={{ color: '#818cf8' }}>Shield</span>
                            </span>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: 'rgba(99, 102, 241, 0.15)',
                                color: '#a5b4fc',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}>
                                PRO
                            </span>
                        </div>
                        <span style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: '500',
                            letterSpacing: '0.2px',
                            color: '#64748b'
                        }}>
                            Financial Defense System
                        </span>
                    </div>
                </div>

                {/* Center Navigation Links */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                        onClick={() => setCurrentView('landing')}
                        style={{
                            background: currentView === 'landing' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                            color: currentView === 'landing' ? '#f8fafc' : '#94a3b8',
                            border: currentView === 'landing' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Sparkles size={14} color={currentView === 'landing' ? '#818cf8' : '#94a3b8'} />
                        <span>Platform Tour</span>
                    </button>
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        style={{
                            background: currentView === 'dashboard' ? 'rgba(79, 70, 229, 0.18)' : 'transparent',
                            color: currentView === 'dashboard' ? '#c7d2fe' : '#94a3b8',
                            border: currentView === 'dashboard' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <LayoutDashboard size={14} color={currentView === 'dashboard' ? '#818cf8' : '#94a3b8'} />
                        <span>Dashboard</span>
                    </button>
                </nav>

                {/* Right Area: Engine Status & User Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Database & RLS Status */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.1)',
                        color: isSupabaseConfigured ? '#34d399' : '#818cf8',
                        border: isSupabaseConfigured ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)'
                    }}>
                        <Database size={12} strokeWidth={2.4} />
                        <span>{isSupabaseConfigured ? 'Supabase RLS Active' : 'Sandbox Store'}</span>
                    </div>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#e2e8f0'
                            }}>
                                {(user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.email}
                            </span>
                            <button
                                onClick={onSignOut}
                                title="Sign out"
                                style={{
                                    background: 'rgba(244, 63, 94, 0.08)',
                                    color: '#fb7185',
                                    border: '1px solid rgba(244, 63, 94, 0.25)',
                                    padding: '6px 10px',
                                    borderRadius: '7px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <LogOut size={13} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                onClick={() => onOpenAuth('login')}
                                style={{
                                    background: 'transparent',
                                    color: '#cbd5e1',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => onOpenAuth('signup')}
                                style={{
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '7px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 10px rgba(79, 70, 229, 0.35)'
                                }}
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
