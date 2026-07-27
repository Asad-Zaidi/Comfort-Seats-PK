// Converts a hex color code into its closest basic solid color name.
// Simplified dictionary containing basic solid colors (White, Black, Gray, Brown, Red, Green, Blue, etc.)

export const NAMED_COLORS = {
    Black: "#000000",
    Charcoal: "#36454F",
    White: "#FFFFFF",
    Cream: "#FFFDD0",
    Gray: "#808080",
    Silver: "#C0C0C0",
    Brown: "#8B4513",
    Beige: "#F5F5DC",
    Gold: "#FFD700",
    Red: "#FF0000",
    Maroon: "#800000",
    Orange: "#FFA500",
    Yellow: "#FFFF00",
    Green: "#008000",
    Olive: "#808000",
    Lime: "#00FF00",
    Teal: "#008080",
    Cyan: "#00FFFF",
    Blue: "#0000FF",
    Navy: "#000080",
    SkyBlue: "#87CEEB",
    Purple: "#800080",
    Pink: "#FFC0CB",
};

export const PREDEFINED_COLORS = Object.entries(NAMED_COLORS).map(([name, hex]) => ({
    name: name.replace(/([a-z])([A-Z])/g, "$1 $2"), // e.g. "SkyBlue" -> "Sky Blue"
    hex
}));

const NAMED_COLOR_ENTRIES = Object.entries(NAMED_COLORS).map(([name, hex]) => ({
    name: name.replace(/([a-z])([A-Z])/g, "$1 $2"),
    rgb: hexToRgb(hex)
}));

function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const full = clean.length === 3
        ? clean.split("").map((c) => c + c).join("")
        : clean;
    const num = parseInt(full, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

export const isHexColor = (value) =>
    typeof value === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());

/**
 * Returns the closest basic solid color name for a given hex color code.
 * Falls back to original string if not a hex code.
 */
export const getColorName = (value) => {
    if (!value || typeof value !== "string") return "Color";
    const trimmed = value.trim();

    if (!isHexColor(trimmed)) {
        return trimmed; // already a plain label like "Red" from the database
    }

    const target = hexToRgb(trimmed);

    let closest = null;
    let closestDistance = Infinity;

    for (const entry of NAMED_COLOR_ENTRIES) {
        const dr = target.r - entry.rgb.r;
        const dg = target.g - entry.rgb.g;
        const db = target.b - entry.rgb.b;
        const distance = dr * dr + dg * dg + db * db;

        if (distance < closestDistance) {
            closestDistance = distance;
            closest = entry.name;
        }
    }

    return closest || trimmed.toUpperCase();
};