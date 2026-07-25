import { useEffect, useState } from "react";
import {
    FiMapPin,
    FiPhone,
    FiMail,
    FiSave,
    FiLoader,
    FiCheckCircle,
    FiAlertCircle,
    FiExternalLink,
} from "react-icons/fi";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import api from "../../api/api";

const socialFields = [
    { key: "instagram", label: "Instagram", icon: FaInstagram, placeholder: "yourhandle" },
    { key: "facebook", label: "Facebook", icon: FaFacebookF, placeholder: "yourpage" },
    { key: "tiktok", label: "TikTok", icon: FaTiktok, placeholder: "yourhandle" },
    { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, placeholder: "923001234567" },
];

const emptyForm = {
    address: "",
    phone: "",
    email: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    whatsapp: "",
};

const AdminContact = () => {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null); // { type: "success" | "error", message }
    const [updatedAt, setUpdatedAt] = useState(null);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await api.get("/contact");
                if (res.data?.success) {
                    const data = res.data.data || {};
                    setForm({
                        address: data.address || "",
                        phone: data.phone || "",
                        email: data.email || "",
                        instagram: data.instagram || "",
                        facebook: data.facebook || "",
                        tiktok: data.tiktok || "",
                        whatsapp: data.whatsapp || "",
                    });
                    setUpdatedAt(data.updatedAt || null);
                }
            } catch (err) {
                setStatus({ type: "error", message: "Failed to load contact information." });
            } finally {
                setLoading(false);
            }
        };
        fetchContact();
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setStatus(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.whatsapp.trim()) {
            setStatus({ type: "error", message: "WhatsApp number is required." });
            return;
        }

        setSaving(true);
        setStatus(null);
        try {
            const res = await api.put("/contact", form);
            if (res.data?.success) {
                setStatus({ type: "success", message: "Contact information updated successfully." });
                setUpdatedAt(res.data.data?.updatedAt || new Date().toISOString());
            }
        } catch (err) {
            setStatus({
                type: "error",
                message: err?.response?.data?.message || "Failed to update contact information.",
            });
        } finally {
            setSaving(false);
        }
    };

    const activeSocialsCount = socialFields.filter(({ key }) => form[key]?.trim()).length;

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <FiLoader className="animate-spin" size={22} />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl">

            {/* Header */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className=" text-2xl font-bold text-[#12131A]">Contact Information</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage the contact details and social links shown across your site.
                    </p>
                </div>
                {updatedAt && (
                    <span className="text-xs text-gray-400">
                        Last updated {new Date(updatedAt).toLocaleString()}
                    </span>
                )}
            </div>

            {/* Status banner */}
            {status && (
                <div
                    className={`mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm ${status.type === "success"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-[#E5484D]/10 text-[#E5484D]"
                        }`}
                >
                    {status.type === "success" ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">

                    {/* Contact details */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h2 className=" text-base font-semibold text-[#12131A]">
                            Contact Details
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">Shown in your site footer and contact page.</p>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Address</label>
                                <div className="relative">
                                    <FiMapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Shop #12, Main Boulevard, Lahore, Pakistan"
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Phone</label>
                                    <div className="relative">
                                        <FiPhone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+92 300 1234567"
                                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Email</label>
                                    <div className="relative">
                                        <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="info@comfortseats.pk"
                                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social media */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h2 className=" text-base font-semibold text-[#12131A]">
                            Social Media
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Enter usernames, numbers, or full URLs - either works.
                        </p>

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {socialFields.map(({ key, label, icon: Icon, placeholder }) => (
                                <div key={key}>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#12131A]">
                                        <Icon size={13} />
                                        {label}
                                        {key === "whatsapp" && <span className="text-[#E5484D]">*</span>}
                                    </label>
                                    <input
                                        name={key}
                                        value={form[key]}
                                        onChange={handleChange}
                                        placeholder={placeholder}
                                        required={key === "whatsapp"}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                {/* Live preview */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
                        <h3 className=" text-sm font-semibold text-[#12131A]">Live Preview</h3>
                        <p className="mt-1 text-xs text-gray-500">How this appears on your site.</p>

                        <div className="mt-5 space-y-3 text-sm">
                            <div className="flex items-start gap-2 text-gray-600">
                                <FiMapPin size={14} className="mt-0.5 shrink-0 text-[#2F6FED]" />
                                {form.address || <span className="text-gray-400">No address set</span>}
                            </div>
                            <div className="flex items-start gap-2 text-gray-600">
                                <FiPhone size={14} className="mt-0.5 shrink-0 text-[#2F6FED]" />
                                {form.phone || <span className="text-gray-400">No phone set</span>}
                            </div>
                            <div className="flex items-start gap-2 text-gray-600">
                                <FiMail size={14} className="mt-0.5 shrink-0 text-[#2F6FED]" />
                                {form.email || <span className="text-gray-400">No email set</span>}
                            </div>
                        </div>

                        <div className="mt-5 border-t border-gray-200 pt-5">
                            <p className="text-xs font-medium text-gray-500">
                                {activeSocialsCount} of {socialFields.length} social links active
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {socialFields.map(({ key, label, icon: Icon }) => {
                                    const active = Boolean(form[key]?.trim());
                                    return (
                                        <span
                                            key={key}
                                            title={label}
                                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${active
                                                    ? "border-transparent bg-[#2F6FED] text-white"
                                                    : "border-gray-200 bg-white text-gray-300"
                                                }`}
                                        >
                                            <Icon size={14} />
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <a
                            href="/contact"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 flex items-center gap-1.5 text-xs font-medium text-[#2F6FED] hover:underline"
                        >
                            View public contact page
                            <FiExternalLink size={12} />
                        </a>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminContact;
