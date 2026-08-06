import React, { createContext, useContext, useMemo } from "react";
import VisitorTracker from "./VisitorTracker";
import RealtimeTracker from "./RealtimeTracker";

const AnalyticsContext = createContext(null);

export const useAnalyticsContext = () => useContext(AnalyticsContext);

const getOrCreateVisitorId = () => {
    if (typeof window === "undefined") return "v_server";
    let vid = localStorage.getItem("cs_analytics_vid");
    if (!vid) {
        vid = "v_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem("cs_analytics_vid", vid);
    }
    return vid;
};

const getOrCreateSessionId = () => {
    if (typeof window === "undefined") return "s_server";
    let sid = sessionStorage.getItem("cs_analytics_sid");
    if (!sid) {
        sid = "s_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        sessionStorage.setItem("cs_analytics_sid", sid);
    }
    return sid;
};

export const AnalyticsProvider = ({ children }) => {
    const visitorId = useMemo(() => getOrCreateVisitorId(), []);
    const sessionId = useMemo(() => getOrCreateSessionId(), []);

    return (
        <AnalyticsContext.Provider value={{ visitorId, sessionId }}>
            <VisitorTracker visitorId={visitorId} sessionId={sessionId} />
            <RealtimeTracker visitorId={visitorId} sessionId={sessionId} />
            {children}
        </AnalyticsContext.Provider>
    );
};

export default AnalyticsProvider;
