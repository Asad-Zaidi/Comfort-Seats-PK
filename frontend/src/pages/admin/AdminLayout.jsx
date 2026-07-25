import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
    FiBell,
    FiMenu,
} from "react-icons/fi";
import AdminSidebar from "../../components/AdminSidebar";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import api from "../../api/api";
import { useSiteConfig } from "../../utils/siteConfig";
import SEO from "../../components/SEO";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [adminName, setAdminName] = useState("");
    const [collapsed, setCollapsed] = useState(false);
    const [now, setNow] = useState(new Date());
    const [orders, setOrders] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    // Persist dismissed/read state in localStorage so it survives page refreshes
    const [readIds, setReadIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("admin_read_orders") || "[]");
        } catch {
            return [];
        }
    });
    const [dismissedIds, setDismissedIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("admin_dismissed_orders") || "[]");
        } catch {
            return [];
        }
    });
    const notifRef = useRef(null);
    const navigate = useNavigate();
    const { siteName } = useSiteConfig();

    // Keep localStorage in sync
    useEffect(() => {
        localStorage.setItem("admin_read_orders", JSON.stringify(readIds));
    }, [readIds]);
    useEffect(() => {
        localStorage.setItem("admin_dismissed_orders", JSON.stringify(dismissedIds));
    }, [dismissedIds]);

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const res = await api.get("/auth/me");
                if (res.data && res.data.success && res.data.admin) {
                    setAdminName(res.data.admin.name || "Admin");
                }
            } catch (err) {
                // silent: not logged in or token invalid
                // console.warn('Could not fetch admin info', err);
            }
        };

        fetchAdmin();
    }, []);

    // Fetch orders to populate the notification panel
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get("/orders");
                if (res.data?.success) setOrders(res.data.data);
            } catch (err) {
                // silent
            }
        };
        fetchOrders();
    }, []);

    // Close the dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notifOpen]);

    // Visible notifications = orders not individually dismissed
    const visibleOrders = orders.filter((o) => !dismissedIds.includes(o._id));

    // Unread badge = orders not yet opened and not dismissed
    const unreadCount = visibleOrders.filter((o) => !readIds.includes(o._id)).length;

    const handleBellClick = () => {
        setNotifOpen((prev) => !prev);
    };

    // Mark a single order as read (when its notification is clicked)
    const markRead = (id) => {
        setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    // Dismiss a single notification
    const dismissOne = (e, id) => {
        e.stopPropagation();
        setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    // Clear all notifications
    const clearAll = () => {
        setDismissedIds(orders.map((o) => o._id));
        setNotifOpen(false);
    };

    const openOrder = (id) => {
        markRead(id);
        setNotifOpen(false);
        // Navigate to the Orders page and tell it which order to auto-expand
        navigate("/admin/orders", { state: { selectedOrderId: id } });
    };

    const recentOrders = visibleOrders.slice(0, 8);

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <>
            <SEO
                title={`Admin - ${siteName}`}
                description="Admin panel for managing the website."
            />
            <div className="flex bg-gray-100 min-h-screen">
                {/* Sidebar */}
                <AdminSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    onChangePassword={() => setPasswordModalOpen(true)}
                />

                {/* Change Password Modal */}
                <ChangePasswordModal
                    isOpen={passwordModalOpen}
                    onClose={() => setPasswordModalOpen(false)}
                />
                {/* Main Content */}
                <div className={`flex flex-col flex-1 ${collapsed ? "lg:ml-20" : "lg:ml-60"}`}>
                    {/* Top Navbar */}
                    <header className="w-auto sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between h-14 px-5 lg:px-8">
                            {/* Left */}
                            <div className="flex items-center gap-5">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden text-3xl text-gray-700 hover:text-blue-600 transition"
                                >
                                    <FiMenu />
                                </button>

                                {adminName && (
                                    <p className="hidden text-lg font-semibold text-gray-800 sm:block">
                                        Welcome, {adminName}
                                    </p>
                                )}
                            </div>

                            {/* Right */}
                            <div className="flex items-center gap-5">
                                {/* Notification */}
                                <div className="relative" ref={notifRef}>
                                    <button
                                        onClick={handleBellClick}
                                        className="relative p-2 rounded-full hover:bg-gray-100 transition"
                                        aria-label="Order notifications"
                                    >
                                        <FiBell className="text-xl text-gray-700" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                {unreadCount > 99 ? "99+" : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                {notifOpen && (
                                        <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg z-50">
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-900">Order Notifications</p>
                                                {visibleOrders.length > 0 && (
                                                    <button
                                                        onClick={clearAll}
                                                        className="text-xs font-medium text-gray-400 hover:text-red-500 transition"
                                                    >
                                                        Clear all
                                                    </button>
                                                )}
                                            </div>

                                            {recentOrders.length === 0 ? (
                                                <p className="px-4 py-6 text-center text-sm text-gray-400">
                                                    No new notifications
                                                </p>
                                            ) : (
                                                <ul className="divide-y divide-gray-100">
                                                    {recentOrders.map((o) => (
                                                        <li key={o._id} className="relative group">
                                                            <button
                                                                onClick={() => openOrder(o._id)}
                                                                className="w-full text-left pl-4 pr-9 py-3 flex items-start gap-3 hover:bg-gray-50 transition"
                                                            >
                                                                {o.product?.imageUrl ? (
                                                                    <img
                                                                        src={o.product.imageUrl}
                                                                        alt={o.product.name}
                                                                        className="h-10 w-10 rounded-lg object-cover shrink-0 bg-gray-100"
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-lg bg-gray-100 shrink-0" />
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                                        {o.customer?.fullName || "Customer"}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 truncate">
                                                                        {o.product?.name} · Rs. {o.totalPrice?.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                            <button
                                                                onClick={(e) => dismissOne(e, o._id)}
                                                                aria-label="Dismiss notification"
                                                                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-gray-300 hover:bg-gray-100 hover:text-gray-600 transition"
                                                            >
                                                                ✕
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            <button
                                                onClick={() => {
                                                    setNotifOpen(false);
                                                    navigate("/admin/orders");
                                                }}
                                                className="w-full text-center text-sm font-medium text-[#2F6FED] py-3 border-t border-gray-100 hover:bg-gray-50 transition"
                                            >
                                                View all orders
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Profile */}
                                <div className="text-right">
                                    <p className="font-normal text-sm text-gray-900">
                                        {now.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                    </p>
                                    <p className="font-normal text-sm text-gray-900">
                                        {now.toLocaleString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                                    </p>
                                </div>

                            </div>

                        </div>

                    </header>

                    {/* Main */}

                    <main className="flex-1 p-6 lg:p-8 overflow-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[calc(100vh-180px)]">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default AdminLayout;