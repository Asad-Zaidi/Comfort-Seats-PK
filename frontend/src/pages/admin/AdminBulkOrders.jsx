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
    FiEdit2,
    FiPercent,
} from "react-icons/fi";
import api from "../../api/api";
import { useToast } from "../../components/ToastNotification";
import SEO from "../../components/SEO";

const STATUS_COLORS = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Under Review": "bg-blue-100 text-blue-800 border-blue-200",
    "Quote Sent": "bg-purple-100 text-purple-800 border-purple-200",
    Approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
    "Converted to Order": "bg-indigo-100 text-indigo-800 border-indigo-200",
    Cancelled: "bg-gray-100 text-gray-700 border-gray-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
};

const ALL_STATUSES = [
    "Pending",
    "Under Review",
    "Quote Sent",
    "Approved",
    "Rejected",
    "Converted to Order",
    "Cancelled",
    "Completed",
];

export default function AdminBulkOrders() {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState("quotes"); // 'quotes' | 'tiers'

    // Quotes state
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [adminNotesDraft, setAdminNotesDraft] = useState("");
    const [statusDraft, setStatusDraft] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Tiers configuration state
    const [tiers, setTiers] = useState([]);
    const [tiersLoading, setTiersLoading] = useState(false);
    const [isSavingTiers, setIsSavingTiers] = useState(false);

    // Fetch quotes list
    const fetchQuotes = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", 20);
            if (statusFilter !== "all") params.append("status", statusFilter);
            if (searchQuery.trim()) params.append("search", searchQuery.trim());

            const res = await api.get(`/bulk-orders?${params.toString()}`);
            if (res.data?.success) {
                setQuotes(res.data.data);
                setPagination(res.data.pagination || { page: 1, pages: 1, total: res.data.data.length });
            }
        } catch (err) {
            console.error("Error loading bulk quotes:", err);
            toast.error("Failed to load bulk order requests.");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchQuery, toast]);

    // Fetch discount tiers
    const fetchTiers = useCallback(async () => {
        try {
            setTiersLoading(true);
            const res = await api.get("/bulk-orders/discounts");
            if (res.data?.success) {
                setTiers(res.data.data);
            }
        } catch (err) {
            console.error("Error loading discount tiers:", err);
            toast.error("Failed to load discount tiers.");
        } finally {
            setTiersLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchQuotes(1);
        fetchTiers();
    }, [fetchQuotes, fetchTiers]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchQuotes(1);
    };

    // Open detail modal
    const handleOpenDetail = (quote) => {
        setSelectedQuote(quote);
        setStatusDraft(quote.status || "Pending");
        setAdminNotesDraft(quote.adminNotes || "");
    };

    // Save status and notes
    const handleSaveStatusAndNotes = async () => {
        if (!selectedQuote) return;
        try {
            setIsUpdatingStatus(true);
            const res = await api.put(`/bulk-orders/${selectedQuote._id}/status`, {
                status: statusDraft,
                adminNotes: adminNotesDraft,
            });
            if (res.data?.success) {
                toast.success("Quote request updated successfully.");
                setSelectedQuote(res.data.data);
                // Update in quotes array
                setQuotes((prev) =>
                    prev.map((q) => (q._id === selectedQuote._id ? res.data.data : q))
                );
            }
        } catch (err) {
            console.error("Error updating quote:", err);
            toast.error(err?.response?.data?.message || "Failed to update quote request.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Delete quote
    const handleDeleteQuote = async (id, quoteId) => {
        if (!window.confirm(`Are you sure you want to delete bulk quote ${quoteId}? This cannot be undone.`)) {
            return;
        }
        try {
            const res = await api.delete(`/bulk-orders/${id}`);
            if (res.data?.success) {
                toast.success(`Quote ${quoteId} deleted successfully.`);
                setQuotes((prev) => prev.filter((q) => q._id !== id));
                if (selectedQuote?._id === id) setSelectedQuote(null);
            }
        } catch (err) {
            console.error("Error deleting quote:", err);
            toast.error("Failed to delete quote request.");
        }
    };

    // Tiers management handlers
    const handleTierChange = (index, field, value) => {
        setTiers((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const handleAddTier = () => {
        setTiers((prev) => [
            ...prev,
            {
                minQuantity: 10,
                maxQuantity: 20,
                discountPercentage: 10,
                label: "Custom Tier",
                active: true,
                order: prev.length + 1,
            },
        ]);
    };

    const handleRemoveTier = (index) => {
        setTiers((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveTiers = async () => {
        try {
            setIsSavingTiers(true);
            const cleanedTiers = tiers.map((t, idx) => ({
                minQuantity: Number(t.minQuantity) || 1,
                maxQuantity: t.maxQuantity === "" || t.maxQuantity === null ? null : Number(t.maxQuantity),
                discountPercentage: Number(t.discountPercentage) || 0,
                label: String(t.label || "").trim(),
                active: t.active !== undefined ? t.active : true,
                order: idx + 1,
            }));

            const res = await api.put("/bulk-orders/discounts", { tiers: cleanedTiers });
            if (res.data?.success) {
                toast.success("Bulk discount tiers updated successfully.");
                setTiers(res.data.data);
            }
        } catch (err) {
            console.error("Error saving discount tiers:", err);
            toast.error(err?.response?.data?.message || "Failed to save discount tiers.");
        } finally {
            setIsSavingTiers(false);
        }
    };

    return (
        <div className="space-y-6">
            <SEO title="Bulk Order Requests | Admin Dashboard" description="Manage bulk quote requests" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bulk Orders Management</h1>
                    <p className="text-sm text-gray-500">
                        Review customer quote inquiries, update negotiation status, and configure volume discount tiers.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setActiveTab("quotes")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                            activeTab === "quotes"
                                ? "bg-white text-gray-900 shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Quote Requests ({pagination.total || quotes.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("tiers")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                            activeTab === "tiers"
                                ? "bg-white text-gray-900 shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Discount Tiers Config
                    </button>
                </div>
            </div>

            {/* TAB 1: QUOTE REQUESTS */}
            {activeTab === "quotes" && (
                <div className="space-y-4">
                    {/* Live Discount Tiers Quick Overview Banner */}
                    <div className="bg-linear-to-r from-blue-50/80 via-indigo-50/40 to-emerald-50/50 rounded-2xl p-4 border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <FiPercent size={11} /> Volume Discount Tiers
                                </span>
                                <span className="text-xs text-gray-500">
                                    (Configurable in this management screen)
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                                {(tiers.length > 0 ? tiers : [
                                    { label: "5–10 chairs", discountPercentage: 5 },
                                    { label: "11–20 chairs", discountPercentage: 10 },
                                    { label: "21–50 chairs", discountPercentage: 15 },
                                    { label: "51+ chairs", discountPercentage: 20 },
                                ]).map((t, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-gray-200/80 text-gray-800 font-semibold shadow-2xs">
                                        <span>{t.label || `${t.minQuantity}${t.maxQuantity ? `–${t.maxQuantity}` : '+'} chairs`}:</span>
                                        <span className="font-extrabold text-emerald-600">{t.discountPercentage}% OFF</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveTab("tiers")}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 transition shadow-2xs shrink-0 cursor-pointer"
                        >
                            <FiEdit2 size={13} /> Edit Discount Tiers
                        </button>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between gap-4 items-center">
                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Search by Quote ID, Company, Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-xs outline-hidden focus:border-[var(--primary,#2F6FED)]"
                            />
                            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={15} />
                        </form>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                            <FiFilter className="text-gray-400 shrink-0" size={14} />
                            <span className="text-xs font-semibold text-gray-500 shrink-0">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-700 outline-hidden focus:border-[var(--primary,#2F6FED)] bg-white cursor-pointer"
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
                                onClick={() => fetchQuotes(1)}
                                className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition shrink-0"
                                title="Refresh"
                            >
                                <FiRefreshCw size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100">
                                    <tr>
                                        <th className="py-3.5 px-4">Quote ID</th>
                                        <th className="py-3.5 px-4">Customer & Company</th>
                                        <th className="py-3.5 px-4">Contact</th>
                                        <th className="py-3.5 px-4 text-center">Chairs</th>
                                        <th className="py-3.5 px-4">Discount Tier</th>
                                        <th className="py-3.5 px-4">Est. Total</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-gray-400">
                                                Loading bulk quote requests...
                                            </td>
                                        </tr>
                                    ) : quotes.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-gray-400">
                                                No bulk order requests found matching your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        quotes.map((q) => {
                                            const statusClass = STATUS_COLORS[q.status] || "bg-gray-100 text-gray-700";
                                            return (
                                                <tr key={q._id} className="hover:bg-gray-50/60 transition">
                                                    <td className="py-3.5 px-4 font-bold text-[var(--primary,#2F6FED)]">
                                                        {q.quoteId}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-semibold text-gray-900">{q.customerName}</div>
                                                        <div className="text-[11px] text-gray-500">{q.companyName || "—"}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-[11px] text-gray-600">
                                                        <div>{q.email || "—"}</div>
                                                        <div className="text-gray-400">{q.phone}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                                                        {q.totalQuantity || "—"}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-gray-700">
                                                        <span className="font-medium">{q.discountTier || `${q.discountPercentage}%`}</span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                                                        {q.estimatedTotal ? `Rs. ${q.estimatedTotal.toLocaleString()}` : "Custom"}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span
                                                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusClass}`}
                                                        >
                                                            {q.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDetail(q)}
                                                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                                            title="View Details"
                                                        >
                                                            <FiEye size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteQuote(q._id, q.quoteId)}
                                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                                                            title="Delete Quote"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                                <div>
                                    Page {pagination.page} of {pagination.pages} ({pagination.total} total quotes)
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={pagination.page <= 1}
                                        onClick={() => fetchQuotes(pagination.page - 1)}
                                        className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        type="button"
                                        disabled={pagination.page >= pagination.pages}
                                        onClick={() => fetchQuotes(pagination.page + 1)}
                                        className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: DISCOUNT TIERS CONFIGURATION */}
            {activeTab === "tiers" && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-[var(--primary,#2F6FED)] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full">
                                    SINGLE SOURCE OF TRUTH
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mt-1">Bulk Discount Tiers Configuration</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Modify chair quantity ranges, discount rates, and labels. Changes here dynamically update the customer calculation table on the website.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleAddTier}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                            >
                                <FiPlus size={14} /> Add New Tier
                            </button>
                            <button
                                type="button"
                                disabled={isSavingTiers}
                                onClick={handleSaveTiers}
                                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--primary,#2F6FED)] hover:bg-[var(--primary-hover,#1d4ed8)] transition shadow-sm cursor-pointer"
                            >
                                <FiSave size={14} /> {isSavingTiers ? "Saving..." : "Save Discount Tiers"}
                            </button>
                        </div>
                    </div>

                    {tiersLoading ? (
                        <div className="py-12 text-center text-xs text-gray-400">Loading discount tiers...</div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100">
                                        <tr>
                                            <th className="py-3.5 px-4">Quantity Range (Chairs)</th>
                                            <th className="py-3.5 px-4">Discount Rate</th>
                                            <th className="py-3.5 px-4">Display Label</th>
                                            <th className="py-3.5 px-4 text-center">Customer View Preview</th>
                                            <th className="py-3.5 px-4 text-center">Status</th>
                                            <th className="py-3.5 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tiers.map((tier, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition">
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="space-y-1">
                                                            <span className="block text-[10px] uppercase font-bold text-gray-400">Min</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={tier.minQuantity}
                                                                onChange={(e) => handleTierChange(idx, "minQuantity", Number(e.target.value))}
                                                                className="w-20 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-800 text-center"
                                                            />
                                                        </div>
                                                        <span className="text-gray-400 font-medium pt-4">to</span>
                                                        <div className="space-y-1">
                                                            <span className="block text-[10px] uppercase font-bold text-gray-400">Max (Blank for +)</span>
                                                            <input
                                                                type="number"
                                                                value={tier.maxQuantity === null ? "" : tier.maxQuantity}
                                                                placeholder="Unlimited"
                                                                onChange={(e) =>
                                                                    handleTierChange(
                                                                        idx,
                                                                        "maxQuantity",
                                                                        e.target.value === "" ? null : Number(e.target.value)
                                                                    )
                                                                }
                                                                className="w-28 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 text-center"
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-1.5 pt-4">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={tier.discountPercentage}
                                                            onChange={(e) =>
                                                                handleTierChange(idx, "discountPercentage", Number(e.target.value))
                                                            }
                                                            className="w-16 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-600 text-center"
                                                        />
                                                        <span className="text-xs font-bold text-gray-600">% OFF</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="pt-4">
                                                        <input
                                                            type="text"
                                                            value={tier.label}
                                                            onChange={(e) => handleTierChange(idx, "label", e.target.value)}
                                                            placeholder="e.g. 5–10 chairs"
                                                            className="w-full min-w-[140px] rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="pt-4">
                                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                                            {tier.discountPercentage}% OFF
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="pt-4">
                                                        <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={tier.active !== false}
                                                                onChange={(e) => handleTierChange(idx, "active", e.target.checked)}
                                                                className="rounded text-[var(--primary,#2F6FED)] h-4 w-4"
                                                            />
                                                            <span className={tier.active !== false ? "font-bold text-emerald-700" : "text-gray-400"}>
                                                                {tier.active !== false ? "Active" : "Disabled"}
                                                            </span>
                                                        </label>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTier(idx)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                                            title="Delete Tier"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* DETAIL MODAL */}
            {selectedQuote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <div>
                                <span className="text-xs font-bold text-[var(--primary,#2F6FED)] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full">
                                    QUOTE DETAILS
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 mt-1">
                                    {selectedQuote.quoteId}{selectedQuote.companyName ? ` • ${selectedQuote.companyName}` : ""}
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Received: {new Date(selectedQuote.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedQuote(null)}
                                className="text-gray-400 hover:text-gray-600 p-2"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Customer & Company Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4 text-xs">
                            <div>
                                <span className="text-gray-400 uppercase font-bold text-[10px]">Contact Person</span>
                                <p className="font-bold text-gray-900 text-sm">{selectedQuote.customerName}</p>
                                {selectedQuote.email ? (
                                    <p className="text-gray-600 mt-1 flex items-center gap-1.5">
                                        <FiMail size={12} /> {selectedQuote.email}
                                    </p>
                                ) : (
                                    <p className="text-gray-400 italic mt-1 text-[11px] flex items-center gap-1.5">
                                        <FiMail size={12} /> No email provided
                                    </p>
                                )}
                                <p className="text-gray-600 flex items-center gap-1.5">
                                    <FiPhone size={12} /> {selectedQuote.phone}
                                </p>
                            </div>

                            <div>
                                <span className="text-gray-400 uppercase font-bold text-[10px]">Company / Organization</span>
                                <p className="font-bold text-gray-900 text-sm">
                                    {selectedQuote.companyName || <span className="text-gray-400 font-normal italic">Individual / Not specified</span>}
                                </p>
                                <p className="text-gray-600 mt-1 flex items-start gap-1.5">
                                    <FiMapPin size={12} className="shrink-0 mt-0.5" />
                                    <span>
                                        {selectedQuote.deliveryAddress}, {selectedQuote.city}
                                        {selectedQuote.state ? `, ${selectedQuote.state}` : ""}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Quantity & Volume Pricing Summary */}
                        <div className="border border-blue-100 bg-blue-50/40 rounded-2xl p-4 text-xs space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Quantity:</span>
                                <span className="font-bold text-gray-900 text-sm">
                                    {selectedQuote.totalQuantity ? `${selectedQuote.totalQuantity} Chairs` : "Standard Inquiry"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Applicable Tier:</span>
                                <span className="font-bold text-emerald-700">
                                    {selectedQuote.discountTier || `${selectedQuote.discountPercentage}% OFF`}
                                </span>
                            </div>
                            {selectedQuote.estimatedSubtotal > 0 && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Estimated Subtotal:</span>
                                        <span className="text-gray-800">Rs. {selectedQuote.estimatedSubtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-700 font-semibold">
                                        <span>Estimated Bulk Discount:</span>
                                        <span>- Rs. {(selectedQuote.estimatedDiscount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-2 border-t border-blue-200/60 flex justify-between text-sm font-bold text-[var(--primary,#2F6FED)]">
                                        <span>Estimated Total:</span>
                                        <span>Rs. {(selectedQuote.estimatedTotal || 0).toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Products Requested */}
                        {selectedQuote.products && selectedQuote.products.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Products Selected</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {selectedQuote.products.map((p, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                {p.imageUrl ? (
                                                    <img
                                                        src={p.imageUrl}
                                                        alt={p.productName}
                                                        className="h-8 w-8 object-cover rounded-lg bg-gray-200"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-lg bg-blue-100 text-[var(--primary,#2F6FED)] flex items-center justify-center">
                                                        <FiBox size={14} />
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-bold text-gray-800">{p.productName}</span>
                                                    {p.sku && <span className="text-[10px] text-gray-400 ml-1.5">({p.sku})</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-semibold text-gray-800">{p.quantity} Units</span>
                                                {p.price > 0 && (
                                                    <div className="text-[10px] text-gray-500">
                                                        Rs. {(p.price * p.quantity).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Customer Additional Requirements */}
                        {selectedQuote.additionalDetails && (
                            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-900">
                                <span className="font-bold uppercase text-[10px] text-amber-800">Customer Additional Notes:</span>
                                <p className="mt-1 whitespace-pre-wrap leading-relaxed">{selectedQuote.additionalDetails}</p>
                            </div>
                        )}

                        {/* Status & Admin Notes Form */}
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Update Quote Status</label>
                                <select
                                    value={statusDraft}
                                    onChange={(e) => setStatusDraft(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-semibold text-gray-800 outline-hidden focus:border-[var(--primary,#2F6FED)] bg-white"
                                >
                                    {ALL_STATUSES.map((st) => (
                                        <option key={st} value={st}>
                                            {st}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Internal Admin Notes (Only visible to admin team)
                                </label>
                                <textarea
                                    rows={3}
                                    value={adminNotesDraft}
                                    onChange={(e) => setAdminNotesDraft(e.target.value)}
                                    placeholder="e.g. Sent PDF quote with 12% discount. Client requested invoice by Friday..."
                                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-hidden focus:border-[var(--primary,#2F6FED)] resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedQuote(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isUpdatingStatus}
                                    onClick={handleSaveStatusAndNotes}
                                    className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-[var(--primary,#2F6FED)] hover:bg-[var(--primary-hover,#1d4ed8)] transition shadow-sm"
                                >
                                    {isUpdatingStatus ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
