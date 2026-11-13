import React, { useState } from 'react';
import { 
    RefreshCw, 
    Clock, 
    Bot, 
    Plus, 
    Flame, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle2, 
    Layers, 
    Search, 
    Trash2, 
    Activity, 
    DollarSign, 
    CreditCard, 
    ArrowUpRight,
    SlidersHorizontal
} from 'lucide-react';
import AnomalyBanner from './AnomalyBanner';

export default function DashboardView({
    subscriptions = [],
    analytics,
    insights,
    anomalies = [],
    roiData,
    budgetLimit,
    onUpdateBudget,
    onAddClick,
    onOpenAiAssistant,
    onOpenRoiModal,
    onLogUsage,
    onCancelSubscription,
    onDeleteSubscription,
    onRefresh
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'ZOMBIE' | 'CANCELLED'
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [editingBudget, setEditingBudget] = useState(false);
    const [tempBudget, setTempBudget] = useState(budgetLimit);

    // Calculate spend & budget progress
    const totalSpend = analytics?.totalMonthlySpend ?? subscriptions
        .filter(s => s.status === 'ACTIVE')
        .reduce((acc, s) => acc + Number(s.amount || 0), 0);

    const budgetPercent = budgetLimit > 0 ? Math.min(Math.round((totalSpend / budgetLimit) * 100), 100) : 0;
    const isOverBudget = totalSpend > budgetLimit;

    // Filter subscriptions
    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sub.category && sub.category.toLowerCase().includes(searchQuery.toLowerCase()));

        const daysIdle = sub.last_used_date 
            ? Math.floor(Math.abs(new Date() - new Date(sub.last_used_date)) / (1000 * 60 * 60 * 24))
            : 90;
        const isZombie = (daysIdle >= 60 || (sub.usage_count === 0 && daysIdle >= 30)) && sub.status === 'ACTIVE';

        let matchesStatus = true;
        if (statusFilter === 'ACTIVE') matchesStatus = sub.status === 'ACTIVE';
        if (statusFilter === 'CANCELLED') matchesStatus = sub.status === 'CANCELLED';
        if (statusFilter === 'ZOMBIE') matchesStatus = isZombie;

        const matchesCat = selectedCategory === 'ALL' || sub.category === selectedCategory;

        return matchesSearch && matchesStatus && matchesCat;
    });

    const categories = ['ALL', ...new Set(subscriptions.map(s => s.category).filter(Boolean))];

    const handleSaveBudget = (e) => {
        e.preventDefault();
        onUpdateBudget(Number(tempBudget));
        setEditingBudget(false);
    };

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 28px', width: '100%' }}>
            {/* Top Bar with Page Title & Primary Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: 0, letterSpacing: '-0.5px' }}>
                        Subscription Defense Dashboard
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
                        Real-time burn rate, dark-pattern detection, and engagement ROI metrics
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={onRefresh}
                        style={{
                            background: '#121826',
                            color: '#94a3b8',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <RefreshCw size={13} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={onOpenRoiModal}
                        style={{
                            background: 'rgba(139, 92, 246, 0.12)',
                            color: '#c084fc',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Clock size={13} />
                        <span>Cost-Per-Use & Dormant</span>
                        {roiData?.zombieCount > 0 && (
                            <span style={{ background: '#e11d48', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontFamily: 'var(--font-mono)' }}>
                                {roiData.zombieCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => onOpenAiAssistant()}
                        style={{
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: '#a5b4fc',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <Bot size={13} />
                        <span>AI Assistant</span>
                    </button>
                    <button
                        onClick={onAddClick}
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(79, 70, 229, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <Plus size={14} />
                        <span>Add Subscription</span>
                    </button>
                </div>
            </div>

            {/* Smart Anomaly & Price-Hike Banner */}
            <AnomalyBanner anomalies={anomalies} onOpenAiAssistant={onOpenAiAssistant} />

            {/* Top Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '28px' }}>
                {/* Metric 1: Monthly Burn Rate */}
                <div style={{ background: '#0d131f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        <span>Monthly Burn Rate</span>
                        <Flame size={16} color="#fb7185" />
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#f8fafc', marginTop: '8px' }}>
                        ${totalSpend.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        Annualized Commitments: <strong style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>${(totalSpend * 12).toFixed(2)}/yr</strong>
                    </div>
                </div>

                {/* Metric 2: Budget Limit Tracker */}
                <div style={{ background: '#0d131f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            Budget Limit Ceiling
                        </span>
                        <button
                            onClick={() => { setTempBudget(budgetLimit); setEditingBudget(!editingBudget); }}
                            style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '11.5px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            {editingBudget ? 'Cancel' : 'Edit Limit'}
                        </button>
                    </div>

                    {editingBudget ? (
                        <form onSubmit={handleSaveBudget} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <input
                                type="number"
                                step="5"
                                min="10"
                                value={tempBudget}
                                onChange={(e) => setTempBudget(e.target.value)}
                                style={{ width: '85px', padding: '6px 10px', background: '#121826', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                            />
                            <button
                                type="submit"
                                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Save
                            </button>
                        </form>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
                            <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: isOverBudget ? '#fb7185' : '#10b981' }}>
                                ${totalSpend.toFixed(2)}
                            </span>
                            <span style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                                / ${budgetLimit.toFixed(2)}
                            </span>
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: '#172033', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${budgetPercent}%`,
                            height: '100%',
                            background: isOverBudget ? '#f43f5e' : (budgetPercent > 80 ? '#f59e0b' : '#10b981'),
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>

                    <div style={{ fontSize: '12px', color: isOverBudget ? '#fb7185' : '#94a3b8', marginTop: '6px' }}>
                        {isOverBudget 
                            ? `Exceeded by $${(totalSpend - budgetLimit).toFixed(2)}`
                            : `$${(budgetLimit - totalSpend).toFixed(2)} headroom remaining (${100 - budgetPercent}%)`}
                    </div>
                </div>

                {/* Metric 3: Active Subscriptions */}
                <div style={{ background: '#0d131f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        <span>Monitored Services</span>
                        <Layers size={16} color="#818cf8" />
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#f8fafc', marginTop: '8px' }}>
                        {subscriptions.filter(s => s.status === 'ACTIVE').length} <span style={{ fontSize: '15px', fontWeight: 'normal', color: '#94a3b8', fontFamily: 'var(--font-sans)' }}>/ {subscriptions.length} total</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        Distributed across {analytics?.categoryBreakdown?.length || 3} categories
                    </div>
                </div>

                {/* Metric 4: Dormant Inactivity Card */}
                <div
                    onClick={onOpenRoiModal}
                    style={{
                        background: (roiData?.zombieCount || 0) > 0 ? 'rgba(244, 63, 94, 0.06)' : '#0d131f',
                        border: (roiData?.zombieCount || 0) > 0 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        padding: '22px',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: (roiData?.zombieCount || 0) > 0 ? '#fb7185' : '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        <span>Dormant Accounts (&gt;60d)</span>
                        <Clock size={16} color={ (roiData?.zombieCount || 0) > 0 ? '#fb7185' : '#94a3b8' } />
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: (roiData?.zombieCount || 0) > 0 ? '#fb7185' : '#10b981', marginTop: '8px' }}>
                        {roiData?.zombieCount ?? 0}
                    </div>
                    <div style={{ fontSize: '12px', color: (roiData?.zombieCount || 0) > 0 ? '#fca5a5' : '#94a3b8', marginTop: '4px' }}>
                        {(roiData?.zombieCount || 0) > 0
                            ? `$${roiData?.totalZombieWasteMonthly?.toFixed(2)}/mo recoverable ($${roiData?.potentialAnnualSavings?.toFixed(2)}/yr). Click to audit.`
                            : 'All active subscriptions show recent engagement.'}
                    </div>
                </div>
            </div>

            {/* AI Advisor Panel */}
            {insights && (
                <div style={{
                    background: '#0d131f',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    marginBottom: '28px',
                    borderLeft: '4px solid #6366f1'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Bot size={17} color="#818cf8" />
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#a5b4fc', margin: 0, letterSpacing: '-0.2px' }}>
                            SubShield AI Strategic Budget Advisor
                        </h3>
                    </div>
                    <p style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '13.5px', margin: '0 0 6px 0' }}>
                        {insights.status}
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {insights.recommendations?.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Subscriptions Table & Filter Bar */}
            <div style={{ background: '#0d131f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: '1 1 300px' }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative', width: '270px' }}>
                            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search by name or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    padding: '8px 12px 8px 34px',
                                    background: '#121826',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '12.5px',
                                    width: '100%'
                                }}
                            />
                        </div>

                        {/* Status Filters */}
                        <div style={{ display: 'flex', background: '#121826', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            {['ALL', 'ACTIVE', 'ZOMBIE', 'CANCELLED'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    style={{
                                        background: statusFilter === st ? '#4f46e5' : 'transparent',
                                        color: statusFilter === st ? '#fff' : '#94a3b8',
                                        border: 'none',
                                        padding: '5px 12px',
                                        borderRadius: '6px',
                                        fontSize: '11.5px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {st === 'ZOMBIE' ? 'Dormant' : st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Category:</span>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                                padding: '7px 12px',
                                background: '#121826',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '12.5px'
                            }}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Subscriptions Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <th style={{ padding: '12px 14px' }}>Service Name</th>
                                <th style={{ padding: '12px 14px' }}>Billing Cycle</th>
                                <th style={{ padding: '12px 14px' }}>Renewal Cost</th>
                                <th style={{ padding: '12px 14px' }}>Cost-Per-Use ROI</th>
                                <th style={{ padding: '12px 14px' }}>Activity Tracker</th>
                                <th style={{ padding: '12px 14px' }}>Status</th>
                                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Defense Action</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '13px' }}>
                            {filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                        No matching subscriptions found. Click "+ Add Subscription" to register a service.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscriptions.map((sub) => {
                                    const uses = Number(sub.usage_count) || 0;
                                    const amount = Number(sub.amount) || 0;
                                    const costPerUse = uses > 0 ? (amount / uses).toFixed(2) : amount.toFixed(2);
                                    
                                    const daysIdle = sub.last_used_date 
                                        ? Math.floor(Math.abs(new Date() - new Date(sub.last_used_date)) / (1000 * 60 * 60 * 24))
                                        : 90;
                                    const isZombie = (daysIdle >= 60 || (uses === 0 && daysIdle >= 30)) && sub.status === 'ACTIVE';

                                    const baseAmount = Number(sub.historical_base_amount);
                                    const hasPriceHike = baseAmount && amount > baseAmount;
                                    const hikePct = hasPriceHike ? Math.round(((amount - baseAmount) / baseAmount) * 100) : 0;

                                    return (
                                        <tr
                                            key={sub.id || sub.paypal_sub_id}
                                            style={{
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                                background: isZombie ? 'rgba(244, 63, 94, 0.03)' : 'transparent'
                                            }}
                                        >
                                            {/* Service Name & Category */}
                                            <td style={{ padding: '14px' }}>
                                                <div style={{ fontWeight: '600', color: '#f8fafc' }}>
                                                    {sub.name}
                                                </div>
                                                <span style={{
                                                    fontSize: '11px',
                                                    color: '#94a3b8',
                                                    background: '#121826',
                                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    display: 'inline-block',
                                                    marginTop: '4px'
                                                }}>
                                                    {sub.category || 'Other'}
                                                </span>
                                            </td>

                                            {/* Billing Cycle */}
                                            <td style={{ padding: '14px', color: '#94a3b8' }}>
                                                {sub.billing_cycle || 'MONTHLY'}
                                            </td>

                                            {/* Cost & Baseline */}
                                            <td style={{ padding: '14px' }}>
                                                <div style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#f1f5f9' }}>
                                                    ${amount.toFixed(2)}
                                                </div>
                                                {hasPriceHike && (
                                                    <div style={{ fontSize: '11px', color: '#fb7185', fontWeight: '600', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <TrendingUp size={11} />
                                                        <span>+{hikePct}% hike (was ${baseAmount.toFixed(2)})</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Cost-Per-Use ROI */}
                                            <td style={{ padding: '14px' }}>
                                                <div style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', color: isZombie ? '#fb7185' : '#10b981' }}>
                                                    ${costPerUse} <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-sans)', fontWeight: 'normal' }}>/ use</span>
                                                </div>
                                                <div style={{ marginTop: '3px' }}>
                                                    {isZombie ? (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: '700',
                                                            background: 'rgba(244, 63, 94, 0.15)',
                                                            color: '#fb7185',
                                                            border: '1px solid rgba(244, 63, 94, 0.3)',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            DORMANT ({daysIdle}d)
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: '600',
                                                            background: uses >= 10 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                                                            color: uses >= 10 ? '#34d399' : '#60a5fa',
                                                            border: uses >= 10 ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(59, 130, 246, 0.25)',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            {uses >= 10 ? 'High ROI' : 'Moderate ROI'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Activity Tracker */}
                                            <td style={{ padding: '14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
                                                        {uses} uses
                                                    </span>
                                                    <button
                                                        onClick={() => onLogUsage(sub.id, uses)}
                                                        title="Log active session for today"
                                                        style={{
                                                            background: '#172033',
                                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                                            color: '#a5b4fc',
                                                            padding: '3px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '3px'
                                                        }}
                                                    >
                                                        <Activity size={11} />
                                                        <span>+1 Use</span>
                                                    </button>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                                                    Last: {sub.last_used_date || 'None'}
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td style={{ padding: '14px' }}>
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    letterSpacing: '0.3px',
                                                    background: sub.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                                                    color: sub.status === 'ACTIVE' ? '#34d399' : '#fb7185',
                                                    border: sub.status === 'ACTIVE' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(244, 63, 94, 0.25)'
                                                }}>
                                                    {sub.status}
                                                </span>
                                            </td>

                                            {/* Action Buttons */}
                                            <td style={{ padding: '14px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                                    {/* AI Assistant Button */}
                                                    <button
                                                        onClick={() => onOpenAiAssistant({
                                                            id: sub.id,
                                                            name: sub.name,
                                                            amount: sub.amount,
                                                            currency: sub.currency,
                                                            strategy: isZombie ? 'ZOMBIE_INACTIVITY' : (hasPriceHike ? 'UNEXPECTED_HIKE' : 'FTC_DARK_PATTERN')
                                                        })}
                                                        title="Generate AI cancellation or negotiation notice"
                                                        style={{
                                                            background: '#4f46e5',
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '11.5px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <Bot size={13} />
                                                        <span>AI Assist</span>
                                                    </button>

                                                    {/* Cancel PayPal */}
                                                    {sub.status === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => onCancelSubscription(sub.paypal_sub_id || sub.id, sub.name)}
                                                            style={{
                                                                background: 'rgba(244, 63, 94, 0.08)',
                                                                color: '#fb7185',
                                                                border: '1px solid rgba(244, 63, 94, 0.25)',
                                                                padding: '6px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '11.5px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => onDeleteSubscription(sub.id)}
                                                        title="Delete subscription"
                                                        style={{
                                                            background: 'transparent',
                                                            color: '#64748b',
                                                            border: 'none',
                                                            padding: '6px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
