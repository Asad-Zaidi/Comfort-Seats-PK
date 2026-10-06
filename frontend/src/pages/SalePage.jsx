import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    FiPercent,
    FiClock,
    FiSearch,
    FiArrowRight,
    FiShoppingBag,
    FiTag,
} from "react-icons/fi";
import api from "../api/api";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import { getProductCardImages } from "../utils/imageUtils";
import { SkeletonProductCard } from "../components/SkeletonLoaders";

const SalePage = () => {
    const [campaign, setCampaign] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [sortBy, setSortBy] = useState("DEFAULT");

    // Dynamic countdown timer
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: false,
    });

    // 1. Fetch active sales campaign & sale products
    useEffect(() => {
        let isMounted = true;

        const fetchSaleData = async () => {
            setLoading(true);
            try {
                // Fetch active sale campaign
                const campaignRes = await api.get("/sales/active");
                if (campaignRes.data?.success && campaignRes.data.data) {
                    const activeCamp = campaignRes.data.data;
                    if (isMounted) {
                        setCampaign(activeCamp);
                    }

                    // Check if campaign has populated saleProducts
                    if (Array.isArray(activeCamp.saleProducts) && activeCamp.saleProducts.length > 0) {
                        // If objects are populated
                        if (typeof activeCamp.saleProducts[0] === "object") {
                            if (isMounted) setProducts(activeCamp.saleProducts.filter(p => p && p._id));
                        } else {
                            // If they are IDs, fetch products
                            const prodRes = await api.get("/products?limit=500");
                            const allProds = prodRes.data?.data || prodRes.data || [];
                            const idSet = new Set(activeCamp.saleProducts.map(String));
                            const filtered = allProds.filter(p => idSet.has(String(p._id)));
                            if (isMounted) setProducts(filtered);
                        }
                    } else if (activeCamp.productId) {
                        // Single featured product
                        try {
                            const singleRes = await api.get(`/products/${activeCamp.productId}`);
                            if (singleRes.data?.success && singleRes.data.data && isMounted) {
                                setProducts([singleRes.data.data]);
                            }
                        } catch (e) {
                            // Fallback
                        }
                    } else {
                        // Storewide sale or no specific products picked -> fetch all products with discounts or all products
                        const prodRes = await api.get("/products?limit=100");
                        const allProds = prodRes.data?.data || prodRes.data || [];
                        if (isMounted) setProducts(allProds);
                    }
                } else {
                    if (isMounted) {
                        setCampaign(null);
                        setProducts([]);
                    }
                }
            } catch (err) {
                console.error("[SalePage] Error loading sale data:", err);
                if (isMounted) {
                    setCampaign(null);
                    setProducts([]);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchSaleData();

        return () => {
            isMounted = false;
        };
    }, []);

    // 2. Countdown calculation
    useEffect(() => {
        if (!campaign || !campaign.endDate) return;

        const targetTime = new Date(campaign.endDate).getTime();

        const updateTimer = () => {
            const now = Date.now();
            const difference = targetTime - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, expired: false });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [campaign]);

    // Categories available in sale products
    const availableCategories = useMemo(() => {
        const cats = new Set();
        products.forEach(p => {
            if (p.category) {
                if (Array.isArray(p.category)) {
                    p.category.forEach(c => cats.add(c));
                } else if (typeof p.category === "object" && p.category.name) {
                    cats.add(p.category.name);
                } else {
                    cats.add(String(p.category));
                }
            }
        });
        return ["ALL", ...Array.from(cats)];
    }, [products]);

    // Filter & Sort Products
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search query filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name?.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                (p.category && String(p.category).toLowerCase().includes(query))
            );
        }

        // Category filter
        if (selectedCategory !== "ALL") {
            result = result.filter(p => {
                if (!p.category) return false;
                if (Array.isArray(p.category)) return p.category.includes(selectedCategory);
                if (typeof p.category === "object" && p.category.name) return p.category.name === selectedCategory;
                return String(p.category) === selectedCategory;
            });
        }

        // Sorting
        if (sortBy === "PRICE_LOW") {
            result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === "PRICE_HIGH") {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === "NAME_ASC") {
            result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        }

        return result;
    }, [products, searchQuery, selectedCategory, sortBy]);

    const isCampaignActive = Boolean(
        campaign &&
        campaign.status === "ACTIVE" &&
        campaign.isSalePageEnabled !== false &&
        campaign.isPopupEnabled !== false &&
        (!timeLeft.expired || !campaign.endDate)
    );

    // Hero title & banner styling
    const heroTitle = campaign?.campaignName || campaign?.heading || "Special Sales Campaign";
    const heroBadge = campaign?.badgeText || "LIMITED TIME OFFER";

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--bg-main, #ffffff)" }}>
            <SEO
                title={isCampaignActive ? `${heroTitle} — Exclusive Deals | Comfort Seats PK` : "Sale & Promotional Deals | Comfort Seats PK"}
                description={campaign?.description || "Browse exclusive limited-time promotional sale discounts and offers on premium ergonomic chairs and furniture at Comfort Seats PK."}
                keywords="sale, deals, discounts, chairs, furniture, comfort seats pk"
            />

            {/* 1. HERO / SALE BANNER SECTION */}
            {isCampaignActive ? (
                <div className="relative overflow-hidden border-b border-gray-200/60 bg-slate-950 text-white">
                    {/* Background Banner Image (3:2 artwork) */}
                    {campaign.image?.url && (
                        <div className="absolute inset-0 z-0">
                            <img
                                src={campaign.image.url}
                                alt={heroTitle}
                                className="w-full h-full object-cover object-center opacity-35 filter blur-[1px] transform scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                        </div>
                    )}

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 flex flex-col items-center text-center">
                        {/* Sale Tag / Badge */}
                        <div className="mb-4">
                            <span
                                style={{
                                    backgroundColor: "var(--secondary, #F5A524)",
                                    color: "#12131A",
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-md"
                            >
                                <FiPercent size={13} className="animate-pulse" />
                                {heroBadge}
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] text-white">
                            {heroTitle}
                        </h1>

                        {/* Optional Discount Highlight */}
                        {campaign.discountText && (
                            <div className="mt-4">
                                <span
                                    style={{
                                        backgroundColor: "var(--product-discount-color, var(--error, #E5484D))",
                                    }}
                                    className="inline-block px-5 py-2 rounded-2xl text-white font-extrabold text-base sm:text-xl uppercase tracking-wider shadow-lg"
                                >
                                    {campaign.discountText}
                                </span>
                            </div>
                        )}

                        {/* Description */}
                        {campaign.description && (
                            <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] font-medium">
                                {campaign.description}
                            </p>
                        )}

                        {/* Live Countdown Timer Banner */}
                        {campaign.countdownEnabled && campaign.endDate && !timeLeft.expired && (
                            <div className="mt-8 pt-6 border-t border-white/20 w-full max-w-md">
                                <div
                                    style={{ color: "var(--secondary, #F5A524)" }}
                                    className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider mb-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                                >
                                    <FiClock size={15} />
                                    <span>Sale Ends In</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-xs mx-auto">
                                    {[
                                        { label: "DAYS", val: timeLeft.days },
                                        { label: "HOURS", val: timeLeft.hours },
                                        { label: "MINS", val: timeLeft.minutes },
                                        { label: "SECS", val: timeLeft.seconds },
                                    ].map((seg, idx) => (
                                        <div
                                            key={idx}
                                            className="p-2 sm:p-2.5 rounded-xl bg-black/70 border border-white/20 text-white shadow-lg text-center"
                                        >
                                            <span className="text-xl sm:text-2xl font-black font-mono leading-none block">
                                                {String(seg.val).padStart(2, "0")}
                                            </span>
                                            <span className="text-[8px] sm:text-[9px] text-gray-300 font-bold uppercase block mt-1 tracking-wider">
                                                {seg.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* INACTIVE SALE / OFF STATE HERO */
                <div className="py-16 sm:py-20 px-4 text-center border-b border-gray-100 bg-gray-50/50">
                    <div className="max-w-md mx-auto space-y-4">
                        <div
                            style={{
                                backgroundColor: "color-mix(in srgb, var(--primary, #2F6FED) 10%, transparent)",
                                color: "var(--primary, #2F6FED)",
                            }}
                            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto"
                        >
                            <FiShoppingBag size={30} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                            No Active Sales Campaign
                        </h1>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Our special promotional sale is currently paused or has ended. Stay tuned for our upcoming seasonal sales and limited-time deals!
                        </p>
                        <div className="pt-2">
                            <Link
                                to="/products"
                                style={{
                                    backgroundColor: "var(--btn-primary-bg, var(--primary, #2F6FED))",
                                    color: "var(--btn-primary-text, #ffffff)",
                                    borderRadius: "var(--card-border-radius, 1rem)",
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold shadow-md hover:opacity-90 transition"
                            >
                                <span>Browse All Products</span>
                                <FiArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. SALE PRODUCTS CATALOG SECTION */}
            {isCampaignActive && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                    {/* Filter & Search Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-200">
                        {/* Search Input */}
                        <div className="relative w-full md:w-80">
                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search sale items..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/15 transition bg-white"
                            />
                        </div>

                        {/* Category Filter Pills & Sort Dropdown */}
                        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                            {/* Categories */}
                            {availableCategories.length > 2 && (
                                <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-full py-1">
                                    {availableCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            style={{
                                                backgroundColor: selectedCategory === cat
                                                    ? "var(--primary, #2F6FED)"
                                                    : "color-mix(in srgb, var(--bg-secondary, #f1f5f9) 90%, transparent)",
                                                color: selectedCategory === cat
                                                    ? "#ffffff"
                                                    : "var(--text, #1e293b)",
                                            }}
                                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap"
                                        >
                                            {cat === "ALL" ? "All Deals" : cat}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white outline-none cursor-pointer"
                            >
                                <option value="DEFAULT">Featured Deals</option>
                                <option value="PRICE_LOW">Price: Low to High</option>
                                <option value="PRICE_HIGH">Price: High to Low</option>
                                <option value="NAME_ASC">Product Name (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    {/* Product Grid Count Label */}
                    <div className="flex items-center justify-between py-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Showing <span className="text-gray-900">{filteredProducts.length}</span> items on sale
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[var(--primary,#2F6FED)] transition"
                        >
                            <span>View Storewide Catalog</span>
                            <FiArrowRight size={12} />
                        </Link>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <SkeletonProductCard key={i} />
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-gray-100 p-8 my-6">
                            <FiTag size={36} className="mx-auto text-gray-300 mb-3" />
                            <h3 className="text-lg font-bold text-gray-800">No sale products match your filter</h3>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
                                Try clearing your search keyword or switching categories to see other sale items.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategory("ALL"); }}
                                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => {
                                const { primaryImage, hoverImage } = getProductCardImages(product);
                                const categoryName = Array.isArray(product.category)
                                    ? product.category[0]
                                    : (product.category?.name || product.category || "");

                                return (
                                    <div key={product._id} className="flex justify-center">
                                        <ProductCard
                                            product={product}
                                            image={primaryImage || product.imageUrl || "https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=500"}
                                            hoverImage={hoverImage}
                                            name={product.name}
                                            price={product.price}
                                            description={product.shortDescription || product.description || ""}
                                            rating={product.ratings || product.avgRating || 5}
                                            reviews={product.numOfReviews || product.totalReviews || 0}
                                            category={categoryName}
                                            to={product.slug ? `/products/${product.slug}` : `/products/${product._id}`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SalePage;
