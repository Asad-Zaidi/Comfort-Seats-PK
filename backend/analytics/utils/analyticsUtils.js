const useragent = require("useragent");

/**
 * Parse user agent to browser, version, OS, and device category
 */
exports.parseUserAgent = (uaString = "") => {
    if (!uaString) {
        return { browser: "Unknown", browserVersion: "", os: "Unknown", deviceType: "Desktop" };
    }
    const agent = useragent.parse(uaString);

    let browser = agent.family || "Unknown";
    if (browser.includes("Mobile Safari") || browser.includes("Safari")) browser = "Safari";
    if (browser.includes("Chrome")) browser = "Chrome";
    if (browser.includes("Firefox")) browser = "Firefox";
    if (browser.includes("Edge")) browser = "Edge";
    if (browser.includes("Samsung")) browser = "Samsung Internet";

    const browserVersion = `${agent.major || ""}.${agent.minor || ""}`.replace(/\.$/, "");
    const os = agent.os.family || "Unknown";

    const uaLower = uaString.toLowerCase();
    let deviceType = "Desktop";
    if (/tablet|ipad|playbook|silk/i.test(uaLower)) {
        deviceType = "Tablet";
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|windows phone/i.test(uaLower)) {
        deviceType = "Mobile";
    }

    return { browser, browserVersion, os, deviceType };
};

/**
 * Categorize referrer & UTM tags into traffic channels
 */
exports.parseTrafficSource = (referrer = "", utmSource = "", utmMedium = "") => {
    if (utmMedium === "cpc" || utmMedium === "ppc" || utmMedium === "paid") return "Paid Ads";
    if (utmMedium === "email" || utmSource === "email") return "Email Campaigns";

    if (!referrer || referrer === "Direct" || referrer === "null" || referrer === "undefined") {
        return "Direct";
    }

    const refLower = referrer.toLowerCase();
    if (refLower.includes("comfortseatspk.com") || refLower.includes("localhost")) return "Direct";

    if (/google\.com|google\.com\.pk|google\.co/i.test(refLower)) return "Google Search";
    if (/bing\.com/i.test(refLower)) return "Bing";
    if (/yahoo\.com/i.test(refLower)) return "Yahoo";
    if (/duckduckgo\.com/i.test(refLower)) return "DuckDuckGo";

    if (/facebook\.com|fb\.com/i.test(refLower)) return "Facebook";
    if (/instagram\.com/i.test(refLower)) return "Instagram";
    if (/whatsapp/i.test(refLower)) return "WhatsApp";
    if (/t\.co|twitter\.com|x\.com/i.test(refLower)) return "Twitter/X";
    if (/linkedin\.com/i.test(refLower)) return "LinkedIn";
    if (/youtube\.com/i.test(refLower)) return "YouTube";

    return "Referral Websites";
};
