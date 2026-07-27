import { useEffect, useState, useRef } from "react";
import { useToast } from "../../components/ToastNotification";
import api, { putMultipart } from "../../api/api";
import {
    FiTruck, FiCreditCard, FiSave, FiLoader, FiEdit3,
    FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiImage, FiX, FiCheckCircle
} from "react-icons/fi";

import { AVAILABLE_BANKS, PAYMENT_TYPES, getBankIcon } from "../../utils/bankIcons";

// ─── Reusable toggle switch ───
const Toggle = ({ enabled, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-green-500" : "bg-gray-300"}`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
);

// ─── Empty state for the form fields when adding new method ───
const EMPTY_METHOD = {
    name: "",
    type: "Bank",
    accountTitle: "",
    accountNumber: "",
    iban: "",
    icon: "",
    logo: "",
    qrCode: "",
    displayOrder: 0,
    enabled: true,
};

const AdminCheckout = () => {
    const toast = useToast();

    // Delivery settings
    const [fastDeliveryCharge, setFastDeliveryCharge] = useState(200);
    const [savingDelivery, setSavingDelivery] = useState(false);

    // Payment settings
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [instructions, setInstructions] = useState("");
    const [defaultPaymentMethod, setDefaultPaymentMethod] = useState("cod");
    const [savingPayment, setSavingPayment] = useState(false);
    const [savingDefaultMethod, setSavingDefaultMethod] = useState(false);

    // Editing / Adding
    const [editingId, setEditingId] = useState(null); // method._id or "new"
    const [editForm, setEditForm] = useState({ ...EMPTY_METHOD });
    const [expandedId, setExpandedId] = useState(null);

    // Image upload state
    const [uploadingImages, setUploadingImages] = useState(false);
    const qrInputRef = useRef(null);
    const logoInputRef = useRef(null);

    // ─── Load data ───
    const loadData = async () => {
        try {
            const res = await api.get("/payment-settings");
            if (res.data?.success) {
                const data = res.data.data;
                setPaymentMethods(data.paymentMethods || []);
                setInstructions(data.instructions || "");
                setDefaultPaymentMethod(data.defaultPaymentMethod || "cod");
            }
        } catch (err) {
            console.error("Failed to load payment settings:", err);
            toast.error("Failed to load payment settings.");
        }
        try {
            const res = await api.get("/site-content");
            if (res.data?.success) {
                setFastDeliveryCharge(res.data.data?.delivery?.fastDeliveryCharge ?? 200);
            }
        } catch (err) {
            console.error("Failed to load delivery settings:", err);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Delivery Charge ───
    const handleSaveDeliveryCharge = async () => {
        setSavingDelivery(true);
        try {
            const res = await api.put("/site-content/delivery", {
                fastDeliveryCharge: Number(fastDeliveryCharge) || 0,
            });
            if (res.data?.success) {
                toast.success("Fast delivery charge updated successfully.");
            } else {
                toast.error(res.data?.message || "Failed to update delivery charge.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update delivery charge.");
        } finally {
            setSavingDelivery(false);
        }
    };

    // ─── Instructions ───
    const handleSaveInstructions = async () => {
        setSavingPayment(true);
        try {
            const res = await api.put("/payment-settings/instructions", { instructions });
            if (res.data?.success) {
                toast.success("Payment instructions updated successfully.");
            } else {
                toast.error(res.data?.message || "Failed to update instructions.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update instructions.");
        } finally {
            setSavingPayment(false);
        }
    };

    // ─── Default Payment Method ───
    const handleSaveDefaultPaymentMethod = async () => {
        setSavingDefaultMethod(true);
        try {
            const res = await api.put("/payment-settings/default-method", { defaultPaymentMethod });
            if (res.data?.success) {
                toast.success("Default payment method updated successfully.");
            } else {
                toast.error(res.data?.message || "Failed to update default payment method.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update default payment method.");
        } finally {
            setSavingDefaultMethod(false);
        }
    };

    // ─── Start adding a new method ───
    const startAdding = () => {
        const maxOrder = paymentMethods.length > 0
            ? Math.max(...paymentMethods.map(m => m.displayOrder || 0))
            : 0;
        setEditForm({ ...EMPTY_METHOD, displayOrder: maxOrder + 1 });
        setEditingId("new");
        setExpandedId("new");
    };

    // ─── Start editing an existing method ───
    const startEditing = (method) => {
        setEditForm({
            name: method.name || "",
            type: method.type || "Bank",
            accountTitle: method.accountTitle || "",
            accountNumber: method.accountNumber || "",
            iban: method.iban || "",
            icon: method.icon || "",
            logo: method.logo || "",
            qrCode: method.qrCode || "",
            displayOrder: method.displayOrder || 0,
            enabled: method.enabled !== false,
        });
        setEditingId(method._id);
        setExpandedId(method._id);
    };

    // ─── Cancel editing ───
    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({ ...EMPTY_METHOD });
    };

    // ─── Bank dropdown change ───
    const handleBankChange = (bankName) => {
        setEditForm(prev => ({
            ...prev,
            icon: bankName, // store the bank name key for icon lookup
            name: prev.name || bankName, // auto-fill name if empty
        }));
    };

    // ─── Save (add or update) ───
    const handleSaveMethod = async () => {
        if (!editForm.name?.trim()) {
            toast.error("Payment method name is required.");
            return;
        }
        if (!editForm.accountNumber?.trim()) {
            toast.error("Account number is required.");
            return;
        }

        setSavingPayment(true);
        try {
            let res;
            if (editingId === "new") {
                res = await api.post("/payment-settings/methods", editForm);
            } else {
                res = await api.put(`/payment-settings/methods/${editingId}`, editForm);
            }

            if (res.data?.success) {
                toast.success(editingId === "new" ? "Payment method added!" : "Payment method updated!");
                setEditingId(null);
                setEditForm({ ...EMPTY_METHOD });
                setPaymentMethods(res.data.data.paymentMethods || []);
            } else {
                toast.error(res.data?.message || "Failed to save payment method.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save payment method.");
        } finally {
            setSavingPayment(false);
        }
    };

    // ─── Delete ───
    const handleDeleteMethod = async (id) => {
        if (!window.confirm("Are you sure you want to delete this payment method?")) return;
        try {
            const res = await api.delete(`/payment-settings/methods/${id}`);
            if (res.data?.success) {
                toast.success("Payment method deleted.");
                setPaymentMethods(res.data.data.paymentMethods || []);
                if (editingId === id) cancelEditing();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete payment method.");
        }
    };

    // ─── Quick toggle enable/disable ───
    const handleToggleEnabled = async (method) => {
        try {
            const res = await api.put(`/payment-settings/methods/${method._id}`, {
                enabled: !method.enabled,
            });
            if (res.data?.success) {
                setPaymentMethods(res.data.data.paymentMethods || []);
                toast.success(`${method.name} ${method.enabled ? "disabled" : "enabled"}.`);
            }
        } catch (err) {
            toast.error("Failed to toggle payment method.");
        }
    };

    // ─── Upload images (QR / Logo) ───
    const handleImageUpload = async (methodId, file, fieldName) => {
        if (!file) return;
        setUploadingImages(true);
        try {
            const formData = new FormData();
            formData.append(fieldName, file);
            const res = await putMultipart(`/payment-settings/methods/${methodId}/images`, formData);
            if (res.data?.success) {
                toast.success(`${fieldName === "qrCode" ? "QR Code" : "Logo"} uploaded!`);
                setPaymentMethods(res.data.data.paymentMethods || []);
                // Update the edit form with the new URL
                const updated = res.data.data.paymentMethods.find(m => m._id === methodId);
                if (updated && editingId === methodId) {
                    setEditForm(prev => ({
                        ...prev,
                        [fieldName]: updated[fieldName] || prev[fieldName],
                    }));
                }
            }
        } catch (err) {
            toast.error(`Failed to upload ${fieldName === "qrCode" ? "QR code" : "logo"}.`);
        } finally {
            setUploadingImages(false);
        }
    };

    // ─── Sorted methods for display ───
    const sortedMethods = [...paymentMethods].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // ─── Resolve icon for display ───
    const getIconSrc = (method) => getBankIcon(method?.icon, method?.logo);

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Checkout Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage delivery options and payment method details shown to customers at checkout.
                </p>
            </div>

            {/* ══════════ Fast Delivery Charge ══════════ */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
                        <FiTruck size={18} />
                    </span>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Delivery Options</h2>
                        <p className="text-sm text-gray-500">
                            "Standard Delivery" is always free. Set the charge applied to "Fast Delivery" below.
                        </p>
                    </div>
                </div>
                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="w-full sm:max-w-[220px]">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Fast Delivery Charge (Rs.)</label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">Rs.</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={fastDeliveryCharge}
                                onChange={(e) => setFastDeliveryCharge(e.target.value)}
                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-8 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSaveDeliveryCharge}
                        disabled={savingDelivery}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FiSave size={16} />
                        {savingDelivery ? "Saving..." : "Save Charge"}
                    </button>
                </div>
            </section>

            {/* ══════════ Default Payment Method Selection ══════════ */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
                        <FiCheckCircle size={18} />
                    </span>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Default Selected Payment Method</h2>
                        <p className="text-sm text-gray-500">
                            Choose which payment method is pre-selected by default when a customer visits the checkout page.
                        </p>
                    </div>
                </div>
                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="w-full sm:max-w-[340px]">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Pre-selected Method at Checkout</label>
                        <select
                            value={defaultPaymentMethod}
                            onChange={(e) => setDefaultPaymentMethod(e.target.value)}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                        >
                            <option value="cod">Cash on Delivery (COD)</option>
                            <option value="online">Bank Transfer / Online Payment (General)</option>
                            {paymentMethods.filter(m => m.enabled && !/cash on delivery/i.test(m.name)).map((m) => (
                                <option key={m._id} value={m._id}>
                                    Online: {m.name} {m.accountTitle ? `(${m.accountTitle})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleSaveDefaultPaymentMethod}
                        disabled={savingDefaultMethod}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {savingDefaultMethod ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                        {savingDefaultMethod ? "Saving..." : "Save Default Method"}
                    </button>
                </div>
            </section>

            {/* ══════════ Payment Methods ══════════ */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
                            <FiCreditCard size={18} />
                        </span>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Payment Methods</h2>
                            <p className="text-sm text-gray-500">Add and manage payment methods shown at checkout.</p>
                        </div>
                    </div>
                    <button
                        onClick={startAdding}
                        disabled={editingId === "new"}
                        className="flex items-center gap-2 rounded-xl bg-[#2F6FED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:opacity-60"
                    >
                        <FiPlus size={16} />
                        Add Payment Method
                    </button>
                </div>

                <div className="mt-5 space-y-3">
                    {/* ─── New Method Form ─── */}
                    {editingId === "new" && (
                        <div className="rounded-xl border-2 border-[#2F6FED] bg-[#2F6FED]/5 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-[#2F6FED]">New Payment Method</h3>
                                <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600">
                                    <FiX size={18} />
                                </button>
                            </div>
                            <PaymentMethodForm
                                form={editForm}
                                setForm={setEditForm}
                                onBankChange={handleBankChange}
                                onSave={handleSaveMethod}
                                onCancel={cancelEditing}
                                saving={savingPayment}
                                isNew={true}
                            />
                        </div>
                    )}

                    {/* ─── Existing Methods ─── */}
                    {sortedMethods.map((method) => {
                        const iconSrc = getIconSrc(method);
                        const isExpanded = expandedId === method._id;
                        const isEditing = editingId === method._id;

                        return (
                            <div key={method._id} className={`rounded-xl border ${isEditing ? "border-[#2F6FED] bg-[#2F6FED]/5" : "border-gray-200 bg-gray-50"} overflow-hidden transition-all`}>
                                {/* Card Header */}
                                <div
                                    className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer"
                                    onClick={() => setExpandedId(isExpanded ? null : method._id)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Icon */}
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
                                            {iconSrc ? (
                                                <img src={iconSrc} alt={method.name} className="h-7 w-7 object-contain" />
                                            ) : (
                                                <span className="text-base font-bold text-gray-400">
                                                    {method.name?.charAt(0)?.toUpperCase() || "?"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{method.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[11px] text-gray-400">{method.type || "Bank"}</span>
                                                <span className="text-gray-300">·</span>
                                                <span className="text-[11px] font-medium text-gray-400">Order: {method.displayOrder || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* Status badge */}
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${method.enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${method.enabled ? "bg-green-500" : "bg-gray-400"}`} />
                                            {method.enabled ? "Active" : "Inactive"}
                                        </span>

                                        {/* Toggle */}
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Toggle enabled={method.enabled} onChange={() => handleToggleEnabled(method)} />
                                        </div>

                                        {/* Expand chevron */}
                                        {isExpanded ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200 px-4 py-4 bg-white/50">
                                        {isEditing ? (
                                            <PaymentMethodForm
                                                form={editForm}
                                                setForm={setEditForm}
                                                onBankChange={handleBankChange}
                                                onSave={handleSaveMethod}
                                                onCancel={cancelEditing}
                                                saving={savingPayment}
                                                isNew={false}
                                                methodId={method._id}
                                                onImageUpload={handleImageUpload}
                                                uploadingImages={uploadingImages}
                                                qrInputRef={qrInputRef}
                                                logoInputRef={logoInputRef}
                                            />
                                        ) : (
                                            <div>
                                                {/* Details view */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                    {method.accountTitle && (
                                                        <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Account Title</p>
                                                            <p className="text-sm font-medium text-gray-900">{method.accountTitle}</p>
                                                        </div>
                                                    )}
                                                    {method.accountNumber && (
                                                        <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Account Number</p>
                                                            <p className="text-sm font-medium text-gray-900">{method.accountNumber}</p>
                                                        </div>
                                                    )}
                                                    {method.iban && (
                                                        <div className="rounded-lg bg-gray-50 px-3 py-2.5 sm:col-span-2">
                                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">IBAN</p>
                                                            <p className="text-sm font-medium text-gray-900 break-all">{method.iban}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* QR Code preview */}
                                                {method.qrCode && (
                                                    <div className="mt-3">
                                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">QR Code</p>
                                                        <img src={method.qrCode} alt="QR Code" className="h-24 w-24 rounded-lg border border-gray-200 object-contain bg-white p-1" />
                                                    </div>
                                                )}

                                                <div className="mt-4 flex gap-2">
                                                    <button
                                                        onClick={() => startEditing(method)}
                                                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                                                    >
                                                        <FiEdit3 size={13} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMethod(method._id)}
                                                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                                                    >
                                                        <FiTrash2 size={13} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {paymentMethods.length === 0 && editingId !== "new" && (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                            <FiCreditCard className="mx-auto text-gray-300" size={32} />
                            <p className="mt-3 text-sm font-medium text-gray-500">No payment methods configured</p>
                            <p className="mt-1 text-xs text-gray-400">Click "+ Add Payment Method" above to get started.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ══════════ Payment Instructions ══════════ */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">Payment Instructions</h2>
                <p className="text-sm text-gray-500">Shown to customers when they choose online transfer at checkout.</p>
                <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={4}
                    className="mt-3 block w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                    placeholder="e.g. Please share your transaction ID after payment. Orders are confirmed within 24 hours."
                />
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSaveInstructions}
                        disabled={savingPayment}
                        className="flex items-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:opacity-60"
                    >
                        {savingPayment ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                        Save Instructions
                    </button>
                </div>
            </section>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// PaymentMethodForm — reusable form for adding/editing a method
// ═══════════════════════════════════════════════════════════
const PaymentMethodForm = ({
    form, setForm, onBankChange, onSave, onCancel, saving, isNew,
    methodId, onImageUpload, uploadingImages, qrInputRef, logoInputRef
}) => {
    const iconPreview = getBankIcon(form.icon, form.logo);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Payment Method Name */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Payment Method Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Meezan Bank"
                        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/10"
                    />
                </div>

                {/* Payment Type */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Payment Type</label>
                    <select
                        value={form.type}
                        onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/10"
                    >
                        {PAYMENT_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* Available Bank Dropdown */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Available Bank / Wallet</label>
                    <select
                        value={form.icon}
                        onChange={(e) => onBankChange(e.target.value)}
                        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/10"
                    >
                        <option value="">— Select or leave empty —</option>
                        {AVAILABLE_BANKS.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>

                {/* Icon Preview */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Logo Preview</label>
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 h-[42px]">
                        {iconPreview ? (
                            <img src={iconPreview} alt="Bank logo" className="h-7 w-7 object-contain" />
                        ) : (
                            <span className="text-xs text-gray-400">No icon selected</span>
                        )}
                        <span className="text-xs text-gray-500 truncate">{form.icon || form.logo || "—"}</span>
                    </div>
                </div>

                {/* Account Title */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Account Title</label>
                    <input
                        value={form.accountTitle}
                        onChange={(e) => setForm(prev => ({ ...prev, accountTitle: e.target.value }))}
                        placeholder="e.g. Comfort Seats PK"
                        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/10"
                    />
                </div>

                {/* Account Number */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Account Number / Wallet Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.accountNumber}
                        onChange={(e) => setForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="e.g. 123456789"
                        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/10"
                    />
                </div>

                {/* IBAN */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">IBAN <span className="text-gray-400">(optional)</span></label>
                    <input
                        value={form.iban}
                        onChange={(e) => setForm(prev => ({ ...prev, iban: e.target.value }))}
                        placeholder="e.g. PK36MEZN..."
                        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/10"
                    />
                </div>

                {/* Display Order */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Display Order</label>
                    <input
                        type="number"
                        min="0"
                        value={form.displayOrder}
                        onChange={(e) => setForm(prev => ({ ...prev, displayOrder: Number(e.target.value) || 0 }))}
                        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/10"
                    />
                </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                <span className="text-sm font-medium text-gray-700">Active</span>
                <Toggle enabled={form.enabled} onChange={(v) => setForm(prev => ({ ...prev, enabled: v }))} />
            </div>

            {/* Image Uploads (only for existing methods — need an ID for the upload endpoint) */}
            {!isNew && methodId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* QR Code Upload */}
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-600">
                            <FiImage size={13} /> QR Code <span className="text-gray-400">(optional)</span>
                        </label>
                        {form.qrCode && (
                            <img src={form.qrCode} alt="QR" className="mb-2 h-20 w-20 rounded-lg border border-gray-100 object-contain bg-gray-50 p-1" />
                        )}
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500 transition hover:border-[#2F6FED] hover:bg-[#2F6FED]/5 hover:text-[#2F6FED]">
                            {uploadingImages ? <FiLoader className="animate-spin" size={13} /> : <FiImage size={13} />}
                            {uploadingImages ? "Uploading..." : "Upload QR Code"}
                            <input
                                ref={qrInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) onImageUpload(methodId, f, "qrCode");
                                }}
                            />
                        </label>
                    </div>

                    {/* Custom Logo Upload */}
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-600">
                            <FiImage size={13} /> Custom Logo <span className="text-gray-400">(optional)</span>
                        </label>
                        {form.logo && (
                            <img src={form.logo} alt="Custom Logo" className="mb-2 h-10 w-10 rounded-lg border border-gray-100 object-contain bg-gray-50 p-1" />
                        )}
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500 transition hover:border-[#2F6FED] hover:bg-[#2F6FED]/5 hover:text-[#2F6FED]">
                            {uploadingImages ? <FiLoader className="animate-spin" size={13} /> : <FiImage size={13} />}
                            {uploadingImages ? "Uploading..." : "Upload Custom Logo"}
                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) onImageUpload(methodId, f, "logo");
                                }}
                            />
                        </label>
                        <p className="mt-1.5 text-[10px] text-gray-400">Overrides the bank dropdown icon.</p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
                <button
                    onClick={onCancel}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-lg bg-[#2F6FED] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:opacity-60"
                >
                    {saving ? <FiLoader className="animate-spin" size={13} /> : <FiSave size={13} />}
                    {isNew ? "Add Method" : "Save Changes"}
                </button>
            </div>
        </div>
    );
};

export default AdminCheckout;