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
            className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-[#2F6FED]/10 hover:text-[#2F6FED]"
        >
            {copied ? <FiCheck size={14} className="text-emerald-500" /> : <FiCopy size={14} />}
        </button>
    );
};

const DetailRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="group flex items-center justify-between rounded-xl bg-white px-4 py-3 transition-all hover:shadow-md">
            <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-[#12131A] truncate">{value}</p>
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
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-400 border border-gray-200">
                <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Select Payment Method</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeMethods.map((method) => {
                    const isActive = selectedMethodId === method._id;
                    const iconSrc = getBankIcon(method.icon, method.logo);

                    return (
                        <button
                            key={method._id}
                            type="button"
                            onClick={() => onSelectMethod(method._id)}
                            className={`group relative flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-200 ${
                                isActive
                                    ? "border-[#2F6FED] bg-gradient-to-br from-[#2F6FED]/5 to-[#2F6FED]/10 shadow-md shadow-[#2F6FED]/10"
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                            }`}
                        >
                            {isActive && (
                                <div className="absolute -right-1 -top-1">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2F6FED] shadow-lg shadow-[#2F6FED]/30">
                                        <FiCheck className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden transition-all duration-200 ${
                                isActive ? "bg-white shadow-sm ring-1 ring-gray-100" : "bg-gray-50"
                            }`}>
                                {iconSrc ? (
                                    <img src={iconSrc} alt={method.name} className="h-7 w-7 object-contain" />
                                ) : (
                                    <span className="text-lg font-bold text-gray-400">
                                        {method.name?.charAt(0)?.toUpperCase() || "?"}
                                    </span>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#12131A] truncate">{method.name}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{method.type || "Bank"}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selected Method Details */}
            {selected && (
                <div className="mt-3 rounded-xl bg-gradient-to-br from-gray-50/80 to-white p-4 sm:p-5 border border-gray-200/50 animate-in fade-in duration-200">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        {(() => {
                            const iconSrc = getBankIcon(selected.icon, selected.logo);
                            return iconSrc ? (
                                <div className="h-10 w-10 rounded-xl bg-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center overflow-hidden">
                                    <img src={iconSrc} alt={selected.name} className="h-7 w-7 object-contain" />
                                </div>
                            ) : null;
                        })()}
                        <div>
                            <p className="text-sm font-bold text-[#12131A]">{selected.name}</p>
                            <span className="inline-flex items-center rounded-full bg-[#2F6FED]/10 px-2 py-0.5 text-[10px] font-medium text-[#2F6FED]">
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
                                className="flex items-center gap-2 text-xs font-medium text-[#2F6FED] hover:text-[#2F6FED]/80 transition"
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
                                    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
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
                <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#2F6FED]/20 bg-gradient-to-br from-[#2F6FED]/5 to-[#2F6FED]/10 px-4 py-3.5">
                    <svg className="mt-0.5 shrink-0 text-[#2F6FED] h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.757l4.5-4.5a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    <p className="whitespace-pre-line text-xs leading-relaxed text-gray-600">{paymentInstructions}</p>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSelector;
