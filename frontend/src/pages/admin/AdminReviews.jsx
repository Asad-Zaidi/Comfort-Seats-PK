import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import { useToast } from "../../components/ToastNotification";
import {
    FiSearch,
    FiTrash2,
    FiStar,
    FiRefreshCw,
    FiX,
    FiEye,
    FiMessageSquare,
    FiChevronLeft,
    FiChevronRight,
    FiFilter,
    FiSliders,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const AdminReviews = () => {
    const toast = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search and Filter states
    const [productSearch, setProductSearch] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");
    const [ratingFilter, setRatingFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("NEWEST");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Image preview modal
    const [previewImage, setPreviewImage] = useState(null);

    // Fetch all reviews
    const fetchReviews = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await api.get("/admin/reviews");
            if (res.data?.success) {
                setReviews(res.data.data || []);
            } else {
                toast.error(res.data?.message || "Failed to load reviews.");
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
            toast.error("Error loading product reviews.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter and Sort logic
    const filteredReviews = useMemo(() => {
        return reviews
            .filter((item) => {
                // Search by Product Name
                if (productSearch.trim()) {
                    const term = productSearch.toLowerCase();
                    const prodName = (item.productName || "").toLowerCase();
                    if (!prodName.includes(term)) return false;
                }

                // Search by Customer Name or Email
                if (customerSearch.trim()) {
                    const term = customerSearch.toLowerCase();
                    const custName = (item.customerName || "").toLowerCase();
                    const custEmail = (item.customerEmail || "").toLowerCase();
                    if (!custName.includes(term) && !custEmail.includes(term)) return false;
                }

                // Filter by Rating
                if (ratingFilter !== "ALL") {
                    const targetRating = Number(ratingFilter);
                    if (Number(item.rating) !== targetRating) return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === "NEWEST") {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                if (sortBy === "OLDEST") {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                }
                if (sortBy === "HIGHEST_RATING") {
                    return b.rating - a.rating;
                }
                if (sortBy === "LOWEST_RATING") {
                    return a.rating - b.rating;
                }
                return 0;
            });
    }, [reviews, productSearch, customerSearch, ratingFilter, sortBy]);

    // Reset page to 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [productSearch, customerSearch, ratingFilter, sortBy]);

    // Pagination metrics
    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
    const paginatedReviews = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredReviews.slice(start, start + itemsPerPage);
    }, [filteredReviews, currentPage]);

    // Statistics calculations
    const stats = useMemo(() => {
        const total = reviews.length;
        if (!total) return { total: 0, avg: 0, fiveStar: 0, lowRating: 0 };

        const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        const avg = (sum / total).toFixed(1);
        const fiveStar = reviews.filter((r) => Number(r.rating) === 5).length;
        const lowRating = reviews.filter((r) => Number(r.rating) <= 2).length;

        return { total, avg, fiveStar, lowRating };
    }, [reviews]);

    // Open Delete Modal
    const handleOpenDeleteModal = (review) => {
        setReviewToDelete(review);
        setDeleteModalOpen(true);
    };

    // Confirm Delete Review
    const handleConfirmDelete = async () => {
        if (!reviewToDelete) return;
        setIsDeleting(true);

        try {
            const res = await api.delete(`/admin/reviews/${reviewToDelete._id}`);
            if (res.data?.success) {
                toast.success("Review deleted successfully.");
                setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete._id));
                setDeleteModalOpen(false);
                setReviewToDelete(null);
            } else {
                toast.error(res.data?.message || "Failed to delete review.");
            }
        } catch (err) {
            console.error("Error deleting review:", err);
            toast.error(err.response?.data?.message || "Error deleting review.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Helper for rendering rating stars
    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={star <= rating ? "text-amber-400" : "text-gray-200"}
                    />
                ))}
                <span className="ml-1 text-xs font-semibold text-slate-700">{rating}</span>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <FiStar className="text-amber-500 fill-amber-500" />
                        Product Reviews Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        View, filter, and moderate customer product reviews and ratings across your store.
                    </p>
                </div>

                <button
                    onClick={() => fetchReviews(true)}
                    disabled={refreshing || loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition shadow-sm self-start sm:self-auto disabled:opacity-50"
                >
                    <FiRefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <FiMessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Total Reviews</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                        <FiStar className="w-6 h-6 fill-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Average Rating</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.avg} <span className="text-sm font-normal text-slate-400">/ 5</span></p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <FaStar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">5-Star Reviews</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.fiveStar}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
                        <FiSliders className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Low Ratings (1-2★)</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.lowRating}</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search Controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search Product */}
                    <div className="relative">
                        <FiSearch className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by Product Name..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        />
                    </div>

                    {/* Search Customer */}
                    <div className="relative">
                        <FiSearch className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search Customer / Email..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        />
                    </div>

                    {/* Filter by Rating */}
                    <div className="relative">
                        <FiFilter className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Ratings (1 - 5 Stars)</option>
                            <option value="5">5 Stars Only</option>
                            <option value="4">4 Stars Only</option>
                            <option value="3">3 Stars Only</option>
                            <option value="2">2 Stars Only</option>
                            <option value="1">1 Star Only</option>
                        </select>
                    </div>

                    {/* Sort By */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition cursor-pointer"
                        >
                            <option value="NEWEST">Sort: Newest First</option>
                            <option value="OLDEST">Sort: Oldest First</option>
                            <option value="HIGHEST_RATING">Sort: Highest Rating</option>
                            <option value="LOWEST_RATING">Sort: Lowest Rating</option>
                        </select>
                    </div>
                </div>

                {/* Active filters indicators & clear */}
                {(productSearch || customerSearch || ratingFilter !== "ALL" || sortBy !== "NEWEST") && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <span>Showing filtered review results ({filteredReviews.length} found)</span>
                        <button
                            onClick={() => {
                                setProductSearch("");
                                setCustomerSearch("");
                                setRatingFilter("ALL");
                                setSortBy("NEWEST");
                            }}
                            className="text-indigo-600 hover:underline font-medium"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 space-y-3">
                        <FiRefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                        <p className="text-sm font-medium">Loading reviews...</p>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 space-y-2">
                        <FiMessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                        <p className="text-base font-semibold text-slate-800">No reviews found</p>
                        <p className="text-sm">
                            {reviews.length === 0
                                ? "There are currently no reviews submitted for any product."
                                : "No reviews match your selected filter or search terms."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                        <th className="py-3.5 px-4">Product</th>
                                        <th className="py-3.5 px-4">Customer</th>
                                        <th className="py-3.5 px-4">Rating</th>
                                        <th className="py-3.5 px-4 min-w-[220px]">Review / Comment</th>
                                        <th className="py-3.5 px-4">Image</th>
                                        <th className="py-3.5 px-4">Date</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                    {paginatedReviews.map((review) => (
                                        <tr key={review._id} className="hover:bg-slate-50/50 transition">
                                            {/* Product Image & Name */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={review.productImage || "https://via.placeholder.com/60"}
                                                        alt={review.productName}
                                                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-slate-100 shrink-0"
                                                        onError={(e) => {
                                                            e.target.src = "https://via.placeholder.com/60?text=No+Img";
                                                        }}
                                                    />
                                                    <div className="max-w-[180px] sm:max-w-[220px]">
                                                        {review.productSlug ? (
                                                            <Link
                                                                to={`/product/${review.productSlug}`}
                                                                target="_blank"
                                                                className="font-semibold text-slate-900 hover:text-indigo-600 line-clamp-2 transition"
                                                            >
                                                                {review.productName || "Product"}
                                                            </Link>
                                                        ) : (
                                                            <span className="font-semibold text-slate-900 line-clamp-2">
                                                                {review.productName || "Product"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Customer Name & Email */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <p className="font-medium text-slate-900">
                                                    {review.customerName || "Anonymous"}
                                                </p>
                                                {review.customerEmail ? (
                                                    <p className="text-xs text-slate-500">{review.customerEmail}</p>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic">No email</p>
                                                )}
                                            </td>

                                            {/* Rating Stars */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {renderStars(review.rating)}
                                            </td>

                                            {/* Review Comment */}
                                            <td className="py-3.5 px-4">
                                                <p className="text-slate-800 line-clamp-3 leading-relaxed">
                                                    {review.comment || <span className="text-slate-400 italic">No comment text</span>}
                                                </p>
                                            </td>

                                            {/* Review Image */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {review.reviewImage ? (
                                                    <button
                                                        onClick={() => setPreviewImage(review.reviewImage)}
                                                        className="group relative block w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-indigo-500 transition"
                                                        title="Click to view full image"
                                                    >
                                                        <img
                                                            src={review.reviewImage}
                                                            alt="Customer review thumbnail"
                                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                                            <FiEye className="text-white w-4 h-4" />
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">—</span>
                                                )}
                                            </td>

                                            {/* Review Date */}
                                            <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                                                {review.createdAt
                                                    ? new Date(review.createdAt).toLocaleDateString(undefined, {
                                                          year: "numeric",
                                                          month: "short",
                                                          day: "numeric",
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                      })
                                                    : "N/A"}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleOpenDeleteModal(review)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-semibold transition shadow-sm"
                                                    title="Permanently Delete Review"
                                                >
                                                    <FiTrash2 className="w-3.5 h-3.5" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                            <div>
                                Showing{" "}
                                <span className="font-semibold text-slate-900">
                                    {(currentPage - 1) * itemsPerPage + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-semibold text-slate-900">
                                    {Math.min(currentPage * itemsPerPage, filteredReviews.length)}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-900">
                                    {filteredReviews.length}
                                </span>{" "}
                                reviews
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <FiChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 font-semibold text-slate-800">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <FiChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && reviewToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                                    <FiTrash2 className="w-5 h-5" />
                                </span>
                                Delete Review Confirmation
                            </h3>
                            <button
                                onClick={() => {
                                    if (!isDeleting) {
                                        setDeleteModalOpen(false);
                                        setReviewToDelete(null);
                                    }
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            Are you sure you want to permanently delete this review? This action cannot be undone.
                        </p>

                        {/* Review Summary Box */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
                            <p>
                                <span className="font-semibold text-slate-900">Product:</span>{" "}
                                {reviewToDelete.productName}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-900">Customer:</span>{" "}
                                {reviewToDelete.customerName} ({reviewToDelete.rating}★)
                            </p>
                            {reviewToDelete.comment && (
                                <p className="italic text-slate-500 line-clamp-2">
                                    "{reviewToDelete.comment}"
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setReviewToDelete(null);
                                }}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50"
                            >
                                {isDeleting && <FiRefreshCw className="w-4 h-4 animate-spin" />}
                                {isDeleting ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-2 border border-slate-700 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                        <img
                            src={previewImage}
                            alt="Uploaded review full preview"
                            className="w-full h-full max-h-[80vh] object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReviews;
