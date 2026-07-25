import { useEffect, useState } from "react";
import { useToast } from "../../components/ToastNotification";
import api from "../../api/api";
import { FiVolume2, FiEye } from "react-icons/fi";

const AdminAnnouncement = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [announcement, setAnnouncement] = useState({
        enabled: false,
        text: "",
        backgroundColor: "#1e3a5f",
        textColor: "#ffffff",
        link: "",
        linkText: "Shop Now",
        fontSize: "14",
        showCloseButton: true,
        speed: 10,
        paddingY: 8,
    });

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get("/announcement");
                if (res.data?.success && res.data.data) {
                    const a = res.data.data;
                    setAnnouncement({
                        enabled: a.enabled ?? false,
                        text: a.text || "",
                        backgroundColor: a.backgroundColor || "#1e3a5f",
                        textColor: a.textColor || "#ffffff",
                        link: a.link || "",
                        linkText: a.linkText || "Shop Now",
                        fontSize: a.fontSize || "14",
                        showCloseButton: a.showCloseButton ?? true,
                        speed: a.speed ?? 10,
                        paddingY: a.paddingY ?? 8,
                    });
                }
            } catch (err) {
                toast.error("Failed to load announcement settings.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [toast]);

    const handleChange = (field, value) => {
        setAnnouncement((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put("/announcement", announcement);
            if (!res.data?.success) {
                throw new Error(res.data?.message || "Failed to update announcement.");
            }
            toast.success("Announcement updated successfully.");
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async () => {
        const newEnabledState = !announcement.enabled;
        // Optimistically update the UI for a faster user experience
        setAnnouncement((prev) => ({ ...prev, enabled: newEnabledState }));

        try {
            // Send only the 'enabled' field to the backend
            const res = await api.patch("/announcement", { enabled: newEnabledState });
            if (!res.data?.success) {
                // If the API call fails, revert the UI change and show an error
                setAnnouncement((prev) => ({ ...prev, enabled: !newEnabledState }));
                toast.error(res.data?.message || "Failed to toggle announcement.");
            } else {
                toast.success(res.data.message || `Announcement ${newEnabledState ? "enabled" : "disabled"}.`);
            }
        } catch (err) {
            // Revert the UI change on a network or server error
            setAnnouncement((prev) => ({ ...prev, enabled: !newEnabledState }));
            toast.error(err?.response?.data?.message || err.message || "Failed to toggle announcement.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Announcement Bar</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Configure the announcement bar that appears at the top of your storefront. Fully customizable with text, colors, links, and more.
                </p>
            </div>

            {/* Live Preview */}
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <FiEye className="text-gray-500" />
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Live Preview</h2>
                </div>
                {announcement.enabled ? (
                    <div
                        className="relative w-full px-4 overflow-hidden rounded-lg"
                        style={{
                            backgroundColor: announcement.backgroundColor || "#1e3a5f",
                            color: announcement.textColor || "#ffffff",
                            fontSize: `${announcement.fontSize || 14}px`,
                            paddingTop: `${announcement.paddingY || 8}px`,
                            paddingBottom: `${announcement.paddingY || 8}px`,
                        }}
                    >
                        <div className="overflow-hidden whitespace-nowrap">
                            <div
                                className="inline-block"
                                style={{ animation: `marquee ${announcement.speed || 10}s linear infinite` }}
                            >
                                <span className="font-medium mx-4">{announcement.text || "Your announcement text here"}</span>
                                {announcement.link && (
                                    <span
                                        className="mx-4 underline font-semibold"
                                        style={{ color: announcement.textColor || "#ffffff" }}
                                    >
                                        {announcement.linkText || "Shop Now"}
                                    </span>
                                )}
                            </div>
                        </div>
                        {announcement.showCloseButton && (
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                                style={{ color: announcement.textColor || "#ffffff" }}
                                disabled
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="py-4 px-4 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <FiVolume2 className="inline-block mr-2" />
                        Announcement is currently <strong>disabled</strong>. Toggle it on to see the preview.
                    </div>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* On/Off Toggle */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-800">Enable Announcement Bar</h3>
                            <p className="text-sm text-gray-500">Turn the announcement bar on or off for all visitors.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleToggle}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none ${announcement.enabled ? "bg-green-500" : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${announcement.enabled ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Content Settings */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Content</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Text</label>
                            <input
                                value={announcement.text}
                                onChange={(e) => handleChange("text", e.target.value)}
                                placeholder="Free shipping on orders over Rs. 10,000!"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (optional)</label>
                            <input
                                value={announcement.link}
                                onChange={(e) => handleChange("link", e.target.value)}
                                placeholder="/products"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                            <input
                                value={announcement.linkText}
                                onChange={(e) => handleChange("linkText", e.target.value)}
                                placeholder="Shop Now"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                        </div>
                    </div>
                </div>

                {/* Styling */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Styling</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={announcement.backgroundColor}
                                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                                    className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer bg-transparent"
                                />
                                <input
                                    value={announcement.backgroundColor}
                                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                                    placeholder="#1e3a5f"
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={announcement.textColor}
                                    onChange={(e) => handleChange("textColor", e.target.value)}
                                    className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer bg-transparent"
                                />
                                <input
                                    value={announcement.textColor}
                                    onChange={(e) => handleChange("textColor", e.target.value)}
                                    placeholder="#ffffff"
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (px)</label>
                            <input
                                type="number"
                                min="10"
                                max="24"
                                value={announcement.fontSize}
                                onChange={(e) => handleChange("fontSize", e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                            />
                        </div>
                    </div>
                    {/* Bar Height */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Bar Height</label>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 whitespace-nowrap">Short</span>
                            <input
                                type="range"
                                min="4"
                                max="40"
                                value={announcement.paddingY}
                                onChange={(e) => handleChange("paddingY", Number(e.target.value))}
                                className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="text-sm text-gray-500 whitespace-nowrap">Tall</span>
                            <span className="text-sm font-semibold text-gray-800 min-w-[3rem]">{announcement.paddingY}px</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-400">Controls vertical padding (top & bottom) of the announcement bar.</p>
                    </div>
                </div>

                {/* Speed Control */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Scroll Speed</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 whitespace-nowrap">Slow</span>
                        <input
                            type="range"
                            min="3"
                            max="30"
                            value={announcement.speed}
                            onChange={(e) => handleChange("speed", Number(e.target.value))}
                            className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">Fast</span>
                        <span className="text-sm font-semibold text-gray-800 min-w-[3rem]">{announcement.speed}s</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">Lower value = faster scrolling. Adjust to your preferred speed.</p>
                </div>

                {/* Options */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Options</h3>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="showCloseButton"
                            checked={announcement.showCloseButton}
                            onChange={(e) => handleChange("showCloseButton", e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="showCloseButton" className="text-sm text-gray-700">
                            Show close (X) button - visitors can dismiss the announcement bar
                        </label>
                    </div>
                </div>

                {/* Save */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save Announcement"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAnnouncement;