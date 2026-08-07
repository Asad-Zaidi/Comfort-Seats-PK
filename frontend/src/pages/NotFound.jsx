import { Link } from "react-router-dom";
import {
    FiHome,
    FiArrowLeft,
    FiShoppingBag,
    FiInfo,
    FiMail,
} from "react-icons/fi";
import SEO from "../components/SEO";
import { useSiteConfig } from "../utils/siteConfig";
import Footer from "../components/Footer";

const NotFound = () => {
    const { siteName, siteUrl } = useSiteConfig();

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50/50 flex flex-col justify-between selection:bg-[#2F6FED]/10 selection:text-[#2F6FED]">
            <SEO
                title={`404 - Page Not Found - ${siteName}`}
                description={`The page you are looking for does not exist or has been moved. Browse ${siteName} - Premium Office Chairs, Gaming Chairs, Bar Stools & Office Furniture Shop in Lahore.`}
                canonicalUrl={`${siteUrl}/404`}
            />

            {/* Ambient Background Decorative Glows */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-[#2F6FED]/20 via-indigo-400/15 to-purple-400/20 blur-3xl opacity-70 animate-pulse" />
                <div className="absolute -top-24 -left-24 h-[350px] w-[350px] rounded-full bg-blue-400/10 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-[350px] w-[350px] rounded-full bg-indigo-400/10 blur-3xl" />
            </div>

            {/* Background Grid Accent */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Main Content Area */}
            <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">

                {/* Glassmorphic Container Card */}
                <div className="w-full rounded-3xl border border-white/80 bg-white/75 p-8 sm:p-12 md:p-16 shadow-2xl shadow-blue-500/5 backdrop-blur-xl transition-all">
                    <div className="flex flex-col items-center text-center">

                        {/* Status Pill Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#2F6FED]/20 bg-[#2F6FED]/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#2F6FED]">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2F6FED] opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2F6FED]"></span>
                            </span>
                            Error Code 404
                        </div>

                        {/* Large Animated Gradient 404 Header */}
                        <div className="relative mt-4 select-none">
                            <h1 className="bg-gradient-to-r from-[#2F6FED] via-indigo-600 to-purple-600 bg-clip-text text-8xl font-extrabold tracking-tight text-transparent sm:text-9xl md:text-[11rem] leading-none drop-shadow-sm">
                                404
                            </h1>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-[#2F6FED]/30 to-transparent h-1 w-3/4 blur-xs" />
                        </div>

                        {/* Heading & Subtitle */}
                        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                            Oops! Page not found
                        </h2>

                        <p className="mt-3 max-w-md text-sm sm:text-base leading-relaxed text-slate-600">
                            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                        </p>

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
                            <Link
                                to="/"
                                className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#2F6FED] to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:ring-offset-2"
                            >
                                <FiHome className="text-base transition-transform duration-300 group-hover:scale-110" />
                                <span>Go Back Home</span>
                            </Link>

                            <button
                                onClick={() => window.history.back()}
                                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white/90 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                            >
                                <FiArrowLeft className="text-base transition-transform duration-300 group-hover:-translate-x-1" />
                                <span>Previous Page</span>
                            </button>
                        </div>

                        {/* Quick Nav Links */}
                        <div className="mt-12 w-full border-t border-slate-100 pt-8">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Need help finding something?
                            </p>

                            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    to="/products"
                                    className="group inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/60 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-[#2F6FED]/30 hover:bg-[#2F6FED]/5 hover:text-[#2F6FED]"
                                >
                                    <FiShoppingBag className="text-slate-400 transition-colors group-hover:text-[#2F6FED]" />
                                    Browse Products
                                </Link>

                                <Link
                                    to="/about"
                                    className="group inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/60 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-[#2F6FED]/30 hover:bg-[#2F6FED]/5 hover:text-[#2F6FED]"
                                >
                                    <FiInfo className="text-slate-400 transition-colors group-hover:text-[#2F6FED]" />
                                    About Us
                                </Link>

                                <Link
                                    to="/contact"
                                    className="group inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/60 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-[#2F6FED]/30 hover:bg-[#2F6FED]/5 hover:text-[#2F6FED]"
                                >
                                    <FiMail className="text-slate-400 transition-colors group-hover:text-[#2F6FED]" />
                                    Contact Support
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Site Footer */}
            <Footer />
        </div>
    );
};

export default NotFound;