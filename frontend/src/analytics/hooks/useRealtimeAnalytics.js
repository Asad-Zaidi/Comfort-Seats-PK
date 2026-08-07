import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export const useRealtimeAnalytics = () => {
    const [liveEvents, setLiveEvents] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
        });

        socket.on("connect", () => {
            setConnected(true);
            socket.emit("admin:subscribe");
        });

        socket.on("analytics:pulse", (data) => {
            setLiveEvents((prev) => [data, ...prev.slice(0, 19)]);
        });

        socket.on("analytics:event", (eventData) => {
            setLiveEvents((prev) => [eventData, ...prev.slice(0, 19)]);
        });

        socket.on("disconnect", () => {
            setConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return {
        liveEvents,
        connected,
    };
};

export default useRealtimeAnalytics;
