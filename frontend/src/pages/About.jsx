// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//     FiAward,
//     FiMapPin,
//     FiCalendar,
//     FiCheckCircle,
//     FiFeather,
//     FiDollarSign,
//     FiShield,
//     FiTrendingUp,
//     FiBriefcase,
//     FiHome,
//     FiZap,
//     FiGrid,
//     FiArrowRight,
//     FiBook,
//     FiMenu,
// } from "react-icons/fi";
// import SEO from "../components/SEO";
// import { useSiteConfig } from "../utils/siteConfig";
// import api from "../api/api";
// import Footer from "../components/Footer";
// import {
//     AnimatedSection,
//     AnimatedItem,
//     AnimatedCard,
//     CardIcon,
//     PageTransition,
//     AnimatedModal,
//     AnimatedMenu,
// } from "../components/animations";

// const iconMap = {
//     FiCalendar: FiCalendar,
//     FiAward: FiAward,
//     FiMapPin: FiMapPin,
//     FiGrid: FiGrid,
//     FiZap: FiZap,
//     FiBriefcase: FiBriefcase,
//     FiHome: FiHome,
//     FiTrendingUp: FiTrendingUp,
//     FiFeather: FiFeather,
//     FiDollarSign: FiDollarSign,
//     FiShield: FiShield,
//     FiCheckCircle: FiCheckCircle,
// };

// const resolveIcon = (iconName) => {
//     return iconMap[iconName] || FiAward;
// };

// const AboutUs = () => {
//     const { siteUrl, siteName } = useSiteConfig();
//     const [aboutContent, setAboutContent] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [storyModalOpen, setStoryModalOpen] = useState(false);

//     useEffect(() => {
//         const fetchAboutContent = async () => {
//             try {
//                 const res = await api.get("/site-content");
//                 if (res.data?.success && res.data.data?.aboutUs) {
//                     setAboutContent(res.data.data.aboutUs);
//                 } else {
//                     setAboutContent(null);
//                 }
//             } catch (err) {
//                 console.error("Failed to load about us content:", err);
//                 setAboutContent(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchAboutContent();
//     }, []);

//     if (loading) {
//         return (
//             <div className="flex min-h-[60vh] items-center justify-center">
//                 <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F6FED] border-t-transparent" />
//             </div>
//         );
//     }

//     // Fallback defaults if no content from API
//     const content = aboutContent || {};

//     const stats = (content.stats || [
//         { icon: "FiCalendar", label: "Established", value: "1995" },
//         { icon: "FiAward", label: "Years of Legacy", value: "25+" },
//         { icon: "FiMapPin", label: "Based In", value: "Lahore, PK" },
//         { icon: "FiGrid", label: "Product Categories", value: "6+" },
//     ]).map((s) => ({ ...s, icon: resolveIcon(s.icon) }));

//     const categories = (content.categories || [
//         { icon: "FiZap", name: "Gaming Chairs", desc: "Ergonomic seating built for long sessions and serious comfort." },
//         { icon: "FiBriefcase", name: "Office Chairs", desc: "Everyday support designed for productivity and posture." },
//         { icon: "FiAward", name: "Manager Chairs", desc: "A step up in style and support for growing responsibilities." },
//         { icon: "FiTrendingUp", name: "Executive Chairs", desc: "Premium finishes and comfort for leadership spaces." },
//         { icon: "FiHome", name: "Sofas & Sofa Sets", desc: "Living room seating crafted for durability and style." },
//         { icon: "FiGrid", name: "Office Furniture", desc: "Complete furnishing solutions for modern workplaces." },
//     ]).map((c) => ({ ...c, icon: resolveIcon(c.icon) }));

//     const values = (content.values || [
//         { icon: "FiFeather", title: "Quality Craftsmanship", desc: "Every piece is built with attention to detail and quality materials." },
//         { icon: "FiDollarSign", title: "Affordable Pricing", desc: "Premium furniture that doesn't come with a premium price tag." },
//         { icon: "FiShield", title: "Built to Last", desc: "Durability that holds up to daily use, year after year." },
//         { icon: "FiCheckCircle", title: "Customer Satisfaction", desc: "Three decades of relationships built on trust and reliability." },
//     ]).map((v) => ({ ...v, icon: resolveIcon(v.icon) }));

//     const heroEyebrow = content.heroEyebrow || "About ComfortSeatsPK";
//     const heroTitle = content.heroTitle || "Comfort Seats PK";
//     const heroDescription = content.heroDescription || "Formerly known as Saqib Poshish House, Comfort Seats PK is a trusted furniture manufacturer built on years of craftsmanship, reliability, and customer satisfaction - proudly based in Lahore, Pakistan.";
//     const heroImageUrl = content.heroImageUrl || "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1000";
//     const heroImageAlt = content.heroImageAlt || "Comfort Seats PK - Modern office chair and furniture manufacturer in Lahore";
//     const storyTitle = content.storyTitle || "Our Story";
//     const storyParagraph1 = content.storyParagraph1 || "Comfort Seats PK began its journey in 1995 as Saqib Poshish House, founded by Tariq Ali with a simple goal: build furniture that people could rely on for years, not seasons. Over three decades, that commitment to quality and craftsmanship grew into a trusted name across Lahore and beyond.";
//     const storyParagraph2 = content.storyParagraph2 || "Today, as Comfort Seats PK, we carry that same legacy forward - combining traditional craftsmanship with modern design to serve a new generation of homes and workplaces.";
//     const storyImageUrl = content.storyImageUrl || "https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1000";
//     const storyImageAlt = content.storyImageAlt || "Furniture craftsmanship at Comfort Seats PK - Lahore furniture manufacturer since 1995";
//     const categoriesTitle = content.categoriesTitle || "What We Make";
//     const categoriesDescription = content.categoriesDescription || "A full range of seating and furniture, manufactured with quality materials for comfort, durability, and modern style.";
//     const missionEyebrow = content.missionEyebrow || "Our Mission";
//     const missionTitle = content.missionTitle || '"To provide high-quality furniture at affordable prices - without compromising on comfort or craftsmanship."';
//     const missionDescription = content.missionDescription || "We believe every customer deserves furniture that offers lasting value, enhances productivity, and creates a better home or workplace experience.";
//     const valuesTitle = content.valuesTitle || "Why Choose Us";
//     const ctaTitle = content.ctaTitle || "Ready to furnish your space?";
//     const ctaDescription = content.ctaDescription || "Browse our full range of chairs, sofas, and office furniture.";
//     const ctaButtonText = content.ctaButtonText || "Shop Now";
//     const ctaButtonLink = content.ctaButtonLink || "/products";

//     return (
//         <PageTransition>
//             <div className="bg-white">
//                 <SEO
//                     title={`About Us - ${siteName}`}
//                     description={`Learn the story behind ${siteName} — Lahore's trusted furniture manufacturer since 1995. Quality craftsmanship, affordable pricing, and customer satisfaction.`}
//                     canonicalUrl={`${siteUrl}/about`}
//                 />

//                 {/* Hero */}
//                 <section className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
//                     <div className="mx-auto grid max-w-full grid-cols-1 items-center gap-14 px-5 py-16 lg:grid-cols-2 lg:px-32 lg:py-24">
//                         <AnimatedSection direction="left" delay={0.1} className="w-full">
//                             <AnimatedItem>
//                                 <span className="inline-block rounded-full bg-[#2F6FED]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2F6FED]">
//                                     {heroEyebrow}
//                                 </span>
//                             </AnimatedItem>
//                             <AnimatedItem delay={0.1}>
//                                 <h1 className="mt-5 text-4xl font-bold leading-tight text-[#12131A] sm:text-5xl">
//                                     {heroTitle.split('<br />').map((line, i) => (
//                                         <span key={i}>{line}{i < heroTitle.split('<br />').length - 1 && <br />}</span>
//                                     ))}
//                                 </h1>
//                             </AnimatedItem>
//                             <AnimatedItem delay={0.2}>
//                                 <p className="mt-6 max-w-full text-lg leading-8 text-gray-500">
//                                     {heroDescription}
//                                 </p>
//                             </AnimatedItem>
//                             <AnimatedItem delay={0.3}>
//                                 <div className="mt-8 flex flex-wrap gap-4">
//                                     <Link
//                                         to="/products"
//                                         className="inline-flex items-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90"
//                                     >
//                                         Explore Products
//                                         <FiArrowRight size={16} />
//                                     </Link>
//                                     <Link
//                                         to="/contact"
//                                         className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-[#12131A] transition hover:border-gray-300"
//                                     >
//                                         Contact Us
//                                     </Link>
//                                 </div>
//                             </AnimatedItem>
//                         </AnimatedSection>

//                         <AnimatedSection direction="right" delay={0.2} className="relative w-full">
//                             <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100">
//                                 <img
//                                     src={heroImageUrl}
//                                     alt={heroImageAlt}
//                                     loading="eager"
//                                     fetchPriority="high"
//                                     className="h-full w-full object-cover"
//                                 />
//                             </div>
//                             <AnimatedItem delay={0.3}>
//                                 <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5 sm:block">
//                                     <p className="text-sm text-gray-500">25+ Years of craftsmanship</p>
//                                 </div>
//                             </AnimatedItem>
//                         </AnimatedSection>
//                     </div>
//                 </section>

//                 {/* Stats bar */}
//                 <section className="bg-[#0F1320]">
//                     <div className="mx-auto grid max-w-full grid-cols-2 gap-8 px-5 py-12 sm:grid-cols-4 lg:px-32">
//                         {stats.map(({ icon: Icon, label, value }, idx) => (
//                             <AnimatedSection
//                                 key={label}
//                                 direction="up"
//                                 delay={0.1 + idx * 0.1}
//                                 className="flex flex-col items-center text-center sm:items-start sm:text-left"
//                             >
//                                 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#F5A524]">
//                                     <Icon size={18} />
//                                 </span>
//                                 <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">
//                                     {value}
//                                 </p>
//                                 <p className="mt-1 text-sm text-gray-400">{label}</p>
//                             </AnimatedSection>
//                         ))}
//                     </div>
//                 </section>

//                 {/* Our Story */}
//                 <section className="mx-auto max-w-full px-5 py-20 lg:px-32">
//                     <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
//                         <AnimatedSection direction="left" delay={0.1} className="aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100 lg:order-1">
//                             <img
//                                 src={storyImageUrl}
//                                 alt={storyImageAlt}
//                                 loading="lazy"
//                                 decoding="async"
//                                 className="h-full w-full object-cover"
//                             />
//                         </AnimatedSection>
//                         <AnimatedSection direction="right" delay={0.2} className="lg:order-2">
//                             <AnimatedItem>
//                                 <h2 className="text-3xl font-bold text-[#12131A] sm:text-4xl">
//                                     {storyTitle}
//                                 </h2>
//                             </AnimatedItem>
//                             <AnimatedItem delay={0.1}>
//                                 <div className="mt-2 h-1 w-14 rounded-full bg-[#F5A524]" />
//                             </AnimatedItem>
//                             <AnimatedItem delay={0.2}>
//                                 <p className="mt-6 leading-8 text-gray-500">
//                                     {storyParagraph1}
//                                 </p>
//                             </AnimatedItem>
//                             <AnimatedItem delay={0.3}>
//                                 <p className="mt-4 leading-8 text-gray-500">
//                                     {storyParagraph2}
//                                 </p>
//                             </AnimatedItem>
//                             <AnimatedItem delay={0.4}>
//                                 <button
//                                     onClick={() => setStoryModalOpen(true)}
//                                     className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2F6FED]/10 px-5 py-2.5 text-sm font-semibold text-[#2F6FED] transition hover:bg-[#2F6FED]/20"
//                                 >
//                                     <FiBook size={16} />
//                                     Read Full Story
//                                 </button>
//                             </AnimatedItem>
//                         </AnimatedSection>
//                     </div>
//                 </section>

//                 {/* What We Make */}
//                 <section className="bg-gray-50/60 py-20">
//                     <div className="mx-auto max-w-full px-5 lg:px-32">
//                         <AnimatedSection direction="up" delay={0.1} className="mx-auto max-w-2xl text-center">
//                             <AnimatedItem>
//                                 <h2 className="text-3xl font-bold text-[#12131A] sm:text-4xl">
//                                     {categoriesTitle}
//                                 </h2>
//                             </AnimatedItem>
//                             <AnimatedItem delay={0.1}>
//                                 <p className="mt-4 text-gray-500">
//                                     {categoriesDescription}
//                                 </p>
//                             </AnimatedItem>
//                         </AnimatedSection>

//                         <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//                             {categories.map(({ icon: Icon, name, desc }, idx) => (
//                                 <AnimatedCard
//                                     key={name}
//                                     direction={idx % 2 === 0 ? "left" : "right"}
//                                     delay={0.1 + idx * 0.1}
//                                 >
//                                     <CardIcon>
//                                         <Icon size={19} />
//                                     </CardIcon>
//                                     <h3 className="mt-4 text-lg font-semibold text-[#12131A]">
//                                         {name}
//                                     </h3>
//                                     <p className="mt-2 text-sm leading-6 text-gray-500">{desc}</p>
//                                 </AnimatedCard>
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* Mission */}
//                 <section className="mx-auto max-w-4xl px-5 py-20 text-center lg:px-8">
//                     <AnimatedSection direction="up" delay={0.1}>
//                         <AnimatedItem>
//                             <span className="text-sm font-semibold uppercase tracking-wide text-[#2F6FED]">{missionEyebrow}</span>
//                         </AnimatedItem>
//                         <AnimatedItem delay={0.1}>
//                             <h2 className="mt-3 text-2xl font-bold leading-snug text-[#12131A] sm:text-3xl">
//                                 {missionTitle}
//                             </h2>
//                         </AnimatedItem>
//                         <AnimatedItem delay={0.2}>
//                             <p className="mt-6 leading-8 text-gray-500">
//                                 {missionDescription}
//                             </p>
//                         </AnimatedItem>
//                     </AnimatedSection>
//                 </section>

//                 {/* Why Choose Us */}
//                 <section className="border-t border-gray-100 bg-gray-50/60 py-20">
//                     <div className="mx-auto max-w-full px-5 lg:px-32">
//                         <AnimatedSection direction="up" delay={0.1} className="mx-auto max-w-2xl text-center">
//                             <AnimatedItem>
//                                 <h2 className="text-3xl font-bold text-[#12131A] sm:text-4xl">
//                                     {valuesTitle}
//                                 </h2>
//                             </AnimatedItem>
//                         </AnimatedSection>

//                         <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//                             {values.map(({ icon: Icon, title, desc }, idx) => (
//                                 <AnimatedCard
//                                     key={title}
//                                     direction={idx % 2 === 0 ? "left" : "right"}
//                                     delay={0.1 + idx * 0.1}
//                                     className="text-center ring-1 ring-black/5"
//                                 >
//                                     <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5A524]/10 text-[#F5A524]">
//                                         <Icon size={20} />
//                                     </span>
//                                     <h3 className="mt-4 font-semibold text-[#12131A]">{title}</h3>
//                                     <p className="mt-2 text-sm leading-6 text-gray-500">{desc}</p>
//                                 </AnimatedCard>
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* CTA */}
//                 <section className="mx-auto max-w-full px-5 py-20 lg:px-32">
//                     <AnimatedSection direction="up" delay={0.1}>
//                         <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-[#0F1320] px-8 py-14 text-center lg:flex-row lg:text-left">
//                             <AnimatedItem>
//                                 <h2 className="text-2xl font-bold text-white sm:text-3xl">
//                                     {ctaTitle}
//                                 </h2>
//                             </AnimatedItem>
//                             <AnimatedItem delay={0.1}>
//                                 <p className="mt-3 max-w-full text-gray-400 lg:mt-0">
//                                     {ctaDescription}
//                                 </p>
//                             </AnimatedItem>
//                             <AnimatedItem delay={0.2}>
//                                 <Link
//                                     to={ctaButtonLink}
//                                     className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#2F6FED] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90"
//                                 >
//                                     {ctaButtonText}
//                                     <FiArrowRight size={16} />
//                                 </Link>
//                             </AnimatedItem>
//                         </div>
//                     </AnimatedSection>
//                 </section>

//                 {/* Animated Modal — Full Story */}
//                 <AnimatedModal
//                     isOpen={storyModalOpen}
//                     onClose={() => setStoryModalOpen(false)}
//                     title="Our Full Story"
//                     size="lg"
//                 >
//                     <div className="space-y-6">
//                         <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
//                             <img
//                                 src={storyImageUrl}
//                                 alt={storyImageAlt}
//                                 className="h-full w-full object-cover"
//                             />
//                         </div>
//                         <div className="space-y-4">
//                             <p className="leading-8 text-gray-600">
//                                 {storyParagraph1}
//                             </p>
//                             <p className="leading-8 text-gray-600">
//                                 {storyParagraph2}
//                             </p>
//                             <div className="rounded-xl bg-gray-50 p-5">
//                                 <p className="text-sm italic text-gray-500">
//                                     "From a small workshop in Lahore to a trusted name across Pakistan — our journey is built on three decades of craftsmanship, integrity, and the unwavering support of our customers."
//                                 </p>
//                             </div>
//                         </div>
//                         <div className="flex justify-end gap-3 pt-2">
//                             <button
//                                 onClick={() => setStoryModalOpen(false)}
//                                 className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
//                             >
//                                 Close
//                             </button>
//                             <Link
//                                 to="/contact"
//                                 onClick={() => setStoryModalOpen(false)}
//                                 className="inline-flex items-center gap-2 rounded-xl bg-[#2F6FED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90"
//                             >
//                                 Get in Touch
//                                 <FiArrowRight size={14} />
//                             </Link>
//                         </div>
//                     </div>
//                 </AnimatedModal>

//                 <Footer />
//             </div>
//         </PageTransition>
//     );
// };

// export default AboutUs;


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiAward,
    FiMapPin,
    FiCalendar,
    FiCheckCircle,
    FiFeather,
    FiDollarSign,
    FiShield,
    FiTrendingUp,
    FiBriefcase,
    FiHome,
    FiZap,
    FiGrid,
    FiArrowRight,
    FiBook,
} from "react-icons/fi";
import SEO from "../components/SEO";
import { useSiteConfig } from "../utils/siteConfig";
import api from "../api/api";
import Footer from "../components/Footer";
import {
    AnimatedSection,
    AnimatedItem,
    AnimatedCard,
    CardIcon,
    PageTransition,
    AnimatedModal,
} from "../components/animations";
import { sanitizeHtml, isHtmlContent } from "../utils/sanitizeHtml";

const iconMap = {
    FiCalendar: FiCalendar,
    FiAward: FiAward,
    FiMapPin: FiMapPin,
    FiGrid: FiGrid,
    FiZap: FiZap,
    FiBriefcase: FiBriefcase,
    FiHome: FiHome,
    FiTrendingUp: FiTrendingUp,
    FiFeather: FiFeather,
    FiDollarSign: FiDollarSign,
    FiShield: FiShield,
    FiCheckCircle: FiCheckCircle,
};

const resolveIcon = (iconName) => {
    return iconMap[iconName] || FiAward;
};

const AboutUs = () => {
    const { siteUrl, siteName } = useSiteConfig();
    const [aboutContent, setAboutContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [storyModalOpen, setStoryModalOpen] = useState(false);

    useEffect(() => {
        const fetchAboutContent = async () => {
            try {
                const res = await api.get("/site-content");
                if (res.data?.success && res.data.data?.aboutUs) {
                    setAboutContent(res.data.data.aboutUs);
                } else {
                    setAboutContent(null);
                }
            } catch (err) {
                console.error("Failed to load about us content:", err);
                setAboutContent(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutContent();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F6FED] border-t-transparent" />
            </div>
        );
    }

    // Fallback defaults if no content from API
    const content = aboutContent || {};

    const stats = (content.stats || [
        { icon: "FiCalendar", label: "Established", value: "1995" },
        { icon: "FiAward", label: "Years of Legacy", value: "25+" },
        { icon: "FiMapPin", label: "Based In", value: "Lahore, PK" },
        { icon: "FiGrid", label: "Product Categories", value: "6+" },
    ]).map((s) => ({ ...s, icon: resolveIcon(s.icon) }));

    const categories = (content.categories || [
        { icon: "FiZap", name: "Gaming Chairs", desc: "Ergonomic seating built for long sessions and serious comfort." },
        { icon: "FiBriefcase", name: "Office Chairs", desc: "Everyday support designed for productivity and posture." },
        { icon: "FiAward", name: "Manager Chairs", desc: "A step up in style and support for growing responsibilities." },
        { icon: "FiTrendingUp", name: "Executive Chairs", desc: "Premium finishes and comfort for leadership spaces." },
        { icon: "FiHome", name: "Sofas & Sofa Sets", desc: "Living room seating crafted for durability and style." },
        { icon: "FiGrid", name: "Office Furniture", desc: "Complete furnishing solutions for modern workplaces." },
    ]).map((c) => ({ ...c, icon: resolveIcon(c.icon) }));

    const values = (content.values || [
        { icon: "FiFeather", title: "Quality Craftsmanship", desc: "Every piece is built with attention to detail and quality materials." },
        { icon: "FiDollarSign", title: "Affordable Pricing", desc: "Premium furniture that doesn't come with a premium price tag." },
        { icon: "FiShield", title: "Built to Last", desc: "Durability that holds up to daily use, year after year." },
        { icon: "FiCheckCircle", title: "Customer Satisfaction", desc: "Three decades of relationships built on trust and reliability." },
    ]).map((v) => ({ ...v, icon: resolveIcon(v.icon) }));

    const heroEyebrow = content.heroEyebrow || "About ComfortSeatsPK";
    const heroTitle = content.heroTitle || "Comfort Seats PK";
    const heroDescription = content.heroDescription || "Formerly known as Saqib Poshish House, Comfort Seats PK is a trusted furniture manufacturer built on years of craftsmanship, reliability, and customer satisfaction - proudly based in Lahore, Pakistan.";
    const heroImageUrl = content.heroImageUrl || "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1000";
    const heroImageAlt = content.heroImageAlt || "Comfort Seats PK - Modern office chair and furniture manufacturer in Lahore";
    const storyTitle = content.storyTitle || "Our Story";
    const storyParagraph1 = content.storyParagraph1 || "Comfort Seats PK began its journey in 1995 as Saqib Poshish House, founded by Tariq Ali with a simple goal: build furniture that people could rely on for years, not seasons. Over three decades, that commitment to quality and craftsmanship grew into a trusted name across Lahore and beyond.";
    const storyParagraph2 = content.storyParagraph2 || "Today, as Comfort Seats PK, we carry that same legacy forward - combining traditional craftsmanship with modern design to serve a new generation of homes and workplaces.";
    const storyImageUrl = content.storyImageUrl || "https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1000";
    const storyImageAlt = content.storyImageAlt || "Furniture craftsmanship at Comfort Seats PK - Lahore furniture manufacturer since 1995";
    const categoriesTitle = content.categoriesTitle || "What We Make";
    const categoriesDescription = content.categoriesDescription || "A full range of seating and furniture, manufactured with quality materials for comfort, durability, and modern style.";
    const missionEyebrow = content.missionEyebrow || "Our Mission";
    const missionTitle = content.missionTitle || '"To provide high-quality furniture at affordable prices - without compromising on comfort or craftsmanship."';
    const missionDescription = content.missionDescription || "We believe every customer deserves furniture that offers lasting value, enhances productivity, and creates a better home or workplace experience.";
    const valuesTitle = content.valuesTitle || "Why Choose Us";
    const ctaTitle = content.ctaTitle || "Ready to furnish your space?";
    const ctaDescription = content.ctaDescription || "Browse our full range of chairs, sofas, and office furniture.";
    const ctaButtonText = content.ctaButtonText || "Shop Now";
    const ctaButtonLink = content.ctaButtonLink || "/products";

    return (
        <PageTransition>
            <div className="transition-colors duration-300" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
                <SEO
                    title={`About Us - ${siteName}`}
                    description={`Learn the story behind ${siteName} — Lahore's trusted furniture manufacturer since 1995. Quality craftsmanship, affordable pricing, and customer satisfaction.`}
                    canonicalUrl={`${siteUrl}/about`}
                />

                {/* Hero */}
                <section className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                    <div className="mx-auto grid max-w-full grid-cols-1 items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:px-32">
                        <AnimatedSection direction="left" delay={0.1} className="w-full">
                            <AnimatedItem>
                                <span
                                    style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
                                    className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                                >
                                    {heroEyebrow}
                                </span>
                            </AnimatedItem>
                            <AnimatedItem delay={0.1}>
                                <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl" style={{ color: 'var(--text)' }}>
                                    {heroTitle.split('<br />').map((line, i) => (
                                        <span key={i}>{line}{i < heroTitle.split('<br />').length - 1 && <br />}</span>
                                    ))}
                                </h1>
                            </AnimatedItem>
                             <AnimatedItem delay={0.2}>
                                {isHtmlContent(heroDescription) ? (
                                    <div
                                        className="mt-6 max-w-full text-lg leading-8 prose-theme"
                                        style={{ color: 'var(--text-secondary)' }}
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(heroDescription) }}
                                    />
                                ) : (
                                    <p className="mt-6 max-w-full text-lg leading-8 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                                        {heroDescription}
                                    </p>
                                )}
                             </AnimatedItem>
                            <AnimatedItem delay={0.3}>
                                <div className="mt-8 flex flex-wrap gap-4">
                                    <Link
                                        to="/products"
                                        style={{ backgroundColor: 'var(--btn-primary-bg, var(--primary))', color: 'var(--btn-primary-text, #fff)' }}
                                        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition hover:opacity-90"
                                    >
                                        Explore Products
                                        <FiArrowRight size={16} />
                                    </Link>
                                    <Link
                                        to="/contact"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                                        className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition hover:opacity-80"
                                    >
                                        Contact Us
                                    </Link>
                                </div>
                            </AnimatedItem>
                        </AnimatedSection>

                        <AnimatedSection direction="right" delay={0.2} className="relative w-full">
                            <div className="aspect-[4/3] overflow-hidden rounded-3xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                <img
                                    src={heroImageUrl}
                                    alt={heroImageAlt}
                                    loading="eager"
                                    fetchPriority="high"
                                    className="h-full w-full object-cover"
                                />
                            </div>

                        </AnimatedSection>
                    </div>
                </section>

                {/* Stats bar */}
                <section style={{ backgroundColor: 'var(--footer-bg, #12131A)' }}>
                    <div className="mx-auto grid w-full max-w-full grid-cols-2 gap-6 px-5 py-4 sm:grid-cols-5 lg:px-32">
                        {stats.map(({ icon: Icon, label, value }, idx) => (
                            <AnimatedSection
                                key={label}
                                direction="up"
                                delay={0.1 + idx * 0.1}
                                className="flex flex-col items-center justify-center p-6 text-center"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10" style={{ color: 'var(--secondary)' }}>
                                    <Icon size={18} />
                                </span>

                                <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                                    {value}
                                </p>

                                <p className="mt-1 text-sm opacity-80" style={{ color: 'var(--footer-link, #9ca3af)' }}>
                                    {label}
                                </p>
                            </AnimatedSection>
                        ))}
                    </div>
                </section>

                {/* Our Story */}
                <section className="mx-auto max-w-full px-5 py-20 lg:px-32">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
                        <AnimatedSection direction="left" delay={0.1} className="aspect-[4/3] overflow-hidden rounded-3xl lg:order-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <img
                                src={storyImageUrl}
                                alt={storyImageAlt}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover"
                            />
                        </AnimatedSection>
                        <AnimatedSection direction="right" delay={0.2} className="lg:order-2">
                            <AnimatedItem>
                                <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: 'var(--text)' }}>
                                    {storyTitle}
                                </h2>
                            </AnimatedItem>
                            <AnimatedItem delay={0.1}>
                                <div className="mt-2 h-1 w-14 rounded-full" style={{ backgroundColor: 'var(--secondary)' }} />
                            </AnimatedItem>
                            <AnimatedItem delay={0.2}>
                                {isHtmlContent(storyParagraph1) ? (
                                    <div
                                        className="mt-6 leading-8 prose-theme"
                                        style={{ color: 'var(--text-secondary)' }}
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(storyParagraph1) }}
                                    />
                                ) : (
                                    <p className="mt-6 leading-8 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                                        {storyParagraph1}
                                    </p>
                                )}
                            </AnimatedItem>
                            <AnimatedItem delay={0.3}>
                                {isHtmlContent(storyParagraph2) ? (
                                    <div
                                        className="mt-4 leading-8 prose-theme"
                                        style={{ color: 'var(--text-secondary)' }}
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(storyParagraph2) }}
                                    />
                                ) : (
                                    <p className="mt-4 leading-8 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                                        {storyParagraph2}
                                    </p>
                                )}
                            </AnimatedItem>
                            <AnimatedItem delay={0.4}>
                                <button
                                    onClick={() => setStoryModalOpen(true)}
                                    style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-80"
                                >
                                    <FiBook size={16} />
                                    Read Full Story
                                </button>
                            </AnimatedItem>
                        </AnimatedSection>
                    </div>
                </section>

                {/* What We Make */}
                <section className="py-20 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="mx-auto max-w-full px-5 lg:px-32">
                        <AnimatedSection direction="up" delay={0.1} className="mx-auto max-w-2xl text-center">
                            <AnimatedItem>
                                <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: 'var(--text)' }}>
                                    {categoriesTitle}
                                </h2>
                            </AnimatedItem>
                            <AnimatedItem delay={0.1}>
                                <p className="mt-4 text-base" style={{ color: 'var(--text-secondary)' }}>
                                    {categoriesDescription}
                                </p>
                            </AnimatedItem>
                        </AnimatedSection>

                        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map(({ icon: Icon, name, desc }, idx) => (
                                <Link
                                    key={name}
                                    to={`/products?category=${encodeURIComponent(name)}`}
                                    className="block group"
                                >
                                    <AnimatedCard
                                        direction={idx % 2 === 0 ? "left" : "right"}
                                        delay={0.1 + idx * 0.08}
                                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                                        className="h-full flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <CardIcon style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
                                                    <Icon size={20} />
                                                </CardIcon>
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--primary)' }}>
                                                    Browse <FiArrowRight size={14} />
                                                </span>
                                            </div>
                                            <h3 className="mt-5 text-lg font-semibold transition-colors group-hover:opacity-90" style={{ color: 'var(--text)' }}>
                                                {name}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                                        </div>
                                    </AnimatedCard>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission */}
                <section className="mx-auto max-w-4xl px-5 py-20 text-center lg:px-32">
                    <AnimatedSection direction="up" delay={0.1}>
                        <AnimatedItem>
                            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>{missionEyebrow}</span>
                        </AnimatedItem>
                        <AnimatedItem delay={0.1}>
                            <h2 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl" style={{ color: 'var(--text)' }}>
                                {missionTitle}
                            </h2>
                        </AnimatedItem>
                        <AnimatedItem delay={0.2}>
                            {isHtmlContent(missionDescription) ? (
                                <div
                                    className="mt-6 leading-8 prose-theme"
                                    style={{ color: 'var(--text-secondary)' }}
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(missionDescription) }}
                                />
                            ) : (
                                <p className="mt-6 leading-8 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                                    {missionDescription}
                                </p>
                            )}
                        </AnimatedItem>
                    </AnimatedSection>
                </section>

                {/* Why Choose Us */}
                <section className="border-t py-20 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <div className="mx-auto max-w-full px-5 lg:px-32">
                        <AnimatedSection direction="up" delay={0.1} className="mx-auto max-w-2xl text-center">
                            <AnimatedItem>
                                <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: 'var(--text)' }}>
                                    {valuesTitle}
                                </h2>
                            </AnimatedItem>
                        </AnimatedSection>

                        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            {values.map(({ icon: Icon, title, desc }, idx) => (
                                <AnimatedCard
                                    key={title}
                                    direction={idx % 2 === 0 ? "left" : "right"}
                                    delay={0.1 + idx * 0.1}
                                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
                                    className="text-center"
                                >
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--secondary) 15%, transparent)', color: 'var(--secondary)' }}>
                                        <Icon size={20} />
                                    </span>
                                    <h3 className="mt-4 font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
                                    <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                                </AnimatedCard>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="mx-auto max-w-full px-5 py-20 lg:px-32">
                    <AnimatedSection direction="up" delay={0.1}>
                        <div className="flex flex-col items-center justify-between gap-10 rounded-3xl px-8 py-14 text-center lg:flex-row lg:text-left" style={{ backgroundColor: 'var(--footer-bg, #12131A)' }}>
                            <AnimatedItem>
                                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                                    {ctaTitle}
                                </h2>
                            </AnimatedItem>
                            <AnimatedItem delay={0.1}>
                                <p className="mt-3 max-w-full opacity-80 lg:mt-0" style={{ color: 'var(--footer-link, #9ca3af)' }}>
                                    {ctaDescription}
                                </p>
                            </AnimatedItem>
                            <AnimatedItem delay={0.2}>
                                <Link
                                    to={ctaButtonLink}
                                    style={{ backgroundColor: 'var(--btn-primary-bg, var(--primary))', color: 'var(--btn-primary-text, #fff)' }}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
                                >
                                    {ctaButtonText}
                                    <FiArrowRight size={16} />
                                </Link>
                            </AnimatedItem>
                        </div>
                    </AnimatedSection>
                </section>

                {/* Animated Modal — Full Story */}
                <AnimatedModal
                    isOpen={storyModalOpen}
                    onClose={() => setStoryModalOpen(false)}
                    title="Our Full Story"
                    size="lg"
                >
                    <div className="space-y-6">
                        <div className="aspect-[16/9] overflow-hidden rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <img
                                src={storyImageUrl}
                                alt={storyImageAlt}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="space-y-4">
                            <p className="leading-8" style={{ color: 'var(--text-secondary)' }}>
                                {storyParagraph1}
                            </p>
                            <p className="leading-8" style={{ color: 'var(--text-secondary)' }}>
                                {storyParagraph2}
                            </p>
                            <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                <p className="text-sm italic" style={{ color: 'var(--text-light)' }}>
                                    "From a small workshop in Lahore to a trusted name across Pakistan — our journey is built on three decades of craftsmanship, integrity, and the unwavering support of our customers."
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setStoryModalOpen(false)}
                                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                                className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:opacity-80"
                            >
                                Close
                            </button>
                            <Link
                                to="/contact"
                                onClick={() => setStoryModalOpen(false)}
                                style={{ backgroundColor: 'var(--btn-primary-bg, var(--primary))', color: 'var(--btn-primary-text, #fff)' }}
                                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                            >
                                Get in Touch
                                <FiArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </AnimatedModal>

                <Footer />
            </div>
        </PageTransition>
    );
};

export default AboutUs;