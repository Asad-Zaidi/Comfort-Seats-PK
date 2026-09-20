import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    FiBox,
    FiCheckCircle,
    FiTruck,
    FiShield,
    FiHeadphones,
    FiCheck,
    FiAlertCircle,
    FiLoader,
    FiArrowRight,
    FiPercent,
    FiBriefcase,
    FiMail,
    FiPhone,
    FiUser,
    FiMapPin,
    FiFileText,
    FiShoppingCart,
    FiPlus,
    FiMinus,
    FiX,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import SEO from "../components/SEO";
import Footer from "../components/Footer";
import DropDown from "../components/DropDown";
import api from "../api/api";
import { useToast } from "../components/ToastNotification";
import { useSiteConfig } from "../utils/siteConfig";
import { PAKISTAN_PROVINCES, CITIES_BY_PROVINCE } from "../utils/pakistanLocations";

export default function BulkOrder() {
    const { whatsappNumber } = useSiteConfig();
    const toast = useToast();

    // Discount Tiers from API
    const [discountTiers, setDiscountTiers] = useState([]);
    const [tiersLoading, setTiersLoading] = useState(true);

    // Products list from API
    const [catalogProducts, setCatalogProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    // Selected products for quote: array of { product, quantity }
    const [selectedItems, setSelectedItems] = useState([]);
    const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
    const [productSearch, setProductSearch] = useState("");

    // Form fields
    const [formData, setFormData] = useState({
        customerName: "",
        email: "",
        phone: "",
        companyName: "",
        totalQuantity: 10,
        deliveryAddress: "",
        state: "Punjab",
        city: "Lahore",
        postalCode: "",
        country: "Pakistan",
        additionalDetails: "",
    });

    const [isCustomCity, setIsCustomCity] = useState(false);
    const [customCityValue, setCustomCityValue] = useState("");

    // Submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [submittedData, setSubmittedData] = useState(null);

    // Fetch discount tiers from single configurable source
    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const res = await api.get("/bulk-orders/discounts");
                if (res.data?.success && Array.isArray(res.data.data)) {
                    setDiscountTiers(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load discount tiers:", err);
                // Fallback default tiers
                setDiscountTiers([
                    { minQuantity: 5, maxQuantity: 10, discountPercentage: 5, label: "5–10 chairs" },
                    { minQuantity: 11, maxQuantity: 20, discountPercentage: 10, label: "11–20 chairs" },
                    { minQuantity: 21, maxQuantity: 50, discountPercentage: 15, label: "21–50 chairs" },
                    { minQuantity: 51, maxQuantity: null, discountPercentage: 20, label: "51+ chairs" },
                ]);
            } finally {
                setTiersLoading(false);
            }
        };
        fetchTiers();
    }, []);

    // Fetch products catalog for the product picker
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get("/products?limit=60");
                if (res.data?.success && Array.isArray(res.data.data)) {
                    setCatalogProducts(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load catalog products:", err);
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Dynamic cities based on province
    const availableCities = useMemo(() => {
        if (formData.state && CITIES_BY_PROVINCE[formData.state]) {
            return [...CITIES_BY_PROVINCE[formData.state], "Other"];
        }
        return ["Other"];
    }, [formData.state]);

    // Active discount tier based on entered quantity
    const currentQuantity = Math.max(1, parseInt(formData.totalQuantity, 10) || 1);

    const activeTier = useMemo(() => {
        if (!discountTiers || discountTiers.length === 0) return null;
        const sorted = [...discountTiers].sort((a, b) => b.minQuantity - a.minQuantity);
        for (const t of sorted) {
            if (currentQuantity >= t.minQuantity) {
                if (t.maxQuantity === null || t.maxQuantity === undefined || currentQuantity <= t.maxQuantity) {
                    return t;
                }
            }
        }
        return null;
    }, [discountTiers, currentQuantity]);

    // Dynamic price calculation
    const pricingEstimate = useMemo(() => {
        const discountPct = activeTier ? activeTier.discountPercentage : 0;
        let subtotal = 0;

        if (selectedItems.length > 0) {
            subtotal = selectedItems.reduce((acc, item) => {
                const price = item.product.isDiscountEnabled && item.product.discountPrice > 0
                    ? item.product.discountPrice
                    : item.product.price || item.product.actualPrice || 0;
                return acc + (price * item.quantity);
            }, 0);
        } else {
            // Default placeholder average price estimation per chair (Rs. 18,500)
            subtotal = currentQuantity * 18500;
        }

        const discountAmount = Math.round((subtotal * discountPct) / 100);
        const total = Math.max(0, subtotal - discountAmount);

        return {
            subtotal,
            discountPct,
            discountAmount,
            total,
            isCustomSelection: selectedItems.length > 0,
        };
    }, [selectedItems, activeTier, currentQuantity]);

    // Handle input field changes
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    // Handle product selection additions
    const handleAddProduct = (product) => {
        setSelectedItems((prev) => {
            const existing = prev.find((i) => i.product._id === product._id);
            if (existing) {
                return prev.map((i) =>
                    i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    // Handle product quantity adjustments
    const handleItemQuantityChange = (productId, delta) => {
        setSelectedItems((prev) =>
            prev
                .map((item) => {
                    if (item.product._id === productId) {
                        const newQty = item.quantity + delta;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean)
        );
    };

    const handleRemoveProduct = (productId) => {
        setSelectedItems((prev) => prev.filter((i) => i.product._id !== productId));
    };

    // Form Validation
    const validateForm = () => {
        const errs = {};
        if (!formData.customerName.trim()) {
            errs.customerName = "Full name is required";
        }
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errs.email = "Please enter a valid email address";
        }
        if (!formData.phone.trim()) {
            errs.phone = "Phone number is required";
        } else if (formData.phone.trim().length < 8) {
            errs.phone = "Please enter a valid phone number";
        }
        if (formData.totalQuantity !== "" && parseInt(formData.totalQuantity, 10) < 1) {
            errs.totalQuantity = "Please enter a valid quantity of chairs (minimum 1)";
        }
        if (!formData.deliveryAddress.trim()) {
            errs.deliveryAddress = "Delivery address is required";
        }
        const effectiveCity = isCustomCity ? customCityValue.trim() : formData.city;
        if (!effectiveCity) {
            errs.city = "City is required";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fill in all required fields accurately.");
            return;
        }

        setIsSubmitting(true);

        const effectiveCity = isCustomCity ? customCityValue.trim() : formData.city;

        const payloadProducts = selectedItems.map((item) => ({
            productId: item.product._id,
            productName: item.product.name,
            sku: item.product.sku || "",
            price: item.product.isDiscountEnabled && item.product.discountPrice > 0
                ? item.product.discountPrice
                : item.product.price || item.product.actualPrice || 0,
            quantity: item.quantity,
            imageUrl: item.product.imageUrl || item.product.productImages?.[0]?.url || "",
        }));

        const finalQuantity = parseInt(formData.totalQuantity, 10) ||
            (selectedItems.length > 0 ? selectedItems.reduce((acc, item) => acc + item.quantity, 0) : 1);

        try {
            const res = await api.post("/bulk-orders", {
                customerName: formData.customerName.trim(),
                email: formData.email.trim() ? formData.email.trim().toLowerCase() : "",
                phone: formData.phone.trim(),
                companyName: formData.companyName.trim(),
                totalQuantity: finalQuantity,
                deliveryAddress: formData.deliveryAddress.trim(),
                state: formData.state,
                city: effectiveCity,
                postalCode: formData.postalCode.trim(),
                country: formData.country,
                additionalDetails: formData.additionalDetails.trim(),
                products: payloadProducts,
            });

            if (res.data?.success) {
                setSubmittedData(res.data.data);
                toast.success("Bulk order quote request submitted successfully!");
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                toast.error(res.data?.message || "Failed to submit request.");
            }
        } catch (err) {
            console.error("Bulk order submission error:", err);
            toast.error(err?.response?.data?.message || "Server error while submitting request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Share current form details via WhatsApp
    const handleWhatsAppShare = () => {
        const effectiveCity = isCustomCity ? customCityValue.trim() : formData.city;
        const lines = [
            "👋 *Hello ComfortSeats PK!*",
            "I would like to request a bulk order quotation with the following details:",
            "",
            "📋 *Customer & Delivery Details:*",
            formData.customerName ? `• Name: ${formData.customerName}` : "",
            formData.phone ? `• Phone: ${formData.phone}` : "",
            formData.email ? `• Email: ${formData.email}` : "",
            formData.companyName ? `• Organization: ${formData.companyName}` : "",
            formData.deliveryAddress
                ? `• Delivery Address: ${formData.deliveryAddress}, ${effectiveCity}${formData.state ? `, ${formData.state}` : ""}`
                : (effectiveCity ? `• City: ${effectiveCity}` : ""),
            "",
            "🪑 *Order Specifications:*",
            `• Expected Quantity: ${currentQuantity} Chairs`,
            activeTier ? `• Applicable Volume Discount: ${activeTier.discountPercentage}% OFF (${activeTier.label})` : "",
        ];

        if (selectedItems.length > 0) {
            lines.push("", "📦 *Selected Product Models:*");
            selectedItems.forEach(({ product, quantity: itemQty }) => {
                const price = product.isDiscountEnabled && product.discountPrice > 0
                    ? product.discountPrice
                    : product.price || product.actualPrice || 0;
                lines.push(`• ${product.name} x ${itemQty} (Rs. ${price.toLocaleString()})`);
            });
        }

        if (pricingEstimate.subtotal > 0) {
            lines.push(
                "",
                "💰 *Pricing Estimate:*",
                `• Subtotal: Rs. ${pricingEstimate.subtotal.toLocaleString()}`,
                pricingEstimate.discountAmount > 0
                    ? `• Estimated Bulk Discount: -Rs. ${pricingEstimate.discountAmount.toLocaleString()} (${pricingEstimate.discountPct}%)`
                    : "",
                `• Estimated Total: Rs. ${pricingEstimate.total.toLocaleString()}`
            );
        }

        if (formData.additionalDetails.trim()) {
            lines.push("", "📝 *Additional Requirements / Notes:*", formData.additionalDetails.trim());
        }

        lines.push("", "Please provide pricing and delivery availability. Thank you!");

        const message = lines.filter((l) => l !== "").join("\n");
        const targetNumber = whatsappNumber ? whatsappNumber.replace(/[^\d]/g, "") : "923000000000";
        window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`, "_blank");
    };

    // Filtered products for dropdown picker
    const filteredCatalog = useMemo(() => {
        if (!productSearch.trim()) return catalogProducts.slice(0, 8);
        return catalogProducts
            .filter((p) =>
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
            )
            .slice(0, 10);
    }, [catalogProducts, productSearch]);

    // Quantity Presets
    const quantityPresets = [
        { label: "5–10 Chairs", value: 10 },
        { label: "11–20 Chairs", value: 20 },
        { label: "21–50 Chairs", value: 50 },
        { label: "51+ Chairs", value: 75 },
    ];


    // SUCCESS SCREEN
    if (submittedData) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary,#f8fafc)] py-16 px-4 sm:px-6 lg:px-8">
                <SEO
                    title="Bulk Order Request Submitted | ComfortSeats PK"
                    description="Your bulk order request has been received by ComfortSeats PK."
                />
                <div className="mx-auto max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                        <FiCheckCircle size={44} />
                    </div>

                    <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--primary,#2F6FED)] bg-blue-50 rounded-full mb-3">
                        REQUEST CONFIRMED
                    </span>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                        Bulk Order Request Submitted
                    </h1>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Thank you, <strong className="text-gray-900">{submittedData.customerName}</strong>. Your corporate quote inquiry has been routed to our corporate sales department.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-left mb-8 space-y-3.5">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-sm">
                            <span className="text-gray-500 font-medium">Quote Reference ID</span>
                            <span className="font-bold text-[var(--primary,#2F6FED)] text-base tracking-wide">
                                {submittedData.quoteId}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Company / Organization</span>
                            <span className="font-semibold text-gray-800">{submittedData.companyName || "Individual / Not specified"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Requested Quantity</span>
                            <span className="font-semibold text-gray-800">
                                {submittedData.totalQuantity ? `${submittedData.totalQuantity} Chairs` : "Standard Inquiry"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Initial Status</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {submittedData.status || "Pending Review"}
                            </span>
                        </div>
                    </div>

                    {submittedData.email ? (
                        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs sm:text-sm text-blue-900 text-left mb-8 flex items-start gap-3">
                            <FiMail className="shrink-0 text-blue-600 mt-0.5" size={18} />
                            <div>
                                We have dispatched a confirmation email to{" "}
                                <strong>{submittedData.email}</strong>. Our team will contact you within 24 business hours with customized pricing and delivery details.
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs sm:text-sm text-blue-900 text-left mb-8 flex items-start gap-3">
                            <FiPhone className="shrink-0 text-blue-600 mt-0.5" size={18} />
                            <div>
                                Our corporate sales team has received your request and will contact you via phone / WhatsApp within 24 business hours with customized pricing and delivery details.
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {whatsappNumber && (
                            <a
                                href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Hi ComfortSeats PK, I have submitted bulk order quote request [${submittedData.quoteId}] for ${submittedData.totalQuantity || "volume"} chairs. Please provide updates.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 cursor-pointer"
                            >
                                <FaWhatsapp className="mr-2" size={18} />
                                Chat on WhatsApp
                            </a>
                        )}
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-white bg-[var(--primary,#2F6FED)] hover:bg-[var(--primary-hover,#1d4ed8)] transition shadow-md shadow-blue-500/20"
                        >
                            <FiShoppingCart className="mr-2" size={18} />
                            Continue Shopping
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg,#ffffff)] text-[var(--text,#12131A)]">
            <SEO
                title="Bulk Orders & Corporate Pricing | ComfortSeats PK"
                description="Equip your office with ComfortSeats bulk volume discounts. Request customized corporate quotes for premium ergonomic chairs, fast delivery across Pakistan."
            />


            {/* 2. BENEFITS SECTION */}
            <section className="relative z-10 mx-auto max-w-full px-4 pt-20 sm:px-16 lg:px-32">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-gray-100 transition hover:-translate-y-1 duration-200">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[var(--primary,#2F6FED)] flex items-center justify-center shrink-0">
                                <FiPercent size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Special Discounts</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Save more with tiered bulk pricing.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-gray-100 transition hover:-translate-y-1 duration-200">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <FiTruck size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Fast & Reliable Delivery</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Reliable delivery for business orders.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-gray-100 transition hover:-translate-y-1 duration-200">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <FiShield size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Warranty Support</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Full product warranty applicable.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-gray-100 transition hover:-translate-y-1 duration-200">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <FiHeadphones size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Dedicated Support</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Personalized assistance for bulk orders.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. MAIN BULK ORDER SECTION: TWO COLUMNS (QUOTE FORM + DISCOUNTS CARD) */}
            <section id="quote-form" className="py-16 lg:py-24 mx-auto max-w-full px-4 sm:px-16 lg:px-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* LEFT COLUMN: REQUEST A BULK ORDER QUOTE FORM */}
                    <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100">
                        <div className="border-b border-gray-100 pb-6 mb-8">
                            <span className="text-xs font-bold text-[var(--primary,#2F6FED)] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                                CORPORATE INQUIRY
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
                                Request a Bulk Order Quote
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Fill out the form and our team will get back to you with bulk pricing and a customized quote.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* SECTION A: CUSTOMER & DELIVERY INFORMATION */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                    <FiUser size={16} className="text-[var(--primary,#2F6FED)]" />
                                    <span>Customer & Delivery Information</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customerName}
                                            onChange={(e) => handleChange("customerName", e.target.value)}
                                            placeholder="e.g. Muhammad Usman"
                                            className={`w-full rounded-xl border px-4 py-3 text-sm transition outline-hidden ${errors.customerName
                                                ? "border-red-500 ring-1 ring-red-500 bg-red-50/20"
                                                : "border-gray-200 focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/20"
                                                }`}
                                        />
                                        {errors.customerName && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <FiAlertCircle size={12} /> {errors.customerName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Phone / WhatsApp Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleChange("phone", e.target.value)}
                                                placeholder="e.g. +92 300 1234567"
                                                className={`w-full rounded-xl border px-4 py-3 text-sm transition outline-hidden ${errors.phone
                                                    ? "border-red-500 ring-1 ring-red-500 bg-red-50/20"
                                                    : "border-gray-200 focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/20"
                                                    }`}
                                            />
                                            <FiPhone className="absolute right-4 top-3.5 text-gray-400" size={16} />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <FiAlertCircle size={12} /> {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Email Address <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                            placeholder="e.g. usman@company.com"
                                            className={`w-full rounded-xl border px-4 py-3 text-sm transition outline-hidden ${errors.email
                                                ? "border-red-500 ring-1 ring-red-500 bg-red-50/20"
                                                : "border-gray-200 focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/20"
                                                }`}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <FiAlertCircle size={12} /> {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Company / Organization Name <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.companyName}
                                            onChange={(e) => handleChange("companyName", e.target.value)}
                                            placeholder="e.g. TechCorp Solutions / Punjab University / ABC Hotel"
                                            className={`w-full rounded-xl border px-4 py-3 text-sm transition outline-hidden ${errors.companyName
                                                ? "border-red-500 ring-1 ring-red-500 bg-red-50/20"
                                                : "border-gray-200 focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/20"
                                                }`}
                                        />
                                        {errors.companyName && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <FiAlertCircle size={12} /> {errors.companyName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                        <FiMapPin size={13} className="text-[var(--primary,#2F6FED)]" />
                                        <span>Delivery Address / Office Location</span> <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.deliveryAddress}
                                        onChange={(e) => handleChange("deliveryAddress", e.target.value)}
                                        placeholder="Building, Floor, Street, Commercial Area"
                                        className={`w-full rounded-xl border px-4 py-3 text-sm transition outline-hidden ${errors.deliveryAddress
                                            ? "border-red-500 ring-1 ring-red-500 bg-red-50/20"
                                            : "border-gray-200 focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/20"
                                            }`}
                                    />
                                    {errors.deliveryAddress && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <FiAlertCircle size={12} /> {errors.deliveryAddress}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Province / Territory
                                        </label>
                                        <DropDown
                                            value={formData.state}
                                            onChange={(val) => {
                                                handleChange("state", val);
                                                // Reset city when province changes
                                                const defaultCity = CITIES_BY_PROVINCE[val]?.[0] || "Other";
                                                handleChange("city", defaultCity);
                                                setIsCustomCity(defaultCity === "Other");
                                            }}
                                            options={PAKISTAN_PROVINCES}
                                            placeholder="Select Province"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <DropDown
                                            value={isCustomCity ? "Other" : formData.city}
                                            onChange={(val) => {
                                                if (val === "Other") {
                                                    setIsCustomCity(true);
                                                } else {
                                                    setIsCustomCity(false);
                                                    handleChange("city", val);
                                                }
                                            }}
                                            options={availableCities}
                                            placeholder="Select City"
                                            searchable={true}
                                        />
                                        {isCustomCity && (
                                            <input
                                                type="text"
                                                placeholder="Enter City Name"
                                                value={customCityValue}
                                                onChange={(e) => setCustomCityValue(e.target.value)}
                                                className="mt-2 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-hidden focus:border-[var(--primary,#2F6FED)]"
                                            />
                                        )}
                                        {errors.city && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <FiAlertCircle size={12} /> {errors.city}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION B: QUANTITY */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                        <FiBox size={16} className="text-[var(--primary,#2F6FED)]" />
                                        <span>Number of Chairs</span>
                                    </h3>
                                    {activeTier && (
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {activeTier.discountPercentage}% Volume Discount Applied
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Expected Quantity <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.totalQuantity}
                                            onChange={(e) => handleChange("totalQuantity", e.target.value)}
                                            className={`w-full sm:w-44 rounded-xl border px-4 py-3 text-base font-bold text-gray-900 transition outline-hidden ${errors.totalQuantity
                                                ? "border-red-500 ring-1 ring-red-500"
                                                : "border-gray-200 focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/20"
                                                }`}
                                        />
                                        {/* Quick Preset Buttons */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                                            {quantityPresets.map((preset) => {
                                                const isSelected = parseInt(formData.totalQuantity, 10) === preset.value;
                                                return (
                                                    <button
                                                        key={preset.label}
                                                        type="button"
                                                        onClick={() => handleChange("totalQuantity", preset.value)}
                                                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${isSelected
                                                            ? "bg-[var(--primary,#2F6FED)] text-white border-[var(--primary,#2F6FED)] shadow-xs"
                                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                                            }`}
                                                    >
                                                        {preset.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {errors.totalQuantity && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <FiAlertCircle size={12} /> {errors.totalQuantity}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* SECTION C: PREFERRED PRODUCTS (RETRIEVED FROM EXISTING CATALOG) */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                        <FiShoppingCart size={16} className="text-[var(--primary,#2F6FED)]" />
                                        <span>Preferred Product(s)</span>
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsProductPickerOpen(!isProductPickerOpen)}
                                        className="text-xs font-semibold text-[var(--primary,#2F6FED)] hover:underline flex items-center gap-1"
                                    >
                                        {isProductPickerOpen ? "Close Catalog" : "+ Select from Catalog"}
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500">
                                    Select specific ComfortSeats chair models for this quote, or leave empty if you want our team to recommend models.
                                </p>

                                {/* Selected Products Chips/List */}
                                {selectedItems.length > 0 ? (
                                    <div className="space-y-2 border border-gray-100 bg-gray-50/60 rounded-2xl p-3.5">
                                        {selectedItems.map(({ product, quantity }) => {
                                            const coverImg = product.imageUrl || product.productImages?.[0]?.url || "";
                                            const unitPrice = product.isDiscountEnabled && product.discountPrice > 0
                                                ? product.discountPrice
                                                : product.price || product.actualPrice || 0;
                                            return (
                                                <div
                                                    key={product._id}
                                                    className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        {coverImg ? (
                                                            <img
                                                                src={coverImg}
                                                                alt={product.name}
                                                                className="h-11 w-11 object-cover rounded-lg bg-gray-100 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="h-11 w-11 rounded-lg bg-blue-50 text-[var(--primary,#2F6FED)] flex items-center justify-center shrink-0">
                                                                <FiBox size={18} />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-bold text-gray-900 truncate">
                                                                {product.name}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                {product.sku ? `SKU: ${product.sku} &bull; ` : ""}
                                                                Rs. {unitPrice.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleItemQuantityChange(product._id, -1)}
                                                                className="h-6 w-6 rounded flex items-center justify-center hover:bg-white text-gray-600"
                                                            >
                                                                <FiMinus size={12} />
                                                            </button>
                                                            <span className="w-8 text-center text-xs font-bold text-gray-800">
                                                                {quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleItemQuantityChange(product._id, 1)}
                                                                className="h-6 w-6 rounded flex items-center justify-center hover:bg-white text-gray-600"
                                                            >
                                                                <FiPlus size={12} />
                                                            </button>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveProduct(product._id)}
                                                            className="text-gray-400 hover:text-red-500 p-1"
                                                        >
                                                            <FiX size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-gray-200 rounded-2xl p-4 text-center">
                                        <p className="text-xs text-gray-500">
                                            No specific models chosen yet.{" "}
                                            <button
                                                type="button"
                                                onClick={() => setIsProductPickerOpen(true)}
                                                className="text-[var(--primary,#2F6FED)] font-semibold underline"
                                            >
                                                Browse Catalog Models
                                            </button>
                                        </p>
                                    </div>
                                )}

                                {/* Product Selector Drawer/Dropdown */}
                                {isProductPickerOpen && (
                                    <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-lg space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-700">Choose from ComfortSeats Chairs:</span>
                                            <button
                                                type="button"
                                                onClick={() => setIsProductPickerOpen(false)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Search by chair name or SKU..."
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-hidden focus:border-[var(--primary,#2F6FED)]"
                                        />

                                        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                                            {productsLoading ? (
                                                <div className="py-6 text-center text-xs text-gray-400">Loading catalog...</div>
                                            ) : filteredCatalog.length === 0 ? (
                                                <div className="py-4 text-center text-xs text-gray-400">No matching products found.</div>
                                            ) : (
                                                filteredCatalog.map((prod) => {
                                                    const isAlreadyChosen = selectedItems.some((i) => i.product._id === prod._id);
                                                    const img = prod.imageUrl || prod.productImages?.[0]?.url || "";
                                                    const price = prod.isDiscountEnabled && prod.discountPrice > 0
                                                        ? prod.discountPrice
                                                        : prod.price || prod.actualPrice || 0;
                                                    return (
                                                        <div
                                                            key={prod._id}
                                                            className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                {img && (
                                                                    <img
                                                                        src={img}
                                                                        alt={prod.name}
                                                                        className="h-9 w-9 object-cover rounded-lg bg-gray-100 shrink-0"
                                                                    />
                                                                )}
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-semibold text-gray-800 truncate">{prod.name}</p>
                                                                    <p className="text-[11px] text-gray-500">Rs. {price.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddProduct(prod)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isAlreadyChosen
                                                                    ? "bg-blue-50 text-[var(--primary,#2F6FED)] border border-blue-200"
                                                                    : "bg-gray-100 hover:bg-[var(--primary,#2F6FED)] hover:text-white text-gray-700"
                                                                    }`}
                                                            >
                                                                {isAlreadyChosen ? "+ Add Another" : "+ Select"}
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>


                            {/* SECTION D: ADDITIONAL DETAILS */}
                            <div className="space-y-2 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                        <FiFileText size={16} className="text-[var(--primary,#2F6FED)]" />
                                        <span>Additional Requirements (Optional)</span>
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                        {formData.additionalDetails.length} / 1500
                                    </span>
                                </div>
                                <textarea
                                    rows={4}
                                    maxLength={1500}
                                    value={formData.additionalDetails}
                                    onChange={(e) => handleChange("additionalDetails", e.target.value)}
                                    placeholder="Describe required delivery date, color preferences, custom upholstery, assembly on site, or special procurement instructions..."
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition outline-hidden focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/20 resize-none"
                                />
                            </div>

                            {/* SUBMIT & WHATSAPP ACTION BUTTONS */}
                            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-bold text-white text-sm shadow-md shadow-blue-500/20 transition duration-200 ${isSubmitting
                                        ? "bg-blue-400 cursor-not-allowed"
                                        : "bg-[var(--primary,#2F6FED)] hover:bg-[var(--primary-hover,#1d4ed8)] active:scale-[0.99] cursor-pointer"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FiLoader className="animate-spin" size={18} />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Request Bulk Quote</span>
                                            <FiArrowRight size={18} />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleWhatsAppShare}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-bold text-white text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition duration-200 shadow-md shadow-emerald-600/20 cursor-pointer"
                                >
                                    <FaWhatsapp size={19} />
                                    <span>Share on WhatsApp</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: BULK ORDER DISCOUNTS & LIVE ESTIMATOR */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                        {/* CARD 1: DISCOUNTS INFORMATION & TIERS TABLE */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                VOLUME ADVANTAGE
                            </span>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-3 tracking-tight">
                                The More You Buy, The More You Save
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                                Get attractive discounts on bulk orders and create a more comfortable and productive workspace for your team.
                            </p>

                            {/* Tiers Table */}
                            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
                                <table className="w-full text-left text-xs sm:text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">Quantity Range</th>
                                            <th className="py-3 px-4 text-right">Discount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tiersLoading ? (
                                            <tr>
                                                <td colSpan={2} className="py-4 text-center text-gray-400 text-xs">
                                                    Loading bulk discount tiers...
                                                </td>
                                            </tr>
                                        ) : discountTiers.map((tier) => {
                                            const isActive = activeTier && activeTier._id === tier._id;
                                            return (
                                                <tr
                                                    key={tier._id || tier.label}
                                                    className={`transition ${isActive
                                                        ? "bg-blue-50/80 font-bold text-[var(--primary,#2F6FED)]"
                                                        : "hover:bg-gray-50/50 text-gray-700"
                                                        }`}
                                                >
                                                    <td className="py-3 px-4 flex items-center gap-2">
                                                        {isActive && <FiCheck className="text-[var(--primary,#2F6FED)] shrink-0" size={15} />}
                                                        <span>{tier.label}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                                                        {tier.discountPercentage}% OFF
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* DYNAMIC ESTIMATOR BREAKDOWN */}
                            <div className="mt-6 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100 rounded-2xl p-5 space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">Selected Quantity:</span>
                                    <span className="font-bold text-gray-900">{currentQuantity} Chairs</span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">Active Discount Tier:</span>
                                    <span className="font-bold text-emerald-600">
                                        {activeTier ? `${activeTier.discountPercentage}% (${activeTier.label})` : "Standard Pricing"}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">
                                        {pricingEstimate.isCustomSelection ? "Catalog Subtotal:" : "Est. Subtotal:"}
                                    </span>
                                    <span className="font-semibold text-gray-700">
                                        Rs. {pricingEstimate.subtotal.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-xs text-emerald-600 font-semibold">
                                    <span>Bulk Discount Savings:</span>
                                    <span>- Rs. {pricingEstimate.discountAmount.toLocaleString()}</span>
                                </div>

                                <div className="pt-3 border-t border-blue-200/60 flex justify-between items-center">
                                    <div>
                                        <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Estimated Total</span>
                                        <p className="text-[10px] text-gray-400">Final price validated on quote</p>
                                    </div>
                                    <span className="text-xl font-extrabold text-[var(--primary,#2F6FED)]">
                                        Rs. {pricingEstimate.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: NEED FAST ASSISTANCE */}
                        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-sm">Need immediate bulk assistance?</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Speak with our corporate furnishing specialists directly.</p>
                            </div>
                            {whatsappNumber && (
                                <a
                                    href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}?text=Hi,%20I%20have%20an%20urgent%20bulk%20chair%20requirement`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-11 w-11 rounded-xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shrink-0 shadow-md transition"
                                >
                                    <FaWhatsapp size={22} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. BUSINESS / INDUSTRY SECTION */}
            <section className="py-16 bg-[var(--bg-secondary,#f8fafc)] border-t border-b border-gray-100">
                <div className="mx-auto max-w-full px-4 sm:px-16 lg:px-32 text-center space-y-4">
                    <span className="text-xs font-bold text-[var(--primary,#2F6FED)] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                        PERFECT FOR
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Offices, Businesses & Institutions
                    </h2>
                    <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
                        Whether setting up a new tech startup, modernizing a corporate floor, or equipping school computer labs, ComfortSeats offers dedicated commercial seating solutions.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 text-left">
                        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-md transition">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[var(--primary,#2F6FED)] flex items-center justify-center mb-4">
                                <FiBriefcase size={20} />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Corporate Offices</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Ergonomic workstations for startups, call centers, IT teams, and headquarters designed for 8+ hours posture health.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-md transition">
                            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                                <FiBox size={20} />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Educational Institutions</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Durable seating for university faculty rooms, campus IT labs, libraries, and administrative offices.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-md transition">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                <FiShield size={20} />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Government Organizations</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Compliant commercial seating with standardized procurement receipts and nationwide logistics.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-md transition">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                                <FiPercent size={20} />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Retail & Hospitality</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Front desk, reception, boutique hotel management, and customer waiting lounge furniture.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-md transition">
                            <div className="h-10 w-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4">
                                <FiHeadphones size={20} />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Coworking Spaces</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                High-turnover durable seating with modern aesthetic finishes tailored for flexible, shared workspaces.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-md transition">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                                <FiTruck size={20} />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Large Workspaces</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Large-scale chair deployment across multiple regional branches with scheduled batch deliveries.
                            </p>
                        </div>
                    </div>
                </div>
            </section>



            <Footer />
        </div>
    );
}