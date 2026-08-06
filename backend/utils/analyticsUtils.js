const useragent = require("useragent");
const geoip = require("geoip-lite");

/**
 * Parse raw user-agent string to return browser, OS, and device type
 */
exports.parseUserAgent = (uaString = "") => {
    if (!uaString) {
        return { browser: "Unknown", browserVersion: "", os: "Unknown", deviceType: "Desktop" };
    }
    const agent = useragent.parse(uaString);

    const browser = agent.family || "Unknown";
    const browserVersion = `${agent.major || ""}.${agent.minor || ""}`.replace(/\.$/, "");
    const os = agent.os.family || "Unknown";

    // Determine device category
    const uaLower = uaString.toLowerCase();
    let deviceType = "Desktop";
    if (/tablet|ipad|playbook|silk/i.test(uaLower)) {
        deviceType = "Tablet";
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|windows phone/i.test(uaLower)) {
        deviceType = "Mobile";
    }

    return {
        browser,
        browserVersion,
        os,
        deviceType,
    };
};

/**
 * Classify traffic channel based on referrer header and UTM parameters
 */
exports.parseTrafficChannel = (referrer = "", utmSource = "", utmMedium = "") => {
    if (utmMedium === "cpc" || utmMedium === "ppc" || utmMedium === "paid") {
        return "Paid Ads";
    }
    if (utmMedium === "email" || utmSource === "email") {
        return "Email";
    }

    if (!referrer || referrer === "Direct" || referrer === "null" || referrer === "undefined") {
        return "Direct";
    }

    const refLower = referrer.toLowerCase();
    
    // Check if internal domain
    if (refLower.includes("comfortseatspk.com") || refLower.includes("localhost")) {
        return "Direct";
    }

    // Search Engines
    if (/google|bing|yahoo|duckduckgo|baidu|yandex/i.test(refLower)) {
        return "Organic Search";
    }

    // Social Media
    if (/facebook|fb\.com|instagram|whatsapp|t\.co|twitter|x\.com|pinterest|linkedin|tiktok|youtube|reddit/i.test(refLower)) {
        return "Social Media";
    }

    return "Referral";
};

/**
 * Resolve Geo Location from IP address
 */
exports.parseGeoLocation = (ip = "") => {
    let clientIp = ip;
    if (clientIp.includes(",")) {
        clientIp = clientIp.split(",")[0].trim();
    }
    if (clientIp === "::1" || clientIp === "127.0.0.1" || clientIp.startsWith("::ffff:127.")) {
        return { country: "Pakistan", city: "Lahore", region: "Punjab" };
    }

    const geo = geoip.lookup(clientIp);
    if (!geo) {
        return { country: "Pakistan", city: "Lahore", region: "Punjab" };
    }

    return {
        country: geo.country || "Unknown",
        city: geo.city || "Unknown",
        region: geo.region || "Unknown",
    };
};
