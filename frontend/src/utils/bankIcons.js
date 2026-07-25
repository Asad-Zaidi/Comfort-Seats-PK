/**
 * Centralized bank icon mapping utility.
 * Maps bank/wallet names to their icon imports from assets/bank_icons/.
 * Used by both the Admin Panel (bank dropdown) and Checkout (logo display).
 */

// Import all bank icons
import meezanLogo from '../assets/bank_icons/meezan-bank-logo.png';
import hblLogo from '../assets/bank_icons/HBL-logo.png';
import ublLogo from '../assets/bank_icons/UBL-Bank-Logo.png';
import alliedLogo from '../assets/bank_icons/allied-bank-limited-logo.png';
import alfalahLogo from '../assets/bank_icons/bank-alfalah-logo.png';
import alHabibLogo from '../assets/bank_icons/bank-al-habib-logo.png';
import faysalLogo from '../assets/bank_icons/faysal-bank-logo.png';
import mcbLogo from '../assets/bank_icons/mcb-logo.png';
import jsLogo from '../assets/bank_icons/js-bank-logo.png';
import nbpLogo from '../assets/bank_icons/national-bank-of-pakistan-logo.png';
import soneriLogo from '../assets/bank_icons/soneri-bank-logo.png';
import silkLogo from '../assets/bank_icons/Silk-Bank-Logo.png';
import sindhLogo from '../assets/bank_icons/Sindh-Bank-Logo.png';
import bopLogo from '../assets/bank_icons/Bank-of-punjab-Logo.png';
import bokLogo from '../assets/bank_icons/Bank-Of-Khyber-Logo.png';
import jazzcashLogo from '../assets/bank_icons/Jazzcash-logo.png';
import easypaisaLogo from '../assets/bank_icons/Easypaisa-logo.png';
import sadapayLogo from '../assets/bank_icons/Sadapay-Logo.png';
import nayapayLogo from '../assets/bank_icons/nayapay-logo.png';
import raastLogo from '../assets/bank_icons/Raast-Logo.png';

/**
 * Map of bank/wallet display names to their local icon paths.
 * The keys are used as dropdown options in the Admin Panel.
 */
export const BANK_ICON_MAP = {
    'Meezan Bank': meezanLogo,
    'HBL': hblLogo,
    'UBL Bank': ublLogo,
    'Allied Bank': alliedLogo,
    'Bank Alfalah': alfalahLogo,
    'Bank Al Habib': alHabibLogo,
    'Faysal Bank': faysalLogo,
    'MCB': mcbLogo,
    'JS Bank': jsLogo,
    'National Bank': nbpLogo,
    'Soneri Bank': soneriLogo,
    'Silk Bank': silkLogo,
    'Sindh Bank': sindhLogo,
    'Bank of Punjab': bopLogo,
    'Bank of Khyber': bokLogo,
    'JazzCash': jazzcashLogo,
    'Easypaisa': easypaisaLogo,
    'SadaPay': sadapayLogo,
    'NayaPay': nayapayLogo,
    'Raast': raastLogo,
};

/** All available bank names (sorted) for dropdown population */
export const AVAILABLE_BANKS = Object.keys(BANK_ICON_MAP).sort();

/** Payment type options */
export const PAYMENT_TYPES = ['Bank', 'Mobile Wallet', 'Digital Payment', 'Other'];

/**
 * Get the display icon for a payment method.
 * Priority: customLogo (Cloudinary URL) > icon key (local asset) > fallback null
 */
export const getBankIcon = (iconKey, customLogo) => {
    if (customLogo) return customLogo;
    if (iconKey && BANK_ICON_MAP[iconKey]) return BANK_ICON_MAP[iconKey];
    return null;
};
