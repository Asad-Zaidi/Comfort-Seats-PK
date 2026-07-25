import { useState, useEffect } from "react";
import { FaTrash, FaCheckCircle, FaTimesCircle, FaSpinner, FaPhone, FaEnvelope } from "react-icons/fa";
import api from "../../api/api";
import { getColorName, isHexColor } from "../../utils/ColorName";

const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    contacted: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Contacted", value: "contacted" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

const AdminCustomizations = () => {
    const [customizations, setCustomizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchCustomizations = async () => {
        try {
            setLoading(true);
            const res = await api.get("/customizations");
            if (res.data?.success) {
                setCustomizations(res.data.data);
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load customization requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomizations();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await api.put(`/customizations/${id}`, { status: newStatus });
            if (res.data?.success) {
                setCustomizations((prev) =>
                    prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
                );
            }
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this customization request?")) return;
        try {
            await api.delete(`/customizations/${id}`);
            setCustomizations((prev) => prev.filter((c) => c._id !== id));
            if (selectedItem?._id === id) setSelectedItem(null);
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to delete");
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return <FaCheckCircle className="text-green-500" />;
            case "cancelled":
                return <FaTimesCircle className="text-red-500" />;
            case "contacted":
                return <FaPhone className="text-blue-500" />;
            default:
                return <FaSpinner className="text-yellow-500" />;
        }
    };

    const resolveColorName = (color) => {
        if (!color) return "N/A";
        return isHexColor(color) ? getColorName(color) : color;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Customization Requests</h1>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {customizations.length} request{customizations.length !== 1 ? "s" : ""}
                </span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-[#2F6FED] rounded-full animate-spin"></div>
                    </div>
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-red-600 text-sm">
                    {error}
                </div>
            ) : customizations.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-lg font-semibold">No customization requests yet</p>
                    <p className="text-sm mt-1">When customers submit customization requests, they will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {customizations.map((item) => (
                        <div
                            key={item._id}
                            className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition cursor-pointer hover:shadow-md ${
                                selectedItem?._id === item._id ? "ring-2 ring-orange-500" : ""
                            }`}
                            onClick={() =>
                                setSelectedItem(selectedItem?._id === item._id ? null : item)
                            }
                        >
                            {/* Header */}
                            <div className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-900 capitalize">
                                            {item.category?.replace(/-/g, " ")}
                                        </p>
                                        <span className="text-gray-500">{item.customer?.fullName}</span>
                                        <span className="text-gray-400 mx-2">·</span>
                                        <span className="text-gray-500">{item.customer?.phone}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(item.status)}
                                    <span
                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                            statusColors[item.status] || statusColors.pending
                                        }`}
                                    >
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400">{formatDate(item.createdAt)}</div>
                            </div>

                            {/* Expanded Details */}
                            {selectedItem?._id === item._id && (
                                <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Customization Details */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                                Customization Details
                                            </h4>
                                            <div className="space-y-1.5">
                                                <p className="text-sm text-gray-900">
                                                    <span className="text-gray-500">Category:</span>{" "}
                                                    <span className="font-semibold capitalize">{item.category?.replace(/-/g, " ")}</span>
                                                </p>
                                                {item.standChoice && (
                                                    <p className="text-sm text-gray-900">
                                                        <span className="text-gray-500">Stand/Base:</span>{" "}
                                                        <span className="font-semibold capitalize">{item.standChoice?.replace(/-/g, " ")}</span>
                                                    </p>
                                                )}
                                                {item.colorName && (
                                                    <p className="text-sm text-gray-900">
                                                        <span className="text-gray-500">Color:</span>{" "}
                                                        <span className="font-semibold">{resolveColorName(item.colorName)}</span>
                                                        {item.color && (
                                                            <span
                                                                className="inline-block ml-2 w-4 h-4 rounded-full border border-gray-300 align-middle"
                                                                style={{ backgroundColor: item.color }}
                                                            />
                                                        )}
                                                    </p>
                                                )}
                                                {item.fabricType && (
                                                    <p className="text-sm text-gray-900">
                                                        <span className="text-gray-500">Fabric/Material:</span>{" "}
                                                        <span className="font-semibold capitalize">{item.fabricType?.replace(/-/g, " ")}</span>
                                                    </p>
                                                )}
                                                {item.dimensions?.width > 0 && (
                                                    <p className="text-sm text-gray-900">
                                                        <span className="text-gray-500">Dimensions:</span>{" "}
                                                        <span className="font-semibold">
                                                            {item.dimensions.width}"W × {item.dimensions.height}"H
                                                            {item.dimensions.depth > 0 ? ` × ${item.dimensions.depth}"D` : ""}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                                Customer
                                            </h4>
                                            <p className="text-sm text-gray-900 font-semibold">{item.customer?.fullName}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <FaPhone size={10} /> {item.customer?.phone}
                                            </p>
                                            {item.customer?.email && (
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <FaEnvelope size={10} /> {item.customer.email}
                                                </p>
                                            )}
                                            {item.customer?.address && (
                                                <p className="text-xs text-gray-500 mt-1">{item.customer.address}</p>
                                            )}
                                        </div>

                                        {/* Notes & Status Update */}
                                        <div>
                                            {item.notes && (
                                                <div className="mb-4">
                                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                                        Notes
                                                    </h4>
                                                    <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
                                                        {item.notes}
                                                    </p>
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                                    Update Status
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {statusOptions.map((s) => (
                                                        <button
                                                            key={s.value}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusChange(item._id, s.value);
                                                            }}
                                                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                                                                item.status === s.value
                                                                    ? `${statusColors[s.value]} border-transparent`
                                                                    : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            {s.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(item._id);
                                                    }}
                                                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition"
                                                >
                                                    <FaTrash size={11} /> Delete Request
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCustomizations;