import React, { useState, useEffect, useCallback, useMemo } from "react";
import api, { postMultipart, putMultipart } from "../../api/api";
import { useToast } from "../../components/ToastNotification";
import {
    FiPercent,
    FiPlus,
    FiEdit2,
    FiCopy,
    FiTrash2,
    FiEye,
    FiPower,
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiAlertTriangle,
    FiX,
    FiUploadCloud,
    FiArrowRight,
    FiCheck,
    FiPackage,
    FiVolume2,
    FiSearch,
    FiShoppingBag,
} from "react-icons/fi";

const DEFAULT_CAMPAIGN = {
    campaignName: "",
    heading: "",
    startDate: "",
    endDate: "",
    productId: "",
    productName: "",
    productSlug: "",
    saleProducts: [],
    isSalePageEnabled: true,
    ctaText: "SHOP NOW",
    ctaUrl: "/sale",
    badgeText: "LIMITED TIME OFFER",
    discountText: "",
    image: { url: "", publicId: "" },
    status: "DRAFT",
    isPopupEnabled: true,
    countdownEnabled: true,
    showAnnouncementBar: true,
    announcementText: "",
    announcementBgColor: "#1e3a5f",
    announcementTextColor: "#ffffff",
    announcementLinkText: "Shop Sale",
    displayFrequency: "once_per_session",
    showCloseButton: true,
};

const AdminSales = () => {
    const toast = useToast();

    // List State
    const [campaigns, setCampaigns] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState(DEFAULT_CAMPAIGN);
    const [saving, setSaving] = useState(false);
    const [productSearch, setProductSearch] = useState("");

    // Image Upload State (3:2 Aspect Ratio - 1500 x 1000 px)
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // Fullscreen Preview State
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewCampaignData, setPreviewCampaignData] = useState(null);

    // Conflict / Activation Modal
    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [pendingActivationCampaign, setPendingActivationCampaign] = useState(null);
    const [currentlyActiveCampaign, setCurrentlyActiveCampaign] = useState(null);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch Campaigns
    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/sales");
            if (res.data?.success && Array.isArray(res.data?.data)) {
                setCampaigns(res.data.data);
                const active = res.data.data.find(
                    (c) => c.status === "ACTIVE" && c.isPopupEnabled
                );
                setCurrentlyActiveCampaign(active || null);
            }
        } catch (error) {
            console.error("Failed to load sales campaigns:", error);
            toast.error("Failed to load sales campaigns.");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Fetch Products for Dropdown Selection
    const fetchProducts = useCallback(async () => {
        try {
            const res = await api.get("/products?limit=500");
            if (res.data?.success && Array.isArray(res.data?.data)) {
                setProducts(res.data.data);
            } else if (Array.isArray(res.data)) {
                setProducts(res.data);
            }
        } catch (err) {
            console.warn("Could not fetch products for dropdown:", err?.message);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
        fetchProducts();
    }, [fetchCampaigns, fetchProducts]);

    // Format Date for datetime-local
    const toDatetimeLocal = (dateString) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "";
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
            d.getHours()
        )}:${pad(d.getMinutes())}`;
    };

    // Format display date
    const formatDisplayDate = (dateString) => {
        if (!dateString) return "Not set";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "Invalid date";
        return d.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Form field change
    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Filtered products within the modal for selection
    const filteredModalProducts = useMemo(() => {
        if (!productSearch.trim()) return products;
        const q = productSearch.toLowerCase();
        return products.filter((p) => {
            const nameMatch = p.name?.toLowerCase().includes(q);
            const cat = typeof p.category === "object" ? p.category?.name : p.category;
            const catMatch = cat?.toLowerCase().includes(q);
            return nameMatch || catMatch;
        });
    }, [products, productSearch]);

    // Toggle individual product selection for sale
    const handleToggleSaleProduct = (prodId) => {
        setFormData((prev) => {
            const currentList = Array.isArray(prev.saleProducts) ? prev.saleProducts : [];
            const exists = currentList.includes(prodId);
            const updated = exists
                ? currentList.filter((id) => id !== prodId)
                : [...currentList, prodId];

            const firstProd = products.find((p) => p._id === (updated[0] || null));
            return {
                ...prev,
                saleProducts: updated,
                productId: firstProd ? firstProd._id : "",
                productName: firstProd ? firstProd.name : "",
                productSlug: firstProd ? (firstProd.slug || firstProd._id) : "",
                ctaUrl: "/sale",
            };
        });
    };

    // Select all filtered products for sale
    const handleSelectAllSaleProducts = (listToSelect) => {
        setFormData((prev) => {
            const currentSet = new Set(Array.isArray(prev.saleProducts) ? prev.saleProducts : []);
            listToSelect.forEach((p) => currentSet.add(p._id));
            const updated = Array.from(currentSet);
            const firstProd = products.find((p) => p._id === (updated[0] || null));
            return {
                ...prev,
                saleProducts: updated,
                productId: firstProd ? firstProd._id : "",
                productName: firstProd ? firstProd.name : "",
                productSlug: firstProd ? (firstProd.slug || firstProd._id) : "",
                ctaUrl: "/sale",
            };
        });
    };

    // Clear all selected products
    const handleClearSaleProducts = () => {
        setFormData((prev) => ({
            ...prev,
            saleProducts: [],
            productId: "",
            productName: "",
            productSlug: "",
            ctaUrl: "/sale",
        }));
    };

    // Handle Image file select (3:2 Ratio - 1500 x 1000)
    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image file must be under 5MB.");
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Remove Image
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");
        setFormData((prev) => ({
            ...prev,
            image: { url: "", publicId: "" },
            removeImage: true,
        }));
    };

    // Open Create Modal
    const handleOpenCreate = () => {
        setIsEditing(false);
        setCurrentId(null);
        setProductSearch("");
        setFormData({
            ...DEFAULT_CAMPAIGN,
            saleProducts: [],
            isSalePageEnabled: true,
            ctaUrl: "/sale",
            startDate: toDatetimeLocal(new Date()),
            endDate: toDatetimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        });
        setImageFile(null);
        setImagePreview("");
        setIsFormOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (camp) => {
        setIsEditing(true);
        setCurrentId(camp._id);
        setProductSearch("");
        const mappedProducts = Array.isArray(camp.saleProducts)
            ? camp.saleProducts.map((p) => (typeof p === "object" && p?._id ? p._id : p))
            : (camp.productId ? [camp.productId] : []);

        setFormData({
            ...DEFAULT_CAMPAIGN,
            ...camp,
            saleProducts: mappedProducts,
            isSalePageEnabled: camp.isSalePageEnabled !== false,
            ctaUrl: camp.ctaUrl || "/sale",
            startDate: toDatetimeLocal(camp.startDate),
            endDate: toDatetimeLocal(camp.endDate),
        });
        setImageFile(null);
        setImagePreview(camp.image?.url || "");
        setIsFormOpen(true);
    };

    // Submit Campaign (Save Draft or Activate)
    const handleSubmitForm = async (targetStatus = null) => {
        if (!formData.campaignName.trim()) {
            toast.error("Please enter a campaign title.");
            return;
        }
        if (!formData.startDate) {
            toast.error("Please select a start date and time.");
            return;
        }
        if (!formData.endDate) {
            toast.error("Please select an end date and time.");
            return;
        }

        const desiredStatus = targetStatus || formData.status || "DRAFT";

        if (
            desiredStatus === "ACTIVE" &&
            currentlyActiveCampaign &&
            currentlyActiveCampaign._id !== currentId
        ) {
            setPendingActivationCampaign({
                ...formData,
                heading: formData.campaignName,
                status: "ACTIVE",
            });
            setConflictModalOpen(true);
            return;
        }

        await executeSave({
            ...formData,
            heading: formData.campaignName,
            status: desiredStatus,
        });
    };

    // Save to API
    const executeSave = async (payload) => {
        setSaving(true);
        try {
            const data = new FormData();

            Object.entries(payload).forEach(([key, value]) => {
                if (key === "image" || key === "_id" || key === "createdAt" || key === "updatedAt" || key === "effectiveStatus") {
                    return;
                }
                if (key === "saleProducts") {
                    data.append("saleProducts", JSON.stringify(value || []));
                    return;
                }
                if (value !== undefined && value !== null) {
                    data.append(key, value);
                }
            });

            if (imageFile) {
                data.append("image", imageFile);
            } else if (payload.removeImage) {
                data.append("removeImage", "true");
            } else if (payload.image?.url) {
                data.append("image", payload.image.url);
            }

            let res;
            if (isEditing && currentId) {
                res = await putMultipart(`/sales/${currentId}`, data);
            } else {
                res = await postMultipart("/sales", data);
            }

            if (res.data?.success) {
                toast.success(
                    isEditing
                        ? "Campaign updated successfully."
                        : "Campaign created successfully."
                );
                setIsFormOpen(false);
                fetchCampaigns();
            } else {
                throw new Error(res.data?.message || "Failed to save campaign.");
            }
        } catch (error) {
            console.error("Save campaign error:", error);
            toast.error(
                error.response?.data?.message || error.message || "Failed to save campaign."
            );
        } finally {
            setSaving(false);
            setConflictModalOpen(false);
            setPendingActivationCampaign(null);
        }
    };

    // Direct Toggle Popup ON / OFF
    const handleTogglePopup = async (camp) => {
        try {
            const res = await api.patch(`/sales/${camp._id}/toggle-popup`, {
                isPopupEnabled: !camp.isPopupEnabled,
            });
            if (res.data?.success) {
                toast.success(
                    `Sales popup ${!camp.isPopupEnabled ? "enabled" : "disabled"} for "${camp.campaignName}".`
                );
                fetchCampaigns();
            }
        } catch (err) {
            toast.error("Failed to update popup status.");
        }
    };

    // Activate request with conflict handling
    const handleRequestActivate = (camp) => {
        if (
            currentlyActiveCampaign &&
            currentlyActiveCampaign._id !== camp._id &&
            currentlyActiveCampaign.status === "ACTIVE"
        ) {
            setPendingActivationCampaign(camp);
            setConflictModalOpen(true);
        } else {
            confirmActivation(camp._id);
        }
    };

    // Confirm Activation
    const confirmActivation = async (id) => {
        try {
            const res = await api.patch(`/sales/${id}/activate`);
            if (res.data?.success) {
                toast.success(res.data?.message || "Campaign activated successfully!");
                setConflictModalOpen(false);
                setPendingActivationCampaign(null);
                fetchCampaigns();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to activate campaign.");
        }
    };

    // Deactivate
    const handleDeactivate = async (id) => {
        try {
            const res = await api.patch(`/sales/${id}/deactivate`);
            if (res.data?.success) {
                toast.success("Campaign deactivated.");
                fetchCampaigns();
            }
        } catch (err) {
            toast.error("Failed to deactivate campaign.");
        }
    };

    // Duplicate
    const handleDuplicate = async (id) => {
        try {
            const res = await api.post(`/sales/${id}/duplicate`);
            if (res.data?.success) {
                toast.success(res.data?.message || "Campaign duplicated!");
                fetchCampaigns();
            }
        } catch (err) {
            toast.error("Failed to duplicate campaign.");
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!campaignToDelete) return;
        setDeleting(true);
        try {
            const res = await api.delete(`/sales/${campaignToDelete._id}`);
            if (res.data?.success) {
                toast.success("Campaign deleted successfully.");
                setDeleteModalOpen(false);
                setCampaignToDelete(null);
                fetchCampaigns();
            }
        } catch (err) {
            toast.error("Failed to delete campaign.");
        } finally {
            setDeleting(false);
        }
    };

    // Fullscreen Preview
    const handleOpenPreview = (camp) => {
        setPreviewCampaignData(camp);
        setIsPreviewModalOpen(true);
    };

    // Filtered campaigns
    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((c) => {
            const matchesSearch =
                c.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.productName && c.productName.toLowerCase().includes(searchQuery.toLowerCase()));

            if (statusFilter === "ALL") return matchesSearch;
            const eff = c.effectiveStatus || c.status;
            return matchesSearch && eff === statusFilter;
        });
    }, [campaigns, searchQuery, statusFilter]);

    // Status Badge Component
    const renderStatusBadge = (effStatus) => {
        switch (effStatus) {
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        ACTIVE
                    </span>
                );
            case "SCHEDULED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        <FiClock size={12} />
                        SCHEDULED
                    </span>
                );
            case "EXPIRED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        EXPIRED
                    </span>
                );
            case "DRAFT":
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        DRAFT
                    </span>
                );
        }
    };

    // Stats
    const stats = useMemo(() => {
        const total = campaigns.length;
        const active = campaigns.filter((c) => (c.effectiveStatus || c.status) === "ACTIVE").length;
        const scheduled = campaigns.filter((c) => (c.effectiveStatus || c.status) === "SCHEDULED").length;
        const expired = campaigns.filter((c) => (c.effectiveStatus || c.status) === "EXPIRED").length;
        return { total, active, scheduled, expired };
    }, [campaigns]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div
                        style={{
                            backgroundColor: "color-mix(in srgb, var(--primary, #2F6FED) 10%, transparent)",
                            color: "var(--primary, #2F6FED)"
                        }}
                        className="p-2.5 rounded-xl font-bold"
                    >
                        <FiPercent size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Sales Campaigns
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Create promotional campaigns with 3:2 banners (1500×1000), countdown timers, and product links.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleOpenCreate}
                    style={{
                        backgroundColor: "var(--primary, #2F6FED)",
                        color: "#ffffff",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--primary-hover, #1d4ed8)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--primary, #2F6FED)"; }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                    <FiPlus size={18} />
                    <span>Create Sale</span>
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales</p>
                        <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{stats.total}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-gray-600 font-bold">
                        <FiPercent size={18} />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Popup</p>
                        <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.active}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scheduled</p>
                        <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{stats.scheduled}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        <FiClock size={18} />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expired</p>
                        <h3 className="text-2xl font-extrabold text-gray-500 mt-1">{stats.expired}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                        <FiCalendar size={18} />
                    </div>
                </div>
            </div>

            {/* Currently Active Banner Alert Card */}
            {currentlyActiveCampaign && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-transparent border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                            <FiCheckCircle size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                                    Current Live Storefront Popup
                                </span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            </div>
                            <h4 className="text-base font-bold text-gray-900 mt-0.5">
                                {currentlyActiveCampaign.campaignName}
                                {currentlyActiveCampaign.productName && (
                                    <span className="text-blue-600 font-semibold ml-2 text-xs">
                                        &bull; Product: {currentlyActiveCampaign.productName}
                                    </span>
                                )}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Scheduled: {formatDisplayDate(currentlyActiveCampaign.startDate)} &rarr;{" "}
                                {formatDisplayDate(currentlyActiveCampaign.endDate)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                            onClick={() => handleOpenPreview(currentlyActiveCampaign)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-sm transition"
                        >
                            <FiEye size={14} />
                            <span>Preview</span>
                        </button>
                        <button
                            onClick={() => handleOpenEdit(currentlyActiveCampaign)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                        >
                            <FiEdit2 size={14} />
                            <span>Edit Live Sale</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Filters and Search Bar */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-72">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search campaigns..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/15 transition"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    {["ALL", "ACTIVE", "SCHEDULED", "DRAFT", "EXPIRED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            style={statusFilter === status ? {
                                backgroundColor: "var(--primary, #2F6FED)",
                                color: "#ffffff",
                            } : {}}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${statusFilter === status
                                ? "shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-16">
                        <div
                            style={{ borderBottomColor: "var(--primary, #2F6FED)" }}
                            className="animate-spin rounded-full h-8 w-8 border-b-2"
                        />
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="p-16 text-center">
                        <div
                            style={{
                                backgroundColor: "color-mix(in srgb, var(--primary, #2F6FED) 10%, transparent)",
                                color: "var(--primary, #2F6FED)"
                            }}
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <FiPercent size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">No sales campaigns found</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-5">
                            {searchQuery || statusFilter !== "ALL"
                                ? "No campaigns match your current search or status filter."
                                : "Create a sales campaign with a 1500×1000 (3:2) banner to boost customer engagement."}
                        </p>
                        <button
                            onClick={handleOpenCreate}
                            style={{
                                backgroundColor: "var(--primary, #2F6FED)",
                                color: "#ffffff",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--primary-hover, #1d4ed8)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--primary, #2F6FED)"; }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition cursor-pointer"
                        >
                            <FiPlus size={16} />
                            <span>Create Sale Campaign</span>
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                                    <th className="py-3.5 px-4 sm:px-6">Campaign Banner</th>
                                    <th className="py-3.5 px-4">Sale Products & Page</th>
                                    <th className="py-3.5 px-4">Schedule Dates</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-center">Popup</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredCampaigns.map((camp) => {
                                    const effStatus = camp.effectiveStatus || camp.status;

                                    return (
                                        <tr
                                            key={camp._id}
                                            className="hover:bg-slate-50/60 transition group"
                                        >
                                            {/* Banner thumbnail and Title */}
                                            <td className="py-4 px-4 sm:px-6">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-18 h-12 rounded-xl overflow-hidden bg-slate-100 border border-gray-200 flex-shrink-0 aspect-[3/2] flex items-center justify-center">
                                                        {camp.image?.url ? (
                                                            <img
                                                                src={camp.image.url}
                                                                alt={camp.campaignName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <FiPercent className="text-gray-400" size={20} />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-gray-900 truncate">
                                                            {camp.campaignName}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                                3:2 Banner
                                                            </span>
                                                            {camp.discountText && (
                                                                <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                                                    {camp.discountText}
                                                                </span>
                                                            )}
                                                            {camp.showAnnouncementBar !== false && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                                    <FiVolume2 size={10} /> Top Bar
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Linked Products & Sale Page */}
                                            <td className="py-4 px-4">
                                                {Array.isArray(camp.saleProducts) && camp.saleProducts.length > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg w-fit">
                                                            <FiPackage size={13} />
                                                            <span>{camp.saleProducts.length} Product{camp.saleProducts.length > 1 ? "s" : ""} on Sale</span>
                                                        </div>
                                                        {camp.isSalePageEnabled !== false && (
                                                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                Sale Page Active (/sale)
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : camp.productName ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                                                        <FiPackage size={14} />
                                                        <span className="truncate max-w-[200px]">{camp.productName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Storewide Catalog</span>
                                                )}
                                            </td>

                                            {/* Schedule Dates */}
                                            <td className="py-4 px-4">
                                                <div className="text-xs text-gray-700">
                                                    <div>
                                                        <span className="font-semibold text-gray-500">From: </span>
                                                        {formatDisplayDate(camp.startDate)}
                                                    </div>
                                                    <div className="mt-0.5">
                                                        <span className="font-semibold text-gray-500">To: </span>
                                                        {formatDisplayDate(camp.endDate)}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Effective Status */}
                                            <td className="py-4 px-4">
                                                {renderStatusBadge(effStatus)}
                                            </td>

                                            {/* Popup ON/OFF Toggle */}
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleTogglePopup(camp)}
                                                    title={camp.isPopupEnabled ? "Disable Popup" : "Enable Popup"}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${camp.isPopupEnabled ? "bg-emerald-500" : "bg-gray-300"
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${camp.isPopupEnabled ? "translate-x-6" : "translate-x-1"
                                                            }`}
                                                    />
                                                </button>
                                                <div className="text-[10px] font-bold text-gray-400 mt-1">
                                                    {camp.isPopupEnabled ? "ON" : "OFF"}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-4 sm:px-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenPreview(camp)}
                                                        title="Live Preview"
                                                        className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
                                                    >
                                                        <FiEye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(camp)}
                                                        title="Edit Campaign"
                                                        className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicate(camp._id)}
                                                        title="Duplicate"
                                                        className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                    >
                                                        <FiCopy size={16} />
                                                    </button>
                                                    {camp.status === "ACTIVE" ? (
                                                        <button
                                                            onClick={() => handleDeactivate(camp._id)}
                                                            title="Deactivate Campaign"
                                                            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                                                        >
                                                            <FiPower size={16} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRequestActivate(camp)}
                                                            title="Activate Campaign"
                                                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                                        >
                                                            <FiPower size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setCampaignToDelete(camp);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                        title="Delete Campaign"
                                                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
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
            </div>

            {/* STREAMLINED CENTERED CREATE / EDIT SALES CAMPAIGN MODAL */}
            {isFormOpen && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-opacity"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !saving) {
                            setIsFormOpen(false);
                        }
                    }}
                >
                    <div className="relative w-full max-w-4xl bg-white max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden my-auto animate-scaleIn border border-gray-100">
                        {/* Header styled like standard Admin Modals (e.g. Product Wizard) */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <span
                                    style={{
                                        backgroundColor: "color-mix(in srgb, var(--primary, #2F6FED) 10%, transparent)",
                                        color: "var(--primary, #2F6FED)"
                                    }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl font-bold"
                                >
                                    <FiPercent size={20} />
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {isEditing ? `Edit: ${formData.campaignName}` : "Create New Sales Campaign"}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Add campaign title, schedule dates, target product, and 3:2 banner image (1500×1000 px).
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Split Body: Focused Form on Left, 3:2 Live Preview on Right */}
                        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
                            {/* Left Side: Only the requested fields */}
                            <div className="lg:col-span-6 p-6 overflow-y-auto space-y-5">
                                {/* 1. Campaign Title & Sale Discount Offer */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Campaign Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.campaignName}
                                            onChange={(e) => handleFieldChange("campaignName", e.target.value)}
                                            placeholder="e.g. Independence Day Sale, Summer Clearance"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/15 transition font-medium"
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            Main campaign heading on the popup and sale page.
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Sale Discount Offer (e.g. Sale Up to 10% - 20%)
                                            </label>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                Optional
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.discountText}
                                            onChange={(e) => handleFieldChange("discountText", e.target.value)}
                                            placeholder="e.g. SALE UP TO 10% - 20%, UP TO 20% OFF"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/15 transition font-medium"
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            Shown prominently on the popup card, top announcement bar, and dedicated sale page.
                                        </p>

                                        {/* Quick Suggestion Pills */}
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                                                Quick Add:
                                            </span>
                                            {[
                                                "Sale Up to 10% - 20%",
                                                "Up to 10% OFF",
                                                "Up to 20% OFF",
                                                "Up to 30% OFF",
                                                "Up to 50% OFF",
                                                "Flat 20% OFF",
                                            ].map((pill) => (
                                                <button
                                                    key={pill}
                                                    type="button"
                                                    onClick={() => handleFieldChange("discountText", pill)}
                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer border ${formData.discountText === pill
                                                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                                                        }`}
                                                >
                                                    {pill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Start & End Date/Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Start Date & Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.startDate}
                                            onChange={(e) => handleFieldChange("startDate", e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/15 transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            End Date & Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.endDate}
                                            onChange={(e) => handleFieldChange("endDate", e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/15 transition"
                                        />
                                    </div>
                                </div>

                                {/* 3. Multi-Product Selection for Sale & Dedicated Sale Page */}
                                <div className="space-y-3 pt-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Select Products for Sale
                                            </label>
                                            <span
                                                style={{
                                                    backgroundColor: "color-mix(in srgb, var(--primary, #2F6FED) 12%, transparent)",
                                                    color: "var(--primary, #2F6FED)",
                                                }}
                                                className="px-2 py-0.5 rounded-full text-[11px] font-extrabold"
                                            >
                                                {(formData.saleProducts || []).length} Selected
                                            </span>
                                        </div>

                                        {/* Quick Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectAllSaleProducts(filteredModalProducts)}
                                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                                            >
                                                Select All ({filteredModalProducts.length})
                                            </button>
                                            {(formData.saleProducts || []).length > 0 && (
                                                <>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        type="button"
                                                        onClick={handleClearSaleProducts}
                                                        className="text-[11px] font-bold text-rose-500 hover:text-rose-700 transition cursor-pointer"
                                                    >
                                                        Clear
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-gray-500">
                                        Choose products from the catalog to put on sale. These will be highlighted on the dedicated <strong>/sale</strong> page when the campaign is active.
                                    </p>

                                    {/* Dedicated Sale Page Toggle Card */}
                                    <div className="p-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/60 rounded-xl border border-blue-100/80 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                style={{
                                                    backgroundColor: "var(--primary, #2F6FED)",
                                                    color: "#ffffff",
                                                }}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs shadow-sm"
                                            >
                                                <FiShoppingBag size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">
                                                    Enable Dedicated Sale Page (<code className="text-[11px] font-mono text-blue-700 bg-white px-1 py-0.5 rounded border border-blue-200">/sale</code>)
                                                </p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">
                                                    When turned ON, the "Sale" link shows on the navbar and campaign CTAs lead to /sale.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleFieldChange("isSalePageEnabled", !formData.isSalePageEnabled)}
                                            className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${formData.isSalePageEnabled !== false ? "bg-emerald-500" : "bg-gray-300"}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out translate-y-0.5 ${formData.isSalePageEnabled !== false ? "translate-x-5" : "translate-x-0.5"}`}
                                            />
                                        </button>
                                    </div>

                                    {/* Search input for products */}
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Search products by name or category..."
                                            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[var(--primary,#2F6FED)] focus:ring-2 focus:ring-[var(--primary,#2F6FED)]/15 transition bg-white"
                                        />
                                        {productSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setProductSearch("")}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <FiX size={13} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Selected Products Preview Chips */}
                                    {(formData.saleProducts || []).length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-gray-50/80 rounded-xl border border-gray-100">
                                            {(formData.saleProducts || []).map((id) => {
                                                const prod = products.find((p) => p._id === id);
                                                if (!prod) return null;
                                                const thumb = prod.primaryImage?.url || prod.images?.[0]?.url || prod.image || prod.imageUrl;
                                                return (
                                                    <span
                                                        key={id}
                                                        className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-lg bg-white border border-gray-200 text-[11px] font-semibold text-gray-800 shadow-xs"
                                                    >
                                                        {thumb && (
                                                            <img
                                                                src={thumb}
                                                                alt=""
                                                                className="w-4 h-4 object-cover rounded"
                                                            />
                                                        )}
                                                        <span className="truncate max-w-[130px]">{prod.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleSaleProduct(id)}
                                                            className="text-gray-400 hover:text-rose-600 ml-0.5"
                                                        >
                                                            <FiX size={11} />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Scrollable Checklist of Products */}
                                    <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100 bg-white shadow-xs">
                                        {filteredModalProducts.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-gray-400">
                                                No products found matching "{productSearch}"
                                            </div>
                                        ) : (
                                            filteredModalProducts.map((p) => {
                                                const isSelected = (formData.saleProducts || []).includes(p._id);
                                                const thumb = p.primaryImage?.url || p.images?.[0]?.url || p.image || p.imageUrl;
                                                const catName = typeof p.category === "object" ? p.category?.name : (Array.isArray(p.category) ? p.category[0] : p.category);

                                                return (
                                                    <div
                                                        key={p._id}
                                                        onClick={() => handleToggleSaleProduct(p._id)}
                                                        className={`flex items-center justify-between p-2.5 hover:bg-slate-50 transition cursor-pointer select-none ${isSelected ? "bg-blue-50/40" : ""}`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => { }}
                                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
                                                            />
                                                            {thumb ? (
                                                                <img
                                                                    src={thumb}
                                                                    alt=""
                                                                    className="w-8 h-8 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                                    <FiPackage size={14} />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-gray-800 truncate">
                                                                    {p.name}
                                                                </p>
                                                                {catName && (
                                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                                        {catName}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {p.price !== undefined && p.price !== null && (
                                                            <span className="text-xs font-bold text-gray-900 ml-2 whitespace-nowrap">
                                                                Rs. {p.price.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* 4. Background Image Banner for Sale (3:2 Ratio - 1500x1000) */}
                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Background Image Banner for Sale
                                        </label>
                                        <span
                                            style={{
                                                backgroundColor: "color-mix(in srgb, var(--primary, #2F6FED) 10%, transparent)",
                                                color: "var(--primary, #2F6FED)"
                                            }}
                                            className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide"
                                        >
                                            3:2 Aspect Ratio (1500 × 1000)
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mb-2.5">
                                        Banner image covering the popup canvas. Recommended: 1500 × 1000 px (3:2 Ratio), max 5MB.
                                    </p>

                                    {imagePreview ? (
                                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-900 group aspect-[3/2] max-w-[280px] mx-auto shadow-md">
                                            <img
                                                src={imagePreview}
                                                alt="Upload preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                <label className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold cursor-pointer hover:bg-gray-100 transition shadow">
                                                    Replace
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageSelect}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="border-2 border-dashed border-gray-300 hover:border-[var(--primary,#2F6FED)] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-50/60 hover:bg-gray-50 transition group aspect-[3/2] max-w-[280px] mx-auto">
                                            <FiUploadCloud size={32} className="text-gray-400 group-hover:text-[var(--primary,#2F6FED)] transition mb-2" />
                                            <span className="text-xs font-bold text-gray-700 group-hover:text-[var(--primary,#2F6FED)] text-center">
                                                Upload 3:2 Banner
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-1">
                                                1500 × 1000 &bull; Max 5MB
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: 3:2 Live Preview (Theme-Aware) */}
                            <div className="lg:col-span-6 bg-slate-900 border-l border-gray-800 p-6 flex flex-col items-center justify-between overflow-y-auto">
                                <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                                    <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
                                        <FiEye style={{ color: "var(--primary, #2F6FED)" }} />
                                        <span>3:2 Live Popup Preview</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">
                                        3:2 Ratio (1500×1000)
                                    </span>
                                </div>

                                {/* Mock 3:2 Popup Preview Container */}
                                <div
                                    style={{
                                        borderRadius: "var(--card-border-radius, 1.5rem)",
                                        fontFamily: "var(--font-family, 'Google Sans', sans-serif)",
                                    }}
                                    className="w-full max-w-[360px] aspect-[3/2] overflow-hidden shadow-2xl border border-white/20 relative flex flex-col justify-center items-center p-3 my-auto bg-slate-950"
                                >
                                    {/* 3:2 Background Image (1500x1000) */}
                                    {imagePreview || formData.image?.url ? (
                                        <img
                                            src={imagePreview || formData.image.url}
                                            alt="Preview"
                                            className="absolute inset-0 w-full h-full object-cover z-0"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black z-0" />
                                    )}

                                    {/* Subtle gradient for depth */}
                                    <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

                                    {/* Mock Close Button */}
                                    <div className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-black/50 text-white border border-white/20">
                                        <FiX size={12} />
                                    </div>

                                    {/* Text, Tags, Timer & CTA Directly Above Banner (Centered, No Blur) */}
                                    <div className="relative z-10 w-full p-2 text-center text-white space-y-2 flex flex-col items-center justify-center my-auto">
                                        {/* Tags / Badge */}
                                        <div>
                                            <span
                                                style={{
                                                    backgroundColor: "var(--secondary, #F5A524)",
                                                    color: "#12131A",
                                                }}
                                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow"
                                            >
                                                <FiPercent size={9} />
                                                LIMITED TIME OFFER
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-base sm:text-lg font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                                            {formData.campaignName || "Campaign Title Here"}
                                        </h3>

                                        {/* Discount Offer Highlight */}
                                        {formData.discountText && (
                                            <div>
                                                <span
                                                    style={{
                                                        backgroundColor: "var(--product-discount-color, var(--error, #E5484D))",
                                                    }}
                                                    className="inline-block px-2.5 py-0.5 rounded-lg text-white font-black text-[11px] uppercase tracking-wider shadow"
                                                >
                                                    {formData.discountText}
                                                </span>
                                            </div>
                                        )}

                                        {/* Linked Product preview if selected */}
                                        {formData.productName && (
                                            <p className="text-[10px] text-gray-100 truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                                                Featured: <strong style={{ color: "var(--secondary, #F5A524)" }}>{formData.productName}</strong>
                                            </p>
                                        )}

                                        {/* Mock Timer Countdown */}
                                        <div className="pt-1.5 border-t border-white/20">
                                            <div
                                                style={{ color: "var(--secondary, #F5A524)" }}
                                                className="text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                                            >
                                                <FiClock size={9} />
                                                <span>Sale Ends In</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-1 max-w-[200px] mx-auto">
                                                {["02", "14", "36", "08"].map((val, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-1 rounded-lg bg-black/60 text-white border border-white/20 text-center"
                                                    >
                                                        <span className="text-xs font-black font-mono block leading-none">
                                                            {val}
                                                        </span>
                                                        <span className="text-[7px] text-gray-300 uppercase block mt-0.5 font-bold">
                                                            {["DAYS", "HRS", "MIN", "SEC"][idx]}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <div className="pt-1">
                                            <div
                                                style={{
                                                    backgroundColor: "var(--btn-primary-bg, var(--primary, #2F6FED))",
                                                    color: "var(--btn-primary-text, #ffffff)",
                                                    borderRadius: "calc(var(--card-border-radius, 1rem) * 0.7)",
                                                }}
                                                className="inline-flex items-center justify-center gap-1 px-5 py-2 text-xs font-extrabold shadow cursor-default"
                                            >
                                                <span>SHOP NOW</span>
                                                <FiArrowRight size={11} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full text-center text-[11px] text-gray-400 mt-2">
                                    Simulated 1500×1000 3:2 customer-facing modal appearance.
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <button
                                type="button"
                                onClick={() => handleOpenPreview(formData)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold transition shadow-sm cursor-pointer"
                            >
                                <FiEye size={14} />
                                <span>Preview Fullscreen</span>
                            </button>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => handleSubmitForm("DRAFT")}
                                    className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold transition shadow-sm cursor-pointer"
                                >
                                    {saving ? "Saving..." : "Save Draft"}
                                </button>

                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => handleSubmitForm("ACTIVE")}
                                    style={{
                                        backgroundColor: "var(--primary, #2F6FED)",
                                        color: "#ffffff",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--primary-hover, #1d4ed8)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--primary, #2F6FED)"; }}
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    <FiCheck size={14} />
                                    <span>{saving ? "Activating..." : "Activate Sale"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FULLSCREEN INTERACTIVE PREVIEW MODAL (3:2 Ratio - 1500x1000) */}
            {isPreviewModalOpen && previewCampaignData && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div
                        style={{
                            borderRadius: "var(--card-border-radius, 1.75rem)",
                            fontFamily: "var(--font-family, 'Google Sans', sans-serif)",
                        }}
                        className="relative w-[94vw] max-w-[660px] sm:max-w-[760px] md:max-w-[840px] max-h-[88vh] aspect-[3/2] overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-center items-center p-4 sm:p-7 md:p-9 bg-slate-950 my-auto"
                    >
                        {/* Background Banner */}
                        {previewCampaignData.image?.url || imagePreview ? (
                            <img
                                src={imagePreview || previewCampaignData.image.url}
                                alt="Preview"
                                className="absolute inset-0 w-full h-full object-cover z-0"
                            />
                        ) : (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black z-0" />
                        )}

                        <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={() => setIsPreviewModalOpen(false)}
                            className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/55 hover:bg-black/85 text-white transition border border-white/20 cursor-pointer"
                        >
                            <FiX size={18} />
                        </button>

                        {/* Text, Tags, Timer & CTA Centered in the Middle of Popup (No Blur) */}
                        <div className="relative z-10 w-full max-w-lg p-2 sm:p-4 text-center text-white space-y-3.5 sm:space-y-4 flex flex-col items-center justify-center my-auto">
                            <div>
                                <span
                                    style={{
                                        backgroundColor: "var(--secondary, #F5A524)",
                                        color: "#12131A",
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow"
                                >
                                    <FiPercent size={10} />
                                    LIMITED TIME OFFER
                                </span>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                                {previewCampaignData.campaignName || previewCampaignData.heading}
                            </h2>

                            {/* Discount Offer Highlight */}
                            {previewCampaignData.discountText && (
                                <div>
                                    <span
                                        style={{
                                            backgroundColor: "var(--product-discount-color, var(--error, #E5484D))",
                                        }}
                                        className="inline-block px-4 py-1.5 rounded-xl text-white font-black text-sm uppercase tracking-wider shadow-lg"
                                    >
                                        {previewCampaignData.discountText}
                                    </span>
                                </div>
                            )}

                            {previewCampaignData.productName && (
                                <p className="text-xs text-gray-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                                    Special Offer on:{" "}
                                    <strong style={{ color: "var(--secondary, #F5A524)" }}>{previewCampaignData.productName}</strong>
                                </p>
                            )}

                            {/* Countdown */}
                            <div className="pt-2 border-t border-white/20">
                                <div
                                    style={{ color: "var(--secondary, #F5A524)" }}
                                    className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                                >
                                    <FiClock size={11} />
                                    <span>Sale Ends In</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5 max-w-[240px] mx-auto">
                                    {["02", "14", "36", "08"].map((val, idx) => (
                                        <div
                                            key={idx}
                                            className="p-1.5 rounded-xl bg-black/60 text-white border border-white/20 text-center"
                                        >
                                            <span className="text-base sm:text-lg font-black font-mono leading-none block">
                                                {val}
                                            </span>
                                            <span className="text-[8px] text-gray-300 uppercase block mt-0.5 font-bold">
                                                {["DAYS", "HRS", "MIN", "SEC"][idx]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="pt-1">
                                <button
                                    onClick={() => setIsPreviewModalOpen(false)}
                                    style={{
                                        backgroundColor: "var(--btn-primary-bg, var(--primary, #2F6FED))",
                                        color: "var(--btn-primary-text, #ffffff)",
                                        borderRadius: "calc(var(--card-border-radius, 1rem) * 0.75)",
                                    }}
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3 font-extrabold text-xs tracking-wide shadow-lg border border-white/20 cursor-pointer"
                                >
                                    <span>SHOP NOW</span>
                                    <FiArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFLICT CONFIRMATION MODAL */}
            {conflictModalOpen && pendingActivationCampaign && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                            <FiAlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Confirm Sales Campaign Activation
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                Another sales campaign is currently active:{" "}
                                <strong className="text-gray-900 font-bold">
                                    &ldquo;{currentlyActiveCampaign?.campaignName}&rdquo;
                                </strong>
                                . Activating this campaign will deactivate the current campaign.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setConflictModalOpen(false);
                                    setPendingActivationCampaign(null);
                                }}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (isFormOpen) {
                                        executeSave(pendingActivationCampaign);
                                    } else {
                                        confirmActivation(pendingActivationCampaign._id);
                                    }
                                }}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
                            >
                                Activate Campaign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deleteModalOpen && campaignToDelete && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                            <FiTrash2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Delete Sales Campaign</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Are you sure you want to delete &ldquo;{campaignToDelete.campaignName}&rdquo;?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setCampaignToDelete(null);
                                }}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-600/20"
                            >
                                {deleting ? "Deleting..." : "Delete Campaign"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSales;
