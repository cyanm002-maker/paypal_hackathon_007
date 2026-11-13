import React, { useState } from 'react';
import { 
    ShieldCheck, 
    TrendingUp, 
    Clock, 
    Bot, 
    Zap, 
    CreditCard, 
    ArrowRight, 
    Lock, 
    Scale, 
    SlidersHorizontal, 
    AlertCircle, 
    CheckCircle2 
} from 'lucide-react';

export default function LandingPage({ onGoToDashboard, onOpenAuth }) {
    // Interactive ROI Calculator states for live demo
    const [calcCost, setCalcCost] = useState(29.99);
    const [calcUses, setCalcUses] = useState(2);
    const [calcDaysIdle, setCalcDaysIdle] = useState(65);

    const costPerUse = calcUses > 0 ? (calcCost / calcUses).toFixed(2) : calcCost.toFixed(2);
    const isZombie = calcDaysIdle >= 60 || (calcUses === 0 && calcDaysIdle >= 30);
    const annualWaste = (calcCost * 12).toFixed(2);

    return (
        <div style={{ background: 'var(--bg-primary)', color: '#f8fafc', minHeight: '100vh', position: 'relative' }}>
            {/* Subtle Ambient Glow Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '1000px',
                height: '450px',
                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }}></div>

            {/* Hero Section */}
            <section style={{
                padding: '90px 24px 60px',
                maxWidth: '1200px',
                margin: '0 auto',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    color: '#a5b4fc',
                    padding: '6px 16px',
                    borderRadius: '30px',
                    fontSize: '12px',
                    fontWeight: '600',
                    letterSpacing: '0.4px',
                    marginBottom: '28px'
                }}>
                    <ShieldCheck size={14} color="#818cf8" strokeWidth={2.4} />
                    <span>Autonomous Financial Defense</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
                    <span style={{ color: '#34d399' }}>FTC Dark Pattern Compliant</span>
                </div>

                <h1 style={{
                    fontSize: 'clamp(38px, 5.6vw, 68px)',
                    fontWeight: '800',
                    lineHeight: '1.08',
                    letterSpacing: '-1.8px',
                    marginBottom: '24px',
                    maxWidth: '980px',
                    margin: '0 auto 24px'
                }}>
                    Defend Your Cash Flow From <span style={{
                        background: 'linear-gradient(135deg, #a5b4fc 0%, #c084fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Unused Subscriptions</span> & Stealth Price Hikes.
                </h1>

                <p style={{
                    fontSize: 'clamp(16px, 1.8vw, 19px)',
                    color: '#94a3b8',
                    maxWidth: '740px',
                    margin: '0 auto 38px',
                    lineHeight: '1.65'
                }}>
                    SubShield continuously audits recurring card and PayPal authorizations, alerts on unannounced rate jumps, classifies dormant accounts with cost-per-use ROI metrics, and generates FTC-backed cancellation scripts.
                </p>

                {/* Call to Actions */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '56px' }}>
                    <button
                        onClick={onGoToDashboard}
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '15px 32px',
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>Access Defense Dashboard</span>
                        <ArrowRight size={16} strokeWidth={2.4} />
                    </button>
                    <button
                        onClick={() => onOpenAuth('signup')}
                        style={{
                            background: '#111726',
                            color: '#e2e8f0',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            padding: '15px 28px',
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Create Workspace
                    </button>
                </div>

                {/* Trust Badges */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '28px',
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: '500',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={13} color="#94a3b8" /> Supabase Row-Level Security
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={13} color="#94a3b8" /> Automated Webhook Sync
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Scale size={13} color="#94a3b8" /> FTC Click-to-Cancel Ready
                    </div>
                </div>
            </section>

            {/* Interactive Feature Simulator */}
            <section style={{
                maxWidth: '1120px',
                margin: '0 auto 80px',
                padding: '0 24px',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    background: '#0d131f',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: '18px',
                    padding: '36px',
                    boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.6)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: '#c084fc',
                            border: '1px solid rgba(139, 92, 246, 0.25)',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            <SlidersHorizontal size={12} />
                            <span>Interactive ROI Simulator</span>
                        </div>
                        <h2 style={{ fontSize: '26px', fontWeight: '800', marginTop: '10px', color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                            Cost-Per-Use ROI & Inactivity Engine
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '580px', margin: '6px auto 0' }}>
                            Adjust subscription metrics below to see how SubShield identifies value extraction and flags dormant accounts.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '28px', alignItems: 'center' }}>
                        {/* Interactive Sliders */}
                        <div style={{ background: '#121927', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <label style={{ display: 'block', marginBottom: '18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                    <span>Monthly Billing Rate:</span>
                                    <span style={{ color: '#818cf8', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>${calcCost}</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="120"
                                    step="1"
                                    value={calcCost}
                                    onChange={(e) => setCalcCost(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: '#6366f1' }}
                                />
                            </label>

                            <label style={{ display: 'block', marginBottom: '18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                    <span>Monthly Active Sessions:</span>
                                    <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{calcUses} {calcUses === 1 ? 'session' : 'sessions'}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    step="1"
                                    value={calcUses}
                                    onChange={(e) => setCalcUses(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: '#10b981' }}
                                />
                            </label>

                            <label style={{ display: 'block' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                    <span>Days Since Last Activity:</span>
                                    <span style={{ color: isZombie ? '#fb7185' : '#fbbf24', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{calcDaysIdle} days</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="120"
                                    step="1"
                                    value={calcDaysIdle}
                                    onChange={(e) => setCalcDaysIdle(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: isZombie ? '#f43f5e' : '#f59e0b' }}
                                />
                            </label>
                        </div>

                        {/* Calculated Results */}
                        <div style={{
                            background: isZombie ? 'rgba(244, 63, 94, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                            border: isZombie ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
                            borderRadius: '14px',
                            padding: '28px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 12px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '700',
                                marginBottom: '14px',
                                background: isZombie ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: isZombie ? '#fb7185' : '#34d399'
                            }}>
                                {isZombie ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
                                <span>{isZombie ? 'FLAGGED DORMANT (60+ Days Inactivity)' : 'OPTIMAL ENGAGEMENT'}</span>
                            </div>

                            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                Calculated Cost-Per-Use
                            </div>
                            <div style={{ fontSize: '40px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: isZombie ? '#fb7185' : '#10b981', margin: '4px 0 10px' }}>
                                ${costPerUse} <span style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8', fontFamily: 'var(--font-sans)' }}>/ use</span>
                            </div>

                            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.55', marginBottom: '20px' }}>
                                {isZombie 
                                    ? `No activity logged in ${calcDaysIdle} days. Decommissioning this single subscription prevents $${annualWaste}/year in pure capital leakage.`
                                    : `Healthy utilization. At $${costPerUse} per session, you are maintaining positive ROI on this service.`}
                            </p>

                            <button
                                onClick={onGoToDashboard}
                                style={{
                                    background: isZombie ? '#e11d48' : '#4f46e5',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '10px 22px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span>{isZombie ? 'Initiate AI Cancellation' : 'Audit My Active Portfolio'}</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Capability Pillars */}
            <section style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.8px' }}>
                        Enterprise-Grade Personal Finance Defense
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '15px' }}>
                        Architected to counter dark patterns, stealth renewal hikes, and unmonitored recurring charges.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
                    {/* Feature 1 */}
                    <div className="glass-card" style={{ borderRadius: '14px', padding: '28px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '18px'
                        }}>
                            <TrendingUp size={20} color="#818cf8" />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
                            Smart Anomaly & Price-Hike Detection
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
                            Streaming services and SaaS providers frequently bump renewal prices by 15-35%. SubShield stores historical baseline rates and immediately flags discrepancies before charges compound.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="glass-card" style={{ borderRadius: '14px', padding: '28px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '18px'
                        }}>
                            <Clock size={20} color="#c084fc" />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
                            Cost-Per-Use ROI & Inactivity Engine
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
                            Quantify how frequently you genuinely interact with each service. Automatic classification isolates tools untouched for 60+ days so you stop funding forgotten accounts.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="glass-card" style={{ borderRadius: '14px', padding: '28px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '18px'
                        }}>
                            <Bot size={20} color="#34d399" />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
                            AI Cancellation & Negotiation Assistant
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
                            Bypass deceptive retention funnels and mandatory phone-call loops. Generate legally sound FTC Click-to-Cancel letters or counter-offer negotiation scripts in 1 click.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="glass-card" style={{ borderRadius: '14px', padding: '28px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '18px'
                        }}>
                            <Lock size={20} color="#60a5fa" />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
                            Supabase Database & Row-Level Security
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
                            Your records are strictly compartmentalized with PostgreSQL Row Level Security (RLS). Real-time subscription sync and automated audit logs ensure strict cryptographic isolation.
                        </p>
                    </div>

                    {/* Feature 5 */}
                    <div className="glass-card" style={{ borderRadius: '14px', padding: '28px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '18px'
                        }}>
                            <CreditCard size={20} color="#fbbf24" />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
                            PayPal Live Integration & Webhooks
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
                            Direct integration with the PayPal Subscriptions API. Revoke recurring pre-approvals and keep cancellation states synchronized via automated webhooks.
                        </p>
                    </div>

                    {/* Feature 6 */}
                    <div className="glass-card" style={{ borderRadius: '14px', padding: '28px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '18px'
                        }}>
                            <Zap size={20} color="#fb7185" />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
                            Monthly Burn Rate & Budget Limiter
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
                            Establish an expenditure ceiling. Monitor live burn rates and receive proactive suggestions when commitments approach or breach your threshold.
                        </p>
                    </div>
                </div>
            </section>

            {/* Dark Patterns Matrix */}
            <section style={{ maxWidth: '1000px', margin: '0 auto 80px', padding: '0 24px' }}>
                <div style={{ background: '#0d131f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '32px', overflowX: 'auto' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', textAlign: 'center', marginBottom: '24px', color: '#f1f5f9', letterSpacing: '-0.4px' }}>
                        Dark Pattern Countermeasures Matrix
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                <th style={{ padding: '12px' }}>Corporate Retention Pattern</th>
                                <th style={{ padding: '12px', color: '#fb7185' }}>Conventional Consumer Friction</th>
                                <th style={{ padding: '12px', color: '#34d399' }}>SubShield AI Countermeasure</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '13px' }}>
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <td style={{ padding: '14px', fontWeight: '600' }}>Mandatory Phone Call to Terminate</td>
                                <td style={{ padding: '14px', color: '#94a3b8' }}>30+ min waiting on hold with sales agents</td>
                                <td style={{ padding: '14px', color: '#34d399', fontWeight: '600' }}>FTC Click-to-Cancel statutory notice bypassing calls</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <td style={{ padding: '14px', fontWeight: '600' }}>Unannounced Renewal Price Hikes</td>
                                <td style={{ padding: '14px', color: '#94a3b8' }}>Unnoticed +$8/mo recurring surcharge</td>
                                <td style={{ padding: '14px', color: '#34d399', fontWeight: '600' }}>Baseline anomaly alert + formal rate dispute letter</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <td style={{ padding: '14px', fontWeight: '600' }}>Dormant "Zombie" Accounts</td>
                                <td style={{ padding: '14px', color: '#94a3b8' }}>Indefinite billing without active sessions</td>
                                <td style={{ padding: '14px', color: '#34d399', fontWeight: '600' }}>60-day inactivity alert with cost-per-use metrics</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '14px', fontWeight: '600' }}>Tier Retention Gating</td>
                                <td style={{ padding: '14px', color: '#94a3b8' }}>Pay full retail while new users get 50% promo</td>
                                <td style={{ padding: '14px', color: '#34d399', fontWeight: '600' }}>Automated retention bargaining scripts matching promos</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Bottom CTA */}
            <section style={{
                background: 'linear-gradient(180deg, rgba(13, 19, 31, 0) 0%, rgba(79, 70, 229, 0.12) 100%)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '60px 24px',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: '#f8fafc', letterSpacing: '-0.5px' }}>
                    Shield Your Recurring Commitments
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '580px', margin: '0 auto 26px' }}>
                    Deploy your personal subscription defense system in under 2 minutes.
                </p>
                <button
                    onClick={onGoToDashboard}
                    style={{
                        background: '#4f46e5',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '13px 28px',
                        borderRadius: '9px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 18px rgba(79, 70, 229, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>Launch Shield Dashboard</span>
                    <ArrowRight size={15} />
                </button>
            </section>
        </div>
    );
}
