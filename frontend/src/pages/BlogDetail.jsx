import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import { useSiteConfig } from "../utils/siteConfig";
import { useToast } from "../components/ToastNotification";
import { sanitizeHtml } from "../utils/sanitizeHtml";
import {
    FiCalendar,
    FiClock,
    FiEye,
    FiUser,
    FiArrowLeft,
    FiShare2,
    FiCheck,
    FiArrowRight,
    FiBookOpen,
    FiCopy,
    FiTag
} from "react-icons/fi";
import { FaWhatsapp, FaFacebookF, FaLinkedinIn } from "react-icons/fa";

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { siteName, siteUrl } = useSiteConfig();

    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchBlogDetail = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/blogs/${slug}`);
                if (res.data?.success && res.data?.data) {
                    setBlog(res.data.data);
                } else {
                    setBlog(null);
                }
            } catch (error) {
                console.error("Failed to load blog detail:", error);
                setBlog(null);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchBlogDetail();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [slug]);

    // Fetch related blogs in background
    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const res = await api.get("/blogs?published=true&limit=6");
                if (res.data?.success && Array.isArray(res.data?.data)) {
                    setRelatedBlogs(
                        res.data.data
                            .filter((b) => b.slug !== slug && b._id !== blog?._id)
                            .slice(0, 3)
                    );
                }
            } catch (error) {
                console.warn("Could not fetch related blogs:", error);
            }
        };
        if (blog) {
            fetchRelated();
        }
    }, [blog, slug]);

    // Copy article link
    const handleCopyLink = () => {
        const currentUrl = typeof window !== "undefined" ? window.location.href : "";
        if (navigator?.clipboard) {
            navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            toast.success("Blog link copied to clipboard!");
            setTimeout(() => setCopied(false), 2500);
        }
    };

    // Social share links
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareTitle = blog?.title || "Check out this ergonomic guide from Comfort Seats PK";

    const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg,#FAF9F6)] py-16 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="animate-spin inline-block w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
                    <p className="text-sm font-medium text-gray-500">Loading blog article...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-[var(--bg,#FAF9F6)] py-16 px-4 flex items-center justify-center">
                <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-gray-200 shadow-sm space-y-4">
                    <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                        <FiBookOpen size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Blog Post Not Found</h2>
                    <p className="text-xs text-gray-500">
                        The article you are looking for might have been moved or removed.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/blog")}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition cursor-pointer"
                    >
                        <FiArrowLeft size={14} /> Back to Blog List
                    </button>
                </div>
            </div>
        );
    }

    // Clean rich text html safely
    const cleanBodyHtml = sanitizeHtml(blog.content || "");

    // 15. Article / BlogPosting Structured Data Schema
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${siteUrl || "https://comfortseatspk.com"}/blog/${blog.slug || blog._id}`
        },
        "headline": blog.seoTitle || blog.title,
        "description": blog.seoDescription || blog.summary || blog.title,
        "image": [
            blog.banner || blog.thumbnail || `${siteUrl || "https://comfortseatspk.com"}/og-image.png`
        ],
        "datePublished": blog.createdAt,
        "dateModified": blog.updatedAt || blog.createdAt,
        "author": {
            "@type": "Person",
            "name": blog.author || "Comfort Seats PK"
        },
        "publisher": {
            "@type": "Organization",
            "name": siteName || "Comfort Seats PK",
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl || "https://comfortseatspk.com"}/logo.png`
            }
        }
    };

    return (
        <article className="min-h-screen bg-[var(--bg,#FAF9F6)] text-[var(--text,#12131A)] py-6 sm:py-10 transition-colors">
            {/* 14. SEO Integration with OpenGraph, Keywords & Twitter Meta */}
            <SEO
                title={`${blog.seoTitle || blog.title} | ${siteName || "Comfort Seats PK"}`}
                description={blog.seoDescription || blog.summary || blog.title}
                keywords={blog.seoKeywords || (Array.isArray(blog.tags) ? blog.tags.join(", ") : "office chairs, ergonomics, furniture, comfort seats pk")}
                url={`${siteUrl || "https://comfortseatspk.com"}/blog/${blog.slug || blog._id}`}
                image={blog.banner || blog.thumbnail}
            />

            {/* Injected JSON-LD Article Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-32">
                {/* Breadcrumb Navigation */}
                <div className="mb-6">
                    <Breadcrumb
                        items={[
                            { label: "Home", link: "/" },
                            { label: "Blog", link: "/blog" },
                            { label: blog.title }
                        ]}
                    />
                </div>

                {/* Main Article Container */}
                <div className="bg-white rounded-3xl border border-[var(--border,#e5e7eb)] shadow-xs overflow-hidden">
                    {/* Hero Banner with Defined Aspect Ratio (1200x500 / 21:9) */}
                    {(blog.banner || blog.thumbnail) && (
                        <div className="relative aspect-[21/9] sm:aspect-[21/9] bg-gray-900 overflow-hidden">
                            <img
                                src={blog.banner || blog.thumbnail}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Subtle gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                            {/* Category Tag on Banner */}
                            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                                <span className="px-3.5 py-1.5 rounded-full bg-[var(--primary)] text-white text-xs font-bold shadow-md tracking-wide uppercase">
                                    {blog.category || "General"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Article Content Header */}
                    <div className="p-6 sm:p-10 lg:p-12">
                        {/* Meta Tags Header */}
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs text-[var(--text-secondary,#6b7280)] mb-4">
                            <span className="flex items-center gap-1.5 font-medium text-[var(--text,#12131A)]">
                                <FiUser size={13} className="text-[var(--primary)]" aria-hidden="true" />
                                {blog.author || "Comfort Seats PK"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <FiCalendar size={13} aria-hidden="true" />
                                <time dateTime={blog.createdAt}>
                                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric"
                                    })}
                                </time>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <FiClock size={13} aria-hidden="true" />
                                <span>{blog.readTime || "3 min read"}</span>
                            </span>
                            {blog.views > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <FiEye size={13} aria-hidden="true" />
                                        <span>{blog.views} views</span>
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text,#12131A)] tracking-tight leading-tight mb-6">
                            {blog.title}
                        </h1>

                        {/* Summary / Excerpt Callout Box */}
                        {blog.summary && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border-l-4 border-[var(--primary)] text-xs sm:text-sm text-gray-800 leading-relaxed mb-8 font-medium">
                                {blog.summary}
                            </div>
                        )}

                        {/* Article Main Body (Rich HTML Content) */}
                        <div
                            className="prose-theme leading-relaxed text-sm sm:text-base text-gray-800 space-y-4"
                            dangerouslySetInnerHTML={{ __html: cleanBodyHtml }}
                        />

                        {/* Tags list */}
                        {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
                                    <FiTag size={12} /> Tags:
                                </span>
                                {blog.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* 16. SOCIAL SHARING BUTTONS */}
                        <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                <FiShare2 className="text-[var(--primary)]" size={16} aria-hidden="true" />
                                <span>Share this article:</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={whatsappShareUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Share on WhatsApp"
                                    aria-label="Share on WhatsApp"
                                    className="h-9 w-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition shadow-2xs"
                                >
                                    <FaWhatsapp size={16} />
                                </a>

                                <a
                                    href={facebookShareUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Share on Facebook"
                                    aria-label="Share on Facebook"
                                    className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-2xs"
                                >
                                    <FaFacebookF size={14} />
                                </a>

                                <a
                                    href={linkedinShareUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Share on LinkedIn"
                                    aria-label="Share on LinkedIn"
                                    className="h-9 w-9 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white flex items-center justify-center transition shadow-2xs"
                                >
                                    <FaLinkedinIn size={14} />
                                </a>

                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    title="Copy Link"
                                    aria-label="Copy Article Link"
                                    className="h-9 px-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                    {copied ? (
                                        <>
                                            <FiCheck className="text-emerald-600" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiCopy />
                                            <span>Copy Link</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Back to Blog Navigation */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                            <Link
                                to="/blog"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition"
                            >
                                <FiArrowLeft size={14} />
                                <span>Back to All Articles</span>
                            </Link>

                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition shadow-xs"
                            >
                                <span>Explore Chairs</span>
                                <FiArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Related Articles Section */}
                {relatedBlogs.length > 0 && (
                    <section className="mt-14" aria-label="Related articles">
                        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text,#12131A)] mb-6">
                            Related Articles You Might Like
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedBlogs.map((item) => (
                                <Link
                                    key={item._id}
                                    to={`/blog/${item.slug || item._id}`}
                                    className="bg-white rounded-2xl border border-[var(--border,#e5e7eb)] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col"
                                >
                                    <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                                        <img
                                            src={
                                                item.thumbnail ||
                                                item.banner ||
                                                "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80"
                                            }
                                            alt={item.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mb-1 block">
                                                {item.category || "General"}
                                            </span>
                                            <h3 className="text-sm font-bold text-[var(--text,#12131A)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-snug mb-2">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <span className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                                            <FiClock size={11} aria-hidden="true" />
                                            <span>{item.readTime || "3 min read"}</span>
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </article>
    );
};

export default BlogDetail;
