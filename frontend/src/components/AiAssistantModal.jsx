import React, { useState, useEffect } from 'react';
import { 
    Bot, 
    X, 
    Mail, 
    MessageSquare, 
    Shield, 
    Copy, 
    Check, 
    Sparkles, 
    Scale, 
    RotateCcw 
} from 'lucide-react';
import { generateCancellationScript } from '../services/api';

export default function AiAssistantModal({ isOpen, onClose, initialData = null, subscriptions = [], onMarkCancelled }) {
    const [selectedSubId, setSelectedSubId] = useState(initialData?.id || '');
    const [serviceName, setServiceName] = useState(initialData?.name || '');
    const [amount, setAmount] = useState(initialData?.amount || '');
    const [currency, setCurrency] = useState(initialData?.currency || 'USD');
    const [strategy, setStrategy] = useState(initialData?.strategy || 'FTC_DARK_PATTERN');
    const [tone, setTone] = useState('FIRM_LEGAL');
    const [userReason, setUserReason] = useState(initialData?.userReason || '');
    
    const [loading, setLoading] = useState(false);
    const [generatedScript, setGeneratedScript] = useState(null);
    const [activeTab, setActiveTab] = useState('email'); // 'email' | 'livechat' | 'playbook'
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (initialData) {
            setServiceName(initialData.name || '');
            setAmount(initialData.amount || '');
            setCurrency(initialData.currency || 'USD');
            if (initialData.strategy) setStrategy(initialData.strategy);
            if (initialData.userReason) setUserReason(initialData.userReason);
        } else if (subscriptions.length > 0 && !serviceName) {
            const first = subscriptions[0];
            setSelectedSubId(first.id);
            setServiceName(first.name);
            setAmount(first.amount);
            setCurrency(first.currency || 'USD');
        }
    }, [initialData, subscriptions]);

    const handleSelectChange = (e) => {
        const id = e.target.value;
        setSelectedSubId(id);
        const sub = subscriptions.find(s => String(s.id) === String(id));
        if (sub) {
            setServiceName(sub.name);
            setAmount(sub.amount);
            setCurrency(sub.currency || 'USD');
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setCopied(false);
        try {
            const res = await generateCancellationScript({
                serviceName: serviceName || 'Service',
                amount: amount || '19.99',
                currency: currency || 'USD',
                strategy,
                tone,
                userReason
            });
            if (res?.script) {
                setGeneratedScript(res.script);
            }
        } catch (err) {
            console.error('Failed to generate script:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate on open if serviceName present
    useEffect(() => {
        if (isOpen && serviceName) {
            handleGenerate();
        }
    }, [isOpen]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (!isOpen) return null;

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
                maxWidth: '780px',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
                color: '#f8fafc',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Modal Header */}
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
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#818cf8'
                        }}>
                            <Bot size={18} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                                AI Cancellation & Negotiation Assistant
                            </h2>
                            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                                FTC Click-to-Cancel dark pattern bypass & automated retention negotiation
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

                {/* Configuration Bar */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: '#090d16' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                                Target Subscription
                            </label>
                            {subscriptions.length > 0 ? (
                                <select
                                    value={selectedSubId}
                                    onChange={handleSelectChange}
                                    style={{
                                        width: '100%',
                                        padding: '9px 12px',
                                        background: '#121826',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '13px'
                                    }}
                                >
                                    {subscriptions.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.currency} {s.amount})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    placeholder="Service name (e.g. Adobe, Gym, Netflix)"
                                    style={{
                                        width: '100%',
                                        padding: '9px 12px',
                                        background: '#121826',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '13px'
                                    }}
                                />
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                                Strategy Directive
                            </label>
                            <select
                                value={strategy}
                                onChange={(e) => setStrategy(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '9px 12px',
                                    background: '#121826',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '13px'
                                }}
                            >
                                <option value="FTC_DARK_PATTERN">Bypass Dark Pattern (FTC Click-to-Cancel)</option>
                                <option value="RETENTION_DISCOUNT">Negotiate 50% Retention Discount</option>
                                <option value="UNEXPECTED_HIKE">Dispute Unauthorized Price Increase</option>
                                <option value="ZOMBIE_INACTIVITY">Decommission Dormant Account</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                                Communication Tone
                            </label>
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '9px 12px',
                                    background: '#121826',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '13px'
                                }}
                            >
                                <option value="FIRM_LEGAL">Strict Legal (FTC Statutory Citations)</option>
                                <option value="POLITE_PERSUASIVE">Polite & Promotional Matching</option>
                                <option value="STUDENT_HARDSHIP">Financial Hardship / Downgrade</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Optional custom context (e.g. found cheaper alternative, didn't agree to price hike)..."
                            value={userReason}
                            onChange={(e) => setUserReason(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '9px 12px',
                                background: '#121826',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '13px'
                            }}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            style={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                padding: '9px 18px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: loading ? 'wait' : 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Sparkles size={14} />
                            <span>{loading ? 'Synthesizing...' : 'Regenerate Script'}</span>
                        </button>
                    </div>
                </div>

                {/* Script Display Tabs */}
                {generatedScript && (
                    <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Tab Switcher */}
                        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
                            <button
                                onClick={() => setActiveTab('email')}
                                style={{
                                    background: activeTab === 'email' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    color: activeTab === 'email' ? '#fff' : '#94a3b8',
                                    border: 'none',
                                    padding: '7px 14px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Mail size={14} />
                                <span>Formal Notice Letter</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('livechat')}
                                style={{
                                    background: activeTab === 'livechat' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    color: activeTab === 'livechat' ? '#fff' : '#94a3b8',
                                    border: 'none',
                                    padding: '7px 14px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <MessageSquare size={14} />
                                <span>Live Chat Rebuttals</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('playbook')}
                                style={{
                                    background: activeTab === 'playbook' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    color: activeTab === 'playbook' ? '#fff' : '#94a3b8',
                                    border: 'none',
                                    padding: '7px 14px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Shield size={14} />
                                <span>Dark Pattern Playbook</span>
                            </button>
                        </div>

                        {/* Tab 1: Formal Email */}
                        {activeTab === 'email' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ background: '#121826', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Subject Line:</span>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#a5b4fc', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                                        {generatedScript.subject}
                                    </div>
                                </div>

                                <textarea
                                    readOnly
                                    value={generatedScript.emailBody}
                                    rows={11}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: '#07090e',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '8px',
                                        color: '#cbd5e1',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '12.5px',
                                        lineHeight: '1.65',
                                        resize: 'vertical'
                                    }}
                                />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '8px' }}>
                                    <button
                                        onClick={() => copyToClipboard(`Subject: ${generatedScript.subject}\n\n${generatedScript.emailBody}`)}
                                        style={{
                                            background: copied ? '#059669' : '#4f46e5',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '10px 18px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '7px'
                                        }}
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        <span>{copied ? 'Copied to Clipboard' : 'Copy Full Script'}</span>
                                    </button>

                                    {onMarkCancelled && selectedSubId && (
                                        <button
                                            onClick={() => {
                                                onMarkCancelled(selectedSubId);
                                                onClose();
                                            }}
                                            style={{
                                                background: 'rgba(244, 63, 94, 0.1)',
                                                color: '#fb7185',
                                                border: '1px solid rgba(244, 63, 94, 0.25)',
                                                padding: '9px 15px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Mark as Cancelled in SubShield
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Live Chat Rebuttals */}
                        {activeTab === 'livechat' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                                    Copy and paste these verified counter-responses when customer support reps deploy retention delay tactics:
                                </p>
                                {generatedScript.liveChatScript?.map((step, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            background: step.role.includes('Agent') ? '#121826' : 'rgba(79, 70, 229, 0.12)',
                                            border: step.role.includes('Agent') ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(99, 102, 241, 0.35)',
                                            marginLeft: step.role.includes('Agent') ? '0' : '20px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: step.role.includes('Agent') ? '#94a3b8' : '#a5b4fc' }}>
                                                {step.role}
                                            </span>
                                            {!step.role.includes('Agent') && (
                                                <button
                                                    onClick={() => copyToClipboard(step.text)}
                                                    style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <Copy size={11} />
                                                    <span>Copy</span>
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#f1f5f9', lineHeight: '1.45' }}>
                                            {step.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tab 3: P