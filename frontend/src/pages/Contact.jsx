// import { useEffect, useState } from "react";
// import {
//     FiMail,
//     FiPhone,
//     FiMapPin,
//     FiClock,
//     FiSend,
//     FiCheckCircle,
//     FiLoader,
// } from "react-icons/fi";
// import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
// import { FaTiktok } from "react-icons/fa6";
// import SEO from "../components/SEO";
// import api from "../api/api";
// import { useToast } from "../components/ToastNotification";
// import { useSiteConfig } from "../utils/siteConfig";

// const socialLinks = [
//     { key: "instagram", label: "Instagram", icon: FaInstagram, color: "#E1306C" },
//     { key: "facebook", label: "Facebook", icon: FaFacebookF, color: "#1877F2" },
//     { key: "tiktok", label: "TikTok", icon: FaTiktok, color: "#000000" },
//     { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, color: "#25D366" },
// ];

// const defaultBusinessHours = [
//     { label: "Mon - Sat", value: "10:00 AM - 8:00 PM" },
// ];

// // Normalizes whatever's stored in the DB (a raw number, a username, or a full URL) into a clickable link
// const resolveSocialUrl = (key, value) => {
//     if (!value) return null;
//     if (/^https?:\/\//i.test(value)) return value;

//     switch (key) {
//         case "instagram":
//             return `https://instagram.com/${value.replace(/^@/, "")}`;
//         case "facebook":
//             return `https://facebook.com/${value}`;
//         case "tiktok":
//             return `https://tiktok.com/@${value.replace(/^@/, "")}`;
//         case "whatsapp":
//             return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
//         default:
//             return value;
//     }
// };

// const ContactPage = () => {
//     const [contact, setContact] = useState(null);
//     const [businessHours, setBusinessHours] = useState(defaultBusinessHours);
//     const [loadingContact, setLoadingContact] = useState(true);
//     const { siteUrl, siteName } = useSiteConfig();

//     const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
//     const [submitting, setSubmitting] = useState(false);
//     const [submitted, setSubmitted] = useState(false);
//     const [formError, setFormError] = useState("");
//     const toast = useToast();

//     useEffect(() => {
//         const fetchContact = async () => {
//             try {
//                 const res = await api.get("/contact");
//                 if (res.data?.success) setContact(res.data.data);
//             } catch (err) {
//                 // Non-critical - the page still works without live contact info
//                 console.error("Failed to load contact info:", err);
//             } finally {
//                 setLoadingContact(false);
//             }
//         };
//         const fetchSiteContent = async () => {
//             try {
//                 const res = await api.get("/site-content");
//                 const hours = res.data?.data?.businessHours;
//                 if (res.data?.success && Array.isArray(hours) && hours.length > 0) {
//                     setBusinessHours(hours);
//                 }
//             } catch (err) {
//                 console.error("Failed to load business hours:", err);
//             }
//         };

//         fetchContact();
//         fetchSiteContent();
//     }, []);

//     const handleChange = (e) => {
//         setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setFormError("");

//         if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
//             const msg = "Please fill in your name, email, and message.";
//             setFormError(msg);
//             toast.error(msg);
//             return;
//         }

//         setSubmitting(true);
//         try {
//             // NOTE: this endpoint doesn't exist yet - wire it up to a real
//             // "contact messages" route (email/DB) before going live.
//             await api.post("/contact/message", form);
//             setSubmitted(true);
//             setForm({ name: "", email: "", subject: "", message: "" });
//             toast.success("Message sent successfully.");
//         } catch (err) {
//             const msg = "Something went wrong sending your message. Please try again.";
//             setFormError(msg);
//             toast.error(msg);
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const activeSocials = socialLinks.filter(({ key }) => contact?.[key]);

//     return (
//         <div className="bg-white">
//                 <SEO
//                     title={`Contact Us - ${siteName}`}
//                     description="Contact Comfort Seats.pk - Lahore furniture manufacturer. Get in touch for office chairs, gaming chairs, sofas, and custom furniture. Call, email, or visit us."
//                     canonicalUrl={`${siteUrl}/contact`}
//                 />

//             {/* Hero */}
//             <section className="border-b border-gray-100 bg-gray-50/60">
//                 <div className="mx-auto max-w-7xl px-5 py-8 text-center lg:px-8">
//                     <span className="inline-block border-2 border-blue-400 rounded-full bg-[#2F6FED]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2F6FED] hover:bg-[#2F6FED]/20 transition">
//                         Contact Us
//                     </span>
//                     <h1 className="mt-5  text-4xl font-bold text-[#12131A] sm:text-5xl">
//                         Get in Touch
//                     </h1>
//                     <p className="mx-auto mt-4 max-w-xl text-gray-500">
//                         Have a question about a product, a bulk order, or anything else? We'd love to hear from you.
//                     </p>
//                 </div>
//             </section>

//             <div className="mx-auto max-w-7xl px-8 py-16 lg:px-8">
//                 <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">

//                     {/* Contact info */}
//                     <div className="lg:col-span-2">
//                         <h2 className=" text-2xl font-bold text-[#12131A]">
//                             Contact Information
//                         </h2>
//                         <p className="mt-3 text-gray-500">
//                             Reach out directly or find us on social media - we're happy to help.
//                         </p>

//                         <div className="mt-8 space-y-5">
//                             {contact?.address && (
//                                 <div className="flex items-start gap-4">
//                                     <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
//                                         <FiMapPin size={18} />
//                                     </span>
//                                     <div>
//                                         <p className="text-sm font-semibold text-[#12131A]">Address</p>
//                                         <p className="mt-0.5 text-sm text-gray-500">{contact.address}</p>
//                                     </div>
//                                 </div>
//                             )}

//                             {contact?.phone && (
//                                 <div className="flex items-start gap-4">
//                                     <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
//                                         <FiPhone size={18} />
//                                     </span>
//                                     <div>
//                                         <p className="text-sm font-semibold text-[#12131A]">Phone</p>
//                                         <a href={`tel:${contact.phone}`} className="mt-0.5 block text-sm text-gray-500 hover:text-[#2F6FED]">
//                                             {contact.phone}
//                                         </a>
//                                     </div>
//                                 </div>
//                             )}

//                             {contact?.email && (
//                                 <div className="flex items-start gap-4">
//                                     <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
//                                         <FiMail size={18} />
//                                     </span>
//                                     <div>
//                                         <p className="text-sm font-semibold text-[#12131A]">Email</p>
//                                         <a href={`mailto:${contact.email}`} className="mt-0.5 block text-sm text-gray-500 hover:text-[#2F6FED]">
//                                             {contact.email}
//                                         </a>
//                                     </div>
//                                 </div>
//                             )}

//                             <div className="flex items-start gap-4">
//                                 <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
//                                     <FiClock size={18} />
//                                 </span>
//                                 <div>
//                                     <p className="text-sm font-semibold text-[#12131A]">Business Hours</p>
//                                     <div className="mt-0.5 space-y-0.5 text-sm text-gray-500">
//                                         {businessHours.map((item, index) => (
//                                             <p key={`${item.label}-${index}`}>
//                                                 {item.label}
//                                                 {item.label && item.value ? ": " : ""}
//                                                 {item.value}
//                                             </p>
//                                         ))}
//                                     </div>
//                                 </div>
//                             </div>

//                             {!loadingContact && !contact?.address && !contact?.phone && !contact?.email && (
//                                 <p className="text-sm text-gray-400">Contact details will appear here once added in the admin panel.</p>
//                             )}
//                         </div>

//                         {/* Social */}
//                         <div className="mt-10 border-t border-gray-100 pt-8">
//                             <p className="text-sm font-semibold text-[#12131A]">Follow Us</p>
//                             {activeSocials.length > 0 ? (
//                                 <div className="mt-4 flex flex-wrap gap-3">
//                                     {activeSocials.map(({ key, label, icon: Icon, color }) => (
//                                         <a
//                                             key={key}
//                                             href={resolveSocialUrl(key, contact[key])}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             aria-label={label}
//                                             title={label}
//                                             className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:-translate-y-0.5 hover:border-transparent hover:text-white"
//                                             style={{ "--hover-bg": color }}
//                                             onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = color)}
//                                             onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
//                                         >
//                                             <Icon size={17} />
//                                         </a>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <p className="mt-3 text-sm text-gray-400">
//                                     {loadingContact ? "Loading social links..." : "Social links will appear here once added in the admin panel."}
//                                 </p>
//                             )}
//                         </div>
//                     </div>

//                     {/* Contact form */}
//                     <div className="lg:col-span-3">
//                         <div className="rounded-3xl border border-gray-100 bg-gray-50/60 p-6 sm:p-8">
//                             <h2 className=" text-2xl font-bold text-[#12131A]">Send a Message</h2>
//                             <p className="mt-2 text-sm text-gray-500">We typically respond within 1–2 business days.</p>

//                             {submitted ? (
//                                 <div className="mt-8 flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-14 text-center">
//                                     <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
//                                         <FiCheckCircle size={22} />
//                                     </span>
//                                     <p className="mt-4 font-semibold text-[#12131A]">Message sent!</p>
//                                     <p className="mt-1 text-sm text-gray-500">Thanks for reaching out - we'll get back to you soon.</p>
//                                     <button
//                                         onClick={() => setSubmitted(false)}
//                                         className="mt-6 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#12131A] transition hover:border-gray-300"
//                                     >
//                                         Send another message
//                                     </button>
//                                 </div>
//                             ) : (
//                                 <form onSubmit={handleSubmit} className="mt-6 space-y-5">
//                                     <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
//                                         <div>
//                                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Name</label>
//                                             <input
//                                                 name="name"
//                                                 value={form.name}
//                                                 onChange={handleChange}
//                                                 className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
//                                                 placeholder="Your full name"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Email</label>
//                                             <input
//                                                 type="email"
//                                                 name="email"
//                                                 value={form.email}
//                                                 onChange={handleChange}
//                                                 className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
//                                                 placeholder="you@example.com"
//                                             />
//                                         </div>
//                                     </div>

//                                     <div>
//                                         <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Subject</label>
//                                         <input
//                                             name="subject"
//                                             value={form.subject}
//                                             onChange={handleChange}
//                                             className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
//                                             placeholder="What's this about?"
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Message</label>
//                                         <textarea
//                                             name="message"
//                                             value={form.message}
//                                             onChange={handleChange}
//                                             rows={5}
//                                             className="block w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
//                                             placeholder="Tell us how we can help..."
//                                         />
//                                     </div>

//                                     {formError && (
//                                         <p className="text-sm text-[#E5484D]">{formError}</p>
//                                     )}

//                                     <button
//                                         type="submit"
//                                         disabled={submitting}
//                                         className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
//                                     >
//                                         {submitting ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
//                                         {submitting ? "Sending..." : "Send Message"}
//                                     </button>
//                                 </form>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ContactPage;

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
            // NOTE: this endpoint doesn't exist yet - wire it up to a real
            // "contact messages" route (email/DB) before going live.
            await api.post("/contact/message", form);
            setSubmitted(true);
            setForm({ name: "", email: "", subject: "", message: "" });
            toast.success("Message sent successfully.");
        } catch (err) {
            const msg = "Something went wrong sending your message. Please try again.";
            setFormError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const activeSocials = socialLinks.filter(({ key }) => contact?.[key]);

    return (
        <PageTransition>
            <div className="bg-white">
                <SEO
                    title={`Contact Us - ${siteName}`}
                    description="Contact Comfort Seats.pk - Lahore furniture manufacturer. Get in touch for office chairs, gaming chairs, sofas, and custom furniture. Call, email, or visit us."
                    canonicalUrl={`${siteUrl}/contact`}
                />

                {/* Hero */}
                <section className="border-b border-gray-100 bg-gray-50/60">
                    <AnimatedSection direction="up" delay={0.1} className="mx-auto max-w-7xl px-5 py-8 text-center lg:px-8">
                        <AnimatedItem>
                            <span className="inline-block border-2 border-blue-400 rounded-full bg-[#2F6FED]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2F6FED] hover:bg-[#2F6FED]/20 transition">
                                Contact Us
                            </span>
                        </AnimatedItem>
                        <AnimatedItem delay={0.1}>
                            <h1 className="mt-5  text-4xl font-bold text-[#12131A] sm:text-5xl">
                                Get in Touch
                            </h1>
                        </AnimatedItem>
                        <AnimatedItem delay={0.2}>
                            <p className="mx-auto mt-4 max-w-2xl text-gray-500">
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
                                <h2 className=" text-2xl font-bold text-[#12131A]">
                                    Contact Information
                                </h2>
                            </AnimatedItem>
                            <AnimatedItem delay={0.1}>
                                <p className="mt-3 text-gray-500">
                                    Reach out directly or find us on social media - we're happy to help.
                                </p>
                            </AnimatedItem>

                            <div className="mt-8 space-y-5">
                                {contact?.address && (
                                    <AnimatedItem delay={0.2}>
                                        <div className="flex items-start gap-4">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
                                                <FiMapPin size={18} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-[#12131A]">Address</p>
                                                <p className="mt-0.5 text-sm text-gray-500">{contact.address}</p>
                                            </div>
                                        </div>
                                    </AnimatedItem>
                                )}

                                {contact?.phone && (
                                    <AnimatedItem delay={0.25}>
                                        <div className="flex items-start gap-4">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
                                                <FiPhone size={18} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-[#12131A]">Phone</p>
                                                <a href={`tel:${contact.phone}`} className="mt-0.5 block text-sm text-gray-500 hover:text-[#2F6FED]">
                                                    {contact.phone}
                                                </a>
                                            </div>
                                        </div>
                                    </AnimatedItem>
                                )}

                                {contact?.email && (
                                    <AnimatedItem delay={0.3}>
                                        <div className="flex items-start gap-4">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
                                                <FiMail size={18} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-[#12131A]">Email</p>
                                                <a href={`mailto:${contact.email}`} className="mt-0.5 block text-sm text-gray-500 hover:text-[#2F6FED]">
                                                    {contact.email}
                                                </a>
                                            </div>
                                        </div>
                                    </AnimatedItem>
                                )}

                                <AnimatedItem delay={0.35}>
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
                                            <FiClock size={18} />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-[#12131A]">Business Hours</p>
                                            <div className="mt-0.5 space-y-0.5 text-sm text-gray-500">
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
                                        <p className="text-sm text-gray-400">Contact details will appear here once added in the admin panel.</p>
                                    </AnimatedItem>
                                )}
                            </div>

                            {/* Social */}
                            <AnimatedItem delay={0.4}>
                                <div className="mt-10 border-t border-gray-100 pt-8">
                                    <p className="text-sm font-semibold text-[#12131A]">Follow Us</p>
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
                                                        className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:-translate-y-0.5 hover:border-transparent hover:text-white"
                                                        style={{ "--hover-bg": color }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = color)}
                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                                    >
                                                        <Icon size={17} />
                                                    </a>
                                                </AnimatedItem>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm text-gray-400">
                                            {loadingContact ? "Loading social links..." : "Social links will appear here once added in the admin panel."}
                                        </p>
                                    )}
                                </div>
                            </AnimatedItem>
                        </AnimatedSection>

                        {/* Contact form */}
                        <AnimatedSection direction="right" delay={0.2} className="lg:col-span-3">
                            <div className="rounded-3xl border border-gray-100 bg-gray-50/60 p-6 sm:p-8">
                                <AnimatedItem>
                                    <h2 className=" text-2xl font-bold text-[#12131A]">Send a Message</h2>
                                </AnimatedItem>
                                <AnimatedItem delay={0.1}>
                                    <p className="mt-2 text-sm text-gray-500">We typically respond within 1–2 business days.</p>
                                </AnimatedItem>

                                {submitted ? (
                                    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-14 text-center">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
                                            <FiCheckCircle size={22} />
                                        </span>
                                        <p className="mt-4 font-semibold text-[#12131A]">Message sent!</p>
                                        <p className="mt-1 text-sm text-gray-500">Thanks for reaching out - we'll get back to you soon.</p>
                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="mt-6 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#12131A] transition hover:border-gray-300"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                                        <AnimatedItem delay={0.2}>
                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Name</label>
                                                    <input
                                                        name="name"
                                                        value={form.name}
                                                        onChange={handleChange}
                                                        className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                                                        placeholder="Your full name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={form.email}
                                                        onChange={handleChange}
                                                        className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                                                        placeholder="you@example.com"
                                                    />
                                                </div>
                                            </div>
                                        </AnimatedItem>

                                        <AnimatedItem delay={0.25}>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Subject</label>
                                                <input
                                                    name="subject"
                                                    value={form.subject}
                                                    onChange={handleChange}
                                                    className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                                                    placeholder="What's this about?"
                                                />
                                            </div>
                                        </AnimatedItem>

                                        <AnimatedItem delay={0.3}>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-[#12131A]">Message</label>
                                                <textarea
                                                    name="message"
                                                    value={form.message}
                                                    onChange={handleChange}
                                                    rows={5}
                                                    className="block w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
                                                    placeholder="Tell us how we can help..."
                                                />
                                            </div>
                                        </AnimatedItem>

                                        {formError && (
                                            <p className="text-sm text-[#E5484D]">{formError}</p>
                                        )}

                                        <AnimatedItem delay={0.35}>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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