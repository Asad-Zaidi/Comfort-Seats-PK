import { useEffect, useState } from "react";
import { useSiteConfig } from "../../utils/siteConfig";
import { useToast } from "../../components/ToastNotification";
import api from "../../api/api";
import { invalidateSiteContentCache, writeCache } from "../../utils/siteConfig";
import { FiInfo } from "react-icons/fi";

const AdminSettings = () => {
    const { siteName, siteUrl, siteTitle, keywords, logoUrl, faviconUrl, whatsappNumber, setSiteContent } = useSiteConfig();
    const toast = useToast();
    const [form, setForm] = useState({
        siteName: "Comfort Seats PK",
        siteUrl: "https://comfortseatspk.com/",
        siteTitle: "Comfort Seats PK",
        keywords: "Chairs, Office Chairs, Gaming Chairs, Ergonomic Chairs, Furniture, Home Office, Comfort Seats, Waiting Chairs, Recliners, Swivel Chairs, Adjustable Chairs, Executive Chairs, Task Chairs, Lounge Chairs, Modern Furniture, Home Decor, Interior Design",
        logoUrl: "",
        faviconUrl: "",
        whatsappNumber: "+923184346146",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm({
            siteName: siteName || "Comfort Seats PK",
            siteUrl: siteUrl || "https://comfortseatspk.com/",
            siteTitle: siteTitle || "Comfort Seats PK",
            keywords: keywords || "Chairs, Office Chairs, Gaming Chairs, Ergonomic Chairs, Furniture, Home Office, Comfort Seats, Waiting Chairs, Recliners, Swivel Chairs, Adjustable Chairs, Executive Chairs, Task Chairs, Lounge Chairs, Modern Furniture, Home Decor, Interior Design",
            logoUrl: logoUrl || "",
            faviconUrl: faviconUrl || "",
            whatsappNumber: whatsappNumber || "+923184346146",
        });
    }, [siteName, siteUrl, siteTitle, keywords, logoUrl, faviconUrl, whatsappNumber]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put("/site-content/settings", form);
            if (!res.data?.success) {
                throw new Error(res.data?.message || "Failed to update site settings.");
            }
            invalidateSiteContentCache();
            const updated = { ...form };
            writeCache({ data: updated, fetchedAt: Date.now() });
            setSiteContent(updated);
            toast.success("Site settings updated successfully.");
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const FieldLabel = ({ label, tooltip }) => (
        <div className="mb-1 flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            <div className="relative group">
                <FiInfo className="text-gray-400 hover:text-blue-600 cursor-pointer" />

                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                    {tooltip}

                    <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Site Branding</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Update the site title, URL, logo, and favicon. Changes apply across the storefront automatically.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div>
                        <FieldLabel
                            label="Site Name"
                            tooltip="This is the name displayed in the website header, footer, invoices, emails, and other branding locations."
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
                            tooltip="Enter your website's complete URL, e.g. https://comfortstorepk.com. It is used for links and SEO."
                        />
                        <input
                            value={form.siteUrl}
                            onChange={(e) => setForm((prev) => ({ ...prev, siteUrl: e.target.value }))}
                            placeholder="https://comfortstorepk.com"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                        />
                    </div>

                    <div>
                        <FieldLabel
                            label="Browser Tab Title"
                            tooltip="The title shown in the browser tab and search engine results."
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
                            tooltip="Comma separated keywords for SEO."
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
                            label="Logo URL"
                            tooltip="Paste the URL of your logo image. PNG or SVG with a transparent background is recommended."
                        />
                        <input
                            value={form.logoUrl}
                            onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                            placeholder="https://"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                        />
                        {form.logoUrl && (
                            <div className="mt-3">
                                <img src={form.logoUrl} alt="Logo preview" className="h-12 w-auto rounded-lg border border-gray-100 object-contain" />
                            </div>
                        )}
                    </div>

                    <div>
                        <FieldLabel
                            label="Favicon URL"
                            tooltip="Small icon shown in browser tabs and bookmarks. A 32x32 or 64x64 PNG or ICO is recommended."
                        />
                        <input
                            value={form.faviconUrl}
                            onChange={(e) => setForm((prev) => ({ ...prev, faviconUrl: e.target.value }))}
                            placeholder="https://"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                        />
                        {form.faviconUrl && (
                            <div className="mt-3">
                                <img src={form.faviconUrl} alt="Favicon preview" className="h-8 w-8 rounded border border-gray-100 object-contain" />
                            </div>
                        )}
                    </div>

                    <div>
                        <FieldLabel
                            label="WhatsApp Number"
                            tooltip="Owner's WhatsApp number (with country code, e.g. +923001234567). Used for customer WhatsApp chat and sharing features."
                        />
                        <input
                            value={form.whatsappNumber}
                            onChange={(e) => setForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                            placeholder="923001234567"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                        />
                    </div>
                </div>
            </form>
            <div className="mt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save Branding"}
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;