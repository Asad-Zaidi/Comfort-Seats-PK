// Utility to enforce strong password policies and reject common dictionary words

const COMMON_DICTIONARY_PASSWORDS = new Set([
    'password', 'password123', 'admin', 'admin123', 'admin@123', 'administrator',
    '123456', '12345678', '123456789', 'qwerty', 'qwerty123', 'comfortseats',
    'comfortseatspk', 'comfort123', 'welcome', 'welcome123', 'letmein', 'pass1234',
    'pakistan', 'pakistan123', 'secret', 'changeme', 'iloveyou', 'testing123', 'saqib'
]);

/**
 * Validates whether a password meets security standards:
 * - At least 8 characters
 * - Uppercase, lowercase, numeric, and special character
 * - Not a common dictionary word
 * - Does not contain email username or name
 */
const validateStrongPassword = (password, context = {}) => {
    if (!password || typeof password !== 'string') {
        return { isValid: false, message: 'Password is required.' };
    }

    if (password.length < 12) {
        return { isValid: false, message: 'Password must be at least 12 characters long.' };
    }

    if (password.length > 128) {
        return { isValid: false, message: 'Password cannot exceed 128 characters.' };
    }

    const lowerPassword = password.toLowerCase();

    // Check against common dictionary words
    if (COMMON_DICTIONARY_PASSWORDS.has(lowerPassword)) {
        return { isValid: false, message: 'Password is too common and easily guessable. Please choose a stronger password.' };
    }

    // Require character classes
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecial) {
        return {
            isValid: false,
            message: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.'
        };
    }

    // Check context (name, email)
    if (context.email) {
        const emailUsername = context.email.split('@')[0].toLowerCase();
        if (emailUsername.length >= 3 && lowerPassword.includes(emailUsername)) {
            return { isValid: false, message: 'Password cannot contain parts of your email address.' };
        }
    }

    if (context.name) {
        const namePart = context.name.trim().toLowerCase();
        if (namePart.length >= 3 && lowerPassword.includes(namePart)) {
            return { isValid: false, message: 'Password cannot contain your name.' };
        }
    }

    return { isValid: true };
};

module.exports = {
    validateStrongPassword,
    COMMON_DICTIONARY_PASSWORDS
};
