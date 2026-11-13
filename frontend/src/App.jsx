import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    addMockSubscription,
    getSubscriptions,
    getAnalyticsSummary,
    getAgentInsights
} from './services/api';

const EMPTY_MOCK_FORM = {
    name: '',
    amount: '',
    currency: 'INR',
    billing_cycle: 'MONTHLY',
    category: 'Other'
};

const formatAmount = (amount, currency) => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) return '—';

    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency || 'USD'
        }).format(numericAmount);
    } catch {
        return `${numericAmount.toFixed(2)} ${currency || ''}`.trim();
    }
};

export default function App() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [insights, setInsights] = useState(null);
    const [budgetLimit, setBudgetLimit] = useState(50);
    const [loading, setLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState('');
    const [loadErrors, setLoadErrors] = useState([]);
    const [showMockForm, setShowMockForm] = useState(false);
    const [mockForm, setMockForm] = useState({ ...EMPTY_MOCK_FORM });
    const [savingMock, setSavingMock] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        const loadData = async () => {
            const results = await Promise.allSettled([
                getSubscriptions(),
                getAnalyticsSummary(),
                getAgentInsights(budgetLimit)
            ]);
            if (!isCurrent) return;

            const errors = [];
            const [subscriptionsResult, analyticsResult, insightsResult] = results;

            if (subscriptionsResult.status === 'fulfilled' &&
                Array.isArray(subscriptionsResult.value.subscriptions)) {
                setSubscriptions(subscriptionsResult.value.subscriptions);
            } else {
                errors.push('Could not load subscriptions.');
            }

            if (analyticsResult.status === 'fulfilled' && analyticsResult.value.analytics) {
                setAnalytics(analyticsResult.value.analytics);
            } else {
                errors.push('Could not load analytics.');
            }

            if (insightsResult.status === 'fulfilled' && insightsResult.value.agent_analysis) {
                setInsights(insightsResult.value.agent_analysis);
            } else {
                errors.push('Budget insights are unavailable.');
            }

            setLoadErrors(errors);
            setLoading(false);
        };

        loadData();
        return () => {
            isCurrent = false;
        };
    }, [budgetLimit, refreshKey]);

    useEffect(() => {
        const refreshOnFocus = () => setRefreshKey((currentKey) => currentKey + 1);
        window.addEventListener('focus', refreshOnFocus);
        return () => window.removeEventListener('focus', refreshOnFocus);
    }, []);

    // Handle subscription cancellation action
    const handleCancel = async (paypalSubId) => {
        if (!confirm(`Are you sure you want to cancel subscription ${paypalSubId}?`)) return;
        try {
            await axios.post(`/api/subscriptions/cancel-subscription/${paypalSubId}`);
            setActionMessage(`Successfully cancelled subscription: ${paypalSubId}`);
            setRefreshKey((currentKey) => currentKey + 1);
        } catch (err) {
            console.error("Failed to cancel subscription", err);
            setActionMessage(err.response?.data?.error || 'Could not cancel this subscription.');
        }
    };

    const handleAddMock = async (event) => {
        event.preventDefault();
        setSavingMock(true);
        setActionMessage('');

        try {
            await addMockSubscription({
                ...mockForm,
                amount: Number(mockForm.amount)
            });
            setMockForm({ ...EMPTY_MOCK_FORM });
            setShowMockForm(false);
            setActionMessage('Mock subscription added.');
            setRefreshKey((currentKey) => currentKey + 1);
        } catch (err) {
            setActionMessage(err.response?.data?.error || 'Could not add the mock subscription.');
        } finally {
            setSavingMock(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading SubShield Dashboard...</div>;

    return (
        <div style={{ padding: '40px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', maxWidth: '1000px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
            
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                <div>
                    <h1 style={{ color: '#0f172a', margin: 0 }}>🛡️ SubShield</h1>
                    <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>AI-Powered Subscription Tracking & Budget Manager</p>
                </div>
                <div>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                        ● Live Sandbox Active
                    </span>
                </div>
            </header>

            {actionMessage && (
                <div style={{ padding: '12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bae6fd' }}>
                    {actionMessage}
                </div>
            )}
            {loadErrors.length > 0 && (
                <div role="alert" style={{ padding: '12px', background: '#fff7ed', color: '#9a3412', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fed7aa' }}>
                    {loadErrors.join(' ')}
                </div>
            )}

            {/* Analytics Summary Cards */}
            {analytics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ padding: '24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Monthly Spend</h4>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                            ${analytics.totalMonthlySpend.toFixed(2)}
                        </p>
                    </div>
                    <div style={{ padding: '24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Active Subscriptions</h4>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                            {analytics.activeSubscriptionsCount} <span style={{ fontSize: '16px', color: '#64748b', fontWeight: 'normal' }}>/ {analytics.totalSubscriptionsCount} total</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Budget Control & AI Agent Insights */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#4338ca' }}>🤖 AI Budget Advisor</h3>
                    <div>
                        <label style={{ marginRight: '10px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                            Monthly Budget Limit ($): 
                        </label>
                        <input 
                            type="number" 
                            value={budgetLimit} 
                            onChange={(e) => setBudgetLimit(Number(e.target.value))}
                            style={{ padding: '6px 10px', width: '80px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                </div>

                {insights && (
                    <div style={{ background: '#eef2ff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                        <p style={{ fontWeight: '600', color: '#312e81', margin: '0 0 8px 0' }}>{insights.status}</p>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151' }}>
                            {insights.recommendations.map((rec, index) => (
                                <li key={index} style={{ marginBottom: '4px' }}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Subscriptions Table */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>Subscription Records</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={() => setRefreshKey((currentKey) => currentKey + 1)}
                            style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Refresh
                        </button>
                        {import.meta.env.DEV && (
                            <button
                                type="button"
                                onClick={() => setShowMockForm(!showMockForm)}
                                style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                {showMockForm ? 'Close' : 'Add mock subscription'}
                            </button>
                        )}
                    </div>
                </div>
                {showMockForm && import.meta.env.DEV && (
                    <form onSubmit={handleAddMock} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', padding: '16px', marginBottom: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <label style={{ display: 'grid', gap: '5px', color: '#475569', fontSize: '14px' }}>
                            Service name
                            <input
                                required
                                value={mockForm.name}
                                onChange={(event) => setMockForm({ ...mockForm, name: event.target.value })}
                                style={{ padding: '9px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </label>
                        <label style={{ display: 'grid', gap: '5px', color: '#475569', fontSize: '14px' }}>
                            Amount
                            <input
                                required
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={mockForm.amount}
                                onChange={(event) => setMockForm({ ...mockForm, amount: event.target.value })}
                                style={{ padding: '9px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </label>
                        <label style={{ display: 'grid', gap: '5px', color: '#475569', fontSize: '14px' }}>
                            Currency
                            <select
                                value={mockForm.currency}
                                onChange={(event) => setMockForm({ ...mockForm, currency: event.target.value })}
                                style={{ padding: '9px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            >
                                <option value="INR">INR</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </label>
                        <label style={{ display: 'grid', gap: '5px', color: '#475569', fontSize: '14px' }}>
                            Billing cycle
                            <select
                                value={mockForm.billing_cycle}
                                onChange={(event) => setMockForm({ ...mockForm, billing_cycle: event.target.value })}
                                style={{ padding: '9px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                        </label>
                        <label style={{ display: 'grid', gap: '5px', color: '#475569', fontSize: '14px' }}>
                            Category
                            <input
                                value={mockForm.category}
                                onChange={(event) => setMockForm({ ...mockForm, category: event.target.value })}
                                style={{ padding: '9px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={savingMock}
                            style={{ alignSelf: 'end', background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: savingMock ? 'wait' : 'pointer', fontWeight: '600' }}
                        >
                            {savingMock ? 'Saving...' : 'Save mock'}
                        </button>
                    </form>
                )}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '14px' }}>
                                <th style={{ padding: '12px' }}>Subscription</th>
                                <th style={{ padding: '12px' }}>Billing cycle</th>
                                <th style={{ padding: '12px' }}>Amount</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                        No subscriptions found. Run your seed script or create one via API!
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                <tr key={sub.id ?? sub.paypal_sub_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px', fontWeight: '600', color: '#1e293b' }}>{sub.name || sub.merchant_name || sub.plan_name || 'Unnamed subscription'}</td>
                                    <td style={{ padding: '14px', color: '#64748b' }}>{sub.billing_cycle || sub.interval || '—'}</td>
                                    <td style={{ padding: '14px', fontWeight: '500' }}>{formatAmount(sub.amount, sub.currency)}</td>
                                        <td style={{ padding: '14px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                background: sub.status === 'ACTIVE' ? '#dcfce7' : '#fef3c7',
                                                color: sub.status === 'ACTIVE' ? '#166534' : '#92400e'
                                            }}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px' }}>
                                            {sub.paypal_sub_id && sub.status === 'ACTIVE' ? (
                                                <button 
                                                    onClick={() => handleCancel(sub.paypal_sub_id)}
                                                    style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                                                >
                                                    Cancel
                                                </button>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}