require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser'); // Important for credentials/sessions
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const contactRoutes = require("./routes/contactRoutes");
const siteContentRoutes = require("./routes/siteContentRoutes");
const adminRoutes = require("./routes/adminRoutes"); // Import admin routes
const paymentSettingsRoutes = require("./routes/paymentmethodRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customizationRoutes = require("./routes/customizationRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const sitemapRoutes = require("./routes/sitemapRoutes");
const themeRoutes = require("./routes/themeRoutes");


const app = express();

// Define the allowed origin
const allowedOrigins = [
    'https://comfortseatspk.com',
    'https://www.comfortseatspk.com',
    'http://localhost:3000' // For local development
];

const corsOptions = {
    // The origin property can be a string, regex, or a function.
    // Here, we check if the request's origin is in our allowed list.
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    // This is essential for your frontend to be able to send cookies
    credentials: true,
    // Optionally, you can expose specific headers
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    // Optionally, you can specify which methods are allowed
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

// Enable CORS with the specified options
app.use(cors(corsOptions));

// Also, enable a pre-flight across-the-board for all routes
// This will handle the OPTIONS requests that browsers send first.
app.options('*', cors(corsOptions));

// Middleware for parsing cookies, which is necessary for `withCredentials: true`
app.use(cookieParser());

// Middleware for parsing JSON and urlencoded request bodies (50mb limit for image payloads & branding settings)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// HTTP request logger middleware
app.use(morgan("dev"));

connectDB();

app.get("/", (req, res) => {
    res.json({ message: "Backend is Running Locally" });
});

// Serve the dynamically generated XML sitemap (includes all products)
app.use("/", sitemapRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes); // Use admin routes
app.use("/api/site-content", siteContentRoutes);
app.use("/api/payment-settings", paymentSettingsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customizations", customizationRoutes);
app.use("/api/announcement", announcementRoutes);
app.use("/api/themes", themeRoutes);

module.exports = app;