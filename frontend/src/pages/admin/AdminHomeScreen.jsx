import { useEffect, useRef, useState } from "react";
import {
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
    FiEdit,
    FiImage,
    FiLoader,
    FiPlus,
    FiSave,
    FiTrash2,
    FiUploadCloud,
    FiX,
    FiMonitor,
    FiSmartphone,
} from "react-icons/fi";
import api, { putMultipart } from "../../api/api";
import { useToast } from "../../components/ToastNotification";

const defaultBanner = {
    eyebrow: "Trusted",
    title: "Comfort, Built\nto Last.",
    description:
        "Premium office chairs, gaming chairs, sofas, and complete furniture solutions.",
    primaryButtonText: "Shop Now",
    primaryButtonLink: "/products",
    secondaryButtonText: "Our Story",
    secondaryButtonLink: "/about",
    imageUrl: "https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=1000",
    desktopImage: "https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=1000",
    mobileImage: "",
    imageAlt: "Premium office chair",
    statValue: "",
    statLabel: "Years of craftsmanship",
};

const defaultWhyChooseUs = [
    { icon: "FiFeather", title: "Quality Craftsmanship", desc: "Every piece built with care and quality materials." },
    { icon: "FiDollarSign", title: "Affordable Pricing", desc: "Premium comfort without the premium price tag." },
    { icon: "FiShield", title: "Built to Last", desc: "Durability that holds up to everyday use." },
    { icon: "FiCheckCircle", title: "30+ Years Trusted", desc: "A legacy of customer satisfaction since 1995." },
];

const defaultBusinessHours = [
    { label: "Mon - Sat", value: "10:00 AM - 8:00 PM" },
];

// Icon options for Why Choose Us
const valueIconOptions = [
    { value: "FiFeather", label: "Feather" },
    { value: "FiDollarSign", label: "Dollar Sign" },
    { value: "FiShield", label: "Shield" },
    { value: "FiCheckCircle", label: "Check Circle" },
    { value: "FiTruck", label: "Truck" },
    { value: "FiClock", label: "Clock" },
];

const AdminHomeScreen = () => {
    const toast = useToast();
    const [banner, setBanner] = useState(defaultBanner);
    const [whyChooseUs, setWhyChooseUs] = useState(defaultWhyChooseUs);
    const [businessHours, setBusinessHours] = useState(defaultBusinessHours);
    const [loading, setLoading] = useState(true);
    const [savingBanner, setSavingBanner] = useState(false);
    const [savingWhyChooseUs, setSavingWhyChooseUs] = useState(false);
    const [savingHours, setSavingHours] = useState(false);
    const [status, setStatus] = useState(null);

    // Desktop image state
    const [desktopImageFile, setDesktopImageFile] = useState(null);
    const [desktopImagePreview, setDesktopImagePreview] = useState("");
    const desktopFileInputRef = useRef(null);
    
    // Mobile image state
    const [mobileImageFile, setMobileImageFile] = useState(null);
    const [mobileImagePreview, setMobileImagePreview] = useState("");
    const mobileFileInputRef = useRef(null);
    

    // Quote section state
    const [quoteLabel, setQuoteLabel] = useState("Designed For Modern Workspaces");
    const [quoteFirstSentence, setQuoteFirstSentence] = useState("Where Comfort Meets ");
    const [quoteRotatingWords, setQuoteRotatingWords] = useState([
        "Productivity", "Comfort", "Ergonomics", "Luxury", "Quality", "Performance", "Style", "Excellence"
    ]);
    const [quoteDescription, setQuoteDescription] = useState(
        "Elevate your workspace with furniture crafted to inspire creativity, improve posture, and redefine everyday comfort. Experience the perfect blend of premium design and lasting functionality."
    );
    const [savingQuote, setSavingQuote] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await api.get("/site-content");
                if (res.data?.success) {
                    const fetchedBanner = { ...defaultBanner, ...(res.data.data?.homeBanner || {}) };
                    setBanner(fetchedBanner);
                    setDesktopImagePreview(fetchedBanner.desktopImage || "");
                    setMobileImagePreview(fetchedBanner.mobileImage || "");
                    
                    const fetchedWhyChooseUs = res.data.data?.whyChooseUs;
                    if (Array.isArray(fetchedWhyChooseUs) && fetchedWhyChooseUs.length > 0) {
                        setWhyChooseUs(fetchedWhyChooseUs.map(({ icon, title, desc }) => ({ 
                            icon: icon || "", 
                            title: title || "", 
                            desc: desc || "" 
                        })));
                    }
                    
                    const hours = res.data.data?.businessHours;
                    if (Array.isArray(hours) && hours.length > 0) {
                        setBusinessHours(hours.map(({ label, value }) => ({ label: label || "", value: value || "" })));
                    }

                    // Load quote section
                    const qs = res.data.data?.quoteSection;
                    if (qs) {
                        if (qs.label) setQuoteLabel(qs.label);
                        if (qs.firstSentence) setQuoteFirstSentence(qs.firstSentence);
                        if (Array.isArray(qs.rotatingWords) && qs.rotatingWords.length > 0) setQuoteRotatingWords(qs.rotatingWords);
                        if (qs.description) setQuoteDescription(qs.description);
                    }
                }
            } catch (err) {
                setStatus({ type: "error", message: "Failed to load home screen settings." });
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    const handleBannerChange = (e) => {
        setBanner((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setStatus(null);
    };


    const handleDesktopImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setStatus({ type: "error", message: "Please select a valid image file (JPG, PNG, GIF, or WebP)." });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setStatus({ type: "error", message: "Image file must be less than 5MB." });
                return;
            }
            
            setDesktopImageFile(file);
            setDesktopImagePreview(URL.createObjectURL(file));
            setStatus(null);
        }
    };

    const handleMobileImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setStatus({ type: "error", message: "Please select a valid image file (JPG, PNG, GIF, or WebP)." });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setStatus({ type: "error", message: "Image file must be less than 5MB." });
                return;
            }
            
            setMobileImageFile(file);
            setMobileImagePreview(URL.createObjectURL(file));
            setStatus(null);
        }
    };

    const handleValueChange = (index, field, value) => {
        setWhyChooseUs((prev) =>
            prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
        );
        setStatus(null);
    };

    const addValueRow = () => {
        setWhyChooseUs((prev) => [...prev, { icon: "", title: "", desc: "" }]);
    };

    const removeValueRow = (index) => {
        setWhyChooseUs((prev) => (prev.length > 1 ? prev.filter((_, itemIndex) => itemIndex !== index) : prev));
        setStatus(null);
    };

    const handleHourChange = (index, field, value) => {
        setBusinessHours((prev) =>
            prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
        );
        setStatus(null);
    };

    const addHourRow = () => {
        setBusinessHours((prev) => [...prev, { label: "", value: "" }]);
    };

    const removeHourRow = (index) => {
        setBusinessHours((prev) => (prev.length > 1 ? prev.filter((_, itemIndex) => itemIndex !== index) : prev));
        setStatus(null);
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();

        if (!banner.title.trim() || !banner.description.trim()) {
            setStatus({ type: "error", message: "Banner title and description are required." });
            return;
        }

        setSavingBanner(true);
        setStatus(null);

        try {
            const formData = new FormData();
            
            // Append desktop image file if selected
            if (desktopImageFile) {
                formData.append("desktopImage", desktopImageFile);
            }
            
            // Append mobile image file if selected
            if (mobileImageFile) {
                formData.append("mobileImage", mobileImageFile);
            }
            
            // Append all banner fields
            Object.entries(banner).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    formData.append(key, value);
                }
            });
            
            const res = await putMultipart("/site-content/home-banner", formData);
            if (res.data?.success) {
                const updatedData = res.data.data || {};
                setBanner((prev) => ({ ...defaultBanner, ...updatedData }));
                setDesktopImagePreview(updatedData.desktopImage || "");
                setMobileImagePreview(updatedData.mobileImage || "");
                setDesktopImageFile(null);
                setMobileImageFile(null);
                if (desktopFileInputRef.current) desktopFileInputRef.current.value = "";
                if (mobileFileInputRef.current) mobileFileInputRef.current.value = "";
                toast.success("Home banner updated successfully.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update home banner.");
        } finally {
            setSavingBanner(false);
        }
    };

    const handleWhyChooseUsSubmit = async (e) => {
        e.preventDefault();

        const cleanedValues = whyChooseUs
            .map((item) => ({ 
                icon: item.icon.trim(), 
                title: item.title.trim(), 
                desc: item.desc.trim() 
            }))
            .filter((item) => item.title);

        if (cleanedValues.length === 0) {
            setStatus({ type: "error", message: "Add at least one value item." });
            return;
        }

        setSavingWhyChooseUs(true);
        setStatus(null);

        try {
            const res = await api.put("/site-content/why-choose-us", { whyChooseUs: cleanedValues });
            if (res.data?.success) {
                setWhyChooseUs(res.data.data || cleanedValues);
                toast.success("Why Choose Us updated successfully.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update Why Choose Us.");
        } finally {
            setSavingWhyChooseUs(false);
        }
    };

    const handleQuoteWordChange = (index, value) => {
        setQuoteRotatingWords((prev) => prev.map((w, i) => (i === index ? value : w)));
    };

    const addQuoteWord = () => {
        setQuoteRotatingWords((prev) => [...prev, ""]);
    };

    const removeQuoteWord = (index) => {
        setQuoteRotatingWords((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
    };

    const handleQuoteSubmit = async (e) => {
        e.preventDefault();

        const cleanedWords = quoteRotatingWords
            .map(w => w.trim())
            .filter(w => w.length > 0);

        if (cleanedWords.length === 0) {
            setStatus({ type: "error", message: "Add at least one rotating word." });
            return;
        }

        setSavingQuote(true);
        setStatus(null);

        try {
            const res = await api.put("/site-content/quote-section", {
                label: quoteLabel.trim(),
                firstSentence: quoteFirstSentence.trim(),
                rotatingWords: cleanedWords,
                description: quoteDescription.trim()
            });
            if (res.data?.success) {
                const qd = res.data.data;
                setQuoteLabel(qd.label || quoteLabel);
                setQuoteFirstSentence(qd.firstSentence || quoteFirstSentence);
                setQuoteRotatingWords(qd.rotatingWords || cleanedWords);
                setQuoteDescription(qd.description || quoteDescription);
                toast.success("Quote section updated successfully.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update quote section.");
        } finally {
            setSavingQuote(false);
        }
    };

    const handleHoursSubmit = async (e) => {
        e.preventDefault();

        const cleanedHours = businessHours
            .map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
            .filter((item) => item.label || item.value);

        if (cleanedHours.length === 0) {
            setStatus({ type: "error", message: "Add at least one business hour row." });
            return;
        }

        setSavingHours(true);
        setStatus(null);

        try {
            const res = await api.put("/site-content/business-hours", { businessHours: cleanedHours });
            if (res.data?.success) {
                setBusinessHours(res.data.data || cleanedHours);
                toast.success("Business hours updated successfully.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update business hours.");
        } finally {
            setSavingHours(false);
        }
    };

    const titleLines = (banner.title || "").split("\n");

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <FiLoader className="animate-spin" size={22} />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-8">
                <h1 className=" text-2xl font-bold text-[#12131A]">Home Screen</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Edit the homepage banner, why-choose-us section, and business hours.
                </p>
            </div>

            {status && (
                <div
                    className={`mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm ${
                        status.type === "success"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-[#E5484D]/10 text-[#E5484D]"
                    }`}
                >
                    {status.type === "success" ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
                    {status.message}
                </div>
            )}

            {/* Home Banner Section */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
                <form onSubmit={handleBannerSubmit} className="space-y-6 xl:col-span-3">
                    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-2">
                            <FiImage className="text-[#2F6FED]" size={18} />
                            <h2 className=" text-base font-semibold text-[#12131A]">
                                Home Banner
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Eyebrow</label>
                                <input
                                    name="eyebrow"
                                    value={banner.eyebrow}
                                    onChange={handleBannerChange}
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Title</label>
                                <textarea
                                    name="title"
                                    value={banner.title}
                                    onChange={handleBannerChange}
                                    rows={3}
                                    className="block w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Description</label>
                                <textarea
                                    name="description"
                                    value={banner.description}
                                    onChange={handleBannerChange}
                                    rows={4}
                                    className="block w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Primary Button</label>
                                    <input
                                        name="primaryButtonText"
                                        value={banner.primaryButtonText}
                                        onChange={handleBannerChange}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Primary Link</label>
                                    <input
                                        name="primaryButtonLink"
                                        value={banner.primaryButtonLink}
                                        onChange={handleBannerChange}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Secondary Button</label>
                                    <input
                                        name="secondaryButtonText"
                                        value={banner.secondaryButtonText}
                                        onChange={handleBannerChange}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Secondary Link</label>
                                    <input
                                        name="secondaryButtonLink"
                                        value={banner.secondaryButtonLink}
                                        onChange={handleBannerChange}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                    />
                                </div>
                            </div>

                            {/* Desktop Banner Upload Section */}
                            <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <FiMonitor className="text-[#2F6FED]" size={18} />
                                    <h3 className="text-sm font-semibold text-[#12131A]">Desktop Banner</h3>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => desktopFileInputRef.current?.click()}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#12131A] transition hover:border-[#2F6FED] hover:text-[#2F6FED]"
                                    >
                                        <FiUploadCloud size={16} />
                                        {desktopImageFile || desktopImagePreview ? "Replace Image" : "Upload Image"}
                                    </button>
                                    {(desktopImageFile || desktopImagePreview) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDesktopImageFile(null);
                                                setDesktopImagePreview(banner.desktopImage || "");
                                                if (desktopFileInputRef.current) desktopFileInputRef.current.value = "";
                                            }}
                                            className="inline-flex items-center gap-1.5 text-xs text-[#E5484D] hover:text-[#E5484D]/80"
                                        >
                                            <FiX size={14} />
                                            Remove
                                        </button>
                                    )}
                                    <input
                                        ref={desktopFileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleDesktopImageChange}
                                        className="hidden"
                                    />
                                </div>
                                {desktopImagePreview && (
                                    <div className="mt-3">
                                        <img
                                            src={desktopImagePreview}
                                            alt="Desktop banner preview"
                                            className="aspect-[1920/700] w-full rounded-lg border border-gray-200 object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                                <p className="mt-2 text-xs text-gray-400">
                                    Recommended: 1920 × 700 px — Recommended for desktops and large screens.
                                </p>
                                {desktopImageFile && (
                                    <p className="mt-1 text-xs text-gray-400">
                                        Selected: {desktopImageFile.name} ({(desktopImageFile.size / 1024).toFixed(1)} KB)
                                    </p>
                                )}
                            </div>

                            {/* Mobile Banner Upload Section */}
                            <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <FiSmartphone className="text-[#7C3AED]" size={18} />
                                    <h3 className="text-sm font-semibold text-[#12131A]">Mobile Banner</h3>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => mobileFileInputRef.current?.click()}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#12131A] transition hover:border-[#7C3AED] hover:text-[#7C3AED]"
                                    >
                                        <FiUploadCloud size={16} />
                                        {mobileImageFile || mobileImagePreview ? "Replace Image" : "Upload Image"}
                                    </button>
                                    {(mobileImageFile || mobileImagePreview) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMobileImageFile(null);
                                                setMobileImagePreview(banner.mobileImage || "");
                                                if (mobileFileInputRef.current) mobileFileInputRef.current.value = "";
                                            }}
                                            className="inline-flex items-center gap-1.5 text-xs text-[#E5484D] hover:text-[#E5484D]/80"
                                        >
                                            <FiX size={14} />
                                            Remove
                                        </button>
                                    )}
                                    <input
                                        ref={mobileFileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleMobileImageChange}
                                        className="hidden"
                                    />
                                </div>
                                {mobileImagePreview && (
                                    <div className="mt-3">
                                        <img
                                            src={mobileImagePreview}
                                            alt="Mobile banner preview"
                                            className="aspect-[1080/1350] w-full max-w-[250px] rounded-lg border border-gray-200 object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                                <p className="mt-2 text-xs text-gray-400">
                                    Recommended: 1080 × 1350 px — Recommended for mobile devices.
                                </p>
                                {mobileImageFile && (
                                    <p className="mt-1 text-xs text-gray-400">
                                        Selected: {mobileImageFile.name} ({(mobileImageFile.size / 1024).toFixed(1)} KB)
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Image Alt Text</label>
                                <input
                                    name="imageAlt"
                                    value={banner.imageAlt}
                                    onChange={handleBannerChange}
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="sm:col-span-1">
                                    <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Stat Value</label>
                                    <input
                                        name="statValue"
                                        value={banner.statValue}
                                        onChange={handleBannerChange}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Stat Label</label>
                                    <input
                                        name="statLabel"
                                        value={banner.statLabel}
                                        onChange={handleBannerChange}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={savingBanner}
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {savingBanner ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                            {savingBanner ? "Saving..." : "Save Banner"}
                        </button>
                    </section>
                </form>

                <aside className="xl:col-span-2">
                    <div className="sticky top-6 space-y-4">
                        {/* Desktop Preview */}
                        <div className="rounded-2xl border border-gray-100 bg-[#0F1320] p-5 text-white shadow-sm">
                            <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                                <FiMonitor size={14} className="text-[#2F6FED]" />
                                <span className="text-xs font-semibold uppercase tracking-wide text-[#2F6FED]">Desktop Preview</span>
                            </div>
                            {desktopImagePreview ? (
                                <img
                                    src={desktopImagePreview}
                                    alt="Desktop banner preview"
                                    className="aspect-[16/7] w-full rounded-lg object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="flex aspect-[16/7] w-full items-center justify-center rounded-lg bg-white/5 text-xs text-gray-400">
                                    No desktop image uploaded
                                </div>
                            )}
                            <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#F5A524]">
                                {banner.eyebrow || "Banner"}
                            </span>
                            <h3 className="mt-3 text-lg font-bold leading-tight">
                                {titleLines.map((line, index) => (
                                    <span key={`desk-${line}-${index}`}>
                                        {line}
                                        {index < titleLines.length - 1 && <br />}
                                    </span>
                                ))}
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-gray-300">{banner.description}</p>
                        </div>

                        {/* Mobile Preview */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <FiSmartphone size={14} className="text-[#7C3AED]" />
                                <span className="text-xs font-semibold uppercase tracking-wide text-[#7C3AED]">Mobile Preview</span>
                            </div>
                        <div className="mx-auto max-w-[200px]">
                                {mobileImagePreview ? (
                                    <img
                                        src={mobileImagePreview}
                                        alt="Mobile banner preview"
                                        className="aspect-[1080/1350] w-full rounded-lg object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="flex aspect-[1080/1350] w-full items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-400">
                                        No Mobile Banner Uploaded
                                    </div>
                                )}
                                <p className="mt-2 text-center text-xs text-gray-400">
                                    {mobileImagePreview ? "Mobile image" : "No Mobile Banner Uploaded"}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Why Choose Us Section */}
            <form onSubmit={handleWhyChooseUsSubmit} className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <FiEdit className="text-[#2F6FED]" size={18} />
                        <h2 className=" text-base font-semibold text-[#12131A]">
                            Why Choose Us
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={addValueRow}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#12131A] transition hover:border-[#2F6FED] hover:text-[#2F6FED]"
                    >
                        <FiPlus size={15} />
                        Add Value
                    </button>
                </div>

                <div className="space-y-4">
                    {whyChooseUs.map((item, index) => (
                        <div key={index} className="space-y-3 rounded-xl border border-gray-100 p-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#12131A]">Title</label>
                                    <input
                                        value={item.title}
                                        onChange={(e) => handleValueChange(index, "title", e.target.value)}
                                        placeholder="Title (e.g., Quality Craftsmanship)"
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#12131A]">Icon</label>
                                    <select
                                        value={item.icon}
                                        onChange={(e) => handleValueChange(index, "icon", e.target.value)}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                    >
                                        <option value="">Select Icon</option>
                                        {valueIconOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-[#12131A]">Description</label>
                                <textarea
                                    value={item.desc}
                                    onChange={(e) => handleValueChange(index, "desc", e.target.value)}
                                    placeholder="Description..."
                                    rows={2}
                                    className="block w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeValueRow(index)}
                                disabled={whyChooseUs.length === 1}
                                title="Remove value"
                                className="inline-flex items-center gap-1.5 text-xs text-[#E5484D] hover:text-[#E5484D]/80"
                            >
                                <FiTrash2 size={14} />
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={savingWhyChooseUs}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {savingWhyChooseUs ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                    {savingWhyChooseUs ? "Saving..." : "Save Why Choose Us"}
                </button>
            </form>

            {/* Business Hours Section */}
            <form onSubmit={handleHoursSubmit} className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <FiClock className="text-[#2F6FED]" size={18} />
                        <h2 className=" text-base font-semibold text-[#12131A]">
                            Business Hours
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={addHourRow}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#12131A] transition hover:border-[#2F6FED] hover:text-[#2F6FED]"
                    >
                        <FiPlus size={15} />
                        Add Row
                    </button>
                </div>

                <div className="space-y-3">
                    {businessHours.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
                            <input
                                value={item.label}
                                onChange={(e) => handleHourChange(index, "label", e.target.value)}
                                placeholder="Mon - Sat"
                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                            <input
                                value={item.value}
                                onChange={(e) => handleHourChange(index, "value", e.target.value)}
                                placeholder="10:00 AM - 8:00 PM"
                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                            <button
                                type="button"
                                onClick={() => removeHourRow(index)}
                                disabled={businessHours.length === 1}
                                title="Remove row"
                                className="flex h-11 items-center justify-center rounded-xl border border-gray-200 px-4 text-[#E5484D] transition hover:border-[#E5484D] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={savingHours}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {savingHours ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                    {savingHours ? "Saving..." : "Save Hours"}
                </button>
            </form>

            {/* Quote Section */}
            <form onSubmit={handleQuoteSubmit} className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                    <FiEdit className="text-[#2F6FED]" size={18} />
                    <h2 className=" text-base font-semibold text-[#12131A]">
                        Quote Section
                    </h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Label</label>
                        <input
                            value={quoteLabel}
                            onChange={(e) => setQuoteLabel(e.target.value)}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            placeholder="Designed For Modern Workspaces"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[#12131A]">
                            First Sentence <span className="font-normal text-gray-400">(before rotating words)</span>
                        </label>
                        <input
                            value={quoteFirstSentence}
                            onChange={(e) => setQuoteFirstSentence(e.target.value)}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            placeholder="Where Comfort Meets "
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[#12131A]">
                            Rotating Words
                        </label>
                        <div className="space-y-2">
                            {quoteRotatingWords.map((word, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        value={word}
                                        onChange={(e) => handleQuoteWordChange(idx, e.target.value)}
                                        className="block flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                        placeholder="e.g., Productivity"
                                    />
                                    {quoteRotatingWords.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuoteWord(idx)}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                            aria-label="Remove word"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addQuoteWord}
                                className="flex items-center gap-2 text-xs font-semibold text-[#2F6FED] transition hover:underline"
                            >
                                <FiPlus size={14} />
                                Add another word
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Description</label>
                        <textarea
                            value={quoteDescription}
                            onChange={(e) => setQuoteDescription(e.target.value)}
                            rows={3}
                            className="block w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            placeholder="Elevate your workspace with furniture crafted to inspire creativity..."
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={savingQuote}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {savingQuote ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                    {savingQuote ? "Saving..." : "Save Quote Section"}
                </button>
            </form>
        </div>
    );
};

export default AdminHomeScreen;