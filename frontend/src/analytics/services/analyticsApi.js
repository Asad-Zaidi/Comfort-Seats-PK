import api from "../../api/api";

const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export const sendPulse = async (payload) => {
    try {
        const res = await api.post("/analytics/pulse", payload);
        return res.data;
    } catch (err) {
        return null;
    }
};

export const sendBeaconPulse = (payload) => {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        try {
            const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
            navigator.sendBeacon(`${BASE_URL}/api/analytics/pulse`, blob);
        } catch (e) {
            // Ignore
        }
    }
};

export const sendEvent = async (eventName, payload = {}) => {
    try {
        const visitorId = typeof localStorage !== "undefined" ? localStorage.getItem("cs_analytics_vid") : null;
        const sessionId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("cs_analytics_sid") : null;

        const res = await api.post("/analytics/event", {
            visitorId,
            sessionId,
            eventName,
            path: window.location.pathname,
            ...payload,
        });
        return res.data;
    } catch (err) {
        return null;
    }
};

export const sendPerformance = async (metrics) => {
    try {
        await api.post("/analytics/performance", metrics);
    } catch (err) {
        // Ignore
    }
};

export const getDashboardAnalytics = async (days = 7) => {
    try {
        const res = await api.get(`/analytics/dashboard?days=${days}`);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch dashboard analytics:", err);
        return null;
    }
};
