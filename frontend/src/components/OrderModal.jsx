import { useState, useEffect, useRef } from "react";
import { FaTimes, FaTruck, FaCreditCard, FaUniversity, FaMoneyBillWave, FaUpload, FaPaperclip } from "react-icons/fa";
import { getColorName, isHexColor } from "../utils/ColorName";
import api, { putMultipart } from "../api/api";

const OrderModal = ({
    isOpen,
    onClose,
    product,
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
        
        setStep("confirming");

        try {
            // Save order to database
            const orderData = {
                product: {
                    productId: product?.productId || product?._id || null,
                    name: product?.name || "",
                    price: displayPrice || 0,
                    imageUrl: product?.imageUrl || "",
                    color: selectedColor || "",
                    size: selectedSize || "",
                    selectedStandType: selectedStandType || "",
                    actualPrice: product?.actualPrice || 0,
                    discountPrice: product?.discountPrice || 0,
                    isDiscountEnabled: product?.isDiscountEnabled || false,
                },
                quantity,
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

    const handleCloseConfirmed = () => {
        onClose();
        setStep("review");
    };

    if (!isOpen) return null;

    const totalPrice = (displayPrice || 0) * quantity + (Number(deliveryCharge) || 0);

    // Convert color code to readable name
    const displayColorName = selectedColor
        ? isHexColor(selectedColor)
            ? getColorName(selectedColor)
            : selectedColor
        : null;

    const InputField = ({ label, name, type = "text", placeholder }) => (
        <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
            <input
                type={type}
                name={name}
                value={shipping[name]}
                onChange={(e) => setShipping({ ...shipping, [name]: e.target.value })}
                placeholder={placeholder}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/30 focus:border-[#2F6FED] ${
                    errors[name] ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
            />
            {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
        </div>
    );

    // Confirmed state - show animated check
    if (step === "confirmed") {
        return (
            <>
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center">
                        <div className="flex items-center justify-center">
                            <svg className="w-28 h-28" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="6"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="#10B981"
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
                                    stroke="#10B981"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="60 60"
                                    style={{ animation: "draw-check 0.4s ease-in-out 0.3s forwards" }}
                                />
                            </svg>
                        </div>

                        <h3 className="mt-6 text-2xl font-bold text-gray-900">Order Confirmed! 🎉</h3>
                        <p className="mt-2 text-gray-500">
                            Your order has been placed successfully. The Team will contact you soon for confirmation and
                            delivery details.
                        </p>

                        <div className="mt-6 bg-gray-50 rounded-xl p-5 text-left space-y-2.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Product</span>
                                <span className="font-semibold text-gray-900">{product?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Quantity</span>
                                <span className="font-semibold text-gray-900">{quantity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total</span>
                                <span className="font-semibold text-[#2F6FED]">Rs. {totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Delivery</span>
                                <span className="font-semibold text-gray-900 capitalize">
                                    {deliveryMethod === "fast" ? "Fast Delivery" : "Standard Delivery"}
                                    {deliveryCharge > 0 ? ` (Rs. ${Number(deliveryCharge).toFixed(2)})` : " (Free)"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Payment</span>
                                <span className="font-semibold text-gray-900 capitalize">
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
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Deliver to</span>
                                    <span className="font-semibold text-gray-900 text-right max-w-[200px] truncate">
                                        {shipping.fullName}, {shipping.address}, {shipping.city}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCloseConfirmed}
                            className="mt-6 w-full rounded-xl bg-[#2F6FED] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90"
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
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center">
                    <div className="flex items-center justify-center">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-transparent border-t-[#2F6FED] rounded-full animate-spin"></div>
                        </div>
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-gray-900">
                        {uploadingReceipt ? "Uploading Receipt..." : "Processing Order..."}
                    </h3>
                    <p className="mt-2 text-gray-500">Please wait while we process your order.</p>
                </div>
            </div>
        );
    }

    // Review state - show order details (wide & large - no scrolling needed)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between bg-white border-b border-gray-100 px-8 sm:px-10 py-5 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Confirm Your Order</h2>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
                    >
                        <FaTimes size={15} />
                    </button>
                </div>

                <div className="p-8 sm:p-10 overflow-y-auto flex-1">
                    {/* Product Summary + Shipping + Payment in 2-column grid for wide layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Product Details */}
                        <div className="bg-gray-50 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Details</h3>
                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                                    <img
                                        src={product?.imageUrl || "https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=200"}
                                        alt={product?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm">{product?.name}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{product?.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedColor && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: selectedColor }}
                                                ></span>
                                                {displayColorName}
                                            </span>
                                        )}
                                        {selectedSize && (
                                            <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200">
                                                Size: {selectedSize}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200">
                                            Qty: {quantity}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-base font-bold text-[#2F6FED]">Rs. {totalPrice.toFixed(2)}</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200">
                                            {deliveryMethod === "fast" ? "Fast Delivery" : "Standard Delivery"}
                                            {deliveryCharge > 0 ? ` · Rs. ${Number(deliveryCharge).toFixed(2)}` : " · Free"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Shipping Details */}
                        {!skipShippingForm ? (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <FaTruck className="text-[#2F6FED]" size={16} />
                                    <h3 className="text-sm font-semibold text-gray-700">Shipping Details</h3>
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
                                    <FaTruck className="text-[#2F6FED]" size={16} />
                                    <h3 className="text-sm font-semibold text-gray-700">Shipping Details</h3>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Name</span>
                                        <span className="font-semibold text-gray-900">{shipping.fullName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Phone</span>
                                        <span className="font-semibold text-gray-900">{shipping.phone}</span>
                                    </div>
                                    {shipping.email && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Email</span>
                                            <span className="font-semibold text-gray-900 text-right max-w-[250px] truncate">
                                                {shipping.email}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Address</span>
                                        <span className="font-semibold text-gray-900 text-right max-w-[250px]">{shipping.address}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">City</span>
                                        <span className="font-semibold text-gray-900">{shipping.city}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method - full width below */}
                    {!skipShippingForm ? (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaCreditCard className="text-[#2F6FED]" size={16} />
                                <h3 className="text-sm font-semibold text-gray-700">Payment Method</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("cod")}
                                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition ${
                                        paymentMethod === "cod"
                                            ? "border-[#2F6FED] bg-[#2F6FED]/5"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <FaMoneyBillWave
                                        size={20}
                                        className={paymentMethod === "cod" ? "text-[#2F6FED]" : "text-gray-400"}
                                    />
                                    <div className="text-left">
                                        <p className={`text-sm font-semibold ${paymentMethod === "cod" ? "text-[#2F6FED]" : "text-gray-700"}`}>
                                            Cash on Delivery
                                        </p>
                                        <p className="text-xs text-gray-400">Pay when you receive</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("bank")}
                                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition ${
                                        paymentMethod === "bank"
                                            ? "border-[#2F6FED] bg-[#2F6FED]/5"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <FaUniversity
                                        size={20}
                                        className={paymentMethod === "bank" ? "text-[#2F6FED]" : "text-gray-400"}
                                    />
                                    <div className="text-left">
                                        <p className={`text-sm font-semibold ${paymentMethod === "bank" ? "text-[#2F6FED]" : "text-gray-700"}`}>
                                            Bank Transfer
                                        </p>
                                        <p className="text-xs text-gray-400">Direct bank payment</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("card")}
                                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition ${
                                        paymentMethod === "card"
                                            ? "border-[#2F6FED] bg-[#2F6FED]/5"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <FaCreditCard
                                        size={20}
                                        className={paymentMethod === "card" ? "text-[#2F6FED]" : "text-gray-400"}
                                    />
                                    <div className="text-left">
                                        <p className={`text-sm font-semibold ${paymentMethod === "card" ? "text-[#2F6FED]" : "text-gray-700"}`}>
                                            Card Payment
                                        </p>
                                        <p className="text-xs text-gray-400">Visa, Mastercard, etc.</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaCreditCard className="text-[#2F6FED]" size={16} />
                                <h3 className="text-sm font-semibold text-gray-700">Payment Method</h3>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-5">
                                <div className="flex items-center gap-3">
                                    {paymentMethod === "cod" ? (
                                        <FaMoneyBillWave size={20} className="text-[#2F6FED]" />
                                    ) : paymentMethod === "bank" ? (
                                        <FaUniversity size={20} className="text-[#2F6FED]" />
                                    ) : (
                                        <FaCreditCard size={20} className="text-[#2F6FED]" />
                                    )}
                                    <span className="font-semibold text-gray-900 capitalize text-base">
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
                    )}

                    {/* Payment Receipt Upload (for online payments) */}
                    {(paymentMethod === "bank" || paymentMethod === "card") && (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaPaperclip className="text-[#2F6FED]" size={16} />
                                <h3 className="text-sm font-semibold text-gray-700">Payment Receipt</h3>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Upload Payment Screenshot / Receipt
                                    </label>
                                    {!receiptPreview ? (
                                        <label className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-6 cursor-pointer text-center transition hover:border-[#2F6FED] hover:bg-[#2F6FED]/5">
                                            <FaUpload className="text-gray-400" size={20} />
                                            <span className="text-sm font-medium text-gray-600">Click to upload receipt</span>
                                            <span className="text-xs text-gray-400">JPG, PNG or WEBP (max 5MB)</span>
                                            <input
                                                ref={receiptInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                onChange={handleReceiptChange}
                                                className="hidden"
                                            />
                                        </label>
                                    ) : (
                                        <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-white">
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
                                    <p className="mt-1.5 text-xs text-gray-400">
                                        The receipt will be shared with the store owner along with your order details.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Summary + Trust badges in 2-column grid */}
                    <div className="grid grid-cols-1 gap-6 mt-6">
                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Subtotal ({quantity} item{quantity > 1 ? "s" : ""})
                                    </span>
                                    <span className="font-medium text-gray-900">Rs. {totalPrice.toFixed(2)}</span>
                                </div>
                                <hr className="border-gray-200" />
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Delivery</span>
                                    <span className="font-medium text-gray-900">
                                        {deliveryMethod === "fast" ? "Fast Delivery" : "Standard Delivery"}
                                        {deliveryCharge > 0 ? ` · Rs. ${Number(deliveryCharge).toFixed(2)}` : " · Free"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-[#2F6FED]">Rs. {totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white border-t border-gray-100 px-8 sm:px-10 py-5 shrink-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border-2 border-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={uploadingReceipt}
                        className="flex-1 rounded-xl bg-[#2F6FED] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 disabled:opacity-60"
                    >
                        {uploadingReceipt ? "Placing Order..." : "Confirm Order"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderModal;
