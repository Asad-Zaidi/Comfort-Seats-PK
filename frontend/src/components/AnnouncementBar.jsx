import React, { useState, useEffect } from "react";
import { FiX, FiClock, FiPercent, FiArrowRight } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import api from "../api/api";

const AnnouncementBar = () => {
    const location = useLocation();

    // Standard store announcement
    const [standardAnnouncement, setStandardAnnouncement] = useState(null);
    const [standardDismissed, setStandardDismissed] = useState(false);

    // Active Sales Campaign announcement
    const [saleCampaign, setSaleCampaign] = useState(null);
    const [saleDismissed, setSaleDismissed] = useState(false);

    // Dynamic mini countdown for sale
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: false,
    });

    const isAdminRoute = location.pathname.startsWith("/admin");

    // Fetch announcements and active sales campaign
    useEffect(() => {
        if (isAdminRoute) return;

        let isMounted = true;

        const fetchData = async () => {
            // 1. Fetch active sales campaign
            try {
                const saleRes = await api.get("/sales/active");
                if (saleRes.data?.success && saleRes.data.data && isMounted) {
                    const s = saleRes.data.data;
                    if (s.showAnnouncementBar !== false) {
                        setSaleCampaign(s);
                        // Check dismissal
                        const dismissed = sessionStorage.getItem(`cs_sale_bar_dismissed_${s._id}`);
                        if (dismissed) {
                            setSaleDismissed(true);
                        }
                    }
                }
            } catch (err) {
                // Silently continue
            }

            // 2. Fetch standard store announcement
            try {
                const res = await api.get("/announcement");
                if (res.data?.success && res.data.data && isMounted) {
                    setStandardAnnouncement(res.data.data);
                }
            } catch (err) {
                // Silently continue
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [isAdminRoute, location.pathname]);

    // Live countdown timer for active sales campaign
    useEffect(() => {
        if (!saleCampaign || !saleCampaign.endDate) return;

        const targetTime = new Date(saleCampaign.endDate).getTime();

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
    }, [saleCampaign]);

    if (isAdminRoute) return null;

    const hasActiveSaleBar =
        Boolean(
            saleCampaign &&
            saleCampaign.showAnnouncementBar !== false &&
            !saleDismissed &&
            (!timeLeft.expired || !saleCampaign.endDate)
        );

    const hasStandardBar =
        Boolean(
            standardAnnouncement &&
            standardAnnouncement.enabled &&
            !standardDismissed
        );

    // If neither announcement bar is active, don't render anything
    if (!hasActiveSaleBar && !hasStandardBar) {
        return null;
    }

    // SALE ANNOUNCEMENT BAR (UP / TOP)
    const renderSaleBar = () => {
        if (!hasActiveSaleBar) return null;

        const bg = (saleCampaign.announcementBgColor && saleCampaign.announcementBgColor !== "#1e3a5f")
            ? saleCampaign.announcementBgColor
            : "var(--announcement-bg, #12131A)";
        const textCol = saleCampaign.announcementTextColor || "var(--announcement-text, #ffffff)";
        const ctaUrl =
            saleCampaign.announcementLink ||
            (saleCampaign.ctaUrl && saleCampaign.ctaUrl !== "/products" ? saleCampaign.ctaUrl : "/sale");
        const ctaLabel = saleCampaign.announcementLinkText || saleCampaign.ctaText || "SHOP NOW";
        const displayMessage =
            saleCampaign.announcementText?.trim() ||
            `${saleCampaign.campaignName || saleCampaign.heading || "Special Sale"}${saleCampaign.productName ? ` • ${saleCampaign.productName}` : ""}${saleCampaign.discountText ? ` — ${saleCampaign.discountText}` : ""}`;

        const handleDismissSale = () => {
            setSaleDismissed(true);
            try {
                sessionStorage.setItem(`cs_sale_bar_dismissed_${saleCampaign._id}`, "true");
            } catch (e) { }
        };

        return (
            <div
                key="sale-announcement-bar"
                className="relative w-full z-40 transition-all duration-300 shadow-sm border-b border-white/10"
                style={{
                    backgroundColor: bg,
                    color: textCol,
                    fontFamily: "var(--font-family, 'Google Sans', sans-serif)",
                }}
            >
                <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-medium">
                    {/* Left & Center: Badge + Message + Countdown */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 justify-center sm:justify-start pr-6 sm:pr-0">
                        {/* Sale Tag / Badge */}
                        <span
                            style={{
                                backgroundColor: "var(--secondary, #F5A524)",
                                color: "#12131A",
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm"
                        >
                            <FiPercent size={10} className="animate-pulse" />
                            {saleCampaign.badgeText || "SALE"}
                        </span>

                        {/* Main Sale Message */}
                        <span className="font-semibold tracking-wide text-center sm:text-left">
                            {displayMessage}
                        </span>

                        {/* Mini Countdown Timer */}
                        {saleCampaign.announcementCountdown !== false && saleCampaign.endDate && !timeLeft.expired && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black/25 backdrop-blur-sm border border-white/10 text-white text-[11px]">
                                <FiClock size={11} style={{ color: "var(--secondary, #F5A524)" }} />
                                <span>Ends in:</span>
                                <span>
                                    {timeLeft.days > 0 && `${timeLeft.days}d `}
                                    {String(timeLeft.hours).padStart(2, "0")}h :{" "}
                                    {String(timeLeft.minutes).padStart(2, "0")}m :{" "}
                                    {String(timeLeft.seconds).padStart(2, "0")}s
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right: CTA Action Link */}
                    <div className="flex items-center gap-3 mx-auto sm:mx-0">
                        <Link
                            to={ctaUrl}
                            style={{
                                backgroundColor: "var(--secondary, #F5A524)",
                                color: "#12131A",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--secondary-hover, #d48c1a)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--secondary, #F5A524)";
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-sm transition-all duration-200 transform hover:scale-105 shadow-sm"
                        >
                            <span>{ctaLabel}</span>
                            <FiArrowRight size={12} />
                        </Link>

                        {/* Dismiss Close Button */}
                        <button
                            onClick={handleDismissSale}
                            className="p-1 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition"
                            aria-label="Dismiss sale announcement"
                        >
                            <FiX size={15} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // STANDARD STORE ANNOUNCEMENT BAR (BELOW / BOTTOM)
    const renderStandardBar = () => {
        if (!hasStandardBar) return null;

        const speed = standardAnnouncement.speed || 10;
        const paddingY = standardAnnouncement.paddingY || 8;

        const barStyle = {
            backgroundColor: standardAnnouncement.backgroundColor || "#1e3a5f",
            color: standardAnnouncement.textColor || "#ffffff",
            fontSize: standardAnnouncement.fontSize ? `${standardAnnouncement.fontSize}px` : "14px",
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
        };

        const marqueeStyle = {
            animation: `marquee ${speed}s linear infinite`,
        };

        return (
            <div
                key="standard-announcement-bar"
                className="relative w-full px-4 overflow-hidden transition-all duration-300 z-40"
                style={barStyle}
            >
                <div className="max-w-7xl mx-auto flex items-center pr-8">
                    <div className="marquee-container flex-1 overflow-hidden whitespace-nowrap">
                        <div className="marquee-content inline-block" style={marqueeStyle}>
                            <span className="font-medium mx-4">{standardAnnouncement.text}</span>
                            {standardAnnouncement.link && (
                                <Link
                                    to={standardAnnouncement.link}
                                    className="underline font-semibold hover:opacity-80 transition-opacity whitespace-nowrap mx-4"
                                    style={{ color: standardAnnouncement.textColor || "#ffffff" }}
                                >
                                    {standardAnnouncement.linkText || "Shop Now"}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
                {standardAnnouncement.showCloseButton && (
                    <button
                        onClick={() => setStandardDismissed(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:opacity-80 transition-opacity"
                        style={{ color: standardAnnouncement.textColor || "#ffffff" }}
                        aria-label="Dismiss announcement"
                    >
                        <FiX size={16} />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col z-40">
            {renderSaleBar()}
            {renderStandardBar()}
        </div>
    );
};

export default AnnouncementBar;