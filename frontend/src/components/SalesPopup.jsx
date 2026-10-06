import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiClock, FiArrowRight, FiPercent } from "react-icons/fi";
import api from "../api/api";

const STORAGE_KEYS = {
    SESSION: (id) => `cs_sales_session_${id}`,
    DAY: (id) => `cs_sales_day_${id}`,
    CAMPAIGN: (id) => `cs_sales_campaign_${id}`,
};

const SalesPopup = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [campaign, setCampaign] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: false,
    });

    // Check if current route is an admin page
    const isAdminRoute = location.pathname.startsWith("/admin");

    // Fetch active sales campaign for storefront
    useEffect(() => {
        if (isAdminRoute) return;

        let isMounted = true;
        const fetchActiveCampaign = async () => {
            try {
                const res = await api.get("/sales/active");
                if (res.data?.success && res.data?.data && isMounted) {
                    setCampaign(res.data.data);
                }
            } catch (err) {
                console.debug("[SalesPopup] Active campaign fetch error:", err?.message);
            }
        };

        fetchActiveCampaign();

        return () => {
            isMounted = false;
        };
    }, [isAdminRoute]);

    // Check display frequency rules & device rules
    const shouldDisplay = useCallback((camp) => {
        if (!camp || !camp.isPopupEnabled) return false;

        const isMobile = window.innerWidth < 768;
        if (isMobile && camp.showOnMobile === false) return false;
        if (!isMobile && camp.showOnDesktop === false) return false;

        const id = camp._id;
        const freq = camp.displayFrequency || "once_per_session";

        if (freq === "every_visit") return true;

        if (freq === "once_per_session") {
            const hasSeen = sessionStorage.getItem(STORAGE_KEYS.SESSION(id));
            return !hasSeen;
        }

        if (freq === "once_per_day") {
            const lastShownTime = localStorage.getItem(STORAGE_KEYS.DAY(id));
            if (!lastShownTime) return true;
            const diffHours = (Date.now() - parseInt(lastShownTime, 10)) / (1000 * 60 * 60);
            return diffHours >= 24;
        }

        if (freq === "once_per_campaign") {
            const dismissed = localStorage.getItem(STORAGE_KEYS.CAMPAIGN(id));
            return !dismissed;
        }

        return true;
    }, []);

    // Trigger popup display with delay
    useEffect(() => {
        if (!campaign || isAdminRoute) return;

        if (!shouldDisplay(campaign)) return;

        const delayMs = (campaign.displayDelay || 0) * 1000;
        const timer = setTimeout(() => {
            setIsVisible(true);

            try {
                const id = campaign._id;
                sessionStorage.setItem(STORAGE_KEYS.SESSION(id), "true");
                localStorage.setItem(STORAGE_KEYS.DAY(id), Date.now().toString());
            } catch (e) { }
        }, delayMs);

        return () => clearTimeout(timer);
    }, [campaign, isAdminRoute, shouldDisplay]);

    // Restore minimized small popup if previously closed during the session
    useEffect(() => {
        if (!campaign || isAdminRoute) return;
        const id = campaign._id;
        const isMiniDismissed = sessionStorage.getItem(`cs_sales_mini_dismissed_${id}`) === "true";
        const wasMinimized = sessionStorage.getItem(`cs_sales_minimized_${id}`) === "true";

        if (wasMinimized && !isMiniDismissed && !isVisible) {
            setIsMinimized(true);
        }
    }, [campaign, isAdminRoute, isVisible]);

    // Scroll lock while main popup is open
    useEffect(() => {
        if (isVisible) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isVisible]);

    // Dynamic Countdown calculation
    useEffect(() => {
        if (!campaign || !campaign.countdownEnabled || !campaign.endDate) return;

        const targetTime = new Date(campaign.endDate).getTime();

        const updateTimer = () => {
            const now = Date.now();
            const difference = targetTime - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, expired: false });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [campaign]);

    // Close handler for main popup -> minimizes to small top-right popup
    const handleClose = useCallback(() => {
        setIsVisible(false);
        setIsMinimized(true);
        if (campaign) {
            try {
                localStorage.setItem(STORAGE_KEYS.CAMPAIGN(campaign._id), "dismissed");
                sessionStorage.setItem(`cs_sales_minimized_${campaign._id}`, "true");
            } catch (e) { }
        }
    }, [campaign]);

    // Dismiss handler for small top-right popup -> dismisses completely
    const handleDismissMini = useCallback((e) => {
        if (e) e.stopPropagation();
        setIsMinimized(false);
        if (campaign) {
            try {
                sessionStorage.setItem(`cs_sales_mini_dismissed_${campaign._id}`, "true");
            } catch (e) { }
        }
    }, [campaign]);

    // Reopen main 3:2 modal from small top-right popup
    const handleReopenModal = useCallback(() => {
        setIsMinimized(false);
        setIsVisible(true);
    }, []);

    // ESC key listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                if (isVisible && campaign?.showCloseButton !== false) {
                    handleClose();
                } else if (isMinimized) {
                    handleDismissMini();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isVisible, isMinimized, campaign, handleClose, handleDismissMini]);

    // CTA Click handler
    const handleCtaClick = () => {
        setIsVisible(false);
        setIsMinimized(false);
        if (campaign) {
            try {
                localStorage.setItem(STORAGE_KEYS.CAMPAIGN(campaign._id), "dismissed");
                sessionStorage.setItem(`cs_sales_minimized_${campaign._id}`, "true");
            } catch (e) { }
        }
        const targetUrl =
            (campaign?.ctaUrl && campaign.ctaUrl !== "/products")
                ? campaign.ctaUrl
                : "/sale";

        if (targetUrl) {
            if (targetUrl.startsWith("http")) {
                window.location.href = targetUrl;
            } else {
                navigate(targetUrl);
            }
        }
    };

    if (isAdminRoute || !campaign) {
        return null;
    }

    const titleText = campaign.campaignName || campaign.heading || "Special Promotion";
    const badge = campaign.badgeText || "LIMITED TIME OFFER";
    const hasImage = Boolean(campaign.image?.url);

    return (
        <>
            {/* 1. MAIN 3:2 SALE POPUP MODAL */}
            <AnimatePresence>
                {isVisible && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
                        {/* Backdrop Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => {
                                if (campaign.closeOnOverlayClick !== false && campaign.showCloseButton !== false) {
                                    handleClose();
                                }
                            }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                        />

                        {/* 3:2 Aspect Ratio Modal Canvas (1500 × 1000 Resolution) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.88, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            role="dialog"
                            aria-modal="true"
                            style={{
                                fontFamily: "var(--font-family, 'Google Sans', sans-serif)",
                                borderRadius: "var(--card-border-radius, 1.75rem)",
                            }}
                            className="relative w-[94vw] max-w-[660px] sm:max-w-[760px] md:max-w-[840px] max-h-[88vh] aspect-[3/2] overflow-hidden shadow-2xl border border-white/20 z-10 flex flex-col justify-center items-center p-4 sm:p-7 md:p-9 bg-slate-950 my-auto"
                        >
                            {/* 3:2 Background Banner Image */}
                            {hasImage ? (
                                <img
                                    src={campaign.image.url}
                                    alt={titleText}
                                    className="absolute inset-0 w-full h-full object-cover z-0"
                                />
                            ) : (
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black z-0" />
                            )}

                            {/* Subtle background shade for high text contrast without blurring banner */}
                            <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

                            {/* Close '×' button */}
                            {campaign.showCloseButton !== false && (
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    aria-label="Close promotion"
                                    className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/55 hover:bg-black/85 text-white transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-lg border border-white/20 cursor-pointer"
                                >
                                    <FiX size={20} />
                                </button>
                            )}

                            {/* TEXT, TAGS, TIMER & CTA CENTERED IN THE MIDDLE OF POPUP */}
                            <div className="relative z-10 w-full max-w-lg p-2 sm:p-4 text-center text-white space-y-3.5 sm:space-y-4.5 flex flex-col items-center justify-center my-auto">
                                {/* Tags / Badge */}
                                {badge && (
                                    <div>
                                        <span 
                                            style={{
                                                backgroundColor: "var(--secondary, #F5A524)",
                                                color: "#12131A",
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold uppercase tracking-widest shadow-md"
                                        >
                                            <FiPercent size={12} className="animate-pulse" />
                                            {badge}
                                        </span>
                                    </div>
                                )}

                                {/* Campaign Title */}
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] text-white">
                                    {titleText}
                                </h2>

                                {/* Product Highlight (if product linked) */}
                                {campaign.productName && (
                                    <p className="text-xs sm:text-sm md:text-base text-gray-100 font-medium truncate max-w-md mx-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                                        Special Offer on:{" "}
                                        <strong 
                                            style={{ color: "var(--secondary, #F5A524)" }}
                                            className="font-bold"
                                        >
                                            {campaign.productName}
                                        </strong>
                                    </p>
                                )}

                                {/* Discount Highlight (if provided) */}
                                {campaign.discountText && (
                                    <div className="inline-block">
                                        <span 
                                            style={{
                                                backgroundColor: "var(--product-discount-color, var(--error, #E5484D))",
                                            }}
                                            className="px-4 py-1.5 rounded-xl text-white font-black text-sm sm:text-lg uppercase tracking-wider shadow-lg"
                                        >
                                            {campaign.discountText}
                                        </span>
                                    </div>
                                )}

                                {/* Dynamic Live Countdown Timer */}
                                {campaign.countdownEnabled && campaign.endDate && !timeLeft.expired && (
                                    <div className="pt-2 w-full max-w-xs">
                                        <div 
                                            style={{ color: "var(--secondary, #F5A524)" }}
                                            className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                                        >
                                            <FiClock size={13} />
                                            <span>Sale Ends In</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 sm:gap-2.5 max-w-[280px] sm:max-w-[320px] mx-auto">
                                            {[
                                                { label: "DAYS", val: timeLeft.days },
                                                { label: "HOURS", val: timeLeft.hours },
                                                { label: "MINS", val: timeLeft.minutes },
                                                { label: "SECS", val: timeLeft.seconds },
                                            ].map((seg, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/60 border border-white/20 text-white shadow-md"
                                                >
                                                    <span className="text-base sm:text-xl font-black font-mono leading-none">
                                                        {String(seg.val).padStart(2, "0")}
                                                    </span>
                                                    <span className="text-[8px] sm:text-[10px] font-bold text-gray-300 mt-1 tracking-wider">
                                                        {seg.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CTA Action Button adhering to Theme */}
                                <div className="pt-1.5 sm:pt-2 w-full">
                                    <button
                                        type="button"
                                        onClick={handleCtaClick}
                                        style={{
                                            backgroundColor: "var(--btn-primary-bg, var(--primary, #2F6FED))",
                                            color: "var(--btn-primary-text, #ffffff)",
                                            borderRadius: "calc(var(--card-border-radius, 1rem) * 0.75)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "var(--btn-primary-hover, var(--primary-hover, #1d4ed8))";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "var(--btn-primary-bg, var(--primary, #2F6FED))";
                                        }}
                                        className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 font-extrabold text-xs sm:text-base tracking-wide active:scale-95 transition-all shadow-2xl border border-white/20 cursor-pointer"
                                    >
                                        <span>{campaign.ctaText || "SHOP NOW"}</span>
                                        <FiArrowRight className="transform group-hover:translate-x-1.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 2. SMALL FLOATING POPUP MENU AT RIGHT TOP SIDE OF THE SCREEN */}
            <AnimatePresence>
                {isMinimized && !isVisible && (!timeLeft.expired || !campaign.endDate) && (
                    <motion.div
                        initial={{ opacity: 0, x: 70, y: -8, scale: 0.94 }}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 70, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        style={{
                            fontFamily: "var(--font-family, 'Google Sans', sans-serif)",
                            borderRadius: "var(--card-border-radius, 1.25rem)",
                        }}
                        className="fixed top-20 sm:top-24 right-3 sm:right-6 z-[60] w-[calc(100vw-1.5rem)] max-w-[310px] sm:max-w-[340px] bg-slate-950/95 backdrop-blur-md border border-white/20 shadow-2xl p-3.5 text-white cursor-pointer select-none group transition-all duration-300 hover:border-[var(--secondary,#F5A524)]/80 hover:shadow-[0_10px_35px_rgba(0,0,0,0.7)]"
                        onClick={handleReopenModal}
                    >
                        {/* Top Header Row: Badge, Expand Hint, Close Button */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5">
                                <span
                                    style={{
                                        backgroundColor: "var(--secondary, #F5A524)",
                                        color: "#12131A",
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm"
                                >
                                    <FiPercent size={9} className="animate-pulse" />
                                    {badge || "SALE"}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium group-hover:text-white transition hidden sm:inline">
                                    Click to view banner
                                </span>
                            </div>

                            {/* Close/Dismiss Small Popup Button */}
                            <button
                                type="button"
                                onClick={handleDismissMini}
                                aria-label="Dismiss sale alert"
                                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <FiX size={15} />
                            </button>
                        </div>

                        {/* Middle: Sale Title */}
                        <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-tight line-clamp-1 group-hover:text-[var(--secondary,#F5A524)] transition mb-1">
                            {titleText}
                        </h4>

                        {/* Optional Product Highlight */}
                        {campaign.productName && (
                            <p className="text-[11px] text-gray-300 truncate mb-2">
                                Special Offer on:{" "}
                                <strong style={{ color: "var(--secondary, #F5A524)" }}>
                                    {campaign.productName}
                                </strong>
                            </p>
                        )}

                        {/* Countdown in the Small Popup Menu */}
                        {campaign.countdownEnabled && campaign.endDate && !timeLeft.expired && (
                            <div className="pt-2 border-t border-white/15">
                                <div className="flex items-center justify-between text-[10px] mb-1.5">
                                    <span 
                                        style={{ color: "var(--secondary, #F5A524)" }}
                                        className="font-bold uppercase tracking-wider flex items-center gap-1"
                                    >
                                        <FiClock size={11} />
                                        Sale Ends In
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                                    {[
                                        { label: "DAYS", val: timeLeft.days },
                                        { label: "HRS", val: timeLeft.hours },
                                        { label: "MIN", val: timeLeft.minutes },
                                        { label: "SEC", val: timeLeft.seconds },
                                    ].map((seg, idx) => (
                                        <div
                                            key={idx}
                                            className="p-1 rounded-lg bg-black/60 border border-white/15 flex flex-col items-center justify-center"
                                        >
                                            <span className="text-xs sm:text-sm font-black text-white leading-none">
                                                {String(seg.val).padStart(2, "0")}
                                            </span>
                                            <span className="text-[7px] text-gray-400 font-bold tracking-wider mt-0.5">
                                                {seg.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Row */}
                        <div className="pt-2.5 mt-1 border-t border-white/10 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-gray-400 group-hover:text-gray-200 transition">
                                Tap to expand banner &rarr;
                            </span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCtaClick();
                                }}
                                style={{
                                    backgroundColor: "var(--btn-primary-bg, var(--primary, #2F6FED))",
                                    color: "var(--btn-primary-text, #ffffff)",
                                    borderRadius: "calc(var(--card-border-radius, 1rem) * 0.6)",
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow hover:opacity-95 transition cursor-pointer"
                            >
                                <span>{campaign.ctaText || "SHOP NOW"}</span>
                                <FiArrowRight size={10} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SalesPopup;
