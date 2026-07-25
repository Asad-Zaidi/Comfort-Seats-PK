import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaTrash, FaCheckCircle, FaTimesCircle, FaSpinner, FaBell, FaImage, FaTruck } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import api from "../../api/api";
import { getColorName, isHexColor } from "../../utils/ColorName";
import ShipmentTrackingModal from "../../components/admin/ShipmentTrackingModal";

const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    returned: "bg-gray-100 text-gray-700", // backward compatibility for historical orders
};

const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancel", value: "cancelled" },
];

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toast, setToast] = useState(null); // in-app admin notification
    const [trackingModalOrder, setTrackingModalOrder] = useState(null);
    const [savingTracking, setSavingTracking] = useState(false);
    const location = useLocation();

    // Auto-dismiss the toast after 5 seconds
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(t);
    }, [toast]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get("/orders");
            if (res.data?.success) {
                setOrders(res.data.data);
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // When navigating from a notification, auto-expand the selected order
    useEffect(() => {
        const id = location.state?.selectedOrderId;
        if (id && orders.length > 0) {
            const match = orders.find((o) => o._id === id);
            if (match) setSelectedOrder(match);
        }
    }, [location.state, orders]);

    const handleStatusClick = (order, targetStatus) => {
        if (order.status === targetStatus) return;

        // If target status is "shipped", open Shipment Tracking Modal
        if (targetStatus === "shipped") {
            setTrackingModalOrder(order);
            return;
        }

        handleStatusChange(order._id, targetStatus);
    };

    const handleStatusChange = async (orderId, newStatus, extraData = {}) => {
        try {
            const payload = { status: newStatus, ...extraData };
            const res = await api.put(`/orders/${orderId}`, payload);
            if (res.data?.success) {
                const updatedOrder = res.data.data;
                setOrders((prev) =>
                    prev.map((o) => (o._id === orderId ? updatedOrder : o))
                );

                if (selectedOrder?._id === orderId) {
                    setSelectedOrder(updatedOrder);
                }

                const statusLabelMap = {
                    pending: "Pending",
                    confirmed: "Confirmed",
                    processing: "Processing",
                    shipped: "Shipped",
                    delivered: "Delivered",
                    cancelled: "Cancelled",
                };

                setToast({
                    type: "success",
                    title: `Order ${statusLabelMap[newStatus] || newStatus}`,
                    message: `Order #${orderId.slice(-8)} updated to ${statusLabelMap[newStatus] || newStatus}. Notifications sent to customer & admin.`,
                });

                return true;
            }
        } catch (err) {
            const msg = err?.response?.data?.message || "Failed to update status";
            setToast({
                type: "error",
                title: "Update Failed",
                message: msg,
            });
            return false;
        }
    };

    const handleConfirmTracking = async (trackingData) => {
        if (!trackingModalOrder) return;
        setSavingTracking(true);
        const success = await handleStatusChange(trackingModalOrder._id, "shipped", {
            shipping: trackingData,
        });
        setSavingTracking(false);
        if (success) {
            setTrackingModalOrder(null);
        }
    };

    const handleDelete = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            await api.delete(`/orders/${orderId}`);
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            if (selectedOrder?._id === orderId) setSelectedOrder(null);
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to delete order");
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
            case "confirmed":
                return <FaCheckCircle className="text-blue-500" />;
            case "processing":
                return <FaSpinner className="text-purple-500 animate-spin" />;
            case "shipped":
                return <FaTruck className="text-indigo-500" />;
            case "delivered":
            case "completed":
                return <FaCheckCircle className="text-green-500" />;
            case "cancelled":
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaSpinner className="text-yellow-500" />;
        }
    };

    return (
        <div>
            {/* In-app admin notification (toast) */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-[fadeIn_0.25s_ease-out]">
                    <div
                        className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg bg-white ${
                            toast.type === "success" ? "border-green-200" : "border-red-200"
                        }`}
                    >
                        <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                toast.type === "success"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                            }`}
                        >
                            <FaBell size={14} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
                            <p className="mt-0.5 text-xs text-gray-500">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast(null)}
                            className="text-gray-400 hover:text-gray-600 text-sm leading-none"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Shipment Tracking Modal */}
            <ShipmentTrackingModal
                isOpen={!!trackingModalOrder}
                onClose={() => setTrackingModalOrder(null)}
                onConfirm={handleConfirmTracking}
                order={trackingModalOrder}
                initialData={trackingModalOrder?.shipping || {}}
                loading={savingTracking}
            />

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {orders.length} order{orders.length !== 1 ? "s" : ""}
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
            ) : orders.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-lg font-semibold">No orders yet</p>
                    <p className="text-sm mt-1">Orders placed by customers will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition cursor-pointer hover:shadow-md ${
                                selectedOrder?._id === order._id ? "ring-2 ring-[#2F6FED]" : ""
                            }`}
                            onClick={() =>
                                setSelectedOrder(selectedOrder?._id === order._id ? null : order)
                            }
                        >
                            {/* Order Header */}
                            <div className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Product icon and Name */}
                                    {order.product?.imageUrl && (
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                                            <img
                                                src={order.product.imageUrl}
                                                alt={order.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-900">{order.product?.name || "Product"}</p>
                                        <span className="text-gray-400 mx-2">·</span>
                                        <span className="text-gray-500">{order.customer?.fullName}</span>
                                        <span className="text-gray-400 mx-2">·</span>
                                        <span className="text-gray-500">Rs. {order.totalPrice?.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(order.status)}
                                    <span
                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                            statusColors[order.status] || statusColors.pending
                                        }`}
                                    >
                                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Pending"}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400">{formatDate(order.createdAt)}</div>
                            </div>

                            {/* Expanded Details */}
                            {selectedOrder?._id === order._id && (
                                <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Product Info */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                                Product
                                            </h4>
                                            <div className="flex gap-3">
                                                {order.product?.imageUrl && (
                                                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                                                        <img
                                                            src={order.product.imageUrl}
                                                            alt={order.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{order.product?.name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                                                    {order.product?.color && (
                                                        <p className="text-xs text-gray-500">
                                                            Color: {isHexColor(order.product.color)
                                                                ? getColorName(order.product.color)
                                                                : order.product.color}
                                                        </p>
                                                    )}
                                                    {order.product?.size && (
                                                        <p className="text-xs text-gray-500">Size: {order.product.size}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                                Customer
                                            </h4>
                                            <p className="text-sm text-gray-900">{order.customer?.fullName}</p>
                                            <p className="text-xs text-gray-500">{order.customer?.phone}</p>
                                            <p className="text-xs text-gray-500">{order.customer?.email}</p>
                                            <p className="text-xs text-gray-500">{order.customer?.address}</p>
                                            <p className="text-xs text-gray-500">{order.customer?.city}</p>
                                        </div>

                                        {/* Status Update */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                                Update Status
                                            </h4>
                                            {order.status === "delivered" || order.status === "completed" ? (
                                                <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-2">
                                                    ✓ Order Delivered — Status updates are locked.
                                                </p>
                                            ) : null}
                                            <div className="flex flex-wrap gap-1.5">
                                                {statusOptions.map((s) => {
                                                    const isDelivered = order.status === "delivered" || order.status === "completed";
                                                    return (
                                                        <button
                                                            key={s.value}
                                                            disabled={isDelivered}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusClick(order, s.value);
                                                            }}
                                                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                                                                order.status === s.value
                                                                    ? `${statusColors[s.value]} border-transparent shadow-sm`
                                                                    : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                                            } ${isDelivered ? "opacity-50 cursor-not-allowed hover:bg-transparent" : ""}`}
                                                        >
                                                            {s.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(order._id);
                                                }}
                                                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition"
                                            >
                                                <FaTrash size={11} /> Delete Order
                                            </button>
                                        </div>
                                    </div>

                                    {/* Shipping Information (if present) */}
                                    {order.shipping && (order.shipping.courierName || order.shipping.trackingNumber) && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FaTruck className="text-[#2F6FED]" size={13} />
                                                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Shipping Information
                                                </h4>
                                            </div>
                                            <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-1.5 text-xs text-gray-700 max-w-md">
                                                {order.shipping.courierName && (
                                                    <p className="flex justify-between">
                                                        <span className="text-gray-400 font-medium">Courier:</span>
                                                        <span className="font-semibold text-gray-900">{order.shipping.courierName}</span>
                                                    </p>
                                                )}
                                                {order.shipping.trackingNumber && (
                                                    <p className="flex justify-between">
                                                        <span className="text-gray-400 font-medium">Tracking Number:</span>
                                                        <span className="font-mono font-semibold text-gray-900">{order.shipping.trackingNumber}</span>
                                                    </p>
                                                )}
                                                {order.shipping.trackingUrl && (
                                                    <p className="pt-1 text-right">
                                                        <a
                                                            href={order.shipping.trackingUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 font-semibold text-[#2F6FED] hover:underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            View Tracking <FiExternalLink size={12} />
                                                        </a>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Info */}
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-6 text-xs text-gray-500">
                                        <span>
                                            Payment:{" "}
                                            <span className="font-semibold text-gray-700 capitalize">
                                                {order.paymentMethod === "cod"
                                                    ? "Cash on Delivery"
                                                    : order.selectedOnlineMethod?.name
                                                        ? order.selectedOnlineMethod.name
                                                        : order.paymentMethod === "bank"
                                                            ? "Bank Transfer"
                                                            : order.paymentMethod === "card"
                                                                ? "Card Payment"
                                                                : order.paymentMethod}
                                            </span>
                                            {order.selectedOnlineMethod?.type && (
                                                <span className="ml-1.5 inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                                                    {order.selectedOnlineMethod.type}
                                                </span>
                                            )}
                                        </span>
                                        {order.transactionRef && (
                                            <span>
                                                Trx Ref:{" "}
                                                <span className="font-semibold text-gray-700">{order.transactionRef}</span>
                                            </span>
                                        )}
                                        <span>
                                            Total:{" "}
                                            <span className="font-semibold text-gray-700">
                                                Rs. {order.totalPrice?.toFixed(2)}
                                            </span>
                                        </span>
                                        <span>
                                            Order ID:{" "}
                                            <span className="text-gray-400">#{order._id.slice(-8)}</span>
                                        </span>
                                    </div>

                                    {/* Payment Receipt */}
                                    {order.paymentReceipt && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FaImage className="text-[#2F6FED]" size={13} />
                                                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Payment Receipt
                                                </h4>
                                            </div>
                                            <a
                                                href={order.paymentReceipt}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-block"
                                            >
                                                <img
                                                    src={order.paymentReceipt}
                                                    alt="Payment receipt"
                                                    className="max-h-48 rounded-xl border border-gray-200 object-contain hover:opacity-90 transition"
                                                />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;