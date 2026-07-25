import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiMapPin, FiPhone, FiMail, FiArrowUpRight } from "react-icons/fi";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import api from "../api/api";
import { useSiteConfig } from "../utils/siteConfig";

const socialLinks = [
    { key: "instagram", label: "Instagram", icon: FaInstagram },
    { key: "facebook", label: "Facebook", icon: FaFacebookF },
    { key: "tiktok", label: "TikTok", icon: FaTiktok },
    { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp },
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
        <footer className="bg-[#0F1320] text-gray-400">
            <div className="mx-auto max-w-full px-8 py-12 lg:px-32">
                <div className="grid grid-cols-2 gap-y-10 gap-x-6 lg:grid-cols-[2.5fr_1fr_1fr_1fr_2fr]">
                    {/* Brand - mobile: full width row 1 | desktop: col 1 */}
                    <div className="col-span-2 order-1 lg:order-1 lg:col-span-1">
                        <Link to={siteUrl || "/"} className="inline-block">
                            <h3 className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
                                {brandName}
                            </h3>
                        </Link>

                        <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
                            {aboutDescription || "Trusted furniture manufacturer since 1995. Gaming chairs, office chairs, sofas, and complete office furniture - crafted for comfort that lasts."}
                        </p>

                        {activeSocials.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {activeSocials.map(({ key, label, icon: Icon }) => (
                                    <a
                                        key={key}
                                        href={resolveSocialUrl(key, contact[key])}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        title={label}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-300 transition hover:border-[#2F6FED] hover:bg-[#2F6FED] hover:text-white"
                                    >
                                        <Icon size={15} />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Links - mobile: col 1, row 2 | desktop: col 2 */}
                    <div className="order-2 lg:order-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
                            Quick Links
                        </h4>
                        <ul className="mt-5 space-y-3">
                            {quickLinks.map(({ label, to }) => (
                                <li key={to}>
                                    <Link
                                        to={to}
                                        className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-white"
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

                    {/* Categories - mobile: col 2, row 2 (side by side with Quick Links) | desktop: col 4 */}
                    <div className="order-3 lg:order-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
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
                                                className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-white"
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
                                <li className="text-sm text-gray-500">No categories available</li>
                            )}
                        </ul>
                    </div>

                    {/* Policies - mobile: full width, row 3 | desktop: col 3 */}
                    <div className="col-span-2 order-4 lg:order-3 lg:col-span-1">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
                            Policies
                        </h4>
                        <ul className="mt-5 space-y-3">
                            {policyLinks.map(({ label, to }) => (
                                <li key={label}>
                                    <Link
                                        to={to}
                                        className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-white"
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

                    {/* Contact Info - mobile: full width, row 4 | desktop: col 5 */}
                    <div className="col-span-2 order-5 lg:order-5 lg:col-span-1">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
                            Get in Touch
                        </h4>
                        <ul className="mt-5 space-y-4">
                            {contact?.address && (
                                <li className="flex items-start gap-2.5 text-sm">
                                    <FiMapPin size={15} className="mt-0.5 shrink-0 text-[#2F6FED]" />
                                    <span>{contact.address}</span>
                                </li>
                            )}
                            {contact?.phone && (
                                <li className="flex items-start gap-2.5 text-sm">
                                    <FiPhone size={15} className="mt-0.5 shrink-0 text-[#2F6FED]" />
                                    <a href={`tel:${contact.phone}`} className="transition hover:text-white">
                                        {contact.phone}
                                    </a>
                                </li>
                            )}
                            {contact?.email && (
                                <li className="flex items-start gap-2.5 text-sm">
                                    <FiMail size={15} className="mt-0.5 shrink-0 text-[#2F6FED]" />
                                    <a href={`mailto:${contact.email}`} className="break-all transition hover:text-white">
                                        {contact.email}
                                    </a>
                                </li>
                            )}
                            {!contact?.address && !contact?.phone && !contact?.email && (
                                <li className="text-sm text-gray-500">Lahore, Pakistan</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-1 text-xs text-gray-500 sm:flex-row lg:px-8">
                    <p>&copy; {year} {brandName}. All rights reserved.</p>
                    <p>Powered By: <a href="https://github.com/Asad-Zaidi" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Asad Zaidi</a></p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;