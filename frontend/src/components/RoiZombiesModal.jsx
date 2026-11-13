import React from 'react';
import { Clock, AlertTriangle, TrendingDown, DollarSign, X, Activity, ArrowRight } from 'lucide-react';

export default function RoiZombiesModal({ isOpen, onClose, roiData, onOpenAiAssistant, onLogUsage }) {
    if (!isOpen || !roiData) return null;

    const { zombieCount = 0, totalZombieWasteMonthly = 0, potentialAnnualSavings = 0, subscriptions = [] } = roiData;

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
            zIndex: 110,
            padding: '20px'
        }}>
            <div style={{
                background: '#0d131f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '860px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
                color: '#f8fafc',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#121826'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: 'rgba(139, 92, 246, 0.15)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#c084fc'
                        }}>
                            <Clock size={18} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                                Cost-Per-Use ROI & Dormant Subscriptions Audit
                            </h2>
                            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                                Audit engagement frequency and identify capital leakage from inactive tools
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Capital Recovery Metrics Banner */}
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(244, 63, 94, 0.08) 100%)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                Dormant Subscriptions
                            </div>
                            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: zombieCount > 0 ? '#fb7185' : '#34d399', marginTop: '4px' }}>
                                {zombieCount} {zombieCount === 1 ? 'Service' : 'Services'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                Inactive for 60+ days or 0 uses logged
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                Monthly Capital Drain
                            </div>
                            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#fb7185', marginTop: '4px' }}>
                                ${totalZombieWasteMonthly.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                Recurring billing with zero engagement
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                Projected Annual Recovery
                            </div>
                            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#34d399', marginTop: '4px' }}>
                                ${potentialAnnualSavings.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                Recoverable capital via decommissioning
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscriptions Engagement Breakdown */}
                <div style={{ padding: '24px', flex: 1 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Engagement & Cost-Per-Use Breakdown
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {subscriptions.map(sub => (
                            <div
                                key={sub.id}
                                style={{
                                    background: sub.isZombie ? 'rgba(244, 63, 94, 0.05)' : '#121826',
                                    border: sub.isZombie ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '10px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '14px'
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>{sub.name}</span>
                                        {sub.isZombie ? (
                                            <span style={{
                                                background: 'rgba(244, 63, 94, 0.15)',
                                                color: '#fb7185',
                                                border: '1px solid rgba(244, 63, 94, 0.3)',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                letterSpacing: '0.3px'
                                            }}>
                                                DORMANT ({sub.daysSinceLastUsed}d inactive)
                                            </span>
                                        ) : (
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: sub.roiTier === 'EXCELLENT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                                color: sub.roiTier === 'EXCELLENT' ? '#34d399' : '#60a5fa'
                                            }}>
                                                {sub.roiTier} ROI
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
                                        <span>Cost: <strong style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>${sub.amount}</strong>/mo</span>
                                        <span>Logged Uses: <strong style={{ color: '#e2e8f0' }}>{sub.usage_count}</strong></span>
                                        <span>Inactivity: <strong style={{ color: sub.daysSinceLastUsed > 45 ? '#fb7185' : '#cbd5e1' }}>{sub.daysSinceLastUsed} days</strong></span>
                                        <span>Last Session: <strong style={{ color: '#e2e8f0' }}>{sub.last_used_date || 'None recorded'}</strong></span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Cost-Per-Use:</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: sub.isZombie ? '#fb7185' : '#10b981' }}>
                                            ${sub.costPerUse} <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#94a3b8', fontFamily: 'var(--font-sans)' }}>/ use</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => onLogUsage(sub.id, sub.usage_count)}
                                            title="Record usage for today"
                                            style={{
                                                background: '#1e293b',
                                                color: '#e2e8f0',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                padding: '7px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <Activity size={12} color="#818cf8" />
                                            <span>+1 Use</span>
                                        </button>

                                        {sub.isZombie ? (
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    onOpenAiAssistant({
                                                        id: sub.id,
                                                        name: sub.name,
                                                        amount: sub.amount,
                                                        currency: sub.currency,
                                                        strategy: 'ZOMBIE_INACTIVITY',
                                                        userReason: `Service has been completely dormant for ${sub.daysSinceLastUsed} days.`
                                                    });
                                                }}
                                                style={{
                                                    background: '#e11d48',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '7px 14px',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}
                                            >
                                                <span>Decommission</span>
                                                <ArrowRight size={13} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    onOpenAiAssistant({
                                                        id: sub.id,
                                                        name: sub.name,
                                                        amount: sub.amount,
                                                        currency: sub.currency,
                                                        strategy: 'RETENTION_DISCOUNT'
                                                    });
                                                }}
                                                style={{
                                                    background: '#4f46e5',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '7px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Negotiate Rate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
