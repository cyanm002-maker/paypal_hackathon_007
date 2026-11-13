import React from 'react';
import { AlertTriangle, TrendingUp, Copy, ArrowUpRight, ShieldAlert } from 'lucide-react';

export default function AnomalyBanner({ anomalies = [], onOpenAiAssistant }) {
    if (!anomalies || anomalies.length === 0) return null;

    return (
        <div style={{
            background: 'rgba(244, 63, 94, 0.06)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '28px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fb7185'
                    }}>
                        <ShieldAlert size={18} strokeWidth={2.3} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fb7185', margin: 0, letterSpacing: '-0.2px' }}>
                            Anomaly & Price-Hike Detection Alert ({anomalies.length} Flagged)
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '2px 0 0 0' }}>
                            SubShield identified rate adjustments, abnormal renewals, or duplicate active agreements.
                        </p>
                    </div>
                </div>
                <span style={{
                    background: 'rgba(244, 63, 94, 0.15)',
                    color: '#fb7185',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    letterSpacing: '0.4px'
                }}>
                    ACTION REQUIRED
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {anomalies.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            background: '#121826',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            padding: '14px 18px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 300px' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: item.type === 'PRICE_HIKE' ? '#f43f5e' : (item.type === 'DUPLICATE_BILLING' ? '#f59e0b' : '#3b82f6'),
                                marginTop: '6px',
                                flexShrink: 0
                            }}></div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: '700', color: '#f8fafc', fontSize: '14px' }}>
                                        {item.subscriptionName || item.category || 'Subscription Discrepancy'}
                                    </span>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: item.type === 'PRICE_HIKE' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                        color: item.type === 'PRICE_HIKE' ? '#fb7185' : '#fbbf24',
                                        border: item.type === 'PRICE_HIKE' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                                    }}>
                                        {item.type === 'PRICE_HIKE' ? `+${item.percentIncrease}% RATE INCREASE` : (item.type === 'DUPLICATE_BILLING' ? 'DUPLICATE CHARGE' : 'CATEGORY OVERLAP')}
                                    </span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.45' }}>
                                    {item.message}
                                </p>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            {item.type === 'PRICE_HIKE' && (
                                <button
                                    onClick={() => onOpenAiAssistant({
                                        name: item.subscriptionName,
                                        amount: item.currentAmount,
                                        currency: item.currency || 'USD',
                                        strategy: 'UNEXPECTED_HIKE',
                                        userReason: `SubShield detected an unauthorized price jump of +${item.percentIncrease}% from original baseline of ${item.currency} ${item.baseAmount}.`
                                    })}
                                    style={{
                                        background: '#4f46e5',
                                        color: '#fff',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
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
                                    <span>Dispute with AI</span>
                                    <ArrowUpRight size={13} />
                                </button>
                            )}

                            {item.type === 'DUPLICATE_BILLING' && (
                                <button
                                    onClick={() => onOpenAiAssistant({
                                        name: item.subscriptionName,
                                        amount: item.amount,
                                        currency: item.currency || 'USD',
                                        strategy: 'FTC_DARK_PATTERN',
                                        userReason: `Duplicate recurring billing detected on duplicate account.`
                                    })}
                                    style={{
                                        background: '#d97706',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '7px 14px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Resolve Duplicate
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
