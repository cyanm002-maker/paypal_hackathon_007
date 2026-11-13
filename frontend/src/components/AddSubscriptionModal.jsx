import React, { useState } from 'react';
import { Plus, X, Zap, Calendar, DollarSign, Activity } from 'lucide-react';

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
            setError(err.response?.data?.error || err.message || 'Failed to add subscription.');
        } finally {
            setSubmitting(false);
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
            zIndex: 110,
            padding: '20px'
        }}>
            <div style={{
                background: '#0d131f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '520px',
                padding: '28px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
                color: '#f8fafc'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(79, 70, 229, 0.15)',
                            border: '1px solid rgba(79, 70, 229, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#818cf8'
                        }}>
                            <Plus size={18} strokeWidth={2.4} />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0, color: '#f8fafc' }}>Add Subscription</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                            Service Identifier *
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Netflix, Spotify, Figma, GitHub Copilot"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: '#121826',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '13px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                                Renewal Rate *
                            </label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="19.99"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#121826',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '13px',
                                    fontFamily: 'var(--font-mono)'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                                Currency
                            </label>
                            <select
                                value={form.currency}
                                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#121826',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '13px'
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
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                                Cycle
                            </label>
                            <select
                                value={form.billing_cycle}
                                onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#121826',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '13px'
                                }}
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="WEEKLY">Weekly</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                                Domain Category
                            </label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#121826',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '13px'
                                }}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Advanced Feature Settings */}
                    <div style={{ background: '#121826', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '10px' }}>
                            Advanced ROI & Baseline Tracking
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '3px' }}>
                                    Historical Base Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Initial rate (e.g. 14.99)"
                                    value={form.historical_base_amount}
                                    onChange={(e) => setForm({ ...form, historical_base_amount: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        background: '#090d16',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '12px',
                                        fontFamily: 'var(--font-mono)'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '3px' }}>
                                    Monthly Sessions
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Uses / mo"
                                    value={form.usage_count}
                                    onChange={(e) => setForm({ ...form, usage_count: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        background: '#090d16',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '12px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '3px' }}>
                                Last Active Date (Older than 60 days flags as dormant)
                            </label>
                            <input
                                type="date"
                                value={form.last_used_date}
                                onChange={(e) => setForm({ ...form, last_used_date: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    background: '#090d16',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
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
                            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: submitting ? 'wait' : 'pointer',
                            marginTop: '6px',
                            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
                        }}
                    >
                        {submitting ? 'Registering...' : 'Add to Defense Portfolio'}
                    </button>
                </form>
            </div>
        </div>
    );
}
