import React, { useState } from 'react';

const CATEGORIES = [
    'Entertainment',
    'Music',
    'Productivity',
    'Cloud & Dev',
    'Fitness',
    'Utilities',
    'AI Tools',
    'News & Media',
    'Other'
];

export default function AddSubscriptionModal({ isOpen, onClose, onAdd }) {
    const today = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        name: '',
        amount: '',
        currency: 'USD',
        billing_cycle: 'MONTHLY',
        category: 'Entertainment',
        historical_base_amount: '',
        usage_count: '10',
        last_used_date: today,
        paypal_sub_id: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) {
            setError('Service name is required.');
            return;
        }
        if (!form.amount || Number(form.amount) <= 0) {
            setError('Amount must be a positive number.');
            return;
        }

        setSubmitting(true);
        try {
            await onAdd({
                name: form.name.trim(),
                amount: Number(form.amount),
                currency: form.currency,
                billing_cycle: form.billing_cycle,
                category: form.category,
                historical_base_amount: form.historical_base_amount ? Number(form.historical_base_amount) : Number(form.amount),
                usage_count: Number(form.usage_count) || 0,
                last_used_date: form.last_used_date || today,
                paypal_sub_id: form.paypal_sub_id.trim() || undefined
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to add subscription.');
        } finally {
            setSubmitting(false);
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
            zIndex: 105,
            padding: '20px'
        }}>
            <div style={{
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '520px',
                padding: '28px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
                color: '#f9fafb'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '22px' }}>➕</span>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Add Tracked Subscription</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' }}
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9ca3af', marginBottom: '4px' }}>
                            Service Name *
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Netflix, Spotify, Figma, Gym Pass"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9ca3af', marginBottom: '4px' }}>
                                Amount *
                            </label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="15.99"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9ca3af', marginBottom: '4px' }}>
                                Currency
                            </label>
                            <select
                                value={form.currency}
                                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="INR">INR (₹)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9ca3af', marginBottom: '4px' }}>
                                Billing Cycle
                            </label>
                            <select
                                value={form.billing_cycle}
                                onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="WEEKLY">Weekly</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9ca3af', marginBottom: '4px' }}>
                                Category
                            </label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px'
                                }}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Advanced Feature Inputs: Price Hike Baseline & Cost-Per-Use */}
                    <div style={{ background: '#1f2937', padding: '14px', borderRadius: '10px', border: '1px solid #374151' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#818cf8', textTransform: 'uppercase', marginBottom: '10px' }}>
                            ⚡ Advanced Competitive Feature Settings
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: '#d1d5db', marginBottom: '3px' }}>
                                    Historical Base Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Baseline (e.g. 12.99)"
                                    value={form.historical_base_amount}
                                    onChange={(e) => setForm({ ...form, historical_base_amount: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        background: '#111827',
                                        border: '1px solid #4b5563',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '12px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: '#d1d5db', marginBottom: '3px' }}>
                                    Monthly Usage Count
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Uses/month"
                                    value={form.usage_count}
                                    onChange={(e) => setForm({ ...form, usage_count: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        background: '#111827',
                                        border: '1px solid #4b5563',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '12px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'block', fontSize: '11px', color: '#d1d5db', marginBottom: '3px' }}>
                                Last Used Date (Older than 60 days triggers Zombie alert)
                            </label>
                            <input
                                type="date"
                                value={form.last_used_date}
                                onChange={(e) => setForm({ ...form, last_used_date: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    background: '#111827',
                                    border: '1px solid #4b5563',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '12px'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: submitting ? 'wait' : 'pointer',
                            marginTop: '8px'
                        }}
                    >
                        {submitting ? 'Saving...' : 'Add to Shield'}
                    </button>
                </form>
            </div>
        </div>
    );
}

