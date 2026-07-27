/**
 * PaymentMethodSelector — checkout component for selecting an online payment method.
 * Renders all active payment methods as selectable cards with bank icons,
 * account details, copy buttons, and QR code display.
 */
import { useState } from "react";
import { FiCopy, FiCheck, FiChevronDown } from "react-icons/fi";
import { FaQrcode } from "react-icons/fa";
import { getBankIcon } from "../../utils/bankIcons";

const CopyButton = ({ value, label }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };
    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy ${label}`}
            style={{ color: 'var(--text-secondary)' }}
            className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all hover:opacity-80"
        >
            {copied ? <FiCheck size={14} style={{ color: 'var(--success)' }} /> : <FiCopy size={14} />}
        </button>
    );
};

const DetailRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="group flex items-center justify-between rounded-xl px-4 py-3 transition-all hover:shadow-md border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-medium opacity-60" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{value}</p>
            </div>
            <CopyButton value={value} label={label} />
        </div>
    );
};

const PaymentMethodSelector = ({ methods = [], selectedMethodId, onSelectMethod, paymentInstructions }) => {
    const [expandedQr, setExpandedQr] = useState(null);

    // Filter only enabled methods (excluding Cash on Delivery)
    const activeMethods = methods
        .filter(m => m.enabled && !/cash on delivery/i.test(m.name))
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    if (activeMethods.length === 0) {
        return (
            <div className="flex items-center gap-3 rounded-xl px-4 py-4 text-sm border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>No online payment methods are currently available. Please try Cash on Delivery.</span>
            </div>
        );
    }

    const selected = activeMethods.find(m => m._id === selectedMethodId);

    return (
        <div className="space-y-3">
            {/* Method Selection */}
            <p className="text-xs font-medium uppercase tracking-wider opacity-70" style={{ color: 'var(--text-secondary)' }}>Select Payment Method</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeMethods.map((method) => {
                    const isActive = selectedMethodId === method._id;
                    const iconSrc = getBankIcon(method.icon, method.logo);

                    return (
                        <button
                            key={method._id}
                            type="button"
                            onClick={() => onSelectMethod(method._id)}
                            style={{
                                backgroundColor: isActive ? 'color-mix(in srgb, var(--primary) 8%, var(--card-bg))' : 'var(--card-bg)',
                                borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                            }}
                            className="group relative flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-200"
                        >
                            {isActive && (
                                <div className="absolute -right-1 -top-1">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full shadow-lg" style={{ backgroundColor: 'var(--primary)' }}>
                                        <FiCheck className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                            )}

                            {/* Icon */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden transition-all duration-200 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                                {iconSrc ? (
                                    <img src={iconSrc} alt={method.name} className="h-7 w-7 object-contain" />
                                ) : (
                                    <span className="text-lg font-bold" style={{ color: 'var(--text-secondary)' }}>
                                        {method.name?.charAt(0)?.toUpperCase() || "?"}
                                    </span>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{method.name}</p>
                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{method.type || "Bank"}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selected Method Details */}
            {selected && (
                <div className="mt-3 rounded-xl p-4 sm:p-5 border transition-colors duration-300" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        {(() => {
                            const iconSrc = getBankIcon(selected.icon, selected.logo);
                            return iconSrc ? (
                                <div className="h-10 w-10 rounded-xl shadow-sm border flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                                    <img src={iconSrc} alt={selected.name} className="h-7 w-7 object-contain" />
                                </div>
                            ) : null;
                        })()}
                        <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{selected.name}</p>
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
                                {selected.type || "Bank"}
                            </span>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="grid gap-2.5 sm:grid-cols-2">
                        <DetailRow label="Account Title" value={selected.accountTitle} />
                        <DetailRow label="Account Number" value={selected.accountNumber} />
                        {selected.iban && <DetailRow label="IBAN" value={selected.iban} />}
                    </div>

                    {/* QR Code */}
                    {selected.qrCode && (
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => setExpandedQr(expandedQr === selected._id ? null : selected._id)}
                                style={{ color: 'var(--primary)' }}
                                className="flex items-center gap-2 text-xs font-medium transition hover:opacity-80"
                            >
                                <FaQrcode size={13} />
                                {expandedQr === selected._id ? "Hide QR Code" : "Show QR Code"}
                                <FiChevronDown
                                    size={14}
                                    className={`transition-transform ${expandedQr === selected._id ? "rotate-180" : ""}`}
                                />
                            </button>
                            {expandedQr === selected._id && (
                                <div className="mt-3 flex justify-center">
                                    <div className="rounded-xl border p-3 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                                        <img
                                            src={selected.qrCode}
                                            alt={`${selected.name} QR Code`}
                                            className="max-h-48 w-auto object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Payment Instructions */}
            {paymentInstructions && (
                <div className="mt-3 flex items-start gap-3 rounded-xl border px-4 py-3.5" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 8%, var(--card-bg))', borderColor: 'color-mix(in srgb, var(--primary) 25%, transparent)' }}>
                    <svg className="mt-0.5 shrink-0 h-4 w-4" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.757l4.5-4.5a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    <p className="whitespace-pre-line text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{paymentInstructions}</p>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSelector;
