import { useState, useEffect } from "react";
import { FiTruck, FiX, FiCheck, FiExternalLink } from "react-icons/fi";

const ShipmentTrackingModal = ({
    isOpen,
    onClose,
    onConfirm,
    initialData = {},
    order = null,
    loading = false,
}) => {
    const [courierName, setCourierName] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [trackingUrl, setTrackingUrl] = useState("");

    useEffect(() => {
        if (isOpen) {
            setCourierName(initialData?.courierName || "");
            setTrackingNumber(initialData?.trackingNumber || "");
            setTrackingUrl(initialData?.trackingUrl || "");
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            courierName: courierName.trim(),
            trackingNumber: trackingNumber.trim(),
            trackingUrl: trackingUrl.trim(),
        });
    };

    const shortId = order?._id ? `#${order._id.slice(-8)}` : "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
                {/* Modal Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                            <FiTruck size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-base">Shipment Tracking Information</h3>
                            <p className="text-xs text-gray-300">
                                Enter courier details for Order {shortId} (Optional)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition hover:bg-white/10 hover:text-white"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Courier Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Courier / Shipping Company</span>
                            <span className="text-gray-400 font-normal text-[11px]">Optional</span>
                        </label>
                        <input
                            type="text"
                            value={courierName}
                            onChange={(e) => setCourierName(e.target.value)}
                            placeholder="e.g. Leopards Courier, TCS, M&P"
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                        />
                    </div>

                    {/* Tracking Number */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Tracking Number</span>
                            <span className="text-gray-400 font-normal text-[11px]">Optional</span>
                        </label>
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="e.g. LP123456789PK"
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 font-mono outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                        />
                    </div>

                    {/* Optional Tracking URL */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Tracking Link (URL)</span>
                            <span className="text-gray-400 font-normal text-[11px]">Optional</span>
                        </label>
                        <div className="relative">
                            <input
                                type="url"
                                value={trackingUrl}
                                onChange={(e) => setTrackingUrl(e.target.value)}
                                placeholder="https://tracking.example.com/LP123456789PK"
                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10 pr-9"
                            />
                            <FiExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl bg-[#2F6FED] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#2F6FED]/90 active:scale-95 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiCheck size={14} />
                                    Save & Mark as Shipped
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShipmentTrackingModal;
