import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiMapPin, FiMail, FiArrowUpRight } from "react-icons/fi";
import { FaTiktok, FaFacebook, FaWhatsapp, FaInstagram, FaPhone } from "react-icons/fa6";
import api from "../api/api";
import { useSiteConfig } from "../utils/siteConfig";
import { sanitizeHtml, isHtmlContent } from "../utils/sanitizeHtml";

const socialLinks = [
    { key: "instagram", label: "Instagram", icon: FaInstagram, color: "#E1306C" },
    { key: "facebook", label: "Facebook", icon: FaFacebook, color: "#1877F2" },
    { key: "tiktok", label: "TikTok", icon: FaTiktok, color: "#FE2C55" },
    { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, color: "#25D366" },
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

const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: "About Us", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Customize", to: "/customization" },
    { label: "Blog", to: "/blog" },
];

const policyLinks = [
    { label: "Privacy Policy", to: "/policy" },
    { label: "Return Policy", to: "/policy" },
    { label: "Warranty Policy", to: "/policy" },
];


const Footer = () => {
    const [contact, setContact] = useState(null);
    const [aboutDescription, setAboutDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const { siteName, siteUrl } = useSiteConfig();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contactRes, siteRes] = await Promise.all([
                    api.get("/contact"),
                    api.get("/site-content")
                ]);
                if (contactRes.data?.success) setContact(contactRes.data.data);
                if (siteRes.data?.success) {
                    if (siteRes.data.data?.aboutUs?.heroDescription) {
                        setAboutDescription(siteRes.data.data.aboutUs.heroDescription);
                    }
                    if (Array.isArray(siteRes.data.data?.categories)) {
                        setCategories(siteRes.data.data.categories.filter(cat => cat.name));
                    }
                }
            } catch (err) {
                console.error("Failed to load footer data:", err);
            }
        };
        fetchData();
    }, []);

    const activeSocials = socialLinks.filter(({ key }) => contact?.[key]);
    const year = new Date().getFullYear();
    const brandName = siteName || "Comfort Seats";


    return (
        <footer
            className="transition-colors duration-300"
            style={{
                backgroundColor: 'var(--footer-bg, #12131A)',
                color: 'var(--footer-link, #9ca3af)',
            }}
        >
            <div className="mx-auto max-w-full px-8 py-12 lg:px-32">
                <div className="grid grid-cols-2 gap-y-10 gap-x-6 lg:grid-cols-[2.5fr_1fr_1fr_1fr_2fr]">
                    {/* Brand */}
                    <div className="col-span-2 order-1 lg:order-1 lg:col-span-1">
                        <Link to={siteUrl || "/"} className="inline-block">
                            <h3
                                className="text-xl font-bold transition-colors hover:opacity-80"
                                style={{ color: 'var(--footer-text, #ffffff)' }}
                            >
                                {brandName}
                            </h3>
                        </Link>

                        {(() => {
                            const descToRender = aboutDescription || "Formerly known as <b>Saqib Poshish House</b>, <i>Comfort Seats PK</i> is a trusted furniture manufacturer built on years of craftsmanship, reliability, and customer satisfaction - based in <b>Lahore, Pakistan</b>.";
                            return isHtmlContent(descToRender) ? (
                                <div
                                    className="mt-4 max-w-sm text-sm leading-6 [&_b]:font-semibold [&_b]:text-white [&_i]:italic [&_strong]:text-white"
                                    style={{ color: 'var(--footer-link, #9ca3af)' }}
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(descToRender) }}
                                />
                            ) : (
                                <p className="mt-4 max-w-sm text-sm leading-6 whitespace-pre-line" style={{ color: 'var(--footer-link, #9ca3af)' }}>
                                    {descToRender}
                                </p>
                            );
                        })()}

                        {activeSocials.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {activeSocials.map(({ key, label, icon: Icon, color }) => (
                                    <a
                                        key={key}
                                        href={resolveSocialUrl(key, contact[key])}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        title={label}
                                        style={{
                                            borderColor: 'var(--footer-border, #374151)',
                                            color: color || 'var(--footer-link, #9ca3af)',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (color) {
                                                e.currentTarget.style.backgroundColor = color;
                                                e.currentTarget.style.borderColor = color;
                                                e.currentTarget.style.color = '#ffffff';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (color) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.borderColor = 'var(--footer-border, #374151)';
                                                e.currentTarget.style.color = color;
                                            }
                                        }}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 shadow-sm"
                                    >
                                        <Icon size={20} />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="order-2 lg:order-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--footer-text, #ffffff)' }}>
                            Quick Links
                        </h4>
                        <ul className="mt-5 space-y-3">
                            {quickLinks.map(({ label, to }) => (
                                <li key={to}>
                                    <Link
                                        to={to}
                                        style={{ color: 'var(--footer-link, #9ca3af)' }}
                                        className="group inline-flex items-center gap-1.5 text-sm transition hover:opacity-80"
                                    >
                                        {label}
                                        <FiArrowUpRight
                                            size={13}
                                            className="opacity-0 transition group-hover:opacity-100"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="order-3 lg:order-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--footer-text, #ffffff)' }}>
                            Categories
                        </h4>
                        <ul className="mt-5 space-y-3">
                            {categories.length > 0 ? (
                                categories.map((cat) => {
                                    const catName = cat.name || cat;
                                    return (
                                        <li key={catName}>
                                            <Link
                                                to={`/products?category=${encodeURIComponent(catName)}`}
                                                style={{ color: 'var(--footer-link, #9ca3af)' }}
                                                className="group inline-flex items-center gap-1.5 text-sm transition hover:opacity-80"
                                            >
                                                {catName}
                                                <FiArrowUpRight
                                                    size={13}
                                                    className="opacity-0 transition group-hover:opacity-100"
                                                />
                                            </Link>
                                        </li>
                                    );
                                })
                            ) : (
                                <li className="text-sm opacity-60">No categories available</li>
                            )}
                        </ul>
                    </div>

                    {/* Policies */}
                    <div className="col-span-2 order-4 lg:order-3 lg:col-span-1">
                        <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--footer-text, #ffffff)' }}>
                            Policies
                        </h4>
                        <ul className="mt-5 space-y-3">
                            {policyLinks.map(({ label, to }) => (
                                <li key={label}>
                                    <Link
                                        to={to}
                                        style={{ color: 'var(--footer-link, #9ca3af)' }}
                                        className="group inline-flex items-center gap-1.5 text-sm transition hover:opacity-80"
                                    >
                                        {label}
                                        <FiArrowUpRight
                                            size={13}
                                            className="opacity-0 transition group-hover:opacity-100"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-2 order-5 lg:order-5 lg:col-span-1">
                        <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--footer-text, #ffffff)' }}>
                            Get in Touch
                        </h4>
                        <ul className="mt-5 space-y-4">
                            {contact?.address && (
                                <li className="flex items-start gap-2.5 text-sm">
                                    <FiMapPin size={15} className="mt-0.5 shrink-0 text-red-700" />
                                    <span>{contact.address}</span>
                                </li>
                            )}
                            {contact?.phone && (
                                <li className="flex items-start gap-2.5 text-sm">
                                    <FaPhone size={15} className="mt-0.5 shrink-0 text-blue-700" />
                                    <a href={`tel:${contact.phone}`} className="transition hover:opacity-80">
                                        {contact.phone}
                                    </a>
                                </li>
                            )}
                            {contact?.email && (
                                <li className="flex items-start gap-2.5 text-sm">
                                    <FiMail size={15} className="mt-0.5 shrink-0 text-green-700" />
                                    <a href={`mailto:${contact.email}`} className="break-all transition hover:opacity-80">
                                        {contact.email}
                                    </a>
                                </li>
                            )}
                            {!contact?.address && !contact?.phone && !contact?.email && (
                                <li className="text-sm opacity-60">Lahore, Pakistan</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t" style={{ borderColor: 'var(--footer-border, #374151)' }}>
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-3 text-xs opacity-70 sm:flex-row lg:px-8">
                    <p>&copy; {year} {brandName}. All rights reserved.</p>
                    <p>Powered By: <a href="https://github.com/Asad-Zaidi" target="_blank" rel="noopener noreferrer" className="transition hover:opacity-100">Asad Zaidi</a></p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;