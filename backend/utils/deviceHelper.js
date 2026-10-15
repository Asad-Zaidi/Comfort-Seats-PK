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
 * Resolve accurate location using Cloudflare headers, real-time live lookup, or offline geoip
 */
const resolveLocation = async (ip, req) => {
    // 1. Private / Localhost
    if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.")) {
        return "Localhost / Internal Network";
    }

    // 2. Cloudflare direct geolocation headers (if using Cloudflare)
    const cfCity = req?.headers?.["cf-ipcity"];
    const cfRegion = req?.headers?.["cf-region"];
    const cfCountry = req?.headers?.["cf-ipcountry"];
    if (cfCountry) {
        const countryName = cfCountry === "PK" ? "Pakistan" : cfCountry;
        const regionPart = cfRegion ? `${cfRegion}, ` : "";
        const cityPart = cfCity ? `${cfCity}, ` : "";
        return `${cityPart}${regionPart}${countryName}`;
    }

    // 3. Real-time fast Geo API lookup (prevents stale offline database misidentifications)
    try {
        const response = await fetch(`https://ipwho.is/${ip}`, { signal: AbortSignal.timeout(2000) });
        if (response.ok) {
            const data = await response.json();
            if (data && data.success) {
                const parts = [data.city, data.region, data.country].filter(Boolean);
                const ispPart = data.connection?.isp ? ` (${data.connection.isp})` : "";
                if (parts.length > 0) {
                    return `${parts.join(", ")}${ispPart}`;
                }
            }
        }
    } catch {
        // Continue to secondary provider
    }

    try {
        const response = await fetch(`https://freeipapi.com/api/json/${ip}`, { signal: AbortSignal.timeout(2000) });
        if (response.ok) {
            const data = await response.json();
            if (data && data.countryName) {
                const parts = [data.cityName, data.regionName, data.countryName].filter(Boolean);
                const ispPart = data.asnOrganization ? ` (${data.asnOrganization})` : "";
                if (parts.length > 0) {
                    return `${parts.join(", ")}${ispPart}`;
                }
            }
        }
    } catch {
        // Fallback to offline geoip-lite
    }

    // 4. Offline geoip-lite fallback
    const geo = parseGeoLocation(ip);
    const countryName = (geo.country === "PK" ? "Pakistan" : geo.country) || "Pakistan";
    if (geo.city && geo.city !== "Unknown") {
        const regionPart = geo.region && geo.region !== "Unknown" ? `${geo.region}, ` : "";
        return `${geo.city}, ${regionPart}${countryName}`;
    } else if (geo.country && geo.country !== "Unknown") {
        return countryName;
    }

    return "Pakistan";
};

/**
 * Extract comprehensive device name, IP address, and location from request
 */
const extractClientDeviceInfo = async (req) => {
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
    const deviceName = `${ua.browser || "Unknown Browser"}${ua.browserVersion ? ` ${ua.browserVersion}` : ""} on ${ua.os || "Unknown OS"} (${ua.deviceType || "Desktop"})`;
    const location = await resolveLocation(ip, req);

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
