import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api, { postMultipart, putMultipart } from "../../api/api";
import { useToast } from "../../components/ToastNotification";
import RichTextEditor from "../../components/common/RichTextEditor";
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiEye,
    FiSearch,
    FiImage,
    FiFileText,
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiX,
    FiUploadCloud,
    FiExternalLink,
    FiRefreshCw,
    FiLayers,
    FiStar,
    FiGlobe
} from "react-icons/fi";
import { FaBlog } from "react-icons/fa";

const CATEGORIES = [
    "General",
    "Office Chairs",
    "Gaming Chairs",
    "Ergonomics",
    "Furniture",
    "Workspace",
    "Buying Guides",
    "Tips & Advice",
    "Maintenance",
    "Trends"
];

const AdminBlog = () => {
    const toast = useToast();

    // State
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");

    // Modal / Drawer state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedBlogId, setSelectedBlogId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Delete confirmation state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Form fields
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("General");
    const [author, setAuthor] = useState("Comfort Seats PK");
    const [tagsInput, setTagsInput] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [isPublished, setIsPublished] = useState(true);

    // SEO Meta Fields
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [seoKeywords, setSeoKeywords] = useState("");

    // Image fields
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");

    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");

    // Helper to generate slug from title
    const generateSlug = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")
            .replace(/--+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");
    };

    // Fetch all blogs
    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/blogs?limit=500");
            if (res.data?.success && Array.isArray(res.data?.data)) {
                setBlogs(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load blogs:", error);
            toast.error("Failed to load blogs.");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    // Handle Title change (auto-generate slug if not editing existing custom slug)
    const handleTitleChange = (e) => {
        const val = e.target.value;
        setTitle(val);
        if (!isEditing || !slug) {
            setSlug(generateSlug(val));
        }
    };

    // Open Form for Adding New Blog
    const handleOpenAdd = () => {
        setIsEditing(false);
        setSelectedBlogId(null);
        setTitle("");
        setSlug("");
        setSummary("");
        setContent("");
        setCategory("General");
        setAuthor("Comfort Seats PK");
        setTagsInput("");
        setIsFeatured(false);
        setIsPublished(true);
        setSeoTitle("");
        setSeoDescription("");
        setSeoKeywords("");
        setThumbnailFile(null);
        setThumbnailPreview("");
        setThumbnailUrl("");
        setBannerFile(null);
        setBannerPreview("");
        setBannerUrl("");
        setIsFormOpen(true);
    };

    // Open Form for Editing Existing Blog
    const handleOpenEdit = (blog) => {
        setIsEditing(true);
        setSelectedBlogId(blog._id);
        setTitle(blog.title || "");
        setSlug(blog.slug || "");
        setSummary(blog.summary || "");
        setContent(blog.content || "");
        setCategory(blog.category || "General");
        setAuthor(blog.author || "Comfort Seats PK");
        setTagsInput(Array.isArray(blog.tags) ? blog.tags.join(", ") : (blog.tags || ""));
        setIsFeatured(blog.isFeatured || false);
        setIsPublished(blog.isPublished !== undefined ? blog.isPublished : true);
        setSeoTitle(blog.seoTitle || "");
        setSeoDescription(blog.seoDescription || "");
        setSeoKeywords(blog.seoKeywords || "");

        setThumbnailFile(null);
        setThumbnailPreview(blog.thumbnail || "");
        setThumbnailUrl(blog.thumbnail || "");

        setBannerFile(null);
        setBannerPreview(blog.banner || "");
        setBannerUrl(blog.banner || "");

        setIsFormOpen(true);
    };

    // Handle thumbnail selection
    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Thumbnail image size must be under 5MB.");
            return;
        }

        setThumbnailFile(file);
        const previewUrl = URL.createObjectURL(file);
        setThumbnailPreview(previewUrl);
    };

    // Handle banner selection
    const handleBannerChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Banner image size must be under 5MB.");
            return;
        }

        setBannerFile(file);
        const previewUrl = URL.createObjectURL(file);
        setBannerPreview(previewUrl);
    };

    // Submit Blog (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Please enter a blog title.");
            return;
        }
        if (!content.trim()) {
            toast.error("Please write blog body content.");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("slug", slug.trim() || generateSlug(title));
            formData.append("content", content);
            formData.append("summary", summary.trim());
            formData.append("category", category);
            formData.append("author", author.trim());
            formData.append("tags", tagsInput);
            formData.append("isFeatured", isFeatured ? "true" : "false");
            formData.append("isPublished", isPublished ? "true" : "false");
            formData.append("seoTitle", seoTitle.trim());
            formData.append("seoDescription", seoDescription.trim());
            formData.append("seoKeywords", seoKeywords.trim());

            if (thumbnailFile) {
                formData.append("thumbnail", thumbnailFile);
            } else if (thumbnailUrl) {
                formData.append("thumbnailUrl", thumbnailUrl.trim());
            }

            if (bannerFile) {
                formData.append("banner", bannerFile);
            } else if (bannerUrl) {
                formData.append("bannerUrl", bannerUrl.trim());
            }

            let res;
            if (isEditing && selectedBlogId) {
                res = await putMultipart(`/blogs/${selectedBlogId}`, formData);
            } else {
                res = await postMultipart("/blogs", formData);
            }

            if (res.data?.success) {
                toast.success(isEditing ? "Blog post updated successfully!" : "Blog post published successfully!");
                setIsFormOpen(false);
                fetchBlogs();
            } else {
                toast.error(res.data?.message || "Failed to save blog post.");
            }
        } catch (error) {
            console.error("Save blog error:", error);
            const msg = error.response?.data?.message || error.message || "Failed to save blog.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Delete confirmation
    const handleDeleteClick = (blog) => {
        setBlogToDelete(blog);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!blogToDelete?._id) return;
        setDeleting(true);
        try {
            const res = await api.delete(`/blogs/${blogToDelete._id}`);
            if (res.data?.success) {
                toast.success("Blog deleted successfully.");
                setBlogs((prev) => prev.filter((b) => b._id !== blogToDelete._id));
                setDeleteModalOpen(false);
                setBlogToDelete(null);
            } else {
                toast.error(res.data?.message || "Failed to delete blog.");
            }
        } catch (error) {
            console.error("Delete blog error:", error);
            toast.error(error.response?.data?.message || "Failed to delete blog.");
        } finally {
            setDeleting(false);
        }
    };

    // Filtered blogs
    const filteredBlogs = blogs.filter((blog) => {
        const matchesCategory =
            filterCategory === "All" || (blog.category || "General").toLowerCase() === filterCategory.toLowerCase();
        const matchesSearch =
            !searchQuery.trim() ||
            blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const publishedCount = blogs.filter((b) => b.isPublished).length;
    const draftCount = blogs.length - publishedCount;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-16">
            {/* Header with Stats & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                        <FaBlog className="text-[var(--primary)]" />
                        <span>Blog Management</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Write, edit, and publish rich articles, ergonomics advice, and company updates.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchBlogs}
                        disabled={loading}
                        title="Refresh blogs"
                        className="flex items-center justify-center h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition shadow-xs cursor-pointer"
                    >
                        <FiPlus size={18} />
                        <span>Write New Blog</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 text-[var(--primary)] flex items-center justify-center font-bold text-xl">
                        <FiLayers size={22} />
                    </div>
                    <div>
                        <div className="text-2xl font-extrabold text-gray-900">{blogs.length}</div>
                        <div className="text-xs text-gray-500 font-medium">Total Blog Posts</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                        <FiCheckCircle size={22} />
                    </div>
                    <div>
                        <div className="text-2xl font-extrabold text-emerald-600">{publishedCount}</div>
                        <div className="text-xs text-gray-500 font-medium">Published Live</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
                        <FiXCircle size={22} />
                    </div>
                    <div>
                        <div className="text-2xl font-extrabold text-amber-600">{draftCount}</div>
                        <div className="text-xs text-gray-500 font-medium">Drafts / Hidden</div>
                    </div>
                </div>
            </div>

            {/* Search and Category Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search blogs by title, category, tags..."
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white outline-none focus:border-[var(--primary)] transition"
                    />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                    <button
                        onClick={() => setFilterCategory("All")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${filterCategory === "All"
                            ? "bg-[var(--primary)] text-white shadow-xs"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        All ({blogs.length})
                    </button>
                    {CATEGORIES.map((cat) => {
                        const count = blogs.filter((b) => (b.category || "General").toLowerCase() === cat.toLowerCase()).length;
                        return (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${filterCategory.toLowerCase() === cat.toLowerCase()
                                    ? "bg-[var(--primary)] text-white shadow-xs"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {cat} {count > 0 ? `(${count})` : ""}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Blogs List / Grid */}
            {loading ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mb-3"></div>
                    <p className="text-sm font-medium text-gray-500">Loading blog posts...</p>
                </div>
            ) : filteredBlogs.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
                    <div className="h-16 w-16 bg-blue-50 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto">
                        <FaBlog size={28} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No blog posts found</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        {searchQuery || filterCategory !== "All"
                            ? "No blogs match your filter criteria. Try searching for something else."
                            : "You haven't written any blog articles yet. Click below to publish your first post!"}
                    </p>
                    <button
                        onClick={handleOpenAdd}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition cursor-pointer mt-2"
                    >
                        <FiPlus size={16} /> Write First Blog
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredBlogs.map((blog) => (
                        <div
                            key={blog._id}
                            className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col group"
                        >
                            {/* Thumbnail Container */}
                            <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                                {blog.thumbnail ? (
                                    <img
                                        src={blog.thumbnail}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                        <FiImage size={32} className="mb-1 text-gray-300" />
                                        <span className="text-xs font-medium">No Thumbnail (600×400)</span>
                                    </div>
                                )}

                                {/* Category Badge */}
                                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                    <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide">
                                        {blog.category || "General"}
                                    </span>
                                    {blog.isFeatured && (
                                        <span className="px-2.5 py-1 rounded-md bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                                            <FiStar size={11} /> Featured
                                        </span>
                                    )}
                                </div>

                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                    <span
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold backdrop-blur-md ${blog.isPublished
                                            ? "bg-emerald-500/90 text-white"
                                            : "bg-amber-500/90 text-white"
                                            }`}
                                    >
                                        {blog.isPublished ? "Published" : "Draft"}
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                                    <span className="flex items-center gap-1">
                                        <FiCalendar size={13} />
                                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric"
                                        })}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <FiClock size={13} />
                                        {blog.readTime || "3 min read"}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <FiEye size={13} />
                                        {blog.views || 0} views
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-gray-900 group-hover:text-[var(--primary)] transition line-clamp-2 mb-2 leading-snug">
                                    {blog.title}
                                </h3>

                                <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                                    {blog.summary || "No summary provided. Read the full post for more details..."}
                                </p>

                                {/* Tags preview */}
                                {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {blog.tags.slice(0, 3).map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        {blog.tags.length > 3 && (
                                            <span className="text-[10px] text-gray-400 self-center">
                                                +{blog.tags.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons Footer */}
                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                                    <Link
                                        to={`/blog/${blog.slug || blog._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                                    >
                                        <span>Preview</span>
                                        <FiExternalLink size={12} />
                                    </Link>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenEdit(blog)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-[var(--primary)] hover:bg-blue-100 text-xs font-semibold transition cursor-pointer"
                                        >
                                            <FiEdit2 size={13} />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(blog)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition cursor-pointer"
                                        >
                                            <FiTrash2 size={13} />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE / EDIT BLOG MODAL */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
                    <div className="bg-white w-full max-w-full rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[96vh] animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between sticky top-0 z-20">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <FaBlog className="text-[var(--primary)]" />
                                    <span>{isEditing ? "Edit Blog Post" : "Write New Blog Post"}</span>
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Fill in the fields below. Rich text editor supports headings, styling, images, and tables.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="h-8 w-8 rounded-full bg-gray-200/70 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition cursor-pointer"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Modal Form Body */}
                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
                            {/* Title & Slug Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Blog Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={handleTitleChange}
                                        placeholder="e.g. Ergonomic Office Chairs: The Ultimate 2026 Buying Guide"
                                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:border-[var(--primary)] outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        URL Slug <span className="text-gray-400 font-normal">(auto-generated)</span>
                                    </label>
                                    <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 font-mono">
                                        <span className="text-gray-400 mr-1">/blog/</span>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => setSlug(generateSlug(e.target.value))}
                                            placeholder="office-chairs-buying-guide"
                                            className="w-full bg-transparent outline-none text-gray-800 font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Category, Author, Tags & Status Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-3 py-2.5 text-xs font-medium rounded-xl border border-gray-200 bg-white focus:border-[var(--primary)] outline-none transition"
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Author
                                    </label>
                                    <input
                                        type="text"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder="Comfort Seats PK"
                                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-white focus:border-[var(--primary)] outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Tags <span className="text-gray-400 font-normal">(comma-separated)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        placeholder="chairs, lumbar, posture"
                                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-white focus:border-[var(--primary)] outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Publish & Featured
                                    </label>
                                    <div className="flex items-center gap-4 h-[42px] px-3 rounded-xl border border-gray-200 bg-gray-50/50">
                                        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isPublished}
                                                onChange={(e) => setIsPublished(e.target.checked)}
                                                className="rounded border-gray-300 text-[var(--primary)]"
                                            />
                                            <span>Published</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isFeatured}
                                                onChange={(e) => setIsFeatured(e.target.checked)}
                                                className="rounded border-gray-300 text-amber-500"
                                            />
                                            <span>Featured</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Images Section with Defined Resolutions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/40 p-5 rounded-2xl border border-blue-100">
                                {/* Thumbnail Upload (600x400 / 3:2 or 16:9) */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <FiImage className="text-[var(--primary)]" />
                                            <span>Thumbnail Image</span>
                                        </label>
                                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[var(--primary)] text-[10px] font-bold">
                                            600 × 400 px (3:2)
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mb-2">
                                        Used for blog card grid and social previews. Recommended: 600×400 px or 800×450 px, max 5MB.
                                    </p>

                                    {thumbnailPreview ? (
                                        <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 mb-2 group">
                                            <img
                                                src={thumbnailPreview}
                                                alt="Thumbnail preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                <label className="px-3 py-1.5 rounded-lg bg-white text-gray-800 text-xs font-semibold cursor-pointer hover:bg-gray-100 transition">
                                                    Change Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleThumbnailChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setThumbnailFile(null);
                                                        setThumbnailPreview("");
                                                        setThumbnailUrl("");
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer hover:bg-red-700 transition"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center aspect-[16/9] rounded-xl border-2 border-dashed border-gray-300 hover:border-[var(--primary)] bg-white hover:bg-blue-50/30 transition cursor-pointer p-4 text-center mb-2">
                                            <FiUploadCloud size={28} className="text-gray-400 mb-1" />
                                            <span className="text-xs font-semibold text-gray-700">
                                                Upload Thumbnail File
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">
                                                JPG, PNG, WebP up to 5MB
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleThumbnailChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}

                                    {/* Direct Thumbnail URL fallback */}
                                    <input
                                        type="url"
                                        value={thumbnailUrl}
                                        onChange={(e) => {
                                            setThumbnailUrl(e.target.value);
                                            if (!thumbnailFile) setThumbnailPreview(e.target.value);
                                        }}
                                        placeholder="Or paste image URL (https://...)"
                                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:border-[var(--primary)] outline-none"
                                    />
                                </div>

                                {/* Banner Upload (1200x500 / 21:9 or 16:6) */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <FiImage className="text-[var(--primary)]" />
                                            <span>Hero Banner Image</span>
                                        </label>
                                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold">
                                            1200 × 500 px (21:9)
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mb-2">
                                        Displayed at top of the blog article page. Recommended: 1200×500 px or 1920×700 px, max 5MB.
                                    </p>

                                    {bannerPreview ? (
                                        <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 mb-2 group">
                                            <img
                                                src={bannerPreview}
                                                alt="Banner preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                <label className="px-3 py-1.5 rounded-lg bg-white text-gray-800 text-xs font-semibold cursor-pointer hover:bg-gray-100 transition">
                                                    Change Banner
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleBannerChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBannerFile(null);
                                                        setBannerPreview("");
                                                        setBannerUrl("");
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer hover:bg-red-700 transition"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center aspect-[16/9] rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-500 bg-white hover:bg-purple-50/30 transition cursor-pointer p-4 text-center mb-2">
                                            <FiUploadCloud size={28} className="text-gray-400 mb-1" />
                                            <span className="text-xs font-semibold text-gray-700">
                                                Upload Banner File
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">
                                                High resolution ultra-wide image
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleBannerChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}

                                    {/* Direct Banner URL fallback */}
                                    <input
                                        type="url"
                                        value={bannerUrl}
                                        onChange={(e) => {
                                            setBannerUrl(e.target.value);
                                            if (!bannerFile) setBannerPreview(e.target.value);
                                        }}
                                        placeholder="Or paste banner URL (https://...)"
                                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:border-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Summary / Excerpt */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Short Summary / Excerpt <span className="text-gray-400 font-normal">(1-2 sentences for card previews)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Brief introduction summarizing what readers will learn from this article..."
                                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 bg-white focus:border-[var(--primary)] outline-none transition"
                                />
                            </div>

                            {/* SEO Meta Section */}
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    <FiGlobe className="text-[var(--primary)]" />
                                    <span>SEO Search Optimization (Optional)</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">SEO Title</label>
                                        <input
                                            type="text"
                                            value={seoTitle}
                                            onChange={(e) => setSeoTitle(e.target.value)}
                                            placeholder="Custom title tag for Google"
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:border-[var(--primary)] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">SEO Keywords</label>
                                        <input
                                            type="text"
                                            value={seoKeywords}
                                            onChange={(e) => setSeoKeywords(e.target.value)}
                                            placeholder="office chair, ergonomics, lumbar"
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:border-[var(--primary)] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Meta Description</label>
                                        <input
                                            type="text"
                                            value={seoDescription}
                                            onChange={(e) => setSeoDescription(e.target.value)}
                                            placeholder="150-160 characters summary for Google"
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:border-[var(--primary)] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Main Body (Rich Text Editor) */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <FiFileText className="text-[var(--primary)]" />
                                        <span>Main Blog Body Content</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-[11px] text-gray-400">
                                        Supports headings, lists, tables, links, colors, and media
                                    </span>
                                </div>

                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Write your article here... You can use headings, lists, bold, italics, tables, and insert images."
                                />
                            </div>

                            {/* Footer Submit Buttons */}
                            <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3 z-10">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-xs hover:opacity-90 transition shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    {submitting && (
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span>{isEditing ? "Update Blog Post" : "Publish Blog Post"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteModalOpen && blogToDelete && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                            <FiTrash2 size={24} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-base font-bold text-gray-900">Delete Blog Post?</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Are you sure you want to delete <strong className="text-gray-800">"{blogToDelete.title}"</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setBlogToDelete(null);
                                }}
                                className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={confirmDelete}
                                className="w-full py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {deleting && (
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                <span>Delete Post</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlog;
