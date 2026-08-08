import { useState, useEffect, useRef, useMemo } from "react";
import { FaTimes, FaTruck, FaCreditCard, FaUniversity, FaMoneyBillWave, FaUpload, FaPaperclip } from "react-icons/fa";
import { getColorName, isHexColor } from "../utils/ColorName";
import api, { putMultipart } from "../api/api";
import { useShop } from "../context/ShopContext";

const OrderModal = ({
    isOpen,
    onClose,
    product,
    items = [],
    quantity,
    selectedColor,
    selectedSize,
    selectedStandType,
    displayPrice,
    // Props for pre-filled data from checkout page
    prefillShipping,
    prefillPaymentMethod,
    skipShippingForm,
    prefillReceiptFile = null,
    prefillReceiptPreview = "",
    deliveryMethod = "standard",
    deliveryCharge = 0,
    selectedOnlineMethod = null,
}) => {
    const [step, setStep] = useState("review"); // review | confirming | confirmed
    const [shipping, setShipping] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [transactionRef, setTransactionRef] = useState("");
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState("");
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const receiptInputRef = useRef(null);
    const [errors, setErrors] = useState({});
    const { clearCart } = useShop();

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep("review");
            // Use pre-filled data if provided (from checkout page), otherwise reset to empty
            if (prefillShipping) {
                setShipping({
                    fullName: prefillShipping.fullName || "",
                    phone: prefillShipping.phone || "",
                    email: prefillShipping.email || "",
                    address: prefillShipping.address || "",
                    city: prefillShipping.city || "",
                    state: prefillShipping.state || "",
                    zipCode: prefillShipping.zipCode || "",
                });
            } else {
                setShipping({
                    fullName: "",
                    phone: "",
                    address: "",
                    email: "",
                    city: "",
                    state: "",
                    zipCode: "",
                });
            }
            setPaymentMethod(prefillPaymentMethod || "cod");
            setErrors({});
            setReceiptFile(prefillReceiptFile || null);
            setReceiptPreview(prefillReceiptPreview || "");
            setTransactionRef("");
        }
    }, [isOpen, prefillShipping, prefillPaymentMethod, prefillReceiptFile, prefillReceiptPreview]);

    const handleReceiptChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!/image\/(jpeg|jpg|png|gif|webp)/.test(file.type)) {
            setErrors((prev) => ({ ...prev, receipt: "Only image files are allowed." }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, receipt: "Image must be under 5MB." }));
            return;
        }
        setErrors((prev) => ({ ...prev, receipt: undefined }));
        setReceiptFile(file);
        setReceiptPreview(URL.createObjectURL(file));
    };

    const removeReceipt = () => {
        setReceiptFile(null);
        setReceiptPreview("");
        if (receiptInputRef.current) receiptInputRef.current.value = "";
    };

    const validateShipping = () => {
        // If shipping form is skipped (from checkout), no validation needed
        if (skipShippingForm) return true;
        const newErrors = {};
        if (!shipping.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!shipping.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!/^[\d\s+\-()]{7,15}$/.test(shipping.phone))
            newErrors.phone = "Enter a valid phone number";
        if (!shipping.address.trim()) newErrors.address = "Address is required";
        if (!shipping.city.trim()) newErrors.city = "City is required";
        if (!shipping.state.trim()) newErrors.state = "State is required";
        if (!shipping.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = async () => {
        if (!validateShipping()) return;

        // Validate receipt for online payments
        if ((paymentMethod === "bank" || paymentMethod === "card") && !receiptFile) {
            setErrors((prev) => ({ ...prev, receipt: "Payment receipt is required for online payments." }));
            return;
        }

        if (window.fbq) {
            window.fbq("track", "AddPaymentInfo");
        }

        setStep("confirming");

        try {
            // Save order to database
            const orderData = {
                items: displayItems,
                product: {
                    productId: displayItems[0]?.productId || product?.productId || product?._id || null,
                    name: displayItems.length > 1 ? `${displayItems.length} Items Order (${displayItems[0]?.name} + more)` : (displayItems[0]?.name || product?.name || ""),
                    price: displayItems[0]?.price || displayPrice || 0,
                    imageUrl: displayItems[0]?.imageUrl || product?.imageUrl || "",
                    color: displayItems[0]?.color || selectedColor || "",
                    size: displayItems[0]?.size || selectedSize || "",
                    slug: displayItems[0]?.slug || product?.slug || "",
                    selectedStandType: displayItems[0]?.selectedStandType || selectedStandType || "",
                    actualPrice: displayItems[0]?.actualPrice || product?.actualPrice || 0,
                    discountPrice: displayItems[0]?.discountPrice || product?.discountPrice || 0,
                    isDiscountEnabled: displayItems[0]?.isDiscountEnabled || product?.isDiscountEnabled || false,
                },
                quantity: displayItems.reduce((a, b) => a + b.quantity, 0),
                totalPrice: totalPrice,
                deliveryMethod: deliveryMethod,
                deliveryCharge: Number(deliveryCharge) || 0,
                customer: {
                    fullName: shipping.fullName,
                    phone: shipping.phone,
                    email: shipping.email,
                    address: shipping.address,
                    city: shipping.city,
                },
                paymentMethod: paymentMethod,
                selectedOnlineMethod: selectedOnlineMethod || undefined,
                transactionRef: transactionRef || "",
            };

            const res = await api.post("/orders", orderData);

            if (res.data?.success) {
                // Track Purchase event with backend confirmed order total & items
                if (window.fbq) {
                    const createdOrder = res.data?.data || {};
                    const itemIds = Array.isArray(createdOrder.items) && createdOrder.items.length > 0
                        ? createdOrder.items.map(item => String(item.productId || item._id || '')).filter(Boolean)
                        : displayItems.map(item => String(item.productId || '')).filter(Boolean);

                    window.fbq("track", "Purchase", {
                        value: Number(createdOrder.totalPrice || createdOrder.total || totalPrice) || 0,
                        currency: "PKR",
                        content_ids: itemIds,
                        content_type: "product"
                    });
                }

                // Clear cart session upon successful order
                if (typeof clearCart === 'function') {
                    clearCart();
                }

                // Upload payment receipt (if provided) to the newly created order
                if (receiptFile && res.data?.data?._id) {
                    try {
                        setUploadingReceipt(true);
                        const formData = new FormData();
                        formData.append("receipt", receiptFile);
                        formData.append("transactionRef", transactionRef || "");
                        await putMultipart(`/orders/${res.data.data._id}/receipt`, formData);
                    } catch (receiptErr) {
                        console.error("Receipt upload failed:", receiptErr);
                    } finally {
                        setUploadingReceipt(false);
                    }
                }
                setTimeout(() => {
                    setStep("confirmed");
                }, 500);
            } else {
                throw new Error(res.data?.message || "Failed to create order");
            }
        } catch (error) {
            console.error("Order creation error:", error);
            setStep("review");
            // Show error - we keep the modal open so user can retry
            setErrors({
                form:
                    error?.response?.data?.message ||
                    error.message ||
                    "Failed to place order. Please try again.",
            });
        }
    };

    const displayItems = useMemo(() => {
        if (Array.isArray(items) && items.length > 0) {
            return items.map((item) => {
                const pObj = item.product || {};
                const rawId = item.productId || pObj._id || pObj.id || item._id || item.id || null;
                const pId = (rawId && rawId !== '1') ? rawId : (pObj._id || item._id || null);
                const pName = item.name || pObj.name || 'Product';
                const pPrice = Number(item.price) || Number(pObj.price) || 0;
                const pImg = item.image || item.imageUrl || pObj.imageUrl || pObj.image || (Array.isArray(pObj.images) && (pObj.images[0]?.url || pObj.images[0])) || '';
                const pColor = item.selectedColor || item.color || '';
                const pSize = item.selectedSize || item.size || '';
                const pStand = item.selectedStandType || '';
                const pSlug = item.slug || pObj.slug || '';
                const pQty = Number(item.quantity) || 1;
                return {
                    productId: pId,
                    name: pName,
                    price: pPrice,
                    imageUrl: pImg,
                    color: pColor,
                    size: pSize,
                    selectedStandType: pStand,
                    slug: pSlug,
                    quantity: pQty,
                    actualPrice: Number(item.actualPrice) || 0,
                    discountPrice: Number(item.discountPrice) || 0,
                    isDiscountEnabled: item.isDiscountEnabled === true,
                };
            });
        }
        if (product) {
            const rawId = product?.productId || product?._id || product?.id || null;
            const pId = (rawId && rawId !== '1') ? rawId : (product?._id || null);
            return [{
                productId: pId,
                name: product?.name || "Product",
                price: Number(displayPrice) || Number(product?.price) || 0,
                imageUrl: product?.imageUrl || product?.image || "",
                color: selectedColor || "",
                size: selectedSize || "",
                selectedStandType: selectedStandType || "",
                slug: product?.slug || "",
                quantity: Number(quantity) || 1,
                actualPrice: Number(product?.actualPrice) || 0,
                discountPrice: Number(product?.discountPrice) || 0,
                isDiscountEnabled: product?.isDiscountEnabled || false,
            }];
        }
        return [];
    }, [items, product, displayPrice, selectedColor, selectedSize, selectedStandType, quantity]);

    const itemsSubtotal = displayItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalPrice = itemsSubtotal + (Number(deliveryCharge) || 0);
    const formatPrice = (val) => (Number(val) || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleCloseConfirmed = () => {
        onClose();
        setStep("review");
    };

    if (!isOpen) return null;

    const InputField = ({ label, name, type = "text", placeholder }) => (
        <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
            <input
                type={type}
                name={name}
                value={shipping[name]}
                onChange={(e) => setShipping({ ...shipping, [name]: e.target.value })}
                placeholder={placeholder}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/30 focus:border-[#2F6FED] ${errors[name] ? "border-red-400 bg-red-50" : "border-gray-200"
                    }`}
            />
            {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
        </div>
    );

    // Confirmed state - order placed success screen
    if (step === "confirmed") {
        return (
            <>
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
                    <div className="rounded-3xl shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in zoom-in-95 duration-300 transition-colors duration-300 relative" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text)' }}>
                        {/* Close Icon */}
                        <button
                            onClick={handleCloseConfirmed}
                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-80 z-10"
                            aria-label="Close modal"
                        >
                            <FaTimes size={14} />
                        </button>
                        {/* Animated Checkmark Circle */}
                        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                            <svg className="w-16 h-16" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="var(--border)"
                                    strokeWidth="6"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="var(--success)"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray="264 264"
                                    strokeDashoffset="0"
                                    transform="rotate(-90 50 50)"
                                    style={{ animation: "draw-circle 0.6s ease-in-out forwards" }}
                                />
                                <polyline
                                    points="38,50 47,59 62,41"
                                    fill="none"
                                    stroke="var(--success)"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="60 60"
                                    style={{ animation: "draw-check 0.4s ease-in-out 0.3s forwards" }}
                                />
                            </svg>
                        </div>

                        <h3 className="mt-3 text-xl font-bold" style={{ color: 'var(--text)' }}>Order Confirmed! 🎉</h3>
                        <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Your order has been placed successfully. The Team will contact you soon for confirmation.
                        </p>

                        <div className="mt-4 rounded-xl p-4 text-left space-y-2.5 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                                    Ordered Products ({displayItems.reduce((acc, i) => acc + i.quantity, 0)} items)
                                </p>
                                <div className="max-h-[80px] overflow-y-auto space-y-2 pr-1 border-b pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style={{ borderColor: 'var(--border)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {displayItems.map((item, idx) => {
                                        const colorName = item.color ? (isHexColor(item.color) ? getColorName(item.color) : item.color) : '';
                                        return (
                                            <div key={idx} className="flex items-center gap-2.5 text-xs">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="w-9 h-9 rounded-lg object-cover border shrink-0" style={{ borderColor: 'var(--border)' }} />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 shrink-0">No Img</div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold truncate text-xs" style={{ color: 'var(--text)' }}>{item.name}</p>
                                                    {(colorName || item.size || item.selectedStandType) && (
                                                        <p className="text-[11px] text-gray-500 truncate">
                                                            {[colorName && `Color: ${colorName}`, item.size && `Size: ${item.size}`, item.selectedStandType && `Stand: ${item.selectedStandType}`].filter(Boolean).join(' · ')}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-[11px] font-semibold block" style={{ color: 'var(--text)' }}>x{item.quantity}</span>
                                                    <span className="text-[11px] font-bold" style={{ color: 'var(--primary)' }}>Rs. {formatPrice(item.price * item.quantity)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-between text-xs pt-0.5">
                                <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
                                <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>Rs. {formatPrice(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span style={{ color: 'var(--text-secondary)' }}>Delivery</span>
                                <span className="font-semibold capitalize" style={{ color: 'var(--text)' }}>
                                    {deliveryMethod === "fast" ? "Fast Delivery" : "Standard Delivery"}
                                    {deliveryCharge > 0 ? ` (Rs. ${formatPrice(deliveryCharge)})` : " (Free)"}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span style={{ color: 'var(--text-secondary)' }}>Payment</span>
                                <span className="font-semibold capitalize" style={{ color: 'var(--text)' }}>
                                    {paymentMethod === "cod"
                                        ? "Cash on Delivery"
                                        : selectedOnlineMethod?.name
                                            ? selectedOnlineMethod.name
                                            : paymentMethod === "bank"
                                                ? "Bank Transfer"
                                                : "Card Payment"}
                                </span>
                            </div>
                            {shipping.fullName && (
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: 'var(--text-secondary)' }}>Deliver to</span>
                                    <span className="font-semibold text-right max-w-[180px] truncate" style={{ color: 'var(--text)' }}>
                                        {shipping.fullName}, {shipping.address}, {shipping.city}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCloseConfirmed}
                            style={{ backgroundColor: 'var(--btn-primary-bg, var(--primary))', color: 'var(--btn-primary-text, #fff)' }}
                            className="mt-4 w-full rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition hover:opacity-90 shrink-0"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes draw-circle {
                        from { stroke-dasharray: 0 264; }
                        to { stroke-dasharray: 264 264; }
                    }
                    @keyframes draw-check {
                        from { stroke-dasharray: 0 60; }
                        to { stroke-dasharray: 60 60; }
                    }
                `}</style>
            </>
        );
    }

    // Confirming state - processing order
    if (step === "confirming") {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="rounded-3xl shadow-2xl max-w-md w-full p-10 text-center transition-colors duration-300" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text)' }}>
                    <div className="flex items-center justify-center">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 border-4 rounded-full opacity-20" style={{ borderColor: 'var(--primary)' }}></div>
                            <div className="absolute inset-0 border-4 border-transparent border-t-[var(--primary)] rounded-full animate-spin"></div>
                        </div>
                    </div>
                    <h3 className="mt-6 text-xl font-bold" style={{ color: 'var(--text)' }}>
                        {uploadingReceipt ? "Uploading Receipt..." : "Processing Order..."}
                    </h3>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Please wait while we process your order.</p>
                </div>
            </div>
        );
    }

    // Review state - show order details (wide & large - no scrolling needed)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8">
            <div className="rounded-3xl shadow-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col transition-colors duration-300" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text)' }}>
                {/* Header */}
                <div className="flex items-center justify-between border-b px-8 sm:px-10 py-5 shrink-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Confirm Your Order</h2>
                    <button
                        onClick={onClose}
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                        className="flex h-9 w-9 items-center justify-center rounded-full transition hover:opacity-80"
                    >
                        <FaTimes size={15} />
                    </button>
                </div>

                <div className="p-8 sm:p-10 overflow-y-auto flex-1">
                    {/* Product Summary + Shipping + Payment in 2-column grid for wide layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Product Details */}
                        <div className="rounded-2xl p-5 border flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
                                Product Details ({displayItems.length} {displayItems.length === 1 ? 'item' : 'items'})
                            </h3>
                            <div className="max-h-72 overflow-y-auto space-y-3 pr-1 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {displayItems.map((item, idx) => {
                                    const colorName = item.color ? (isHexColor(item.color) ? getColorName(item.color) : item.color) : null;
                                    return (
                                        <div key={idx} className="flex gap-4 p-3 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border" style={{ borderColor: 'var(--border)' }}>
                                                <img
                                                    src={item.imageUrl || "https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=200"}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{item.name}</h4>
                                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                    {colorName && (
                                                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                                                            <span
                                                                className="w-2 h-2 rounded-full border"
                                                                style={{ backgroundColor: item.color, borderColor: 'var(--border)' }}
                                                            ></span>
                                                            {colorName}
                                                        </span>
                                                    )}
                                                    {item.size && (
                                                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                                                            Size: {item.size}
                                                        </span>
                                                    )}
                                                    {item.selectedStandType && (
                                                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                                                            Stand: {item.selectedStandType}
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                                                        Qty: {item.quantity}
                                                    </span>
                                                </div>
                                                <p className="mt-1.5 text-sm font-bold" style={{ color: 'var(--primary)' }}>Rs. {formatPrice(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 pt-3 border-t flex flex-col gap-1.5" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Items Subtotal</span>
                                    <span className="font-semibold" style={{ color: 'var(--text)' }}>Rs. {formatPrice(itemsSubtotal)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Delivery ({deliveryMethod === "fast" ? "Fast" : "Standard"})</span>
                                    <span className="font-semibold" style={{ color: 'var(--text)' }}>{deliveryCharge > 0 ? `Rs. ${formatPrice(deliveryCharge)}` : "Free"}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold mt-1 pt-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
                                    <span>Order Total</span>
                                    <span style={{ color: 'var(--primary)' }}>Rs. {formatPrice(totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Shipping Details */}
                        {!skipShippingForm ? (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <FaTruck style={{ color: 'var(--primary)' }} size={16} />
                                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Shipping Details</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <InputField label="Full Name" name="fullName" placeholder="Your Name" />
                                    <InputField label="Phone Number" name="phone" placeholder="Phone Number" />
                                    <InputField label="Email Address" name="email" type="email" placeholder="Enter your email" />
                                    <InputField label="Street Address" name="address" placeholder="123 Main Street, Apt 4B" />
                                    <div className="grid grid-cols-3 gap-3">
                                        <InputField label="City" name="city" placeholder="New York" />
                                        <InputField label="State" name="state" placeholder="NY" />
                                        <InputField label="ZIP Code" name="zipCode" placeholder="10001" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <FaTruck style={{ color: 'var(--primary)' }} size={16} />
                                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Shipping Details</h3>
                                </div>
                                <div className="rounded-2xl p-5 space-y-3 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: 'var(--text-secondary)' }}>Name</span>
                                        <span className="font-semibold" style={{ color: 'var(--text)' }}>{shipping.fullName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: 'var(--text-secondary)' }}>Phone</span>
                                        <span className="font-semibold" style={{ color: 'var(--text)' }}>{shipping.phone}</span>
                                    </div>
                                    {shipping.email && (
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: 'var(--text-secondary)' }}>Email</span>
                                            <span className="font-semibold text-right max-w-[250px] truncate" style={{ color: 'var(--text)' }}>
                                                {shipping.email}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: 'var(--text-secondary)' }}>Address</span>
                                        <span className="font-semibold text-right max-w-[250px]" style={{ color: 'var(--text)' }}>{shipping.address}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: 'var(--text-secondary)' }}>City</span>
                                        <span className="font-semibold" style={{ color: 'var(--text)' }}>{shipping.city}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method - full width below */}
                    <div className="mt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaCreditCard style={{ color: 'var(--primary)' }} size={16} />
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Payment Method</h3>
                        </div>
                        <div className="rounded-2xl p-5 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                            <div className="flex items-center gap-3">
                                {paymentMethod === "cod" ? (
                                    <FaMoneyBillWave size={20} style={{ color: 'var(--primary)' }} />
                                ) : paymentMethod === "bank" ? (
                                    <FaUniversity size={20} style={{ color: 'var(--primary)' }} />
                                ) : (
                                    <FaCreditCard size={20} style={{ color: 'var(--primary)' }} />
                                )}
                                <span className="font-semibold capitalize text-base" style={{ color: 'var(--text)' }}>
                                    {paymentMethod === "cod"
                                        ? "Cash on Delivery"
                                        : selectedOnlineMethod?.name
                                            ? selectedOnlineMethod.name
                                            : paymentMethod === "bank"
                                                ? "Bank Transfer"
                                                : "Card Payment"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Receipt Upload (for online/bank payments) */}
                    {(paymentMethod === "bank" || paymentMethod === "card" || paymentMethod === "online") && (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaPaperclip style={{ color: 'var(--primary)' }} size={16} />
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Payment Receipt</h3>
                            </div>
                            <div className="rounded-2xl p-5 border space-y-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
                                        Upload Payment Screenshot / Receipt
                                    </label>
                                    {!receiptPreview ? (
                                        <label className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer text-center transition hover:opacity-90" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                                            <FaUpload style={{ color: 'var(--text-secondary)' }} size={20} />
                                            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Click to upload receipt</span>
                                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>JPG, PNG or WEBP (max 5MB)</span>
                                            <input
                                                ref={receiptInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                onChange={handleReceiptChange}
                                                className="hidden"
                                            />
                                        </label>
                                    ) : (
                                        <div className="relative w-full rounded-xl overflow-hidden border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                                            <img src={receiptPreview} alt="Receipt preview" className="max-h-56 w-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={removeReceipt}
                                                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                                                aria-label="Remove receipt"
                                            >
                                                <FaTimes size={13} />
                                            </button>
                                        </div>
                                    )}
                                    {errors.receipt && <p className="mt-1 text-xs text-red-500">{errors.receipt}</p>}
                                    <p className="mt-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        The receipt will be shared with the store owner along with your order details.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Summary */}
                    <div className="grid grid-cols-1 gap-6 mt-6">
                        <div className="rounded-2xl p-5 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        Subtotal ({quantity} item{quantity > 1 ? "s" : ""})
                                    </span>
                                    <span className="font-medium" style={{ color: 'var(--text)' }}>Rs. {totalPrice.toFixed(2)}</span>
                                </div>
                                <hr style={{ borderColor: 'var(--border)' }} />
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-secondary)' }}>Delivery</span>
                                    <span className="font-medium" style={{ color: 'var(--text)' }}>
                                        {deliveryMethod === "fast" ? "Fast Delivery" : "Standard Delivery"}
                                        {deliveryCharge > 0 ? ` · Rs. ${Number(deliveryCharge).toFixed(2)}` : " · Free"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                                    <span className="font-bold" style={{ color: 'var(--text)' }}>Total</span>
                                    <span className="font-bold" style={{ color: 'var(--primary)' }}>Rs. {totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t px-8 sm:px-10 py-5 shrink-0 flex gap-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    <button
                        onClick={onClose}
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                        className="flex-1 rounded-xl border px-6 py-3.5 text-sm font-semibold transition hover:opacity-80"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={uploadingReceipt}
                        style={{ backgroundColor: 'var(--btn-primary-bg, var(--primary))', color: 'var(--btn-primary-text, #fff)' }}
                        className="flex-1 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:opacity-60"
                    >
                        {uploadingReceipt ? "Placing Order..." : "Confirm Order"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderModal;
