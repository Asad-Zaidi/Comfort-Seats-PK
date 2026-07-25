import { useState, useEffect } from "react";
import { FiCheckCircle, FiSend, FiLoader } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import api from "../api/api";
import { useToast } from "../components/ToastNotification";
import { useSiteConfig } from "../utils/siteConfig";
import Footer from "../components/Footer";

const initialForm = {
    fullName: "",
    phone: "",
    email: "",
    requirements: "",
};

const Customize = () => {
    const { siteName, siteUrl } = useSiteConfig();
    const toast = useToast();

    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const contactRes = await api.get("/contact");
                if (contactRes.data?.success && contactRes.data.data?.whatsapp) {
                    setWhatsappNumber(contactRes.data.data.whatsapp);
                }
            } catch (err) {
                console.error("Failed to load contact info:", err);
            }
        };
        fetchContact();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const buildWhatsAppMessage = () => {
        const lines = [
            "Hello Comfort Seats! I'd like a custom furniture quote.",
            "",
            "*My Details*",
            `• Name: ${form.fullName || ""}`,
            `• Phone: ${form.phone || ""}`,
            form.email ? `• Email: ${form.email}` : "",
            "",
            "*My Requirements*",
            `${form.requirements || "Not specified"}`,
        ];
        return lines.filter(Boolean).join("\n");
    };

    const handleWhatsAppClick = () => {
        if (!form.fullName.trim() || !form.phone.trim()) {
            const msg = "Please fill in your name and phone number first.";
            setFormError(msg);
            toast.error(msg);
            return;
        }
        if (!whatsappNumber) {
            toast.error("WhatsApp number not configured. Please submit the form instead.");
            return;
        }
        window.open(
            `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}?text=${encodeURIComponent(buildWhatsAppMessage())}`,
            "_blank"
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        if (!form.fullName.trim() || !form.phone.trim()) {
            const msg = "Name and phone number are required.";
            setFormError(msg);
            toast.error(msg);
            return;
        }
        setSubmitting(true);
        try {
            await api.post("/customizations", {
                customer: {
                    fullName: form.fullName,
                    phone: form.phone,
                    email: form.email,
                },
                notes: form.requirements,
            });
            setSubmitted(true);
            toast.success("Request submitted! We'll contact you soon.");
        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong.";
            setFormError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-gray-50/50 min-h-screen">
                <div className="max-w-lg mx-auto px-5 py-24 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto">
                        <FiCheckCircle size={32} />
                    </span>
                    <h2 className="mt-6 text-2xl font-bold text-[#12131A]">Request Submitted!</h2>
                    <p className="mt-2 text-gray-500">
                        We've received your customization request and will contact you shortly.
                    </p>
                    <button
                        onClick={() => { setForm(initialForm); setSubmitted(false); setFormError(""); }}
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2F6FED]/90"
                    >
                        <FiLoader size={16} /> Submit Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50/50">
            <SEO
                title={`Customize Your Furniture - ${siteName}`}
                description="Get your furniture customized to your exact preferences at Comfort Seats.pk. Tell us your requirements and we'll craft it for you."
                canonicalUrl={`${siteUrl}/customization`}
            />

            <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
                    <Link to="/" className="hover:text-[#2F6FED] transition">Home</Link>
                    <span>/</span>
                    <span className="text-[#12131A] font-medium">Customize</span>
                </nav>

                {/* Header */}
                <div className="mb-4">
                    <span className="inline-block rounded-full bg-[#2F6FED]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#2F6FED]">
                        Custom Orders
                    </span>
                    <h1 className="mt-4 text-3xl font-bold text-[#12131A] sm:text-4xl">
                        Get It <span className="text-[#2F6FED]">Customized</span>
                    </h1>
                </div>

                {/* Description paragraph */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8">
                    <p className="leading-7 text-gray-600">
                        Don't see exactly what you're looking for? No problem. We customize our products to match
                        your <strong>preferred color</strong>, <strong>stand type</strong>, <strong>fabric</strong>, and
                        any other requirements you have. Just tell us what you need below — we'll craft it for you
                        with the same quality and care we put into every piece.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                            <FiCheckCircle className="text-[#10B981]" size={14} /> Color options
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <FiCheckCircle className="text-[#10B981]" size={14} /> Stand type
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <FiCheckCircle className="text-[#10B981]" size={14} /> Fabric selection
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <FiCheckCircle className="text-[#10B981]" size={14} /> Size & dimensions
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Details */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-bold text-[#12131A]">Your Details</h2>
                        <p className="text-sm text-gray-400">We'll reach out to you with a quote based on your requirements.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-[#12131A]">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[#12131A]">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#12131A]">
                                    Email Address <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-bold text-[#12131A]">Your Requirements</h2>
                        <p className="text-sm text-gray-400">
                            Tell us what you need — color, stand type, fabric, dimensions, or anything else.
                        </p>
                        <textarea
                            name="requirements"
                            value={form.requirements}
                            onChange={handleChange}
                            rows={5}
                            placeholder="e.g. I need a black office chair with chrome base, blue fabric upholstery, adjustable armrests, and medium back support..."
                            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                        />
                    </div>

                    {formError && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {formError}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 disabled:opacity-60"
                        >
                            {submitting ? (
                                <FiLoader className="animate-spin" size={16} />
                            ) : (
                                <FiSend size={16} />
                            )}
                            {submitting ? "Submitting..." : "Submit Request"}
                        </button>
                        <button
                            type="button"
                            onClick={handleWhatsAppClick}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                        >
                            <FaWhatsapp size={18} />
                            Send via WhatsApp
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                        By submitting, you agree to be contacted regarding your customization request.
                    </p>
                </form>

            </div>
            <Footer />
        </div>
    );
};

export default Customize;