// Backend (CommonJS) version of the color name helper used in the frontend.
// Converts a hex color code into its closest human-readable name.

const NAMED_COLORS = {
    black: "#000000",
    dimgray: "#696969",
    gray: "#808080",
    darkgray: "#a9a9a9",
    silver: "#c0c0c0",
    lightgray: "#d3d3d3",
    gainsboro: "#dcdcdc",
    whitesmoke: "#f5f5f5",
    white: "#ffffff",
    rosybrown: "#bc8f8f",
    indianred: "#cd5c5c",
    brown: "#a52a2a",
    firebrick: "#b22222",
    lightcoral: "#f08080",
    maroon: "#800000",
    darkred: "#8b0000",
    red: "#ff0000",
    snow: "#fffafa",
    mistyrose: "#ffe4e1",
    salmon: "#fa8072",
    tomato: "#ff6347",
    darksalmon: "#e9967a",
    coral: "#ff7f50",
    orangered: "#ff4500",
    lightsalmon: "#ffa07a",
    sienna: "#a0522d",
    seashell: "#fff5ee",
    chocolate: "#d2691e",
    saddlebrown: "#8b4513",
    sandybrown: "#f4a460",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    linen: "#faf0e6",
    bisque: "#ffe4c4",
    darkorange: "#ff8c00",
    burlywood: "#deb887",
    tan: "#d2b48c",
    antiquewhite: "#faebd7",
    navajowhite: "#ffdead",
    blanchedalmond: "#ffebcd",
    papayawhip: "#ffefd5",
    moccasin: "#ffe4b5",
    orange: "#ffa500",
    wheat: "#f5deb3",
    oldlace: "#fdf5e6",
    floralwhite: "#fffaf0",
    goldenrod: "#daa520",
    darkgoldenrod: "#b8860b",
    cornsilk: "#fff8dc",
    gold: "#ffd700",
    khaki: "#f0e68c",
    lemonchiffon: "#fffacd",
    palegoldenrod: "#eee8aa",
    darkkhaki: "#bdb76b",
    beige: "#f5f5dc",
    lightgoldenrodyellow: "#fafad2",
    olive: "#808000",
    yellow: "#ffff00",
    lightyellow: "#ffffe0",
    ivory: "#fffff0",
    olivedrab: "#6b8e23",
    yellowgreen: "#9acd32",
    darkolivegreen: "#556b2f",
    greenyellow: "#adff2f",
    lawngreen: "#7cfc00",
    chartreuse: "#7fff00",
    honeydew: "#f0fff0",
    darkseagreen: "#8fbc8f",
    palegreen: "#98fb98",
    lightgreen: "#90ee90",
    forestgreen: "#228b22",
    limegreen: "#32cd32",
    lime: "#00ff00",
    seagreen: "#2e8b57",
    mediumseagreen: "#3cb371",
    green: "#008000",
    darkgreen: "#006400",
    mediumspringgreen: "#00fa9a",
    springgreen: "#00ff7f",
    mintcream: "#f5fffa",
    mediumaquamarine: "#66cdaa",
    aquamarine: "#7fffd4",
    turquoise: "#40e0d0",
    lightseagreen: "#20b2aa",
    mediumturquoise: "#48d1cc",
    darkslategray: "#2f4f4f",
    paleturquoise: "#afeeee",
    teal: "#008080",
    darkcyan: "#008b8b",
    cyan: "#00ffff",
    lightcyan: "#e0ffff",
    azure: "#f0ffff",
    darkturquoise: "#00ced1",
    cadetblue: "#5f9ea0",
    powderblue: "#b0e0e6",
    lightblue: "#add8e6",
    deepskyblue: "#00bfff",
    skyblue: "#87ceeb",
    lightskyblue: "#87cefa",
    steelblue: "#4682b4",
    aliceblue: "#f0f8ff",
    dodgerblue: "#1e90ff",
    slategray: "#708090",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    cornflowerblue: "#6495ed",
    royalblue: "#4169e1",
    ghostwhite: "#f8f8ff",
    lavender: "#e6e6fa",
    midnightblue: "#191970",
    navy: "#000080",
    darkblue: "#00008b",
    mediumblue: "#0000cd",
    blue: "#0000ff",
    indigo: "#4b0082",
    darkslateblue: "#483d8b",
    slateblue: "#6a5acd",
    mediumslateblue: "#7b68ee",
    mediumpurple: "#9370db",
    darkorchid: "#9932cc",
    darkviolet: "#9400d3",
    darkmagenta: "#8b008b",
    purple: "#800080",
    blueviolet: "#8a2be2",
    mediumorchid: "#ba55d3",
    thistle: "#d8bfd8",
    plum: "#dda0dd",
    violet: "#ee82ee",
    magenta: "#ff00ff",
    orchid: "#da70d6",
    mediumvioletred: "#c71585",
    deeppink: "#ff1493",
    hotpink: "#ff69b4",
    lavenderblush: "#fff0f5",
    palevioletred: "#db7093",
    crimson: "#dc143c",
    pink: "#ffc0cb",
    lightpink: "#ffb6c1"
};

const NAMED_COLOR_ENTRIES = Object.entries(NAMED_COLORS).map(([name, hex]) => ({
    name,
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

function toTitleCase(name) {
    const spaced = name
        .replace(/(dark|light|medium|pale|deep)(?=[a-z])/g, "$1 ")
        .trim();
    return spaced
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

const isHexColor = (value) =>
    typeof value === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());

const getColorName = (value) => {
    if (!value || typeof value !== "string") return "Color";
    const trimmed = value.trim();

    if (!isHexColor(trimmed)) {
        return trimmed;
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

    return closest ? toTitleCase(closest) : trimmed.toUpperCase();
};

module.exports = { isHexColor, getColorName };
