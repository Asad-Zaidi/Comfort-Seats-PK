const express = require("express");
const router = express.Router();
const { generateSitemap } = require("../controllers/sitemapController");

// Serve the dynamically generated XML sitemap (includes products)
router.get("/sitemap.xml", generateSitemap);

module.exports = router;