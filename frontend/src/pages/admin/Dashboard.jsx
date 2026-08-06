import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiAlertTriangle,
    FiBox,
    FiClock,
    FiDollarSign,
    FiLoader,
    FiPackage,
    FiShoppingBag,
    FiShoppingCart,
    FiArrowRight,
} from "react-icons/fi";
import api from "../../api/api";
import { useSiteConfig } from "../../utils/siteConfig";
import AnalyticsCharts from "../../components/admin/AnalyticsCharts";

const statusColors = {
    pending: { bg: "#fef3c7", color: "#d97706" },
    confirmed: { bg: "#dbeafe", color: "#2563eb" },
    processing: { bg: "#f3e8ff", color: "#7e22ce" },
    shipped: { bg: "#e0e7ff", color: "#4338ca" },
    delivered: { bg: "#d1fae5", color: "#059669" },
    completed: { bg: "#d1fae5", color: "#059669" },
    cancelled: { bg: "#fee2e2", color: "#dc2626" },
    returned: { bg: "#f3f4f6", color: "#4b5563" },
};

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatCurrency = (value) =>
    `Rs. ${Number(value || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const cssVar = (name, fallback) => `var(--${name}, ${fallback})`;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { siteName } = useSiteConfig();
    const c = {
      primary: cssVar('primary', '#2F6FED'),
      secondary: cssVar('secondary', '#F5A524'),
      accent: cssVar('accent', '#f97316'),
      text: cssVar('text', '#12131A'),
      'text-secondary': cssVar('text-secondary', '#6b7280'),
      'bg-secondary': cssVar('bg-secondary', '#f8fafc'),
      border: cssVar('border', '#e5e7eb'),
      'card-bg': cssVar('card-bg', '#ffffff'),
      success: cssVar('success', '#10B981'),
      error: cssVar('error', '#E5484D'),
    };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");
                const [productsRes, ordersRes] = await Promise.all([
                    api.get("/products?limit=1000"),
                    api.get("/orders"),
                ]);
                if (productsRes.data?.success) setProducts(productsRes.data.data || []);
                if (ordersRes.data?.success) setOrders(ordersRes.data.data || []);
            } catch (err) {
                setError(err?.response?.data?.message || "Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalProducts = products.length;
    const outOfStock = products.filter((p) => !p.inStock || Number(p.stock) <= 0).length;
    const lowStock = products.filter((p) => p.inStock && Number(p.stock) > 0 && Number(p.stock) <= 5).length;

    const completedOrders = orders.filter((o) => o.status === "delivered" || o.status === "shipped" || o.status === "completed");
    const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "processing");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
    const lowStockProducts = products.filter((p) => p.inStock && Number(p.stock) > 0 && Number(p.stock) <= 5).sort((a, b) => Number(a.stock) - Number(b.stock)).slice(0, 5);

    const tintPrimary = { bg: `color-mix(in srgb, ${c.primary} 10%, transparent)`, color: c.primary };
    const tintPurple = { bg: "#ede9fe", color: "#7c3aed" };
    const tintGreen = { bg: "#d1fae5", color: "#059669" };
    const tintAmber = { bg: "#fef3c7", color: "#d97706" };

    const stats = [
        { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: <FiDollarSign size={16} />, tint: tintPrimary, sub: `${completedOrders.length} completed orders` },
        { label: "Total Orders", value: orders.length, icon: <FiShoppingCart size={16} />, tint: tintGreen, sub: "All time" },
        { label: "Pending Orders", value: pendingOrders.length, icon: <FiClock size={16} />, tint: tintAmber, sub: "Awaiting action" },
        { label: "Total Products", value: totalProducts, icon: <FiPackage size={16} />, tint: tintPurple, sub: `${outOfStock} out of stock` },
    ];

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <FiLoader className="animate-spin" size={22} />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: c.text }}>Dashboard</h1>
                    <p className="mt-1 text-sm" style={{ color: c['text-secondary'] }}>Welcome to the {siteName || "Comfort Seats"} admin overview.</p>
                </div>
                <button onClick={() => navigate("/admin/orders")} className="inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition" style={{ borderColor: c.border, backgroundColor: c['card-bg'], color: c.text }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.primary; e.currentTarget.style.color = c.primary; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.text; }}>
                    <FiShoppingBag size={15} /> View Orders
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border p-6 shadow-sm" style={{ borderColor: c.border, backgroundColor: c['card-bg'] }}>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium" style={{ color: c['text-secondary'] }}>{stat.label}</p>
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: stat.tint.bg, color: stat.tint.color }}>{stat.icon}</span>
                        </div>
                        <h3 className="mt-4 text-3xl font-bold" style={{ color: c.text }}>{stat.value}</h3>
                        <p className="mt-1 text-xs" style={{ color: c['text-secondary'] }}>{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <AnalyticsCharts products={products} orders={orders} />
            </div>

            {lowStock > 0 && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border px-5 py-4" style={{ borderColor: c.border, backgroundColor: c['bg-secondary'] }}>
                    <FiAlertTriangle className="text-yellow-600" size={18} />
                    <p className="text-sm" style={{ color: c.text }}>
                        <span className="font-semibold">{lowStock}</span> product{lowStock !== 1 ? "s" : ""} running low on stock (5 or fewer left).
                    </p>
                    <button onClick={() => navigate("/admin/products")} className="ml-auto inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: c.secondary }}>
                        Manage <FiArrowRight size={14} />
                    </button>
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border p-6 shadow-sm lg:col-span-2" style={{ borderColor: c.border, backgroundColor: c['card-bg'] }}>
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-base font-semibold" style={{ color: c.text }}>Recent Orders</h2>
                        <button onClick={() => navigate("/admin/orders")} className="inline-flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: c.primary }}>
                            See all <FiArrowRight size={14} />
                        </button>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="py-10 text-center text-sm" style={{ color: c['text-secondary'] }}>No orders placed yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <button key={order._id} onClick={() => navigate("/admin/orders")} className="flex w-full items-center gap-4 rounded-xl border p-3 text-left transition" style={{ borderColor: c.border, backgroundColor: c['card-bg'] }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c['bg-secondary']; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = c['card-bg']; }}>
                                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        {order.product?.imageUrl ? (
                                            <img src={order.product.imageUrl} alt={order.product.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center" style={{ color: c['text-secondary'] }}><FiBox size={18} /></div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold" style={{ color: c.text }}>{order.product?.name || "Product"}</p>
                                        <p className="truncate text-xs" style={{ color: c['text-secondary'] }}>{order.customer?.fullName || "Customer"} · {formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-sm font-semibold" style={{ color: c.text }}>{formatCurrency(order.totalPrice)}</span>
                                        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize" style={{ backgroundColor: (statusColors[order.status] || statusColors.pending).bg, color: (statusColors[order.status] || statusColors.pending).color }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border p-6 shadow-sm" style={{ borderColor: c.border, backgroundColor: c['card-bg'] }}>
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-base font-semibold" style={{ color: c.text }}>Low Stock</h2>
                        <button onClick={() => navigate("/admin/products")} className="inline-flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: c.primary }}>
                            Manage <FiArrowRight size={14} />
                        </button>
                    </div>
                    {lowStockProducts.length === 0 ? (
                        <p className="py-10 text-center text-sm" style={{ color: c['text-secondary'] }}>All products are well stocked.</p>
                    ) : (
                        <ul className="space-y-3">
                            {lowStockProducts.map((p) => (
                                <li key={p._id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: c.border, backgroundColor: c['card-bg'] }}>
                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        {p.imageUrl ? (
                                            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center" style={{ color: c['text-secondary'] }}><FiBox size={16} /></div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium" style={{ color: c.text }}>{p.name}</p>
                                        <p className="text-xs" style={{ color: c['text-secondary'] }}>{Array.isArray(p.category) ? (p.category[0] || "Uncategorized") : (p.category || "Uncategorized")}</p>
                                    </div>
                                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: statusColors.cancelled.bg, color: statusColors.cancelled.color }}>
                                        {p.stock} left
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;