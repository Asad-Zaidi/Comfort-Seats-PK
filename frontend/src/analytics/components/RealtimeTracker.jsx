import { useEffect } from "react";
import { sendPulse } from "../services/analyticsApi";

const RealtimeTracker = ({ visitorId, sessionId }) => {
    useEffect(() => {
        const interval = setInterval(() => {
            sendPulse({
                visitorId,
                sessionId,
                path: window.location.pathname,
                title: document.title,
            });
        }, 15000);

        return () => clearInterval(interval);
    }, [visitorId, sessionId]);

    return null;
};

export default RealtimeTracker;
