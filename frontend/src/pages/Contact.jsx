import { useEffect, useState } from "react";
import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiClock,
    FiSend,
    FiCheckCircle,
    FiLoader,
} from "react-icons/fi";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import SEO from "../components/SEO";
import api from "../api/api";
import { useToast } from "../components/ToastNotification";
import { useSiteConfig } from "../utils/siteConfig";
import {
    AnimatedSection,
    AnimatedItem,
    PageTransition,
} from "../components/animations";

const socialLinks = [
    { key: "instagram", label: "Instagram", icon: FaInstagram, color: "#E1306C" },
    { key: "facebook", label: "Facebook", icon: FaFacebookF, color: "#1877F2" },
    { key: "tiktok", label: "TikTok", icon: FaTiktok, color: "#000000" },
    { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, color: "#25D366" },
];

const defaultBusinessHours = [
    { label: "Mon - Sat", value: "10:00 AM - 8:00 PM" },
];

// Normalizes whatever's stored in the DB (a raw number, a username, or a full URL) into a clickable link
const resolveSocialUrl = (key, value) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;

    switch (key) {
        case "instagram":
            return `https://instagram.com/${value.replace(/^@/, "")}`;
        case "facebook":
            return `https://facebook.com/${value}`;
        case "tiktok":
            return `https://tiktok.com/@${value.replace(/^@/, "")}`;
        case "whatsapp":
            return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
        default:
            return value;
    }
};

const ContactPage = () => {
    const [contact, setContact] = useState(null);
    const [businessHours, setBusinessHours] = useState(defaultBusinessHours);
    const [loadingContact, setLoadingContact] = useState(true);
    const { siteUrl, siteName } = useSiteConfig();

    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState("");
    const toast = useToast();

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await api.get("/contact");
                if (res.data?.success) setContact(res.data.data);
            } catch (err) {
                // Non-critical - the page still works without live contact info
                console.error("Failed to load contact info:", err);
            } finally {
                setLoadingContact(false);
            }
        };
        const fetchSiteContent = async () => {
            try {
                const res = await api.get("/site-content");
                const hours = res.data?.data?.businessHours;
                if (res.data?.success && Array.isArray(hours) && hours.length > 0) {
                    setBusinessHours(hours);
                }
            } catch (err) {
                console.error("Failed to load business hours:", err);
            }
        };

        fetchContact();
        fetchSiteContent();
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            const msg = "Please fill in your name, email, and message.";
            setFormError(msg);
            toast.error(msg);
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post("/contact/messages", form);
            setSubmitted(true);
            setForm({ name: "", email: "", subject: "", message: "" });
            toast.success(res.data?.message || "Message sent successfully.");
            if (window.fbq) {
                window.fbq("track", "Lead");
            }
        } catch (err) {
            const msg = err?.response?.data?.message || "Something went wrong sending your message. Please try again.";
            setFormError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const activeSocials = socialLinks.filter(({ key }) => contact?.[key]);

    return (
        <PageTransition>
            <div className="transition-colors duration-300" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
                <SEO
                    title={`Contact Us - ${siteName}`}
                    description="Contact Comfort Seats.pk - Lahore furniture manufacturer. Get in touch for office chairs, gaming chairs, sofas, and custom furniture. Call, email, or visit us."
                    canonicalUrl={`${siteUrl}/contact`}
                />

                {/* Hero */}
                <section className="border-b transition-colors duration-300" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <AnimatedSection direction="up" delay={0.1} className="mx-auto max-w-7xl px-5 py-8 text-center lg:px-8">
                        <AnimatedItem>
                            <span
                                style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                className="inline-block border rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wide transition"
                            >
                                Contact Us
                            </span>
                        </AnimatedItem>
                        <AnimatedItem delay={0.1}>
                            <h1 className="mt-5 text-4xl font-bold sm:text-5xl" style={{ color: 'var(--text)' }}>
                                Get in Touch
                            </h1>
                        </AnimatedItem>
                        <AnimatedItem delay={0.2}>
                            <p className="mx-auto mt-4 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                                Have a question about a product, a bulk order, or anything else? We'd love to hear from you.
                            </p>
                        </AnimatedItem>
                    </AnimatedSection>
                </section>

                <div className="mx-auto max-w-full px-8 py-16 lg:px-32">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">

                        {/* Contact info */}
                        <AnimatedSection direction="left" delay={0.1} className="lg:col-span-2">
                            <AnimatedItem>
                                <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                                    Contact Information
                                </h2>
                            </AnimatedItem>
                            <AnimatedItem delay={0.1}>
                                <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>
                                    Reach out directly or find us on social media - we're happy to help.
                                </p>
                            </AnimatedItem>

                            <div className="mt-8 space-y-5">
                                {contact?.address && (
                                    <AnimatedItem delay={0.2}>
                                        <div className="flex items-start gap-4">
                                            <span
                                                style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                            >
                                                <FiMapPin size={18} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Address</p>
                                                <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{contact.address}</p>
                                            </div>
                                        </div>
                                    </AnimatedItem>
                                )}

                                {contact?.phone && (
                                    <AnimatedItem delay={0.25}>
                                        <div className="flex items-start gap-4">
                                            <span
                                                style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                            >
                                                <FiPhone size={18} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Phone</p>
                                                <a href={`tel:${contact.phone}`} className="mt-0.5 block text-sm transition hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                                                    {contact.phone}
                                                </a>
                                            </div>
                                        </div>
                                    </AnimatedItem>
                                )}

                                {contact?.email && (
                                    <AnimatedItem delay={0.3}>
                                        <div className="flex items-start gap-4">
                                            <span
                                                style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                            >
                                                <FiMail size={18} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Email</p>
                                                <a href={`mailto:${contact.email}`} className="mt-0.5 block text-sm transition hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                                                    {contact.email}
                                                </a>
                                            </div>
                                        </div>
                                    </AnimatedItem>
                                )}

                                <AnimatedItem delay={0.35}>
                                    <div className="flex items-start gap-4">
                                        <span
                                            style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                        >
                                            <FiClock size={18} />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Business Hours</p>
                                            <div className="mt-0.5 space-y-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                {businessHours.map((item, index) => (
                                                    <p key={`${item.label}-${index}`}>
                                                        {item.label}
                                                        {item.label && item.value ? ": " : ""}
                                                        {item.value}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </AnimatedItem>

                                {!loadingContact && !contact?.address && !contact?.phone && !contact?.email && (
                                    <AnimatedItem delay={0.2}>
                                        <p className="text-sm opacity-60">Contact details will appear here once added in the admin panel.</p>
                                    </AnimatedItem>
                                )}
                            </div>

                            {/* Social */}
                            <AnimatedItem delay={0.4}>
                                <div className="mt-10 border-t pt-8" style={{ borderColor: 'var(--border)' }}>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Follow Us</p>
                                    {activeSocials.length > 0 ? (
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            {activeSocials.map(({ key, label, icon: Icon, color }, idx) => (
                                                <AnimatedItem key={key} delay={0.05 * idx}>
                                                    <a
                                                        href={resolveSocialUrl(key, contact[key])}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={label}
                                                        title={label}
                                                        onClick={() => {
                                                            if (window.fbq) {
                                                                window.fbq("track", "Contact");
                                                            }
                                                        }}
                                                        className="flex h-11 w-11 items-center justify-center rounded-full border transition hover:-translate-y-0.5 hover:border-transparent hover:text-white"
                                                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = color)}
                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                                    >
                                                        <Icon size={17} />
                                                    </a>
                                                </AnimatedItem>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm opacity-60">
                                            {loadingContact ? "Loading social links..." : "Social links will appear here once added in the admin panel."}
                                        </p>
                                    )}
                                </div>
                            </AnimatedItem>
                        </AnimatedSection>

                        {/* Contact form */}
                        <AnimatedSection direction="right" delay={0.2} className="lg:col-span-3">
                            <div className="rounded-3xl border p-6 sm:p-8 transition-colors duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                                <AnimatedItem>
                                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Send a Message</h2>
                                </AnimatedItem>
                                <AnimatedItem delay={0.1}>
                                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>We typically respond within 1–2 business days.</p>
                                </AnimatedItem>

                                {submitted ? (
                                    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                        <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)', color: 'var(--success)' }}>
                                            <FiCheckCircle size={22} />
                                        </span>
                                        <p className="mt-4 font-semibold" style={{ color: 'var(--text)' }}>Message sent!</p>
                                        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Thanks for reaching out - we'll get back to you soon.</p>
                                        <button
                                            onClick={() => setSubmitted(false)}
                                            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                                            className="mt-6 rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:opacity-80"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                                        <AnimatedItem delay={0.2}>
                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text)' }}>Name</label>
                                                    <input
                                                        name="name"
                                                        value={form.name}
                                                        onChange={handleChange}
                                                        style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                                                        className="block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-[var(--primary)]/10"
                                                        placeholder="Your full name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text)' }}>Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={form.email}
                                                        onChange={handleChange}
                                                        style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                                                        className="block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-[var(--primary)]/10"
                                                        placeholder="you@example.com"
                                                    />
                                                </div>
                                            </div>
                                        </AnimatedItem>

                                        <AnimatedItem delay={0.25}>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text)' }}>Subject</label>
                                                <input
                                                    name="subject"
                                                    value={form.subject}
                                                    onChange={handleChange}
                                                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                                                    className="block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-[var(--primary)]/10"
                                                    placeholder="What's this about?"
                                                />
                                            </div>
                                        </AnimatedItem>

                                        <AnimatedItem delay={0.3}>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text)' }}>Message</label>
                                                <textarea
                                                    name="message"
                                                    value={form.message}
                                                    onChange={handleChange}
                                                    rows={5}
                                                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                                                    className="block w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-[var(--primary)]/10"
                                                    placeholder="Tell us how we can help..."
                                                />
                                            </div>
                                        </AnimatedItem>

                                        {formError && (
                                            <p className="text-sm" style={{ color: 'var(--error)' }}>{formError}</p>
                                        )}

                                        <AnimatedItem delay={0.35}>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                style={{ backgroundColor: 'var(--btn-primary-bg, var(--primary))', color: 'var(--btn-primary-text, #fff)' }}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                            >
                                                {submitting ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
                                                {submitting ? "Sending..." : "Send Message"}
                                            </button>
                                        </AnimatedItem>
                                    </form>
                                )}
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default ContactPage;