const Product = require("../models/Product");
const SiteContent = require("../models/SiteContent");

// Build the absolute base URL from the incoming request so the sitemap
// works correctly regardless of the deployed domain/protocol.
const getBaseUrl = (req) => {
    if (process.env.SITE_URL) {
        return process.env.SITE_URL.replace(/\/+$/, "");
    }
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    return protocol + "://" + req.headers.host;
};

// Escape XML special characters in URLs/text. The entities are built via
// string concatenation to avoid encoding issues in source files.
const escapeXml = (str) => {
    const map = {
        "&": "&" + "amp;",
        "<": "&" + "lt;",
        ">": "&" + "gt;",
        '"': "&" + "quot;",
        "'": "&" + "apos;",
    };
    return String(str).replace(/[&<>"']/g, (ch) => map[ch]);
};

const buildUrlEntry = (loc, lastmod, changefreq, priority) => {
    const parts = ["    <loc>" + escapeXml(loc) + "</loc>"];
    if (lastmod) parts.push("    <lastmod>" + lastmod + "</lastmod>");
    if (changefreq) parts.push("    <changefreq>" + changefreq + "</changefreq>");
    if (priority) parts.push("    <priority>" + priority + "</priority>");
    return "  <url>\n" + parts.join("\n") + "\n  </url>";
};

const generateSitemap = async (req, res) => {
    try {
        const baseUrl = getBaseUrl(req);
        const today = new Date().toISOString().split("T")[0];

        const urls = [];

        // Static pages
        urls.push(buildUrlEntry(baseUrl + "/", today, "daily", "1.0"));
        urls.push(buildUrlEntry(baseUrl + "/products", today, "daily", "0.9"));
        urls.push(buildUrlEntry(baseUrl + "/about", today, "monthly", "0.6"));
        urls.push(buildUrlEntry(baseUrl + "/contact", today, "monthly", "0.6"));
        urls.push(buildUrlEntry(baseUrl + "/checkout", today, "yearly", "0.3"));

        // Category listing pages
        const siteContent = await SiteContent.findOne().lean();
        const categories = siteContent ? siteContent.categories || [] : [];
        categories.forEach((cat) => {
            if (cat && cat.name) {
                const catSlug = cat.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w-]/g, "");
                urls.push(
                    buildUrlEntry(
                        baseUrl + "/products?category=" + encodeURIComponent(cat.name),
                        today,
                        "weekly",
                        "0.7"
                    )
                );
                // Reference the slug form as well (used by product detail links)
                if (catSlug) {
                    urls.push(buildUrlEntry(baseUrl + "/products/" + catSlug, today, "weekly", "0.5"));
                }
            }
        });

        // Dynamic product pages
        const products = await Product.find({}, "slug subcategory updatedAt createdAt").lean();
        products.forEach((product) => {
            if (!product.slug) return;
            const lastmod = (product.updatedAt || product.createdAt || new Date())
                .toISOString()
                .split("T")[0];
            urls.push(
                buildUrlEntry(baseUrl + "/products/" + product.slug, lastmod, "weekly", "0.8")
            );
            // Also include the optional subcategory filter URL for the product's subcategory
            if (product.subcategory) {
                // derive category slug from the product slug (first segment)
                const firstSlash = product.slug.indexOf("/");
                const categorySlug = firstSlash > -1 ? product.slug.substring(0, firstSlash) : "";
                if (categorySlug) {
                    urls.push(
                        buildUrlEntry(
                            baseUrl + "/products?category=" + encodeURIComponent(categorySlug) +
                            "&subcategory=" + encodeURIComponent(product.subcategory),
                            lastmod,
                            "monthly",
                            "0.4"
                        )
                    );
                }
            }
        });

        const xml =
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            urls.join("\n") +
            "\n</urlset>";

        res.header("Content-Type", "application/xml");
        res.send(xml);
    } catch (err) {
        console.error("Sitemap generation failed:", err);
        res.status(500).json({ success: false, message: "Failed to generate sitemap" });
    }
};

module.exports = { generateSitemap };