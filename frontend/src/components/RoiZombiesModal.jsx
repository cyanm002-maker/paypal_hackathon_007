import React from 'react';

export default function RoiZombiesModal({ isOpen, onClose, roiData, onOpenAiAssistant, onLogUsage }) {
    if (!isOpen || !roiData) return null;

    const { zombieCount = 0, totalZombieWasteMonthly = 0, potentialAnnualSavings = 0, subscriptions = [] } = roiData;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '20px'
        }}>
            <div style={{
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '18px',
                width: '100%',
                maxWidth: '840px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                color: '#f9fafb',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #374151',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#1f2937'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '26px' }}>🧟</span>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#f3f4f6' }}>
                                Cost-Per-Use ROI & Zombie Subscription Audit
                            </h2>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                                Eliminate silent financial drain from forgotten and low-engagement apps
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#9ca3af',
                            fontSize: '22px',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Savings Summary Banner */}
                <div style={{ padding: '24px', borderBottom: '1px solid #1f2937', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#d1d5db', fontWeight: '700', textTransform: 'uppercase' }}>
                                Flagged Zombie Subscriptions
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '900', color: zombieCount > 0 ? '#f87171' : '#34d399', marginTop: '4px' }}>
                                {zombieCount} {zombieCount === 1 ? 'Service' : 'Services'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                Inactive for 60+ days or 0 uses logged
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '12px', color: '#d1d5db', fontWeight: '700', textTransform: 'uppercase' }}>
                                Monthly Cash Drain
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '900', color: '#f87171', marginTop: '4px' }}>
                                ${totalZombieWasteMonthly.toFixed(2)}/mo
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                Pure financial waste on unused tools
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '12px', color: '#d1d5db', fontWeight: '700', textTransform: 'uppercase' }}>
                                Potential Annual Savings
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '900', color: '#34d399', marginTop: '4px' }}>
                                ${potentialAnnualSavings.toFixed(2)}/yr
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                Reclaimed by terminating zombies
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscriptions Table / Cards */}
                <div style={{ padding: '24px', flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#d1d5db', marginBottom: '14px' }}>
                        Engagement & Cost-Per-Use Breakdown
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {subscriptions.map(sub => (
                            <div
                                key={sub.id}
                                style={{
                                    background: sub.isZombie ? 'rgba(239, 68, 68, 0.08)' : '#1f2937',
                                    border: sub.isZombie ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #374151',
                                    borderRadius: '12px',
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
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{sub.name}</span>
                                        {sub.isZombie ? (
                                            <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                                                🚨 ZOMBIE (Dormant {sub.daysSinceLastUsed}d)
                                            </span>
                                        ) : (
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: sub.roiTier === 'EXCELLENT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                color: sub.roiTier === 'EXCELLENT' ? '#34d399' : '#60a5fa'
                                            }}>
                                                {sub.roiTier} ROI
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '12px', color: '#9ca3af', flexWrap: 'wrap' }}>
                                        <span>Cost: <strong>${sub.amount}</strong>/mo</span>
                                        <span>Logged Uses: <strong>{sub.usage_count}</strong></span>
                                        <span>Days Idle: <strong style={{ color: sub.daysSinceLastUsed > 45 ? '#f87171' : '#d1d5db' }}>{sub.daysSinceLastUsed} days</strong></span>
                                        <span>Last Used: <strong>{sub.last_used_date || 'Never'}</strong></span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '700' }}>Cost-Per-Use:</div>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: sub.isZombie ? '#f87171' : '#10b981' }}>
                                            ${sub.costPerUse} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>/ use</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => onLogUsage(sub.id, sub.usage_count)}
                                            title="I used this service today"
                                            style={{
                                                background: '#374151',
                                                color: '#e5e7eb',
                                                border: 'none',
                                                padding: '7px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            +1 Use Today
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
                                                    background: '#ef4444',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '7px 14px',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Kill Zombie 🧟
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

