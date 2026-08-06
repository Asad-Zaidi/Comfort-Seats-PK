import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { sendPulse, sendBeaconPulse, sendPerformance } from "../services/analyticsApi";

const VisitorTracker = ({ visitorId, sessionId }) => {
    const location = useLocation();
    const clickCountRef = useRef(0);
    const maxScrollRef = useRef(0);
    const sessionStartTimeRef = useRef(Date.now());
    const pulseTimerRef = useRef(null);

    // Global Click & Scroll Tracker
    useEffect(() => {
        const handleClick = () => { clickCountRef.current += 1; };
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (docHeight > 0) {
                const scrollPct = Math.round((scrollTop / docHeight) * 100);
                if (scrollPct > maxScrollRef.current) maxScrollRef.current = scrollPct;
            }
        };

        window.addEventListener("click", handleClick);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("click", handleClick);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const getPayload = useCallback((path) => {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            visitorId,
            sessionId,
            path: path || window.location.pathname,
            title: document.title,
            referrer: document.referrer || "Direct",
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language || "en-US",
            utmSource: urlParams.get("utm_source") || "",
            utmMedium: urlParams.get("utm_medium") || "",
            utmCampaign: urlParams.get("utm_campaign") || "",
            clickCount: clickCountRef.current,
            scrollDepth: maxScrollRef.current,
            durationSeconds: Math.round((Date.now() - sessionStartTimeRef.current) / 1000),
        };
    }, [visitorId, sessionId]);

    useEffect(() => {
        sendPulse(getPayload(location.pathname));

        if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
        pulseTimerRef.current = setInterval(() => {
            sendPulse(getPayload(location.pathname));
        }, 30000);

        return () => { if (pulseTimerRef.current) clearInterval(pulseTimerRef.current); };
    }, [location.pathname, getPayload]);

    useEffect(() => {
        const handleUnload = () => sendBeaconPulse(getPayload(location.pathname));
        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [location.pathname, getPayload]);

    useEffect(() => {
        if (typeof window !== "undefined" && window.performance) {
            setTimeout(() => {
                const nav = window.performance.getEntriesByType("navigation")[0];
                if (nav) {
                    sendPerformance({
                        path: location.pathname,
                        pageLoadTimeMs: Math.round(nav.loadEventEnd - nav.startTime || 0),
                        fcpMs: Math.round(nav.responseEnd - nav.requestStart || 0),
                        lcpMs: Math.round(nav.domContentLoadedEventEnd - nav.startTime || 0),
                    });
                }
            }, 3000);
        }
    }, [location.pathname]);

    return null;
};

export default VisitorTracker;
