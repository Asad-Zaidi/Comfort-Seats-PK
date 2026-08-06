import React, { createContext, useContext, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { sendPulse, sendBeaconPulse, sendPerformance } from "../services/analyticsService";

const AnalyticsContext = createContext(null);

export const useAnalyticsContext = () => useContext(AnalyticsContext);

// Utility to generate UUID persistent visitor ID
const getOrCreateVisitorId = () => {
    if (typeof window === "undefined") return "server-id";
    let vid = localStorage.getItem("cs_analytics_vid");
    if (!vid) {
        vid = "v_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem("cs_analytics_vid", vid);
    }
    return vid;
};

// Utility to generate session ID
const getOrCreateSessionId = () => {
    if (typeof window === "undefined") return "server-sid";
    let sid = sessionStorage.getItem("cs_analytics_sid");
    if (!sid) {
        sid = "s_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        sessionStorage.setItem("cs_analytics_sid", sid);
    }
    return sid;
};

export const AnalyticsProvider = ({ children }) => {
    const location = useLocation();
    const clickCountRef = useRef(0);
    const maxScrollRef = useRef(0);
    const sessionStartTimeRef = useRef(Date.now());
    const pulseTimerRef = useRef(null);

    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();

    // 1. Listen for global user clicks & max scroll depth
    useEffect(() => {
        const handleClick = () => {
            clickCountRef.current += 1;
        };

        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (docHeight > 0) {
                const scrollPct = Math.round((scrollTop / docHeight) * 100);
                if (scrollPct > maxScrollRef.current) {
                    maxScrollRef.current = scrollPct;
                }
            }
        };

        window.addEventListener("click", handleClick);
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("click", handleClick);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // 2. Extract UTM & Referrer info
    const getPayload = useCallback((path) => {
        const urlParams = new URLSearchParams(window.location.search);
        const durationSeconds = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);

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
            durationSeconds,
        };
    }, [visitorId, sessionId]);

    // 3. Heartbeat Pulse & Route Changes
    useEffect(() => {
        const payload = getPayload(location.pathname);
        sendPulse(payload);

        // Reset pulse interval timer (30 seconds)
        if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
        pulseTimerRef.current = setInterval(() => {
            sendPulse(getPayload(location.pathname));
        }, 30000);

        return () => {
            if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
        };
    }, [location.pathname, getPayload]);

    // 4. Send Beacon on Tab Close / Exit
    useEffect(() => {
        const handleUnload = () => {
            const payload = getPayload(location.pathname);
            sendBeaconPulse(payload);
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => {
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, [location.pathname, getPayload]);

    // 5. Performance Web Vitals Reporting
    useEffect(() => {
        if (typeof window !== "undefined" && window.performance) {
            setTimeout(() => {
                const navEntries = window.performance.getEntriesByType("navigation");
                if (navEntries && navEntries.length > 0) {
                    const nav = navEntries[0];
                    sendPerformance({
                        path: location.pathname,
                        loadTimeMs: Math.round(nav.loadEventEnd - nav.startTime || 0),
                        fcpMs: Math.round(nav.responseEnd - nav.requestStart || 0),
                        lcpMs: Math.round(nav.domContentLoadedEventEnd - nav.startTime || 0),
                    });
                }
            }, 3000);
        }
    }, [location.pathname]);

    return (
        <AnalyticsContext.Provider value={{ visitorId, sessionId }}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export default AnalyticsProvider;
