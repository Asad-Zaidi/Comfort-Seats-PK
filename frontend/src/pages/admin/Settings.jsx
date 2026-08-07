import { useEffect, useState, useRef } from "react";
import { useSiteConfig } from "../../utils/siteConfig";
import { useToast } from "../../components/ToastNotification";
import api from "../../api/api";
import { invalidateSiteContentCache, writeCache } from "../../utils/siteConfig";
import { FiInfo, FiUpload, FiImage, FiCheck, FiSliders, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const AdminSettings = () => {
    const { siteName, siteUrl, siteTitle, keywords, logoUrl, whatsappNumber, setSiteContent } = useSiteConfig();
    const toast = useToast();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        siteName: "Comfort Seats PK",
        siteUrl: "https://comfortseatspk.com/",
        siteTitle: "Comfort Seats PK",
        keywords: "Chairs, Office Chairs, Gaming Chairs, Ergonomic Chairs, Furniture, Home Office, Comfort Seats, Waiting Chairs, Recliners, Swivel Chairs, Adjustable Chairs, Executive Chairs, Task Chairs, Lounge Chairs, Modern Furniture, Home Decor, Interior Design",
        logoUrl: "",
        whatsappNumber: "+923184346146",
    });
    const [saving, setSaving] = useState(false);
    const [logoDimensions, setLogoDimensions] = useState({ width: 0, height: 0, error: false });

    useEffect(() => {
        setForm({
            siteName: siteName || "Comfort Seats PK",
            siteUrl: (siteUrl && !siteUrl.includes("localhost") && !siteUrl.includes("127.0.0.1")) ? siteUrl : "https://comfortseatspk.com/",
            siteTitle: siteTitle || "Comfort Seats PK",
            keywords: keywords || "Chairs, Office Chairs, Gaming Chairs, Ergonomic Chairs, Furniture, Home Office, Comfort Seats, Waiting Chairs, Recliners, Swivel Chairs, Adjustable Chairs, Executive Chairs, Task Chairs, Lounge Chairs, Modern Furniture, Home Decor, Interior Design",
            logoUrl: logoUrl || "",
            whatsappNumber: whatsappNumber || "+923184346146",
        });
    }, [siteName, siteUrl, siteTitle, keywords, logoUrl, whatsappNumber]);

    // Measure logo image dimensions whenever logoUrl changes
    useEffect(() => {
        if (!form.logoUrl) {
            setLogoDimensions({ width: 0, height: 0, error: false });
            return;
        }
        const img = new Image();
        img.src = form.logoUrl;
        img.onload = () => {
            setLogoDimensions({ width: img.naturalWidth, height: img.naturalHeight, error: false });
        };
        img.onerror = () => {
            setLogoDimensions({ width: 0, height: 0, error: true });
        };
    }, [form.logoUrl]);

    const handleLogoFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Logo file size must be under 10MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result;
            if (!dataUrl) return;

            // SVGs can be set directly
            if (file.type === "image/svg+xml") {
                setForm((prev) => ({ ...prev, logoUrl: dataUrl }));
                toast.success("SVG logo selected.");
                return;
            }

            // Optimize raster image (PNG, WEBP, JPG) on Canvas
            const img = new Image();
            img.onload = () => {
                const MAX_WIDTH = 800;
                let width = img.naturalWidth || img.width;
                let height = img.naturalHeight || img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const mimeType = file.type === "image/png" ? "image/png" : "image/webp";
                const optimizedUrl = canvas.toDataURL(mimeType, 0.92);
                setForm((prev) => ({ ...prev, logoUrl: optimizedUrl }));
                toast.success("Logo file selected and optimized.");
            };
            img.onerror = () => {
                setForm((prev) => ({ ...prev, logoUrl: dataUrl }));
                toast.success("Logo file selected.");
            };
            img.src = dataUrl;
        };

        reader.onerror = () => {
            toast.error("Failed to read logo file.");
        };

        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const sanitizedForm = {
            ...form,
            siteUrl: (form.siteUrl && !form.siteUrl.includes("localhost") && !form.siteUrl.includes("127.0.0.1"))
                ? form.siteUrl
                : "https://comfortseatspk.com/"
        };
        try {
            const res = await api.put("/site-content/settings", sanitizedForm);
            if (!res.data?.success) {
                throw new Error(res.data?.message || "Failed to update site settings.");
            }
            invalidateSiteContentCache();
            const updated = { ...sanitizedForm };
            writeCache({ data: updated, fetchedAt: Date.now() });
            setSiteContent(updated);
            toast.success("Site settings updated successfully.");
        } catch (err) {
            if (err?.response?.status === 413) {
                toast.error("Payload too large. Please select a smaller logo or use an image URL.");
            } else {
                toast.error(err?.response?.data?.message || err?.message || "Something went wrong.");
            }
        } finally {
            setSaving(false);
        }
    };

    const FieldLabel = ({ label, tooltip }) => (
        <div className="mb-1.5 flex items-center gap-2">
            <label className="block text-sm font-semibold text-gray-800">
                {label}
            </label>

            <div className="relative group">
                <FiInfo className="text-gray-400 hover:text-blue-600 cursor-pointer" size={15} />

                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                    {tooltip}
                    <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"></div>
                </div>
            </div>
        </div>
    );

    // Dimension status calculation
    const aspectRatio = logoDimensions.width && logoDimensions.height
        ? (logoDimensions.width / logoDimensions.height).toFixed(1)
        : null;

    const isOptimalAspect = aspectRatio && aspectRatio >= 2.5 && aspectRatio <= 6.0;
    const isTallOrSquare = aspectRatio && aspectRatio < 2.0;

    return (
        <div className="max-w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Site Branding & Settings</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Update your storefront navbar logo, site title, URL, and branding parameters.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* General Settings */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                    <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                        <FiSliders className="text-[#2F6FED]" size={18} />
                        General Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <FieldLabel
                                label="Site Name"
                                tooltip="The name displayed in the navbar header, footer, invoices, and email communications."
                            />
                            <input
                                value={form.siteName}
                                onChange={(e) => setForm((prev) => ({ ...prev, siteName: e.target.value }))}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                        </div>

                        <div>
                            <FieldLabel
                                label="Site URL"
                                tooltip="Enter your complete website URL, e.g. https://comfortseatspk.com."
                            />
                            <input
                                value={form.siteUrl}
                                onChange={(e) => setForm((prev) => ({ ...prev, siteUrl: e.target.value }))}
                                placeholder="https://comfortseatspk.com"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                        </div>

                        <div>
                            <FieldLabel
                                label="Browser Tab Title"
                                tooltip="Title shown in browser tabs and search engine results."
                            />
                            <input
                                value={form.siteTitle}
                                onChange={(e) => setForm((prev) => ({ ...prev, siteTitle: e.target.value }))}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                        </div>

                        <div>
                            <FieldLabel
                                label="Meta Keywords"
                                tooltip="Comma-separated keywords for search engine optimization (SEO)."
                            />
                            <input
                                value={form.keywords}
                                onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
                                placeholder="furniture, office chairs, etc."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                        </div>

                        <div>
                            <FieldLabel
                                label="WhatsApp Number"
                                tooltip="Owner's WhatsApp number with country code (e.g. +923001234567) used for WhatsApp checkout and chat."
                            />
                            <input
                                value={form.whatsappNumber}
                                onChange={(e) => setForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                                placeholder="+923001234567"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                        </div>
                    </div>
                </div>

                {/* Navbar Logo Configuration */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                    <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                        <FiImage className="text-[#2F6FED]" size={18} />
                        Navbar Logo Settings & Specs
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Upload & Link Controls */}
                        <div className="space-y-4">
                            <FieldLabel
                                label="Navbar Logo Source"
                                tooltip="Upload a logo image file from your computer or paste an external image URL."
                            />

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#2F6FED]/10 px-4 py-2.5 text-sm font-semibold text-[#2F6FED] hover:bg-[#2F6FED]/20 transition shrink-0 cursor-pointer"
                                >
                                    <FiUpload size={16} />
                                    Upload Logo File
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/svg+xml,image/webp,image/jpeg"
                                    onChange={handleLogoFileChange}
                                    className="hidden"
                                />
                                <span className="text-xs text-gray-400">PNG, SVG, WEBP (Auto-optimized)</span>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                                <input
                                    value={form.logoUrl}
                                    onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>

                            {/* Recommended Specifications Box */}
                            <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4 text-xs text-blue-900 space-y-2">
                                <p className="font-semibold text-blue-950 flex items-center gap-1.5 text-sm">
                                    📐 Recommended Logo Specs:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
                                        <span className="text-gray-500 block text-[11px]">Optimal Dimensions</span>
                                        <span className="font-bold text-gray-800">240 × 60 px</span>
                                        <span className="text-gray-400 block text-[10px]">(4:1 Aspect Ratio)</span>
                                    </div>
                                    <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
                                        <span className="text-gray-500 block text-[11px]">Resolution & Format</span>
                                        <span className="font-bold text-gray-800">72 DPI Standard</span>
                                        <span className="text-gray-400 block text-[10px]">(Retina @2x: 480 × 120 px)</span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-blue-700">
                                    💡 <strong>Tip:</strong> Transparent PNG or vector SVG files look best across dark and light header themes.
                                </p>
                            </div>
                        </div>

                        {/* Live Preview & Dimension Validation Card */}
                        <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Navbar Logo Preview
                                    </span>
                                    {logoDimensions.error ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                                            <FiAlertTriangle size={12} /> Image Load Error
                                        </span>
                                    ) : isOptimalAspect ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                                            <FiCheckCircle size={12} /> Optimal Dimensions
                                        </span>
                                    ) : isTallOrSquare ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                            <FiAlertTriangle size={12} /> Tall/Square Aspect
                                        </span>
                                    ) : null}
                                </div>

                                <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-4 shadow-2xs">
                                    {form.logoUrl ? (
                                        <img
                                            src={form.logoUrl}
                                            alt="Navbar logo preview"
                                            className="max-h-16 max-w-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <FiImage size={32} className="mx-auto mb-1 opacity-40" />
                                            <span className="text-xs">No logo image uploaded</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dimension Error Warning / Measurement Badges */}
                            <div>
                                {logoDimensions.error && (
                                    <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                                        <FiAlertTriangle className="shrink-0 mt-0.5 text-red-500" size={15} />
                                        <div>
                                            <strong className="block font-semibold">Image Loading Error</strong>
                                            The logo URL or file could not be rendered. Please ensure the link is a valid image or upload a PNG/SVG file.
                                        </div>
                                    </div>
                                )}

                                {isTallOrSquare && !logoDimensions.error && (
                                    <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                                        <FiAlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={15} />
                                        <div>
                                            <strong className="block font-semibold">Dimension Notice ({aspectRatio}:1 aspect ratio)</strong>
                                            This logo is tall or square. For best navbar alignment, a horizontal 4:1 logo (240×60px) is recommended.
                                        </div>
                                    </div>
                                )}

                                {form.logoUrl && !logoDimensions.error && (
                                    <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="bg-white p-2 rounded-lg border border-gray-200">
                                            <span className="text-gray-400 text-[10px] block">Width</span>
                                            <span className="font-bold text-gray-700">
                                                {logoDimensions.width ? `${logoDimensions.width}px` : "Detecting..."}
                                            </span>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200">
                                            <span className="text-gray-400 text-[10px] block">Height</span>
                                            <span className="font-bold text-gray-700">
                                                {logoDimensions.height ? `${logoDimensions.height}px` : "Detecting..."}
                                            </span>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200">
                                            <span className="text-gray-400 text-[10px] block">Aspect Ratio</span>
                                            <span className="font-bold text-gray-700">
                                                {aspectRatio ? `${aspectRatio}:1` : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                        <FiCheck size={18} />
                        {saving ? "Saving..." : "Save Branding Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;