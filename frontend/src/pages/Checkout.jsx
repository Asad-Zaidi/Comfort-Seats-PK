import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import {
    FiUser,
    FiPhone,
    FiMapPin,
    FiCreditCard,
    FiChevronLeft,
    FiShoppingBag,
    FiCheck,
    FiTruck,
    FiZap,
    FiShield,
    FiMail,
    FiCheckCircle,
    FiClock,
} from "react-icons/fi";
import { FaMoneyBillWave, FaUniversity, FaUpload, FaTimes } from "react-icons/fa";
import api from "../api/api";
import { getColorName, isHexColor } from "../utils/ColorName";
import { useToast } from "../components/ToastNotification";
import { useSiteConfig } from "../utils/siteConfig";
import OrderModal from "../components/OrderModal";
import { formatPrice } from "../utils/priceCalculator";
import PaymentMethodSelector from "../components/checkout/PaymentMethods";

const paymentOptions = [
    { key: "cod", label: "Cash on Delivery", icon: FaMoneyBillWave, desc: "Pay when you receive" },
    { key: "online", label: "Bank Transfer", icon: FaUniversity, desc: "Pay via bank transfer" },
];

const deliveryOptions = [
    {
        key: "standard",
        label: "Standard Delivery",
        icon: FiTruck,
        desc: "Free delivery across Pakistan",
        time: "3 to 5 Days Delivery Time",
        timeIcon: FiClock,
    },
    {
        key: "fast",
        label: "Express Delivery",
        icon: FiZap,
        desc: "Priority handling & shipping",
        time: "1 to 2 Days Delivery Time",
        timeIcon: FiClock,
    },
];

const InputField = ({ id, name, label, icon: Icon, type = "text", value, onChange, placeholder, required = false, ...props }) => (
    <div className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
            {label}
            {required && <span className="ml-1" style={{ color: 'var(--error)' }}>*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-secondary)' }} size={17} />
            )}
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-4 focus:ring-[var(--primary)]/10"
                style={{ paddingLeft: Icon ? "2.75rem" : "1rem", backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                {...props}
            />
        </div>
    </div>
);

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { product, quantity: initialQuantity, selectedColor, selectedSize, selectedStandType, cartItems } = location.state || {};
    const { siteUrl, siteName } = useSiteConfig();

    const checkoutItems = useMemo(() => {
        if (Array.isArray(cartItems) && cartItems.length > 0) {
            return cartItems;
        }
        if (product) {
            const rawId = product._id || product.productId || (product.id && product.id !== '1' ? product.id : undefined);
            return [{
                id: rawId || `${product.name || 'product'}_checkout_item`,
                productId: rawId || undefined,
                product,
                name: product.name,
                image: product.imageUrl || product.image || (Array.isArray(product.images) && product.images[0]?.url) || (Array.isArray(product.images) && product.images[0]) || '',
                price: product.price || 0,
                quantity: initialQuantity || 1,
                selectedColor,
                selectedSize,
                selectedStandType,
                actualPrice: product.actualPrice || 0,
                isDiscountEnabled: product.isDiscountEnabled === true,
            }];
        }
        return [];
    }, [cartItems, product, initialQuantity, selectedColor, selectedSize, selectedStandType]);

    const hasItems = checkoutItems.length > 0;
    const effectiveProduct = product || (checkoutItems.length > 0 ? (checkoutItems[0].product || checkoutItems[0]) : null);
    const effectiveQuantity = checkoutItems.length === 1 ? checkoutItems[0].quantity : 1;

    const [form, setForm] = useState({ fullName: "", phone: "", email: "", address: "", city: "" });
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [paymentSettings, setPaymentSettings] = useState(null);
    const [paymentInstructions, setPaymentInstructions] = useState("");
    const [deliverySettings, setDeliverySettings] = useState({
        fastDeliveryCharge: 200,
        codOnlinePaymentMessage: "You have to pay Rs. {amount} online in advance for Cash on Delivery.",
    });
    const [deliveryMethod, setDeliveryMethod] = useState("standard");
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState("");
    const [isSubmitting] = useState(false);
    const [receiptError, setReceiptError] = useState("");
    const [selectedOnlineMethodId, setSelectedOnlineMethodId] = useState(null);
    const receiptInputRef = useRef(null);
    const toast = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/payment-settings");
                if (res.data?.success) {
                    const settingsData = res.data.data;
                    setPaymentSettings(settingsData);
                    setPaymentInstructions(settingsData?.instructions || "");

                    // Pre-select default payment method based on admin settings
                    const def = settingsData?.defaultPaymentMethod || "cod";
                    if (def === "cod") {
                        setPaymentMethod("cod");
                    } else if (def === "online") {
                        setPaymentMethod("online");
                        const activeMethods = (settingsData?.paymentMethods || []).filter(m => m.enabled && !/cash on delivery/i.test(m.name));
                        if (activeMethods.length > 0) {
                            setSelectedOnlineMethodId(activeMethods[0]._id);
                        }
                    } else {
                        // Specific payment method ID selected by admin
                        const foundMethod = (settingsData?.paymentMethods || []).find(m => m._id === def && m.enabled);
                        if (foundMethod) {
                            setPaymentMethod("online");
                            setSelectedOnlineMethodId(foundMethod._id);
                        } else {
                            setPaymentMethod("cod");
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load payment settings:", err);
            }
            try {
                const res = await api.get("/site-content");
                if (res.data?.success) {
                    setDeliverySettings({
                        fastDeliveryCharge: res.data.data?.delivery?.fastDeliveryCharge ?? 200,
                        codOnlinePaymentMessage: res.data.data?.delivery?.codOnlinePaymentMessage || "You have to pay Rs. {amount} online in advance for Cash on Delivery.",
                    });
                }
            } catch (err) {
                console.error("Failed to load delivery settings:", err);
            }
        };
        fetchSettings();
    }, []);

    // Auto-select first online method if online payment is chosen and none is selected yet
    useEffect(() => {
        if (paymentMethod === "online" && !selectedOnlineMethodId && paymentSettings?.paymentMethods) {
            const activeMethods = paymentSettings.paymentMethods.filter(m => m.enabled && !/cash on delivery/i.test(m.name));
            if (activeMethods.length > 0) {
                setSelectedOnlineMethodId(activeMethods[0]._id);
            }
        }
    }, [paymentMethod, selectedOnlineMethodId, paymentSettings]);


    const handleReceiptChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!/image\/(jpeg|jpg|png|gif|webp)/.test(file.type)) {
            toast.error("Only image files are allowed for the receipt.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Receipt image must be under 5MB.");
            return;
        }
        setReceiptFile(file);
        setReceiptPreview(URL.createObjectURL(file));
        setReceiptError(""); // Clear error when file is uploaded
    };

    const removeReceipt = () => {
        setReceiptFile(null);
        setReceiptPreview("");
        if (receiptInputRef.current) receiptInputRef.current.value = "";
    };

    const subtotal = useMemo(() => {
        return checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [checkoutItems]);
    const deliveryCharge = deliveryMethod === "fast" ? Number(deliverySettings.fastDeliveryCharge) || 0 : 0;
    const total = subtotal + deliveryCharge;

    const hasFiredInitiateCheckoutRef = useRef(false);

    useEffect(() => {
        if (hasItems && total > 0 && !hasFiredInitiateCheckoutRef.current) {
            hasFiredInitiateCheckoutRef.current = true;
            if (window.fbq) {
                window.fbq("track", "InitiateCheckout", {
                    value: total,
                    currency: "PKR"
                });
            }
        }
    }, [hasItems, total]);

    if (!hasItems) {
        return (
            <>
                <SEO title={`Checkout - ${siteName}`} description="Complete your order." canonicalUrl={`${siteUrl}/checkout`} />
                <div className="min-h-[60vh] flex items-center justify-center px-5">
                    <div className="text-center max-w-md">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                            <FiShoppingBag className="text-gray-300" size={32} />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold text-[#12131A]">No product selected</h1>
                        <p className="mt-2 text-gray-500">Please choose a product before proceeding to checkout.</p>
                        <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90">
                            Browse Products
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim()) {
            toast.error("Please fill in your name, phone number, and address.");
            return;
        }
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (paymentMethod === "online" && !receiptFile) {
            setReceiptError("Payment receipt is required for bank transfer.");
            toast.error("Please upload your payment receipt.");
            return;
        }
        setReceiptError("");
        if (window.fbq) {
            window.fbq("track", "AddPaymentInfo");
        }
        setIsOrderModalOpen(true);
    };

    const checkoutPaymentMethod = paymentMethod === "cod" ? "cod" : "bank";
    // Build selectedOnlineMethod object for the order
    const selectedOnlineMethodData = (() => {
        if (paymentMethod !== "online" || !selectedOnlineMethodId) return null;
        const m = paymentSettings?.paymentMethods?.find(pm => pm._id === selectedOnlineMethodId);
        if (!m) return null;
        return { methodId: m._id, name: m.name, type: m.type || 'Bank', icon: m.logo || m.icon || '' };
    })();

    return (
        <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
            <SEO title={`Checkout - ${siteName}`} canonicalUrl={`${siteUrl}/checkout`} />

            <div className="mx-auto max-w-full px-5 py-10 lg:px-32">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        style={{ color: 'var(--text-secondary)' }}
                        className="group inline-flex items-center gap-2 text-sm font-medium transition hover:opacity-80"
                    >
                        <FiChevronLeft className="transition-transform group-hover:-translate-x-0.5" size={18} />
                        Back
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>
                            <FiShield size={14} />
                            Secure Checkout
                        </span>
                        <span className="h-5 w-px border-r hidden sm:block" style={{ borderColor: 'var(--border)' }} />
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)' }}>
                            ✓ 100% Secure
                        </span>
                    </div>
                </div>

                <h1 className="text-2xl text-center sm:text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                    Complete Your Order
                </h1>
                <p className="mt-1.5 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>Fill in your details to place your order</p>

                <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-5">
                    {/* Left Column - Form */}
                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6 lg:col-span-3">
                        {/* Delivery Details */}
                        <div className="rounded-2xl border p-5 sm:p-6 shadow-xs transition-colors duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
                                    <FiUser size={18} />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Delivery Details</h2>
                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Where should we ship your order?</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <InputField
                                        id="checkout-full-name"
                                        name="fullName"
                                        label="Full Name"
                                        icon={FiUser}
                                        value={form.fullName}
                                        onChange={handleChange}
                                        placeholder="Your Name"
                                        required
                                    />
                                    <InputField
                                        id="checkout-phone"
                                        name="phone"
                                        label="Phone Number"
                                        icon={FiPhone}
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Phone Number"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <InputField
                                        id="checkout-email"
                                        name="email"
                                        label="Email Address"
                                        icon={FiMail}
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                    />
                                    <InputField
                                        id="checkout-city"
                                        name="city"
                                        label="City"
                                        icon={FiMapPin}
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="Lahore"
                                    />
                                </div>


                                <div className="space-y-1.5">
                                    <label htmlFor="checkout-address" className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
                                        Address <span className="ml-1" style={{ color: 'var(--error)' }}>*</span>
                                    </label>
                                    <div className="relative">
                                        <FiMapPin className="pointer-events-none absolute left-3.5 top-3.5" style={{ color: 'var(--text-secondary)' }} size={17} />
                                        <textarea
                                            id="checkout-address"
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="House #, Street, Area"
                                            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)', paddingLeft: '2.75rem' }}
                                            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-4 focus:ring-[var(--primary)]/10"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Delivery Method */}


                        {/* Payment Method */}
                        <div className="rounded-2xl border p-5 sm:p-6 shadow-xs transition-colors duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
                                        <FiCreditCard size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Payment Method</h2>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Choose how you'd like to pay</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)' }}>
                                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--success)' }} />
                                    Secure
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {paymentOptions.map(({ key, label, icon: Icon, desc }) => {
                                    const active = paymentMethod === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setPaymentMethod(key)}
                                            style={{
                                                backgroundColor: active ? 'color-mix(in srgb, var(--primary) 8%, var(--card-bg))' : 'var(--card-bg)',
                                                borderColor: active ? 'var(--primary)' : 'var(--border)',
                                            }}
                                            className="group relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200"
                                        >
                                            {active && (
                                                <div className="absolute -right-1 -top-1">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full shadow-lg" style={{ backgroundColor: 'var(--primary)' }}>
                                                        <FiCheck className="h-3 w-3 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            <span style={{ backgroundColor: active ? 'var(--primary)' : 'var(--bg-secondary)', color: active ? '#ffffff' : 'var(--text-secondary)' }} className="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200">
                                                <Icon size={18} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</p>
                                                {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{desc}</p>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {paymentMethod === "cod" && paymentSettings?.codOnlinePaymentEnabled && Number(paymentSettings.codOnlinePaymentAmount) > 0 && (
                                <p
                                    className="mt-4 rounded-xl border px-4 py-3 text-sm font-medium"
                                    style={{
                                        backgroundColor: 'color-mix(in srgb, var(--primary) 8%, var(--card-bg))',
                                        borderColor: 'color-mix(in srgb, var(--primary) 25%, transparent)',
                                        color: 'var(--primary)',
                                    }}
                                >
                                    {(deliverySettings.codOnlinePaymentMessage || "You have to pay Rs. {amount} online in advance for Cash on Delivery.")
                                        .replace(/\{amount\}/g, formatPrice(paymentSettings.codOnlinePaymentAmount))}
                                </p>
                            )}

                            {paymentMethod === "online" && (
                                <div className="mt-4 rounded-xl bg-gradient-to-br from-gray-50/80 to-white p-5 sm:p-6 border border-gray-200/50">
                                    {/* Dynamic Payment Method Selector */}
                                    <PaymentMethodSelector
                                        methods={paymentSettings?.paymentMethods || []}
                                        selectedMethodId={selectedOnlineMethodId}
                                        onSelectMethod={setSelectedOnlineMethodId}
                                        paymentInstructions={paymentInstructions}
                                    />

                                    {/* Receipt Upload */}
                                    <div className="mt-5">
                                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#12131A]">
                                            Payment Receipt <span className="text-red-500">*</span>
                                        </label>

                                        {!receiptPreview ? (
                                            <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed border-gray-300 bg-white/80 px-4 py-6 text-center transition-all duration-200 hover:border-[#2F6FED] hover:bg-[#2F6FED]/5">
                                                <div className="rounded-full bg-gray-50 p-3 transition-colors group-hover:bg-[#2F6FED]/10">
                                                    <FaUpload className="text-gray-400 transition-colors group-hover:text-[#2F6FED]" size={20} />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600 group-hover:text-[#12131A]">Click to upload receipt</span>
                                                    <p className="mt-1 text-xs text-gray-400">JPG, PNG or WEBP (max 5MB)</p>
                                                </div>
                                                <input
                                                    ref={receiptInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                                    onChange={handleReceiptChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        ) : (
                                            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                                <img src={receiptPreview} alt="Receipt preview" className="max-h-56 w-full object-contain p-2" />
                                                <button
                                                    type="button"
                                                    onClick={removeReceipt}
                                                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition-all hover:bg-black/90"
                                                    aria-label="Remove receipt"
                                                >
                                                    <FaTimes size={13} />
                                                </button>
                                            </div>
                                        )}
                                        {receiptError && (
                                            <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                                </svg>
                                                {receiptError}
                                            </p>
                                        )}
                                        <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1.5">
                                            <FiCheckCircle className="text-gray-300" size={13} />
                                            Attach a screenshot or photo of your payment confirmation.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-2 space-y-6">

                        <div className="rounded-2xl border p-5 sm:p-6 shadow-xs transition-colors duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
                                    <FiTruck size={18} />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Delivery Method</h2>
                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Choose your preferred shipping option</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {deliveryOptions.map(({ key, label, icon: Icon, desc, time }) => {
                                    const active = deliveryMethod === key;
                                    const priceText = key === "fast"
                                        ? `Rs. ${Number(deliverySettings.fastDeliveryCharge) || 0}`
                                        : "Free";
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setDeliveryMethod(key)}
                                            style={{
                                                backgroundColor: active ? 'color-mix(in srgb, var(--primary) 8%, var(--card-bg))' : 'var(--card-bg)',
                                                borderColor: active ? 'var(--primary)' : 'var(--border)',
                                            }}
                                            className="group relative flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200"
                                        >
                                            {active && (
                                                <div className="absolute -right-1 -top-1">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full shadow-lg" style={{ backgroundColor: 'var(--primary)' }}>
                                                        <FiCheck className="h-3 w-3 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            <span style={{ backgroundColor: active ? 'var(--primary)' : 'var(--bg-secondary)', color: active ? '#ffffff' : 'var(--text-secondary)' }} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-all duration-200">
                                                <Icon size={20} />
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</p>
                                                    <p className="text-xs font-semibold whitespace-nowrap" style={{ color: key === "fast" ? 'var(--primary)' : 'var(--success)' }}>
                                                        {priceText}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                        {desc}
                                                    </p>

                                                    <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--primary)' }}>
                                                        <FiClock className="h-3.5 w-3.5" />
                                                        <span>{time}</span>
                                                    </div>
                                                </div>

                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="sticky top-6 space-y-6">
                            <div className="rounded-2xl border p-5 sm:p-6 shadow-xs transition-colors duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                                <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>
                                    Order Summary ({checkoutItems.reduce((a, i) => a + i.quantity, 0)} {checkoutItems.reduce((a, i) => a + i.quantity, 0) === 1 ? 'item' : 'items'})
                                </h2>

                                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                                    {checkoutItems.map((item, idx) => {
                                        const itemImg = item.image || (item.product?.images?.[0]?.url || item.product?.images?.[0] || item.product?.image || '');
                                        const colorName = item.selectedColor ? (isHexColor(item.selectedColor) ? getColorName(item.selectedColor) : item.selectedColor) : null;

                                        return (
                                            <div key={item.id || idx} className="flex gap-3 pb-3 border-b last:border-b-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                                                    {itemImg ? (
                                                        <img src={itemImg} alt={item.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No Image</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{item.name}</p>
                                                    <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                        {colorName && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <span className="h-2.5 w-2.5 rounded-full border border-black/10 inline-block" style={{ backgroundColor: isHexColor(item.selectedColor) ? item.selectedColor : "#E5E7EB" }} />
                                                                {colorName}
                                                            </span>
                                                        )}
                                                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                                        {item.selectedStandType && <span>Stand: {item.selectedStandType}</span>}
                                                    </div>
                                                    <div className="mt-1 flex items-center justify-between text-xs">
                                                        <span style={{ color: 'var(--text-secondary)' }}>Qty: <span className="font-semibold" style={{ color: 'var(--text)' }}>{item.quantity}</span></span>
                                                        <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Rs. {formatPrice(item.price * item.quantity)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 space-y-2.5 border-t pt-5 text-sm" style={{ borderColor: 'var(--border)' }}>
                                    <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                                        <span>Subtotal</span>
                                        <span className="font-medium" style={{ color: 'var(--text)' }}>Rs. {formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                                        <span className="flex items-center gap-1.5">
                                            {deliveryMethod === "fast" ? <FiZap size={14} /> : <FiTruck size={14} />}
                                            {deliveryMethod === "fast" ? "Express Delivery" : "Standard Delivery"}
                                        </span>
                                        <span className="font-medium" style={{ color: deliveryCharge > 0 ? 'var(--primary)' : 'var(--success)' }}>
                                            {deliveryCharge > 0 ? `Rs. ${formatPrice(deliveryCharge)}` : "Free"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-3 text-base font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                                        <span>Total</span>
                                        <span style={{ color: 'var(--primary)' }}>Rs. {formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                form="checkout-form"
                                type="submit"
                                style={{ backgroundColor: 'var(--btn-primary-bg, var(--primary))', color: 'var(--btn-primary-text, #fff)' }}
                                className="flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-4 text-sm font-semibold shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FiShoppingBag size={18} />
                                        Place Order - Rs. {formatPrice(total)}
                                    </>
                                )}
                            </button>


                        </div>
                    </div>
                </div>
            </div>

            <OrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                product={effectiveProduct}
                items={checkoutItems}
                quantity={effectiveQuantity}
                selectedColor={selectedColor || (checkoutItems.length > 0 ? checkoutItems[0].selectedColor : null)}
                selectedSize={selectedSize || (checkoutItems.length > 0 ? checkoutItems[0].selectedSize : null)}
                selectedStandType={selectedStandType || (checkoutItems.length > 0 ? checkoutItems[0].selectedStandType : null)}
                displayPrice={subtotal}
                deliveryMethod={deliveryMethod}
                deliveryCharge={deliveryCharge}
                prefillShipping={{
                    fullName: form.fullName,
                    phone: form.phone,
                    email: form.email,
                    address: form.address,
                    city: form.city,
                    state: form.city,
                    zipCode: "",
                }}
                prefillPaymentMethod={checkoutPaymentMethod}
                skipShippingForm={true}
                prefillReceiptFile={receiptFile}
                prefillReceiptPreview={receiptPreview}
                selectedOnlineMethod={selectedOnlineMethodData}
            />
        </div>
    );
};

export default Checkout;