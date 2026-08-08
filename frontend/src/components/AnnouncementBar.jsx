import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import api from "../api/api";

const AnnouncementBar = () => {
    const location = useLocation();
    const [announcement, setAnnouncement] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    // Clear legacy localStorage key that may be persisting from old code
    useEffect(() => {
        try {
            localStorage.removeItem("announcement_dismissed");
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        if (location.pathname.startsWith("/admin")) return;

        const fetchAnnouncement = async () => {
            try {
                const res = await api.get("/announcement");
                if (res.data?.success && res.data.data) {
                    setAnnouncement(res.data.data);
                }
            } catch (err) {
                // Silent fail - announcement bar won't show
            }
        };
        fetchAnnouncement();
    }, [location.pathname]);

    // Hide announcement bar completely on any admin route or if disabled/dismissed
    if (location.pathname.startsWith("/admin")) return null;
    if (!announcement || !announcement.enabled || dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
    };

    const speed = announcement.speed || 10;
    const paddingY = announcement.paddingY || 8;

    const barStyle = {
        backgroundColor: announcement.backgroundColor || "#1e3a5f",
        color: announcement.textColor || "#ffffff",
        fontSize: announcement.fontSize ? `${announcement.fontSize}px` : "14px",
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
    };

    const marqueeStyle = {
        animation: `marquee ${speed}s linear infinite`,
    };

    return (
        <div
            className="relative w-full px-4 overflow-hidden transition-all duration-300"
            style={barStyle}
        >
            <div className="max-w-7xl mx-auto flex items-center pr-8">
                <div className="marquee-container flex-1 overflow-hidden whitespace-nowrap">
                    <div className="marquee-content inline-block" style={marqueeStyle}>
                        <span className="font-medium mx-4">{announcement.text}</span>
                        {announcement.link && (
                            <Link
                                to={announcement.link}
                                className="underline font-semibold hover:opacity-80 transition-opacity whitespace-nowrap mx-4"
                                style={{ color: announcement.textColor || "#ffffff" }}
                            >
                                {announcement.linkText || "Shop Now"}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            {announcement.showCloseButton && (
                <button
                    onClick={handleDismiss}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:opacity-80 transition-opacity"
                    style={{ color: announcement.textColor || "#ffffff" }}
                    aria-label="Dismiss announcement"
                >
                    <FiX size={16} />
                </button>
            )}
        </div>
    );
};

export default AnnouncementBar;