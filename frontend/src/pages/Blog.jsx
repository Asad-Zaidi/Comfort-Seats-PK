import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import SEO from "../components/SEO";
import { useSiteConfig } from "../utils/siteConfig";
import {
    FiCalendar,
    FiClock,
    FiArrowRight,
    FiSearch,
    FiX,
    FiTrendingUp,
    FiRefreshCw,
    FiBookOpen,
    FiUser,
    FiAlertCircle
} from "react-icons/fi";
import { FaBlog } from "react-icons/fa";

const DEFAULT_CATEGORIES = [
    "All",
    "Office Chairs",
    "Gaming Chairs",
    "Ergonomics",
    "Furniture",
    "Workspace",
    "Buying Guides",
    "Tips & Advice"
];

const INITIAL_PAGE_SIZE = 6;
const LOAD_MORE_STEP = 6;

const Blog = () => {
    const { siteName, siteUrl } = useSiteConfig();

    // State
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

    // Debounce search query to prevent redundant filtering / re-renders
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim().toLowerCase());
            setVisibleCount(INITIAL_PAGE_SIZE); // reset pagination on search change
        }, 250);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset pagination when category changes
    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setVisibleCount(INITIAL_PAGE_SIZE);
    };

    // Fetch blogs and dynamic categories from backend
    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/blogs?published=true&limit=200");
            if (res.data?.success && Array.isArray(res.data?.data)) {
                const publishedBlogs = res.data.data.filter((b) => b.isPublished !== false);
                setBlogs(publishedBlogs);

                // Collect and merge dynamic categories from backend data
                const backendCategories = res.data.categories || [];
                const postCategories = publishedBlogs.map((b) => b.category).filter(Boolean);
                const uniqueCategories = Array.from(
                    new Set(["All", ...DEFAULT_CATEGORIES.slice(1), ...backendCategories, ...postCategories])
                );
                setCategories(uniqueCategories);
            } else {
                setBlogs([]);
            }
        } catch (err) {
            console.error("Failed to load blog posts:", err);
            setError("Unable to load articles right now. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    // Filter blogs based on category and debounced search
    const filteredBlogs = useMemo(() => {
        return blogs.filter((blog) => {
            const blogCategory = (blog.category || "General").toLowerCase();
            const matchesCategory =
                selectedCategory === "All" || blogCategory === selectedCategory.toLowerCase();

            if (!matchesCategory) return false;

            if (!debouncedSearch) return true;

            const titleMatch = blog.title?.toLowerCase().includes(debouncedSearch);
            const summaryMatch = blog.summary?.toLowerCase().includes(debouncedSearch);
            const categoryMatch = blog.category?.toLowerCase().includes(debouncedSearch);
            const tagMatch =
                Array.isArray(blog.tags) &&
                blog.tags.some((t) => t.toLowerCase().includes(debouncedSearch));

            return titleMatch || summaryMatch || categoryMatch || tagMatch;
        });
    }, [blogs, selectedCategory, debouncedSearch]);

    // Identify Featured Article (Priority: flagged isFeatured, otherwise top blog when in "All" with no search)
    const featuredBlog = useMemo(() => {
        if (debouncedSearch) return null;
        if (selectedCategory !== "All") return null;

        // Try finding explicitly featured post
        const explicitlyFeatured = blogs.find((b) => b.isFeatured);
        if (explicitlyFeatured) return explicitlyFeatured;

        // Fallback to latest first blog if more than 1 post exists
        return blogs.length > 0 ? blogs[0] : null;
    }, [blogs, selectedCategory, debouncedSearch]);

    // Grid blogs (excluding the featured blog if one is displayed)
    const gridBlogs = useMemo(() => {
        if (!featuredBlog) return filteredBlogs;
        return filteredBlogs.filter((b) => b._id !== featuredBlog._id);
    }, [filteredBlogs, featuredBlog]);

    // Paginated subset
    const displayedGridBlogs = useMemo(() => {
        return gridBlogs.slice(0, visibleCount);
    }, [gridBlogs, visibleCount]);

    const hasMore = visibleCount < gridBlogs.length;

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + LOAD_MORE_STEP);
    };

    const handleResetFilters = () => {
        setSelectedCategory("All");
        setSearchQuery("");
        setDebouncedSearch("");
        setVisibleCount(INITIAL_PAGE_SIZE);
    };

    // JSON-LD Structured Data Schema for Blog Collection
    const blogCollectionSchema = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": `Blog & Insights - ${siteName || "Comfort Seats PK"}`,
        "description":
            "Explore helpful guides, expert tips, product insights, and inspiration to create a more comfortable workspace and home.",
        "url": `${siteUrl || "https://comfortseatspk.com"}/blog`,
        "publisher": {
            "@type": "Organization",
            "name": siteName || "Comfort Seats PK",
            "url": siteUrl || "https://comfortseatspk.com",
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl || "https://comfortseatspk.com"}/logo.png`
            }
        },
        "blogPost": filteredBlogs.slice(0, 10).map((b) => ({
            "@type": "BlogPosting",
            "headline": b.title,
            "description": b.summary || b.title,
            "url": `${siteUrl || "https://comfortseatspk.com"}/blog/${b.slug || b._id}`,
            "datePublished": b.createdAt,
            "dateModified": b.updatedAt || b.createdAt,
            "image": b.thumbnail || b.banner,
            "author": {
                "@type": "Person",
                "name": b.author || "Comfort Seats PK"
            }
        }))
    };

    return (
        <main className="min-h-screen bg-[var(--bg,#FAF9F6)] text-[var(--text,#12131A)] py-8 sm:py-12 transition-colors">
            {/* SEO Meta Tags */}
            <SEO
                title={`Blog | ${siteName || "Comfort Seats PK"}`}
                description="Explore office chair guides, ergonomic tips, furniture insights, buying guides, and workspace inspiration from Comfort Seats PK."
                keywords="Office Chairs Lahore, Gaming Chairs Pakistan, Furniture Lahore, Ergonomic Chairs, Comfort Seats Blog, Office Ergonomics"
                url={`${siteUrl || "https://comfortseatspk.com"}/blog`}
            />

            {/* Injected JSON-LD Schema for Blog */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCollectionSchema) }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 1. BLOG HEADER SECTION */}
                <header className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider mb-3.5 shadow-2xs">
                        <FaBlog size={13} className="text-[var(--primary)]" />
                        <span>Insights, Guides & Inspiration</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text,#12131A)] tracking-tight leading-tight">
                        Comfort & Ergonomics Blog
                    </h1>

                    <p className="mt-3.5 text-sm sm:text-base text-[var(--text-secondary,#6b7280)] leading-relaxed max-w-2xl mx-auto">
                        Explore helpful guides, expert tips, product insights, and inspiration to create a more comfortable workspace and home.
                    </p>

                    {/* 8. SEARCH BAR */}
                    <div className="mt-6 relative max-w-lg mx-auto">
                        <label htmlFor="blog-search" className="sr-only">
                            Search articles
                        </label>
                        <FiSearch
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            size={18}
                            aria-hidden="true"
                        />
                        <input
                            id="blog-search"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search articles on posture, office chairs, buying guides..."
                            className="w-full pl-11 pr-10 py-3 text-xs sm:text-sm rounded-2xl border border-[var(--border,#e5e7eb)] bg-white text-[var(--text,#12131A)] shadow-xs focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_20%,transparent)] outline-none transition duration-200"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search input"
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
                            >
                                <FiX size={15} />
                            </button>
                        )}
                    </div>
                </header>

                {/* 2. CATEGORY NAVIGATION (Horizontal scroll on mobile) */}
                <nav
                    aria-label="Blog categories"
                    className="mb-10 sm:mb-12 border-b border-[var(--border,#e5e7eb)] pb-4"
                >
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0 sm:flex-wrap sm:justify-center">
                        {categories.map((cat) => {
                            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                            const postCount =
                                cat === "All"
                                    ? blogs.length
                                    : blogs.filter(
                                          (b) => (b.category || "General").toLowerCase() === cat.toLowerCase()
                                      ).length;

                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategoryChange(cat)}
                                    aria-pressed={isSelected}
                                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                                        isSelected
                                            ? "bg-[var(--primary)] text-white shadow-sm scale-102"
                                            : "bg-white text-[var(--text-secondary,#6b7280)] hover:bg-gray-100/80 border border-[var(--border,#e5e7eb)] hover:text-[var(--text,#12131A)]"
                                    }`}
                                >
                                    <span>{cat}</span>
                                    {postCount > 0 && (
                                        <span
                                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                                isSelected
                                                    ? "bg-white/20 text-white"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}
                                        >
                                            {postCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* 13. ERROR STATE */}
                {error && (
                    <div
                        role="alert"
                        className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-red-200 max-w-lg mx-auto shadow-xs space-y-4 my-8"
                    >
                        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                            <FiAlertCircle size={30} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Unable to load articles right now</h2>
                        <p className="text-xs text-gray-500 max-w-md mx-auto">{error}</p>
                        <button
                            type="button"
                            onClick={fetchBlogs}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-xs"
                        >
                            <FiRefreshCw size={14} />
                            <span>Try Again</span>
                        </button>
                    </div>
                )}

                {/* 11. LOADING STATE (SKELETON CARDS) */}
                {loading && (
                    <div
                        aria-live="polite"
                        aria-busy="true"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {[1, 2, 3, 4, 5, 6].map((idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-3xl border border-[var(--border,#e5e7eb)] overflow-hidden shadow-xs animate-pulse flex flex-col"
                            >
                                <div className="aspect-[16/9] bg-gray-200"></div>
                                <div className="p-6 space-y-3 flex-1 flex flex-col">
                                    <div className="h-3.5 bg-gray-200 rounded-full w-1/4"></div>
                                    <div className="h-5 bg-gray-200 rounded-lg w-5/6"></div>
                                    <div className="h-3.5 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3.5 bg-gray-200 rounded w-4/5"></div>
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 12. EMPTY STATE */}
                {!loading && !error && filteredBlogs.length === 0 && (
                    <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[var(--border,#e5e7eb)] max-w-lg mx-auto shadow-xs space-y-4 my-8">
                        <div className="h-16 w-16 bg-blue-50 text-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto">
                            <FiBookOpen size={30} />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-[var(--text,#12131A)]">
                            No articles found
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary,#6b7280)] leading-relaxed">
                            {debouncedSearch || selectedCategory !== "All"
                                ? "No blog articles match your current search criteria or category filter."
                                : "We're currently preparing new guides and articles. Check back soon!"}
                        </p>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-xs"
                        >
                            View All Articles
                        </button>
                    </div>
                )}

                {/* 5. FEATURED BLOG & MAIN GRID */}
                {!loading && !error && filteredBlogs.length > 0 && (
                    <div className="space-y-12">
                        {/* FEATURED BLOG CARD */}
                        {featuredBlog && (
                            <section aria-label="Featured article">
                                <div className="bg-white rounded-3xl border border-[var(--border,#e5e7eb)] shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden group">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                        {/* Featured Image */}
                                        <Link
                                            to={`/blog/${featuredBlog.slug || featuredBlog._id}`}
                                            className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-gray-100 block"
                                        >
                                            <img
                                                src={
                                                    featuredBlog.banner ||
                                                    featuredBlog.thumbnail ||
                                                    "https://images.unsplash.com/photo-1580481077197-2a4c1f93f6ea?auto=format&fit=crop&w=1200&q=80"
                                                }
                                                alt={featuredBlog.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                                            />
                                            {/* Category Badge on Featured Image */}
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3.5 py-1 rounded-full bg-[var(--primary)] text-white text-xs font-bold shadow-md flex items-center gap-1.5 uppercase tracking-wide">
                                                    <FiTrendingUp size={13} aria-hidden="true" />
                                                    <span>Featured Article</span>
                                                </span>
                                            </div>
                                        </Link>

                                        {/* Featured Content */}
                                        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary,#6b7280)] mb-3">
                                                    <span className="px-2.5 py-0.5 rounded-md bg-gray-100 font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                                                        {featuredBlog.category || "General"}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <FiCalendar size={12} aria-hidden="true" />
                                                        <time dateTime={featuredBlog.createdAt}>
                                                            {new Date(featuredBlog.createdAt).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric"
                                                            })}
                                                        </time>
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <FiClock size={12} aria-hidden="true" />
                                                        <span>{featuredBlog.readTime || "4 min read"}</span>
                                                    </span>
                                                </div>

                                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--text,#12131A)] group-hover:text-[var(--primary)] transition-colors leading-tight mb-3">
                                                    <Link to={`/blog/${featuredBlog.slug || featuredBlog._id}`}>
                                                        {featuredBlog.title}
                                                    </Link>
                                                </h2>

                                                <p className="text-xs sm:text-sm text-[var(--text-secondary,#6b7280)] line-clamp-3 leading-relaxed mb-6">
                                                    {featuredBlog.summary ||
                                                        "Learn what to look for in an ergonomic office chair, including lumbar support, adjustability, seat depth, and more."}
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                                    <FiUser size={13} className="text-[var(--primary)]" aria-hidden="true" />
                                                    <span>By {featuredBlog.author || "Comfort Seats PK"}</span>
                                                </span>

                                                <Link
                                                    to={`/blog/${featuredBlog.slug || featuredBlog._id}`}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition group/btn shadow-xs"
                                                >
                                                    <span>Read Article</span>
                                                    <FiArrowRight
                                                        size={14}
                                                        className="group-hover/btn:translate-x-1 transition-transform"
                                                        aria-hidden="true"
                                                    />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 3. BLOG CARD GRID (Desktop: 3 cols, Tablet: 2 cols, Mobile: 1 col) */}
                        {gridBlogs.length > 0 && (
                            <section aria-label="Articles list">
                                {featuredBlog && (
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text,#12131A)] tracking-tight">
                                            {selectedCategory === "All" ? "Latest Articles" : `${selectedCategory} Articles`}
                                        </h2>
                                        <span className="text-xs text-[var(--text-secondary,#6b7280)] font-medium">
                                            Showing {displayedGridBlogs.length} of {gridBlogs.length} articles
                                        </span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {displayedGridBlogs.map((blog) => (
                                        <article
                                            key={blog._id}
                                            className="bg-white rounded-3xl border border-[var(--border,#e5e7eb)] shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col group"
                                        >
                                            {/* A. Featured Image (16:9 fixed aspect ratio, hover zoom, lazy load) */}
                                            <Link
                                                to={`/blog/${blog.slug || blog._id}`}
                                                className="relative aspect-[16/9] overflow-hidden bg-gray-100 block"
                                            >
                                                <img
                                                    src={
                                                        blog.thumbnail ||
                                                        blog.banner ||
                                                        "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80"
                                                    }
                                                    alt={blog.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {/* B. Category Badge */}
                                                <div className="absolute top-3.5 left-3.5">
                                                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-xs">
                                                        {blog.category || "General"}
                                                    </span>
                                                </div>
                                            </Link>

                                            {/* Card Body */}
                                            <div className="p-6 flex-1 flex flex-col justify-between">
                                                <div>
                                                    {/* E. Metadata: Author, Date, Reading Time */}
                                                    <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[var(--text-secondary,#6b7280)] mb-2.5">
                                                        <span className="flex items-center gap-1 font-medium">
                                                            <FiCalendar size={12} aria-hidden="true" />
                                                            <time dateTime={blog.createdAt}>
                                                                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric"
                                                                })}
                                                            </time>
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1 font-medium">
                                                            <FiClock size={12} aria-hidden="true" />
                                                            <span>{blog.readTime || "3 min read"}</span>
                                                        </span>
                                                    </div>

                                                    {/* C. Blog Title (Max 2-3 lines with line-clamp-2) */}
                                                    <h3 className="text-base sm:text-lg font-bold text-[var(--text,#12131A)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-snug mb-2.5">
                                                        <Link to={`/blog/${blog.slug || blog._id}`}>
                                                            {blog.title}
                                                        </Link>
                                                    </h3>

                                                    {/* D. Excerpt (Line clamped) */}
                                                    <p className="text-xs sm:text-sm text-[var(--text-secondary,#6b7280)] line-clamp-3 leading-relaxed mb-6">
                                                        {blog.summary ||
                                                            "Discover ergonomics recommendations, posture adjustments, and office chair insights from Comfort Seats PK."}
                                                    </p>
                                                </div>

                                                {/* Card Footer with Author and Read More CTA */}
                                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                                    <span className="text-[11px] font-medium text-gray-400">
                                                        By {blog.author || "Comfort Seats PK"}
                                                    </span>

                                                    {/* F. Read More */}
                                                    <Link
                                                        to={`/blog/${blog.slug || blog._id}`}
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] group-hover:underline focus:outline-none"
                                                    >
                                                        <span>Read Article</span>
                                                        <FiArrowRight
                                                            size={13}
                                                            className="group-hover:translate-x-1.5 transition-transform"
                                                            aria-hidden="true"
                                                        />
                                                    </Link>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {/* 9. LOAD MORE PAGINATION */}
                                {hasMore && (
                                    <div className="mt-12 text-center">
                                        <button
                                            type="button"
                                            onClick={handleLoadMore}
                                            className="px-8 py-3 rounded-2xl bg-white border border-[var(--border,#e5e7eb)] text-[var(--text,#12131A)] text-xs sm:text-sm font-bold shadow-xs hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                                        >
                                            <span>Load More Articles</span>
                                            <span className="text-xs font-normal text-gray-400">
                                                ({gridBlogs.length - visibleCount} remaining)
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

export default Blog;
