/**
 * Non-blocking analytics middleware to detect bot traffic
 */
exports.analyticsBotFilter = (req, res, next) => {
    const ua = (req.headers["user-agent"] || "").toLowerCase();
    
    // Check common bot / crawler user agents
    if (
        /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit/i.test(ua)
    ) {
        req.isBot = true;
    } else {
        req.isBot = false;
    }
    
    next();
};
