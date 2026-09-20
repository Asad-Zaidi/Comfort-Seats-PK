import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    FiShield,
    FiCheckCircle,
    FiAlertCircle,
    FiUploadCloud,
    FiTrash2,
    FiFileText,
    FiClock,
    FiUser,
    FiPackage,
    FiSearch,
    FiCopy,
    FiCheck,
    FiArrowLeft,
    FiImage,
    FiVideo,
    FiHelpCircle,
    FiPhone,
    FiMail,
    FiLoader,
    FiInfo,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import SEO from "../components/SEO";
import Footer from "../components/Footer";
import api, { postMultipart } from "../api/api";
import { useToast } from "../components/ToastNotification";
import { useSiteConfig } from "../utils/siteConfig";
import DropDown from "../components/DropDown";
import { PAKISTAN_PROVINCES, CITIES_BY_PROVINCE } from "../utils/pakistanLocations";

const ISSUE_TYPES = [
    "Product Defect",
    "Manufacturing Defect",
    "Damaged Product",
    "Part Missing",
    "Part Broken",
    "Mechanical Issue",
    "Material/Fabric Issue",
    "Electrical Issue",
    "Product Not Functioning",
    "Other",
];

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 40 * 1024 * 1024; // 40MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];


export default function WarrantyClaim() {
    const { siteName, siteUrl } = useSiteConfig();
    const toast = useToast();

    // Form fields
    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Pakistan",
        orderNumber: "",
        orderDate: "",
        productId: "",
        productName: "",
        productSku: "",
        quantity: 1,
        issueType: "",
        description: "",
    });

    // Media state
    const [images, setImages] = useState([]); // array of { file, previewUrl, name, size }
    const [video, setVideo] = useState(null); // { file, previewUrl, name, size }

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLookingUpOrder, setIsLookingUpOrder] = useState(false);
    const [lookupSuccess, setLookupSuccess] = useState(false);
    const [orderItemsList, setOrderItemsList] = useState([]);
    const [copiedClaimId, setCopiedClaimId] = useState(false);
    const [submittedClaim, setSubmittedClaim] = useState(null);
    const [errors, setErrors] = useState({});
    const [contactInfo, setContactInfo] = useState(null);

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const [isCustomCity, setIsCustomCity] = useState(false);

    // Available cities based on selected province
    const availableCities = useMemo(() => {
        if (formData.state && CITIES_BY_PROVINCE[formData.state]) {
            return [...CITIES_BY_PROVINCE[formData.state], "Other"];
        }
        return [];
    }, [formData.state]);

    // Handle Province dropdown change
    const handleProvinceChange = (selectedProvince) => {
        setFormData((prev) => {
            let nextCity = prev.city;
            if (selectedProvince && selectedProvince !== "Other") {
                const provinceCities = CITIES_BY_PROVINCE[selectedProvince] || [];
                // If currently selected city is not in the new province, clear it
                if (nextCity && !provinceCities.includes(nextCity) && !isCustomCity) {
                    nextCity = "";
                }
            } else if (!selectedProvince) {
                nextCity = "";
                setIsCustomCity(false);
            }
            return {
                ...prev,
                state: selectedProvince,
                city: nextCity,
            };
        });
        if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
    };

    // Handle City dropdown change
    const handleCitySelectChange = (val) => {
        if (val === "Other") {
            setIsCustomCity(true);
            setFormData((prev) => ({ ...prev, city: "" }));
        } else {
            setIsCustomCity(false);
            setFormData((prev) => ({
                ...prev,
                city: val,
            }));
        }
        if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
    };

    // Fetch store contact info for sidebar
    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await api.get("/contact");
                if (res.data?.success && res.data.data) {
                    setContactInfo(res.data.data);
                }
            } catch (err) {
                // Silently fallback to defaults
            }
        };
        fetchContact();
    }, []);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
            if (video?.previewUrl) URL.revokeObjectURL(video.previewUrl);
        };
    }, [images, video]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // Quick Order Lookup
    const handleOrderLookup = async () => {
        if (!formData.orderNumber.trim()) {
            setErrors((prev) => ({ ...prev, orderNumber: "Please enter an order number first" }));
            return;
        }

        setIsLookingUpOrder(true);
        setLookupSuccess(false);

        try {
            const res = await api.get("/warranty-claims/order-lookup", {
                params: {
                    orderNumber: formData.orderNumber.trim(),
                    contact: formData.customerEmail || formData.customerPhone || undefined,
                },
            });

            if (res.data?.success && res.data.data) {
                const { orderDate, customer, items } = res.data.data;
                const formattedDate = orderDate ? new Date(orderDate).toISOString().split("T")[0] : "";

                setFormData((prev) => ({
                    ...prev,
                    orderDate: formattedDate || prev.orderDate,
                    customerName: prev.customerName || customer.fullName || "",
                    customerEmail: prev.customerEmail || customer.email || "",
                    customerPhone: prev.customerPhone || customer.phone || "",
                    address: prev.address || customer.address || "",
                    city: prev.city || customer.city || "",
                }));

                if (Array.isArray(items) && items.length > 0) {
                    setOrderItemsList(items);
                    // Preselect first item
                    const firstItem = items[0];
                    setFormData((prev) => ({
                        ...prev,
                        productId: firstItem.productId || "",
                        productName: firstItem.name || "",
                        quantity: firstItem.quantity || 1,
                    }));
                }

                setLookupSuccess(true);
                toast.success("Order details retrieved successfully!");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Order not found. You can enter details manually.";
            toast.info(msg);
            setLookupSuccess(false);
        } finally {
            setIsLookingUpOrder(false);
        }
    };

    // Pick item from retrieved order
    const handleSelectItem = (item) => {
        setFormData((prev) => ({
            ...prev,
            productId: item.productId || "",
            productName: item.name || "",
            quantity: item.quantity || 1,
        }));
    };

    // Handle Image Upload
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const newImages = [...images];
        let errorMsg = null;

        for (const file of files) {
            if (newImages.length >= MAX_IMAGES) {
                errorMsg = `You can upload up to ${MAX_IMAGES} images.`;
                break;
            }
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                errorMsg = `File "${file.name}" has an unsupported format. Supported: JPG, PNG, WEBP.`;
                continue;
            }
            if (file.size > MAX_IMAGE_SIZE) {
                errorMsg = `File "${file.name}" exceeds the 10MB limit.`;
                continue;
            }

            newImages.push({
                file,
                previewUrl: URL.createObjectURL(file),
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2),
            });
        }

        if (errorMsg) {
            toast.error(errorMsg);
        }

        setImages(newImages);
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    const removeImage = (index) => {
        setImages((prev) => {
            const removed = prev[index];
            if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    // Handle Video Upload
    const handleVideoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
            toast.error("Unsupported video format. Supported: MP4, MOV, WEBM.");
            return;
        }
        if (file.size > MAX_VIDEO_SIZE) {
            toast.error("Video file exceeds the 40MB limit. Please upload a shorter clip.");
            return;
        }

        if (video?.previewUrl) URL.revokeObjectURL(video.previewUrl);

        setVideo({
            file,
            previewUrl: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2),
        });

        if (videoInputRef.current) videoInputRef.current.value = "";
    };

    const removeVideo = () => {
        if (video?.previewUrl) URL.revokeObjectURL(video.previewUrl);
        setVideo(null);
        if (videoInputRef.current) videoInputRef.current.value = "";
    };

    // Client-side validation
    const validate = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) newErrors.customerName = "Full Name is required.";
        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = "Email address is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail.trim())) {
            newErrors.customerEmail = "Please enter a valid email address.";
        }
        if (!formData.customerPhone.trim()) newErrors.customerPhone = "Phone number is required.";
        if (!formData.address.trim()) newErrors.address = "Street address is required.";
        if (!formData.city.trim()) newErrors.city = "City is required.";
        if (!formData.orderNumber.trim()) newErrors.orderNumber = "Order number is required.";
        if (!formData.orderDate) newErrors.orderDate = "Order date is required.";
        if (!formData.productName.trim()) newErrors.productName = "Product name is required.";
        if (!formData.issueType) newErrors.issueType = "Please select an issue type.";
        if (!formData.description.trim()) {
            newErrors.description = "Please describe the issue in detail.";
        } else if (formData.description.trim().length < 10) {
            newErrors.description = "Description should be at least 10 characters long.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please fill in all required fields marked in red.");
            window.scrollTo({ top: 200, behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    payload.append(key, String(val));
                }
            });

            // Append images
            images.forEach((img) => {
                payload.append("images", img.file);
            });

            // Append video
            if (video?.file) {
                payload.append("video", video.file);
            }

            const res = await postMultipart("/warranty-claims", payload);

            if (res.data?.success) {
                toast.success("Warranty claim submitted successfully!");
                setSubmittedClaim(res.data.data);
                window.scrollTo({ top: 100, behavior: "smooth" });
            } else {
                throw new Error(res.data?.message || "Failed to submit warranty claim");
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                err.message ||
                "Failed to submit your warranty claim. Please try again.";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset Form to Submit Another Claim
    const handleResetForm = () => {
        setSubmittedClaim(null);
        setFormData({
            customerName: "",
            customerEmail: "",
            customerPhone: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            country: "Pakistan",
            orderNumber: "",
            orderDate: "",
            productId: "",
            productName: "",
            productSku: "",
            quantity: 1,
            issueType: "",
            description: "",
        });
        setImages([]);
        setVideo(null);
        setOrderItemsList([]);
        setLookupSuccess(false);
        setIsCustomCity(false);
        setErrors({});
    };

    const copyClaimIdToClipboard = () => {
        if (!submittedClaim?.claimId) return;
        navigator.clipboard.writeText(submittedClaim.claimId);
        setCopiedClaimId(true);
        setTimeout(() => setCopiedClaimId(false), 2500);
        toast.success("Claim ID copied to clipboard!");
    };

    const brandName = siteName || "Comfort Seats";

    return (
        <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: "var(--bg, #ffffff)", color: "var(--text, #12131A)" }}>
            <SEO
                title={`Warranty Claim - ${brandName}`}
                description="Submit a warranty claim for your Comfort Seats products. Fast, hassle-free warranty review and direct customer support."
                canonicalUrl={`${siteUrl}/warranty-claim`}
            />

            {/* Breadcrumb / Top Bar */}
            <div className="border-b" style={{ borderColor: "var(--border, #e5e7eb)", backgroundColor: "var(--bg-secondary, #f8fafc)" }}>
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-secondary, #6b7280)" }}>
                        <Link to="/" className="hover:underline" style={{ color: "var(--primary, #2F6FED)" }}>Home</Link>
                        <span>/</span>
                        <span style={{ color: "var(--text, #12131A)" }}>Warranty Claim</span>
                    </nav>
                </div>
            </div>

            {/* Hero Section */}
            <section className="border-b py-8 sm:py-12 text-center transition-colors" style={{ backgroundColor: "var(--bg-secondary, #f8fafc)", borderColor: "var(--border, #e5e7eb)" }}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider shadow-xs mb-4"
                        style={{
                            backgroundColor: "color-mix(in srgb, var(--primary, #2F6FED) 12%, transparent)",
                            color: "var(--primary, #2F6FED)",
                            border: "1px solid color-mix(in srgb, var(--primary, #2F6FED) 30%, transparent)",
                        }}
                    >
                        <FiShield size={14} />
                        <span>ComfortSeats Guarantee</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text, #12131A)" }}>
                        Warranty Claim
                    </h1>

                    <p className="mt-4 text-base sm:text-lg leading-relaxed max-w-7xl mx-auto" style={{ color: "var(--text-secondary, #6b7280)" }}>
                        We&apos;re here to help! If you&apos;re facing an issue with your product, please fill out the warranty claim form below. Our dedicated team will review your request and get back to you as soon as possible.
                    </p>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="mx-auto max-w-full px-12 py-10 sm:px-20 lg:px-32">
                {/* SUCCESS SCREEN */}
                {submittedClaim ? (
                    <div className="mx-auto max-w-2xl rounded-3xl border p-6 sm:p-10 shadow-lg text-center transition-all" style={{ backgroundColor: "var(--card-bg, #ffffff)", borderColor: "var(--border, #e5e7eb)" }}>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--success, #10B981) 15%, transparent)" }}>
                            <FiCheckCircle className="h-10 w-10" style={{ color: "var(--success, #10B981)" }} />
                        </div>

                        <span className="mt-6 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>
                            Submission Successful
                        </span>

                        <h2 className="mt-3 text-2xl sm:text-3xl font-bold" style={{ color: "var(--text, #12131A)" }}>
                            Warranty Claim Submitted
                        </h2>

                        <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-secondary, #6b7280)" }}>
                            Thank you, <strong className="font-semibold" style={{ color: "var(--text, #12131A)" }}>{submittedClaim.customerName}</strong>. Your warranty claim has been registered in our system and assigned to a technical representative.
                        </p>

                        {/* Claim Highlights Card */}
                        <div className="mt-6 rounded-2xl border p-5 text-left space-y-3" style={{ backgroundColor: "var(--bg-secondary, #f8fafc)", borderColor: "var(--border, #e5e7eb)" }}>
                            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border, #e5e7eb)" }}>
                                <div>
                                    <span className="text-xs uppercase font-medium tracking-wider" style={{ color: "var(--text-secondary, #6b7280)" }}>Warranty Claim ID</span>
                                    <p className="text-xl font-extrabold tracking-tight mt-0.5" style={{ color: "var(--primary, #2F6FED)" }}>
                                        {submittedClaim.claimId}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={copyClaimIdToClipboard}
                                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 active:scale-95"
                                    style={{ borderColor: "var(--border, #e5e7eb)", backgroundColor: "var(--card-bg, #ffffff)", color: "var(--text, #12131A)" }}
                                >
                                    {copiedClaimId ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                                    <span>{copiedClaimId ? "Copied" : "Copy ID"}</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                                <div>
                                    <span style={{ color: "var(--text-secondary, #6b7280)" }}>Order Number:</span>
                                    <p className="font-semibold mt-0.5" style={{ color: "var(--text, #12131A)" }}>{submittedClaim.orderNumber}</p>
                                </div>
                                <div>
                                    <span style={{ color: "var(--text-secondary, #6b7280)" }}>Product:</span>
                                    <p className="font-semibold mt-0.5" style={{ color: "var(--text, #12131A)" }}>{submittedClaim.productName}</p>
                                </div>
                                <div>
                                    <span style={{ color: "var(--text-secondary, #6b7280)" }}>Status:</span>
                                    <div className="mt-0.5 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                        <FiClock size={12} />
                                        <span>Pending Review</span>
                                    </div>
                                </div>
                                <div>
                                    <span style={{ color: "var(--text-secondary, #6b7280)" }}>Confirmation Sent To:</span>
                                    <p className="font-semibold mt-0.5 truncate" style={{ color: "var(--text, #12131A)" }}>{submittedClaim.customerEmail}</p>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps Info */}
                        <div className="mt-6 rounded-2xl p-4 text-left flex items-start gap-3" style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                            <FiInfo className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                            <div className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                                <p className="font-semibold mb-1">What will happen next?</p>
                                <p>Our technical team will review your photos, video, and description within <strong>24–48 business hours</strong>. You will receive email updates as your claim progresses.</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                to="/products"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition hover:opacity-90 active:scale-95"
                                style={{ backgroundColor: "var(--btn-primary-bg, var(--primary, #2F6FED))", color: "var(--btn-primary-text, #ffffff)" }}
                            >
                                <FiArrowLeft size={16} />
                                <span>Back to Shop</span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleResetForm}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition hover:bg-black/5 active:scale-95"
                                style={{ borderColor: "var(--border, #e5e7eb)", color: "var(--text, #12131A)" }}
                            >
                                <span>File Another Claim</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* TWO COLUMN LAYOUT: CLAIM FORM & SIDEBAR */
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                        {/* LEFT COLUMN: THE CLAIM FORM */}
                        <div className="lg:col-span-8">
                            <form onSubmit={handleSubmit} noValidate className="space-y-8">
                                {/* SECTION 1: PERSONAL INFORMATION */}
                                <div className="rounded-2xl border p-6 sm:p-8 shadow-xs transition-colors" style={{ backgroundColor: "var(--card-bg, #ffffff)", borderColor: "var(--border, #e5e7eb)" }}>
                                    <div className="flex items-center gap-3 pb-4 mb-6 border-b" style={{ borderColor: "var(--border, #e5e7eb)" }}>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "color-mix(in srgb, var(--primary, #2F6FED) 10%, transparent)", color: "var(--primary, #2F6FED)" }}>
                                            <FiUser size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold" style={{ color: "var(--text, #12131A)" }}>1. Personal Information</h2>
                                            <p className="text-xs" style={{ color: "var(--text-secondary, #6b7280)" }}>Your contact details for warranty updates and verification</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        {/* Full Name */}
                                        <div className="sm:col-span-2">
                                            <label htmlFor="customerName" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="customerName"
                                                type="text"
                                                name="customerName"
                                                value={formData.customerName}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Asad Zaidi"
                                                className={`w-full rounded-xl border px-4 py-3 text-sm outline-hidden transition ${errors.customerName ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                                style={{ backgroundColor: "var(--input-bg, #ffffff)", borderColor: errors.customerName ? "#ef4444" : "var(--input-border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                                required
                                            />
                                            {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="customerEmail" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="customerEmail"
                                                type="email"
                                                name="customerEmail"
                                                value={formData.customerEmail}
                                                onChange={handleInputChange}
                                                placeholder="e.g. customer@example.com"
                                                className={`w-full rounded-xl border px-4 py-3 text-sm outline-hidden transition ${errors.customerEmail ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                                style={{ backgroundColor: "var(--input-bg, #ffffff)", borderColor: errors.customerEmail ? "#ef4444" : "var(--input-border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                                required
                                            />
                                            {errors.customerEmail && <p className="mt-1 text-xs text-red-500">{errors.customerEmail}</p>}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label htmlFor="customerPhone" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="customerPhone"
                                                type="tel"
                                                name="customerPhone"
                                                value={formData.customerPhone}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 0300 1234567"
                                                className={`w-full rounded-xl border px-4 py-3 text-sm outline-hidden transition ${errors.customerPhone ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                                style={{ backgroundColor: "var(--input-bg, #ffffff)", borderColor: errors.customerPhone ? "#ef4444" : "var(--input-border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                                required
                                            />
                                            {errors.customerPhone && <p className="mt-1 text-xs text-red-500">{errors.customerPhone}</p>}
                                        </div>

                                        {/* Street Address */}
                                        <div className="sm:col-span-2">
                                            <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                Complete Delivery / Street Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="address"
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="House/Plot #, Street, Area"
                                                className={`w-full rounded-xl border px-4 py-3 text-sm outline-hidden transition ${errors.address ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                                style={{ backgroundColor: "var(--input-bg, #ffffff)", borderColor: errors.address ? "#ef4444" : "var(--input-border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                                required
                                            />
                                            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                        </div>

                                        {/* State / Province Dropdown */}
                                        <div>
                                            <label htmlFor="state" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                State / Province
                                            </label>
                                            <DropDown
                                                id="state"
                                                value={formData.state}
                                                onChange={handleProvinceChange}
                                                options={PAKISTAN_PROVINCES}
                                                placeholder="-- Select Province / Region --"
                                                error={errors.state}
                                            />
                                            {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                                        </div>

                                        {/* City Dropdown (Disabled until Province is selected) */}
                                        <div>
                                            <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <DropDown
                                                id="city"
                                                value={isCustomCity ? "Other" : (availableCities.includes(formData.city) ? formData.city : (formData.city ? "Other" : ""))}
                                                onChange={handleCitySelectChange}
                                                options={availableCities}
                                                disabled={!formData.state}
                                                disabledPlaceholder="-- Please select a province first --"
                                                placeholder="-- Select City --"
                                                searchable={true}
                                                error={errors.city}
                                            />
                                            {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}

                                            {/* Custom City text input when "Other" is chosen */}
                                            {formData.state && (isCustomCity || formData.state === "Other" || (formData.city && !availableCities.includes(formData.city))) && (
                                                <div className="mt-2.5">
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your city / town name"
                                                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-hidden transition ${errors.city ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                                        style={{ backgroundColor: "var(--input-bg, #ffffff)", borderColor: errors.city ? "#ef4444" : "var(--input-border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: ORDER DETAILS */}
                                <div className="rounded-2xl border p-6 sm:p-8 shadow-xs transition-colors" style={{ backgroundColor: "var(--card-bg, #ffffff)", borderColor: "var(--border, #e5e7eb)" }}>
                                    <div className="flex items-center gap-3 pb-4 mb-6 border-b" style={{ borderColor: "var(--border, #e5e7eb)" }}>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "color-mix(in srgb, var(--primary, #2F6FED) 10%, transparent)", color: "var(--primary, #2F6FED)" }}>
                                            <FiPackage size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold" style={{ color: "var(--text, #12131A)" }}>2. Order Details</h2>
                                            <p className="text-xs" style={{ color: "var(--text-secondary, #6b7280)" }}>Link your claim to your original purchase</p>
                                        </div>
                                    </div>

                                    {/* Order Number & Find Order Quick Lookup */}
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label htmlFor="orderNumber" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                Order Number / ID <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        id="orderNumber"
                                                        type="text"
                                                        name="orderNumber"
                                                        value={formData.orderNumber}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. #a1b2c3d4 or full order ID"
                                                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-hidden transition ${errors.orderNumber ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                                        style={{ backgroundColor: "var(--input-bg, #ffffff)", borderColor: errors.orderNumber ? "#ef4444" : "var(--input-border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleOrderLookup}
                                                    disabled={isLookingUpOrder || !formData.orderNumber.trim()}
                                                    className="flex items-center gap-1.5 rounded-xl border px-4 py-3 text-xs font-semibold transition hover:opacity-90 disabled:opacity-50 shrink-0"
                                                    style={{ backgroundColor: "var(--bg-secondary, #f8fafc)", borderColor: "var(--border, #e5e7eb)", color: "var(--primary, #2F6FED)" }}
                                                >
                                                    {isLookingUpOrder ? <FiLoader className="animate-spin" size={14} /> : <FiSearch size={14} />}
                                                    <span className="hidden sm:inline">Find Order</span>
                                                </button>
                                            </div>
                                            {errors.orderNumber && <p className="mt-1 text-xs text-red-500">{errors.orderNumber}</p>}
                                            {lookupSuccess && (
                                                <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1">
                                                    <FiCheck size={14} /> Order found! Product information loaded below.
                                                </p>
                                            )}
                                        </div>

                                        {/* Order Date */}
                                        <div>
                                            <label htmlFor="orderDate" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                Order Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="orderDate"
                                                type="date"
                                                name="orderDate"
                                                value={formData.orderDate}
                                                onChange={handleInputChange}
                                                className={`w-full rounded-xl border px-4 py-3 text-sm outline-hidden transition ${errors.orderDate ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                                style={{ backgroundColor: "var(--input-bg, #ffffff)", borderColor: errors.orderDate ? "#ef4444" : "var(--input-border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                                required
                                            />
                                            {errors.orderDate && <p className="mt-1 text-xs text-red-500">{errors.orderDate}</p>}
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <label htmlFor="quantity" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                Quantity Affected <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="quantity"
                                                type="number"
                                                name="quantity"
                                                min="1"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                className="w-full rounded-xl border px-4 py-3 text-sm outline-hidden transition"
                                                style={{ backgroundColor: "var(--input-bg, #ffffff)", borderColor: "var(--input-border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                                required
                                            />
                                        </div>

                                        {/* If items were retrieved from Order Lookup, render selector */}
                                        {orderItemsList.length > 0 && (
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                    Select Purchased Product:
                                                </label>
                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                    {orderItemsList.map((item, idx) => {
                                                        const isSelected = formData.productName === item.name;
                                                        return (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => handleSelectItem(item)}
                                                                className="flex items-center gap-3 rounded-xl border p-3 text-left transition-all"
                                                                style={{
                                                                    backgroundColor: isSelected ? "color-mix(in srgb, var(--primary, #2F6FED) 8%, var(--card-bg, #ffffff))" : "var(--card-bg, #ffffff)",
                                                                    borderColor: isSelected ? "var(--primary, #2F6FED)" : "var(--border, #e5e7eb)",
                                                                }}
                                                            >
                                                                {item.imageUrl ? (
                                                                    <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-lg object-cover border" />
                                                                ) : (
                                                                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                                        <FiPackage size={18} />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text, #12131A)" }}>{item.name}</p>
                                                                    <p className="text-xs" style={{ color: "var(--text-secondary, #6b7280)" }}>
                                                                        Qty: {item.quantity} {item.color ? `• ${item.color}` : ""}
                                                                    </p>
                                                                </div>
                                                                {isSelected && <FiCheck className="text-blue-600 shrink-0" size={16} />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Product Name */}
                                        <div className="sm:col-span-2">
                                            <label htmlFor="productName" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                Product Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="productName"
                                                type="text"
                                                name="productName"
                                                value={formData.productName}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Ergonomic Office Chair / Cushion"
                                                className={`w-full rounded-xl border px-4 py-3 text-sm outline-hidden transition ${errors.productName ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                                style={{ backgroundColor: "var(--input-bg, #ffffff)", borderColor: errors.productName ? "#ef4444" : "var(--input-border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                                required
                                            />
                                            {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName}</p>}
                                        </div>

                                        {/* Product SKU (optional) */}
                                        <div className="sm:col-span-2">
                                            <label htmlFor="productSku" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                SKU / Model Number <span className="text-xs font-normal lowercase text-gray-400">(optional)</span>
                                            </label>
                                            <input
                                                id="productSku"
                                                type="text"
                                                name="productSku"
                                                value={formData.productSku}
                                                onChange={handleInputChange}
                                                placeholder="e.g. CS-CHAIR-BLK"
                                                className="w-full rounded-xl border px-4 py-3 text-sm outline-hidden transition"
                                                style={{ backgroundColor: "var(--input-bg, #ffffff)", borderColor: "var(--input-border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: ISSUE / CLAIM DETAILS */}
                                <div className="rounded-2xl border p-6 sm:p-8 shadow-xs transition-colors" style={{ backgroundColor: "var(--card-bg, #ffffff)", borderColor: "var(--border, #e5e7eb)" }}>
                                    <div className="flex items-center gap-3 pb-4 mb-6 border-b" style={{ borderColor: "var(--border, #e5e7eb)" }}>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "color-mix(in srgb, var(--primary, #2F6FED) 10%, transparent)", color: "var(--primary, #2F6FED)" }}>
                                            <FiAlertCircle size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold" style={{ color: "var(--text, #12131A)" }}>3. Issue / Claim Details</h2>
                                            <p className="text-xs" style={{ color: "var(--text-secondary, #6b7280)" }}>Tell us what went wrong so we can resolve it quickly</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        {/* Issue Type Dropdown */}
                                        <div>
                                            <label htmlFor="issueType" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--label-color, #374151)" }}>
                                                Issue Type <span className="text-red-500">*</span>
                                            </label>
                                            <DropDown
                                                id="issueType"
                                                value={formData.issueType}
                                                onChange={(val) => {
                                                    setFormData((prev) => ({ ...prev, issueType: val }));
                                                    if (errors.issueType) setErrors((prev) => ({ ...prev, issueType: undefined }));
                                                }}
                                                options={ISSUE_TYPES}
                                                placeholder="-- Select an issue type --"
                                                error={errors.issueType}
                                            />
                                            {errors.issueType && <p className="mt-1 text-xs text-red-500">{errors.issueType}</p>}
                                        </div>

                                        {/* Detailed Description */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--label-color, #374151)" }}>
                                                    Warranty Claim Description <span className="text-red-500">*</span>
                                                </label>
                                                <span className="text-xs" style={{ color: formData.description.length > 2800 ? "var(--error, #E5484D)" : "var(--text-secondary, #6b7280)" }}>
                                                    {formData.description.length} / 3000 chars
                                                </span>
                                            </div>
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows={5}
                                                maxLength={3000}
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Please explain what happened, when the problem started, which specific part is affected, and how the product is being used..."
                                                className={`w-full rounded-xl border p-4 text-sm outline-hidden transition ${errors.description ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                                style={{ backgroundColor: "var(--input-bg, #ffffff)", borderColor: errors.description ? "#ef4444" : "var(--input-border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                                required
                                            />
                                            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 4: MEDIA EVIDENCE (PHOTOS & VIDEO) */}
                                <div className="rounded-2xl border p-6 sm:p-8 shadow-xs transition-colors" style={{ backgroundColor: "var(--card-bg, #ffffff)", borderColor: "var(--border, #e5e7eb)" }}>
                                    <div className="flex items-center gap-3 pb-4 mb-6 border-b" style={{ borderColor: "var(--border, #e5e7eb)" }}>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "color-mix(in srgb, var(--primary, #2F6FED) 10%, transparent)", color: "var(--primary, #2F6FED)" }}>
                                            <FiUploadCloud size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold" style={{ color: "var(--text, #12131A)" }}>4. Photo & Video Evidence</h2>
                                            <p className="text-xs" style={{ color: "var(--text-secondary, #6b7280)" }}>Attach clear photos or video of the defect for faster approval</p>
                                        </div>
                                    </div>

                                    {/* Images Upload Zone */}
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--label-color, #374151)" }}>
                                                    Upload Images ({images.length}/{MAX_IMAGES})
                                                </span>
                                                <span className="text-xs text-gray-400">JPG, PNG, WEBP (Max 10MB each)</span>
                                            </div>

                                            {/* Dropzone */}
                                            {images.length < MAX_IMAGES && (
                                                <div
                                                    onClick={() => imageInputRef.current?.click()}
                                                    className="group cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition hover:border-blue-500 hover:bg-blue-50/20"
                                                    style={{ borderColor: "var(--border, #e5e7eb)" }}
                                                >
                                                    <input
                                                        ref={imageInputRef}
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        multiple
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-hover:scale-110">
                                                        <FiImage size={24} />
                                                    </div>
                                                    <p className="mt-3 text-sm font-semibold" style={{ color: "var(--text, #12131A)" }}>
                                                        Click or drag photos here to upload
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-400">Clear pictures of defective parts or damaged surfaces</p>
                                                </div>
                                            )}

                                            {/* Image Thumbnails */}
                                            {images.length > 0 && (
                                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                                    {images.map((img, idx) => (
                                                        <div key={idx} className="group relative rounded-xl border overflow-hidden bg-gray-50 p-1" style={{ borderColor: "var(--border, #e5e7eb)" }}>
                                                            <img src={img.previewUrl} alt={img.name} className="h-28 w-full rounded-lg object-cover" />
                                                            <div className="mt-1 flex items-center justify-between px-1 text-[11px] text-gray-500">
                                                                <span className="truncate max-w-[80px]">{img.name}</span>
                                                                <span>{img.size} MB</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(idx)}
                                                                className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow-md transition hover:bg-red-700 active:scale-95"
                                                                title="Remove image"
                                                            >
                                                                <FiTrash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Video Upload Zone */}
                                        <div className="pt-4 border-t" style={{ borderColor: "var(--border, #e5e7eb)" }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--label-color, #374151)" }}>
                                                    Upload Video Clip <span className="text-xs font-normal lowercase text-gray-400">(optional, 1 video)</span>
                                                </span>
                                                <span className="text-xs text-gray-400">MP4, MOV, WEBM (Max 40MB)</span>
                                            </div>

                                            {!video ? (
                                                <div
                                                    onClick={() => videoInputRef.current?.click()}
                                                    className="group cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition hover:border-blue-500 hover:bg-blue-50/20"
                                                    style={{ borderColor: "var(--border, #e5e7eb)" }}
                                                >
                                                    <input
                                                        ref={videoInputRef}
                                                        type="file"
                                                        accept="video/mp4,video/quicktime,video/webm"
                                                        onChange={handleVideoChange}
                                                        className="hidden"
                                                    />
                                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-hover:scale-110">
                                                        <FiVideo size={24} />
                                                    </div>
                                                    <p className="mt-3 text-sm font-semibold" style={{ color: "var(--text, #12131A)" }}>
                                                        Click to attach video evidence
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-400">Short video showing mechanical sounds, movement, or functional failure</p>
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border p-4 flex items-center justify-between" style={{ backgroundColor: "var(--bg-secondary, #f8fafc)", borderColor: "var(--border, #e5e7eb)" }}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                                            <FiVideo size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold truncate max-w-[200px] sm:max-w-xs" style={{ color: "var(--text, #12131A)" }}>{video.name}</p>
                                                            <p className="text-xs text-gray-400">{video.size} MB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={removeVideo}
                                                        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 active:scale-95"
                                                    >
                                                        <FiTrash2 size={13} />
                                                        <span>Remove</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 5: CLAIM SUMMARY REVIEW */}
                                <div className="rounded-2xl border p-5 sm:p-6" style={{ backgroundColor: "var(--bg-secondary, #f8fafc)", borderColor: "var(--border, #e5e7eb)" }}>
                                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--text-secondary, #6b7280)" }}>
                                        <FiFileText size={14} />
                                        <span>Claim Submission Review</span>
                                    </h3>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                        <div>
                                            <span className="text-gray-400">Customer:</span>
                                            <p className="font-semibold truncate">{formData.customerName || "—"}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Order #:</span>
                                            <p className="font-semibold truncate">{formData.orderNumber || "—"}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Issue:</span>
                                            <p className="font-semibold truncate">{formData.issueType || "—"}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Attachments:</span>
                                            <p className="font-semibold">
                                                {images.length} Image{images.length !== 1 ? "s" : ""}
                                                {video ? " • 1 Video" : ""}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{
                                            backgroundColor: "var(--btn-primary-bg, var(--primary, #2F6FED))",
                                            color: "var(--btn-primary-text, #ffffff)",
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FiLoader className="animate-spin" size={20} />
                                                <span>Submitting Warranty Claim...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiShield size={20} />
                                                <span>Submit Warranty Claim</span>
                                            </>
                                        )}
                                    </button>
                                    <p className="mt-2 text-center text-xs text-gray-400">
                                        By submitting this form, you confirm that the information provided is accurate.
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT COLUMN: WARRANTY INFORMATION SIDEBAR (STICKY) */}
                        <aside className="lg:col-span-4 space-y-6">
                            {/* Card 1: Warranty Promise */}
                            <div className="rounded-2xl border p-6 shadow-xs transition-colors" style={{ backgroundColor: "var(--card-bg, #ffffff)", borderColor: "var(--border, #e5e7eb)" }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                        <FiShield size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm sm:text-base" style={{ color: "var(--text, #12131A)" }}>ComfortSeats Promise</h3>
                                        <p className="text-xs text-gray-400">Authentic &amp; Reliable Support</p>
                                    </div>
                                </div>

                                <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
                                    <li className="flex items-start gap-2.5">
                                        <FiCheck className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span><strong>100% Genuine Replacement:</strong> Authentic parts manufactured to original specs.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <FiCheck className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span><strong>Rapid 24-48h Review:</strong> Prompt inspection and communication from our tech specialists.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <FiCheck className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span><strong>Doorstep Pickup &amp; Delivery:</strong> Seamless courier service right to your home in Pakistan.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Card 2: What is Covered */}
                            <div className="rounded-2xl border p-6 shadow-xs transition-colors" style={{ backgroundColor: "var(--card-bg, #ffffff)", borderColor: "var(--border, #e5e7eb)" }}>
                                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--text, #12131A)" }}>
                                    <FiCheckCircle className="text-blue-600" size={16} />
                                    <span>What is Covered?</span>
                                </h3>

                                <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-0.5">Covered Under Warranty:</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>Manufacturing or structural flaws</li>
                                            <li>Defective hydraulics, gas lifts, or mechanisms</li>
                                            <li>Broken joints or welding defects under normal use</li>
                                            <li>Missing hardware or parts upon unboxing</li>
                                        </ul>
                                    </div>

                                    <div className="pt-2 border-t" style={{ borderColor: "var(--border, #e5e7eb)" }}>
                                        <p className="font-semibold text-gray-900 mb-0.5">Not Covered:</p>
                                        <ul className="list-disc pl-4 space-y-1 text-gray-400">
                                            <li>Normal wear and tear of fabric / leather over time</li>
                                            <li>Accidental cuts, burns, or liquid spills</li>
                                            <li>Damage due to improper assembly or unauthorized modification</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Important Tips */}
                            <div className="rounded-2xl border p-6 shadow-xs transition-colors" style={{ backgroundColor: "var(--card-bg, #ffffff)", borderColor: "var(--border, #e5e7eb)" }}>
                                <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--text, #12131A)" }}>
                                    <FiInfo className="text-amber-500" size={16} />
                                    <span>Helpful Tips</span>
                                </h3>
                                <ul className="space-y-2 text-xs text-gray-600">
                                    <li>• Take photos in good lighting to capture the defect clearly.</li>
                                    <li>• If a mechanical part is making noise, a 5-10 second video helps diagnose it immediately.</li>
                                    <li>• Double-check your phone number so our team can WhatsApp or call you for quick confirmation.</li>
                                </ul>
                            </div>

                            {/* Card 4: Need Help? Direct Support */}
                            <div className="rounded-2xl border p-6 shadow-xs transition-colors" style={{ backgroundColor: "var(--card-bg, #ffffff)", borderColor: "var(--border, #e5e7eb)" }}>
                                <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: "var(--text, #12131A)" }}>
                                    <FiHelpCircle className="text-blue-600" size={16} />
                                    <span>Need Immediate Help?</span>
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Our customer service representatives are available Mon–Sat (10:00 AM – 8:00 PM).
                                </p>

                                <div className="space-y-2.5">
                                    {/* WhatsApp */}
                                    <a
                                        href={contactInfo?.whatsapp ? `https://wa.me/${contactInfo.whatsapp.replace(/[^\d]/g, "")}` : "https://wa.me/923000000000"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-95"
                                    >
                                        <FaWhatsapp size={16} />
                                        <span>Chat on WhatsApp</span>
                                    </a>

                                    {/* Email */}
                                    <a
                                        href={`mailto:${contactInfo?.email || "comfortseats.pk@gmail.com"}`}
                                        className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition hover:bg-black/5 active:scale-95"
                                        style={{ borderColor: "var(--border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                    >
                                        <FiMail size={15} />
                                        <span>{contactInfo?.email || "comfortseats.pk@gmail.com"}</span>
                                    </a>

                                    {/* Phone */}
                                    {contactInfo?.phone && (
                                        <a
                                            href={`tel:${contactInfo.phone}`}
                                            className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition hover:bg-black/5 active:scale-95"
                                            style={{ borderColor: "var(--border, #e5e7eb)", color: "var(--text, #12131A)" }}
                                        >
                                            <FiPhone size={15} />
                                            <span>{contactInfo.phone}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </main>

            {/* Standard Footer */}
            <Footer />
        </div>
    );
}
