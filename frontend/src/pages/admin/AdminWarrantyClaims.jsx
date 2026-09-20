import { useState, useEffect, useCallback } from "react";
import {
    FiSearch,
    FiFilter,
    FiEye,
    FiTrash2,
    FiX,
    FiPlus,
    FiSave,
    FiRefreshCw,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBox,
    FiShield,
    FiCheckCircle,
    FiAlertCircle,
    FiClock,
    FiCheck,
    FiVideo,
    FiImage,
    FiExternalLink,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import api from "../../api/api";
import { useToast } from "../../components/ToastNotification";
import SEO from "../../components/SEO";

const STATUS_CONFIG = {
    Pending: {
        bg: "bg-amber-50 text-amber-800 border-amber-200",
        badge: "bg-amber-500",
        icon: FiClock,
    },
    "Under Review": {
        bg: "bg-blue-50 text-blue-800 border-blue-200",
        badge: "bg-blue-500",
        icon: FiEye,
    },
    Approved: {
        bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        badge: "bg-emerald-500",
        icon: FiCheckCircle,
    },
    Rejected: {
        bg: "bg-rose-50 text-rose-800 border-rose-200",
        badge: "bg-rose-500",
        icon: FiAlertCircle,
    },
    "More Information Required": {
        bg: "bg-purple-50 text-purple-800 border-purple-200",
        badge: "bg-purple-500",
        icon: FiAlertCircle,
    },
    Resolved: {
        bg: "bg-teal-50 text-teal-800 border-teal-200",
        badge: "bg-teal-500",
        icon: FiCheck,
    },
    Closed: {
        bg: "bg-gray-100 text-gray-700 border-gray-200",
        badge: "bg-gray-400",
        icon: FiX,
    },
};

const ALL_STATUSES = [
    "Pending",
    "Under Review",
    "Approved",
    "Rejected",
    "More Information Required",
    "Resolved",
    "Closed",
];

const DEFAULT_COVERED_ITEMS = [
    "Manufacturing or structural flaws",
    "Defective hydraulics, gas lifts, or mechanisms",
    "Broken joints or welding defects under normal use",
    "Missing hardware or parts upon unboxing",
];

const DEFAULT_NOT_COVERED_ITEMS = [
    "Normal wear and tear of fabric / leather over time",
    "Accidental cuts, burns, or liquid spills",
    "Damage due to improper assembly or unauthorized modification",
];

export default function AdminWarrantyClaims() {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState("claims"); // 'claims' | 'coverage'

    // Claims state
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [adminNotesDraft, setAdminNotesDraft] = useState("");
    const [statusDraft, setStatusDraft] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Coverage policy state
    const [coverageLoading, setCoverageLoading] = useState(false);
    const [isSavingCoverage, setIsSavingCoverage] = useState(false);
    const [coveredTitle, setCoveredTitle] = useState("Covered Under Warranty:");
    const [coveredItems, setCoveredItems] = useState([...DEFAULT_COVERED_ITEMS]);
    const [notCoveredTitle, setNotCoveredTitle] = useState("Not Covered:");
    const [notCoveredItems, setNotCoveredItems] = useState([...DEFAULT_NOT_COVERED_ITEMS]);

    // Fetch claims list
    const fetchClaims = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", 20);
            if (statusFilter !== "all") params.append("status", statusFilter);
            if (searchQuery.trim()) params.append("search", searchQuery.trim());

            const res = await api.get(`/warranty-claims?${params.toString()}`);
            if (res.data?.success) {
                setClaims(res.data.data || []);
                setPagination(res.data.pagination || { page: 1, pages: 1, total: res.data.data?.length || 0 });
            }
        } catch (err) {
            console.error("Error loading warranty claims:", err);
            toast.error("Failed to load warranty claims.");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchQuery, toast]);

    // Fetch coverage policy
    const fetchCoverageConfig = useCallback(async () => {
        try {
            setCoverageLoading(true);
            const res = await api.get("/warranty-claims/config");
            if (res.data?.success && res.data.data) {
                const config = res.data.data;
                setCoveredTitle(config.coveredTitle || "Covered Under Warranty:");
                setCoveredItems(config.coveredItems?.length > 0 ? config.coveredItems : [...DEFAULT_COVERED_ITEMS]);
                setNotCoveredTitle(config.notCoveredTitle || "Not Covered:");
                setNotCoveredItems(config.notCoveredItems?.length > 0 ? config.notCoveredItems : [...DEFAULT_NOT_COVERED_ITEMS]);
            }
        } catch (err) {
            console.error("Error loading warranty config:", err);
            toast.error("Failed to load coverage policy.");
        } finally {
            setCoverageLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (activeTab === "claims") {
            fetchClaims(1);
        } else if (activeTab === "coverage") {
            fetchCoverageConfig();
        }
    }, [activeTab, fetchClaims, fetchCoverageConfig]);

    // Open claim review modal
    const handleOpenClaim = (claim) => {
        setSelectedClaim(claim);
        setStatusDraft(claim.status || "Pending");
        setAdminNotesDraft(claim.adminNotes || "");
    };

    // Update claim status & notes
    const handleUpdateClaim = async () => {
        if (!selectedClaim) return;
        try {
            setIsUpdatingStatus(true);
            const res = await api.put(`/warranty-claims/${selectedClaim._id}/status`, {
                status: statusDraft,
                adminNotes: adminNotesDraft,
            });

            if (res.data?.success) {
                toast.success("Warranty claim updated successfully!");
                setSelectedClaim(res.data.data);
                // Update local list
                setClaims((prev) =>
                    prev.map((c) => (c._id === selectedClaim._id ? res.data.data : c))
                );
            }
        } catch (err) {
            console.error("Error updating claim:", err);
            toast.error(err.response?.data?.message || "Failed to update claim.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Delete claim
    const handleDeleteClaim = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this warranty claim? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await api.delete(`/warranty-claims/${id}`);
            if (res.data?.success) {
                toast.success("Warranty claim deleted.");
                if (selectedClaim?._id === id) setSelectedClaim(null);
                fetchClaims(pagination.page);
            }
        } catch (err) {
            console.error("Error deleting claim:", err);
            toast.error(err.response?.data?.message || "Failed to delete claim.");
        }
    };

    // Coverage Policy: Add item
    const handleAddCoveredItem = () => {
        setCoveredItems((prev) => [...prev, ""]);
    };

    const handleUpdateCoveredItem = (index, value) => {
        setCoveredItems((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const handleRemoveCoveredItem = (index) => {
        setCoveredItems((prev) => prev.filter((_, idx) => idx !== index));
    };

    // Not Covered: Add item
    const handleAddNotCoveredItem = () => {
        setNotCoveredItems((prev) => [...prev, ""]);
    };

    const handleUpdateNotCoveredItem = (index, value) => {
        setNotCoveredItems((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const handleRemoveNotCoveredItem = (index) => {
        setNotCoveredItems((prev) => prev.filter((_, idx) => idx !== index));
    };

    // Reset coverage policy to default
    const handleResetCoverageDefaults = () => {
        if (!window.confirm("Reset coverage policy points to system defaults?")) return;
        setCoveredTitle("Covered Under Warranty:");
        setCoveredItems([...DEFAULT_COVERED_ITEMS]);
        setNotCoveredTitle("Not Covered:");
        setNotCoveredItems([...DEFAULT_NOT_COVERED_ITEMS]);
    };

    // Save coverage policy
    const handleSaveCoverage = async () => {
        try {
            setIsSavingCoverage(true);
            const cleanedCovered = coveredItems.map((item) => item.trim()).filter(Boolean);
            const cleanedNotCovered = notCoveredItems.map((item) => item.trim()).filter(Boolean);

            if (cleanedCovered.length === 0) {
                toast.error("Please provide at least one 'What is Covered' item.");
                return;
            }
            if (cleanedNotCovered.length === 0) {
                toast.error("Please provide at least one 'Not Covered' item.");
                return;
            }

            const res = await api.put("/warranty-claims/config", {
                coveredTitle: coveredTitle.trim() || "Covered Under Warranty:",
                coveredItems: cleanedCovered,
                notCoveredTitle: notCoveredTitle.trim() || "Not Covered:",
                notCoveredItems: cleanedNotCovered,
            });

            if (res.data?.success) {
                toast.success("Warranty coverage policy saved successfully!");
                setCoveredItems(cleanedCovered);
                setNotCoveredItems(cleanedNotCovered);
            }
        } catch (err) {
            console.error("Error saving coverage config:", err);
            toast.error(err.response?.data?.message || "Failed to save coverage policy.");
        } finally {
            setIsSavingCoverage(false);
        }
    };

    // WhatsApp Direct Consultation Link helper
    const getWhatsAppUrl = (claim) => {
        const rawPhone = (claim.customerPhone || "").replace(/[^\d]/g, "");
        let intlPhone = rawPhone;
        if (intlPhone.startsWith("03")) {
            intlPhone = "92" + intlPhone.slice(1);
        } else if (!intlPhone.startsWith("92") && intlPhone.length === 10) {
            intlPhone = "92" + intlPhone;
        }

        const msg = encodeURIComponent(
            `Hello ${claim.customerName},\n\nThis is ComfortSeats Support regarding your Warranty Claim *${claim.claimId}* for *${claim.productName}*.\n\nCurrent Status: *${claim.status}*\nOrder Number: *#${claim.orderNumber}*\n\nWe are reviewing your claim and would like to coordinate next steps with you.`
        );

        return `https://wa.me/${intlPhone}?text=${msg}`;
    };

    // Count stats for header
    const stats = {
        total: pagination.total || claims.length,
        pending: claims.filter((c) => c.status === "Pending").length,
        underReview: claims.filter((c) => c.status === "Under Review" || c.status === "More Information Required").length,
        approved: claims.filter((c) => c.status === "Approved" || c.status === "Resolved").length,
    };

    return (
        <div className="space-y-6">
            <SEO
                title="Admin - Warranty Claims Management | ComfortSeats"
                description="Manage customer warranty claims, review attachments, update statuses, and edit warranty coverage policies."
            />

            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiShield size={20} />
                        </span>
                        <h1 className="text-2xl font-bold text-gray-900">Warranty Claims</h1>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        Review customer warranty requests, examine photo &amp; video evidence, and configure coverage terms.
                    </p>
                </div>

                {/* Tabs Switcher */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab("claims")}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === "claims"
                                ? "bg-white text-gray-900 shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FiShield size={14} />
                        <span>Claim Requests</span>
                        <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            {stats.total}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("coverage")}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === "coverage"
                                ? "bg-white text-gray-900 shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FiCheckCircle size={14} />
                        <span>Coverage &amp; Policy Editor</span>
                    </button>
                </div>
            </div>

            {/* TAB 1: CLAIMS REQUESTS */}
            {activeTab === "claims" && (
                <div className="space-y-6">
                    {/* KPI Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
                            <p className="text-xs font-medium text-gray-500">Total Claims</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">All registered claims</p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
                            <p className="text-xs font-medium text-amber-700">Pending Review</p>
                            <p className="mt-1 text-2xl font-bold text-amber-800">{stats.pending}</p>
                            <p className="text-[11px] text-amber-600/80 mt-0.5">Awaiting initial inspection</p>
                        </div>
                        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
                            <p className="text-xs font-medium text-blue-700">Under Review</p>
                            <p className="mt-1 text-2xl font-bold text-blue-800">{stats.underReview}</p>
                            <p className="text-[11px] text-blue-600/80 mt-0.5">In communication / testing</p>
                        </div>
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
                            <p className="text-xs font-medium text-emerald-700">Approved / Resolved</p>
                            <p className="mt-1 text-2xl font-bold text-emerald-800">{stats.approved}</p>
                            <p className="text-[11px] text-emerald-600/80 mt-0.5">Successful replacements</p>
                        </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by Claim ID, Customer Name, Phone, Email, Order #, Product..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <FiFilter className="text-gray-400" size={14} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-blue-500 focus:outline-hidden"
                            >
                                <option value="all">All Statuses</option>
                                {ALL_STATUSES.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={() => fetchClaims(pagination.page)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition active:scale-95"
                                title="Refresh Claims"
                            >
                                <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* Claims Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <FiRefreshCw className="animate-spin text-blue-600 mb-2" size={28} />
                                <p className="text-sm">Loading warranty claims...</p>
                            </div>
                        ) : claims.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                                <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
                                    <FiShield size={24} />
                                </div>
                                <p className="text-base font-semibold text-gray-700">No warranty claims found</p>
                                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                                    {searchQuery || statusFilter !== "all"
                                        ? "Try adjusting your search query or filters to find what you are looking for."
                                        : "Customer warranty submissions will appear here once submitted."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-gray-600">
                                    <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3.5">Claim ID</th>
                                            <th className="px-4 py-3.5">Customer</th>
                                            <th className="px-4 py-3.5">Product &amp; Order</th>
                                            <th className="px-4 py-3.5">Issue Type</th>
                                            <th className="px-4 py-3.5 text-center">Media</th>
                                            <th className="px-4 py-3.5">Date</th>
                                            <th className="px-4 py-3.5">Status</th>
                                            <th className="px-4 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {claims.map((claim) => {
                                            const statusStyle = STATUS_CONFIG[claim.status] || STATUS_CONFIG.Pending;
                                            const StatusIcon = statusStyle.icon;
                                            const imagesCount = claim.attachments?.filter((a) => a.fileType === "image").length || 0;
                                            const videosCount = claim.attachments?.filter((a) => a.fileType === "video").length || 0;

                                            return (
                                                <tr
                                                    key={claim._id}
                                                    onClick={() => handleOpenClaim(claim)}
                                                    className="cursor-pointer hover:bg-gray-50/80 transition-colors"
                                                >
                                                    {/* Claim ID */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md text-[11px]">
                                                            {claim.claimId}
                                                        </span>
                                                    </td>

                                                    {/* Customer */}
                                                    <td className="px-4 py-3.5">
                                                        <div className="font-semibold text-gray-900">{claim.customerName}</div>
                                                        <div className="text-[11px] text-gray-500 mt-0.5">{claim.customerPhone}</div>
                                                        <div className="text-[11px] text-gray-400">{claim.city}</div>
                                                    </td>

                                                    {/* Product & Order */}
                                                    <td className="px-4 py-3.5 max-w-xs">
                                                        <div className="font-semibold text-gray-900 truncate" title={claim.productName}>
                                                            {claim.productName}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                                                            <span>Order: <strong>#{claim.orderNumber}</strong></span>
                                                            <span>• Qty: {claim.quantity || 1}</span>
                                                        </div>
                                                    </td>

                                                    {/* Issue Type */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700">
                                                            {claim.issueType}
                                                        </span>
                                                    </td>

                                                    {/* Media Count */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                        <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                                            {imagesCount > 0 && (
                                                                <span className="inline-flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]" title={`${imagesCount} Images`}>
                                                                    <FiImage size={12} className="text-blue-500" />
                                                                    <span>{imagesCount}</span>
                                                                </span>
                                                            )}
                                                            {videosCount > 0 && (
                                                                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[11px]" title="Video Attached">
                                                                    <FiVideo size={12} />
                                                                    <span>1</span>
                                                                </span>
                                                            )}
                                                            {imagesCount === 0 && videosCount === 0 && (
                                                                <span className="text-gray-300">—</span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-500 text-[11px]">
                                                        {new Date(claim.createdAt).toLocaleDateString("en-PK", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle.bg}`}>
                                                            <StatusIcon size={12} />
                                                            <span>{claim.status}</span>
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenClaim(claim)}
                                                                className="rounded-lg p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
                                                                title="Review Claim"
                                                            >
                                                                <FiEye size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleDeleteClaim(claim._id, e)}
                                                                className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                                                title="Delete Claim"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-3 text-xs text-gray-500">
                                <div>
                                    Showing page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} claims)
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        type="button"
                                        disabled={pagination.page <= 1}
                                        onClick={() => fetchClaims(pagination.page - 1)}
                                        className="rounded border border-gray-200 bg-white px-2.5 py-1 font-medium disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        type="button"
                                        disabled={pagination.page >= pagination.pages}
                                        onClick={() => fetchClaims(pagination.page + 1)}
                                        className="rounded border border-gray-200 bg-white px-2.5 py-1 font-medium disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: COVERAGE & POLICY SETTINGS */}
            {activeTab === "coverage" && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
                        <div className="max-w-3xl">
                            <h2 className="text-lg font-bold text-gray-900">Warranty Coverage Policy Settings</h2>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                Customize the exact terms displayed in the <strong>&ldquo;What is Covered?&rdquo;</strong> and <strong>&ldquo;Not Covered:&rdquo;</strong> section on the public Warranty Claim page (<code className="bg-white/80 px-1 py-0.5 rounded text-blue-700 font-mono">/warranty</code>). Any changes made here are updated live immediately.
                            </p>
                        </div>
                    </div>

                    {coverageLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <FiRefreshCw className="animate-spin text-blue-600 mb-2" size={28} />
                            <p className="text-sm">Loading coverage configuration...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* LEFT COLUMN: EDITORS */}
                            <div className="lg:col-span-7 space-y-6">
                                {/* SECTION 1: WHAT IS COVERED */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                                <FiCheckCircle size={16} />
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-900">Covered Under Warranty</h3>
                                                <p className="text-[11px] text-gray-500">Defects and flaws eligible for free warranty replacement or repair</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Heading Title */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Section Heading
                                        </label>
                                        <input
                                            type="text"
                                            value={coveredTitle}
                                            onChange={(e) => setCoveredTitle(e.target.value)}
                                            placeholder="Covered Under Warranty:"
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-hidden"
                                        />
                                    </div>

                                    {/* Bullet Items List */}
                                    <div className="space-y-2.5">
                                        <label className="block text-xs font-semibold text-gray-700">
                                            Covered Points ({coveredItems.length})
                                        </label>
                                        {coveredItems.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="text-emerald-500 font-bold text-xs shrink-0">•</span>
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => handleUpdateCoveredItem(index, e.target.value)}
                                                    placeholder={`Coverage point ${index + 1}`}
                                                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCoveredItem(index)}
                                                    disabled={coveredItems.length <= 1}
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 transition"
                                                    title="Remove item"
                                                >
                                                    <FiTrash2 size={15} />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={handleAddCoveredItem}
                                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition w-full justify-center"
                                        >
                                            <FiPlus size={14} />
                                            <span>Add Covered Item</span>
                                        </button>
                                    </div>
                                </div>

                                {/* SECTION 2: NOT COVERED */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                                <FiAlertCircle size={16} />
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-900">Not Covered (Exclusions)</h3>
                                                <p className="text-[11px] text-gray-500">Damage, wear &amp; tear, or conditions excluded from warranty</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Heading Title */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Section Heading
                                        </label>
                                        <input
                                            type="text"
                                            value={notCoveredTitle}
                                            onChange={(e) => setNotCoveredTitle(e.target.value)}
                                            placeholder="Not Covered:"
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-hidden"
                                        />
                                    </div>

                                    {/* Bullet Items List */}
                                    <div className="space-y-2.5">
                                        <label className="block text-xs font-semibold text-gray-700">
                                            Exclusion Points ({notCoveredItems.length})
                                        </label>
                                        {notCoveredItems.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="text-rose-400 font-bold text-xs shrink-0">•</span>
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => handleUpdateNotCoveredItem(index, e.target.value)}
                                                    placeholder={`Exclusion point ${index + 1}`}
                                                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNotCoveredItem(index)}
                                                    disabled={notCoveredItems.length <= 1}
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 transition"
                                                    title="Remove item"
                                                >
                                                    <FiTrash2 size={15} />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={handleAddNotCoveredItem}
                                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition w-full justify-center"
                                        >
                                            <FiPlus size={14} />
                                            <span>Add Non-Covered Item</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-2">
                                    <button
                                        type="button"
                                        onClick={handleResetCoverageDefaults}
                                        className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
                                    >
                                        Reset to Standard Defaults
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isSavingCoverage}
                                        onClick={handleSaveCoverage}
                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition active:scale-95"
                                    >
                                        {isSavingCoverage ? (
                                            <>
                                                <FiRefreshCw className="animate-spin" size={14} />
                                                <span>Saving Changes...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiSave size={14} />
                                                <span>Save Coverage Settings</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: LIVE PUBLIC PREVIEW */}
                            <div className="lg:col-span-5">
                                <div className="sticky top-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Live Public Preview
                                        </span>
                                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                                            Matches /warranty
                                        </span>
                                    </div>

                                    {/* Replicated public sidebar Card */}
                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                        <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-gray-900">
                                            <FiCheckCircle className="text-blue-600" size={16} />
                                            <span>What is Covered?</span>
                                        </h3>

                                        <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
                                            <div>
                                                <p className="font-semibold text-gray-900 mb-1">
                                                    {coveredTitle || "Covered Under Warranty:"}
                                                </p>
                                                <ul className="list-disc pl-4 space-y-1.5">
                                                    {coveredItems.filter(Boolean).map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="pt-3 border-t border-gray-100">
                                                <p className="font-semibold text-gray-900 mb-1">
                                                    {notCoveredTitle || "Not Covered:"}
                                                </p>
                                                <ul className="list-disc pl-4 space-y-1.5 text-gray-400">
                                                    {notCoveredItems.filter(Boolean).map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-gray-400 text-center">
                                        This card dynamically reflects on the right-hand sidebar of the customer&apos;s warranty claim form.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CLAIM DETAIL MODAL */}
            {selectedClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/80 shrink-0">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-sm font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-2.5 py-1 rounded-lg">
                                    {selectedClaim.claimId}
                                </span>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Warranty Claim Review</h2>
                                    <p className="text-xs text-gray-400">
                                        Submitted on {new Date(selectedClaim.createdAt).toLocaleString("en-PK", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedClaim(null)}
                                className="rounded-xl p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                            {/* Direct Customer Communication Shortcuts */}
                            <div className="rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-emerald-50/50 p-4 border border-blue-100/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <p className="font-bold text-gray-900 text-xs sm:text-sm">
                                        Contact {selectedClaim.customerName}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        Phone: {selectedClaim.customerPhone} • Email: {selectedClaim.customerEmail}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {/* WhatsApp */}
                                    <a
                                        href={getWhatsAppUrl(selectedClaim)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition"
                                    >
                                        <FaWhatsapp size={14} />
                                        <span>WhatsApp Customer</span>
                                    </a>

                                    {/* Call */}
                                    <a
                                        href={`tel:${selectedClaim.customerPhone}`}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        <FiPhone size={13} />
                                        <span>Call</span>
                                    </a>

                                    {/* Email */}
                                    <a
                                        href={`mailto:${selectedClaim.customerEmail}?subject=ComfortSeats%20Warranty%20Claim%20${selectedClaim.claimId}`}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        <FiMail size={13} />
                                        <span>Email</span>
                                    </a>
                                </div>
                            </div>

                            {/* 2-Column Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Customer & Delivery Info */}
                                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                                        <FiMapPin className="text-blue-600" size={14} />
                                        <span>Customer &amp; Delivery Address</span>
                                    </h4>
                                    <div className="space-y-1 text-gray-600">
                                        <p><strong>Name:</strong> {selectedClaim.customerName}</p>
                                        <p><strong>Phone:</strong> {selectedClaim.customerPhone}</p>
                                        <p><strong>Email:</strong> {selectedClaim.customerEmail}</p>
                                        <p><strong>Address:</strong> {selectedClaim.address}</p>
                                        <p><strong>City / Province:</strong> {selectedClaim.city}{selectedClaim.state ? `, ${selectedClaim.state}` : ""}</p>
                                        {selectedClaim.postalCode && <p><strong>Postal Code:</strong> {selectedClaim.postalCode}</p>}
                                    </div>
                                </div>

                                {/* Order & Product Info */}
                                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                                        <FiBox className="text-blue-600" size={14} />
                                        <span>Product &amp; Order Information</span>
                                    </h4>
                                    <div className="space-y-1 text-gray-600">
                                        <p><strong>Product Name:</strong> {selectedClaim.productName}</p>
                                        {selectedClaim.productSku && <p><strong>SKU:</strong> {selectedClaim.productSku}</p>}
                                        <p><strong>Order Number:</strong> #{selectedClaim.orderNumber}</p>
                                        <p>
                                            <strong>Order Date:</strong>{" "}
                                            {new Date(selectedClaim.orderDate).toLocaleDateString("en-PK", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                        <p><strong>Claim Quantity:</strong> {selectedClaim.quantity || 1}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Issue Details */}
                            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-gray-900">Reported Issue</h4>
                                    <span className="rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
                                        {selectedClaim.issueType}
                                    </span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                                    {selectedClaim.description}
                                </div>
                            </div>

                            {/* Evidence & Attachments */}
                            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FiImage className="text-blue-600" size={15} />
                                    <span>Photo &amp; Video Evidence ({selectedClaim.attachments?.length || 0})</span>
                                </h4>

                                {!selectedClaim.attachments || selectedClaim.attachments.length === 0 ? (
                                    <p className="text-gray-400 italic">No attachments submitted for this claim.</p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {selectedClaim.attachments.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-100 aspect-square flex items-center justify-center"
                                            >
                                                {file.fileType === "video" ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                                                        <FiVideo size={28} className="text-purple-600 mb-1" />
                                                        <span className="text-[10px] font-semibold text-gray-700">Video Evidence</span>
                                                        <a
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-2 inline-flex items-center gap-1 rounded bg-purple-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-purple-700"
                                                        >
                                                            <span>Play Video</span>
                                                            <FiExternalLink size={10} />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <img
                                                            src={file.url}
                                                            alt={`Evidence ${idx + 1}`}
                                                            className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                                                        />
                                                        <div
                                                            onClick={() => setPreviewImage(file.url)}
                                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition text-white"
                                                        >
                                                            <FiEye size={20} />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Status and Workflow Update */}
                            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-4">
                                <h4 className="font-bold text-gray-900">Update Status &amp; Admin Notes</h4>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Workflow Status
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {ALL_STATUSES.map((st) => {
                                            const active = statusDraft === st;
                                            return (
                                                <button
                                                    key={st}
                                                    type="button"
                                                    onClick={() => setStatusDraft(st)}
                                                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                                        active
                                                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {st}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Internal Notes / Resolution History
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={adminNotesDraft}
                                        onChange={(e) => setAdminNotesDraft(e.target.value)}
                                        placeholder="Add private inspection notes, courier tracking numbers, or replacement details..."
                                        className="w-full rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50/80 shrink-0">
                            <button
                                type="button"
                                onClick={() => handleDeleteClaim(selectedClaim._id)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                            >
                                <FiTrash2 size={14} />
                                <span>Delete Claim</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedClaim(null)}
                                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isUpdatingStatus}
                                    onClick={handleUpdateClaim}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition active:scale-95"
                                >
                                    {isUpdatingStatus ? (
                                        <>
                                            <FiRefreshCw className="animate-spin" size={14} />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiSave size={14} />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LIGHTBOX / FULL IMAGE PREVIEW MODAL */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-black shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-3 right-3 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black transition cursor-pointer"
                        >
                            <FiX size={20} />
                        </button>
                        <img
                            src={previewImage}
                            alt="Full preview"
                            className="max-h-[85vh] max-w-full object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
