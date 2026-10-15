const { parseUserAgent, parseGeoLocation } = require("./analyticsUtils");

/**
 * Extract clean IP address handling Cloudflare and reverse proxies
 */
const getClientIp = (req) => {
    let ip = req.headers["cf-connecting-ip"] ||
             req.headers["x-real-ip"] ||
             req.headers["x-forwarded-for"] ||
             req.ip ||
             req.socket?.remoteAddress ||
             "";

    if (ip.includes(",")) {
        ip = ip.split(",")[0].trim();
    }

    if (ip.startsWith("::ffff:")) {
        ip = ip.replace("::ffff:", "");
    }

    return ip || "127.0.0.1";
};

/**
 * Extract comprehensive device name, IP address, and location from request
 */
const extractClientDeviceInfo = (req) => {
    if (!req) {
        return {
            ip: "Unknown IP",
            deviceName: "Unknown Device",
            location: "Unknown Location",
            timestamp: new Date().toUTCString(),
        };
    }

    const ip = getClientIp(req);
    const uaString = req.headers ? (req.headers["user-agent"] || "") : "";
    const ua = parseUserAgent(uaString);
    const geo = parseGeoLocation(ip);

    const deviceName = `${ua.browser || "Unknown Browser"}${ua.browserVersion ? ` ${ua.browserVersion}` : ""} on ${ua.os || "Unknown OS"} (${ua.deviceType || "Desktop"})`;

    let location = "Unknown Location";
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("127.")) {
        location = "Localhost / Internal Network";
    } else {
        const countryName = (geo.country === "PK" ? "Pakistan" : geo.country) || "Pakistan";
        if (geo.city && geo.city !== "Unknown") {
            const regionPart = geo.region && geo.region !== "Unknown" ? `${geo.region}, ` : "";
            location = `${geo.city}, ${regionPart}${countryName}`;
        } else if (geo.country && geo.country !== "Unknown") {
            location = countryName;
        } else {
            location = "Pakistan";
        }
    }

    return {
        ip: ip || "Unknown IP",
        deviceName: deviceName || "Unknown Device",
        location: location || "Unknown Location",
        timestamp: new Date().toUTCString(),
    };
};

module.exports = {
    getClientIp,
    extractClientDeviceInfo,
};
