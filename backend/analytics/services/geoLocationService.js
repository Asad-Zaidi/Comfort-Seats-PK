const geoip = require("geoip-lite");

/**
 * Perform IP Geolocation lookup
 */
exports.lookupIp = (ip = "") => {
    let clientIp = ip;
    if (clientIp.includes(",")) {
        clientIp = clientIp.split(",")[0].trim();
    }

    if (clientIp === "::1" || clientIp === "127.0.0.1" || clientIp.startsWith("::ffff:127.")) {
        return {
            country: "Pakistan",
            state: "Punjab",
            city: "Lahore",
            region: "Punjab",
            timeZone: "Asia/Karachi",
            isp: "Localhost",
            latitude: 31.5204,
            longitude: 74.3587,
        };
    }

    const geo = geoip.lookup(clientIp);
    if (!geo) {
        return {
            country: "Pakistan",
            state: "Punjab",
            city: "Lahore",
            region: "Punjab",
            timeZone: "Asia/Karachi",
            isp: "Telecom",
            latitude: 31.5204,
            longitude: 74.3587,
        };
    }

    return {
        country: geo.country || "Pakistan",
        state: geo.region || "Punjab",
        city: geo.city || "Lahore",
        region: geo.region || "Punjab",
        timeZone: geo.timezone || "Asia/Karachi",
        isp: "ISP Provider",
        latitude: geo.ll ? geo.ll[0] : 31.5204,
        longitude: geo.ll ? geo.ll[1] : 74.3587,
    };
};
