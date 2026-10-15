const rateLimit = require('express-rate-limit');

// Strict rate limiter for admin login endpoint to prevent brute-force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many login attempts from this IP address. Please try again after 15 minutes.'
    },
    // Only count failed attempts or all requests to prevent credential stuffing
    skipSuccessfulRequests: false
});

// General API rate limiter for overall traffic abuse prevention
const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});

// Rate limiter for password reset requests to protect email quota & prevent brute force
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset attempts. Please wait 15 minutes before trying again.'
    }
});

module.exports = {
    loginLimiter,
    passwordResetLimiter,
    generalApiLimiter
};
