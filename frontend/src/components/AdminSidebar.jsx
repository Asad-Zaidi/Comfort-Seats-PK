import { NavLink, useNavigate } from "react-router-dom";
import { setAuthToken } from "../api/api";
import { useToast } from "./ToastNotification";
import { useSiteConfig } from "../utils/siteConfig";
import {
    FiGrid,
    FiHome,
    FiPackage,
    FiShoppingCart,
    FiMail,
    FiSettings,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight,
    FiInfo,
    FiLock,
    FiEdit3,
    FiTag,
    FiFileText,
    FiVolume2,
    FiDroplet,
    FiCreditCard,
    FiStar,
} from "react-icons/fi";

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed, onChangePassword }) => {
    const toast = useToast();
    const { siteName } = useSiteConfig();
    const navItems = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: <FiGrid />,
        },
        {
            name: "Home Screen",
            path: "/admin/home-screen",
            icon: <FiHome />,
        },
        {
            name: "About Us",
            path: "/admin/about-us",
            icon: <FiInfo />,
        },
        {
            name: "Categories",
            path: "/admin/categories",
            icon: <FiTag />,
        },
        {
            name: "Products",
            path: "/admin/products",
            icon: <FiPackage />,
        },
        {
            name: "Product Reviews",
            path: "/admin/reviews",
            icon: <FiStar />,
        },
        {
            name: "Orders",
            path: "/admin/orders",
            icon: <FiShoppingCart />,
        },
        {
            name: "Contact",
            path: "/admin/contacts",
            icon: <FiMail />,
        },
        {
            name: "Customizations",
            path: "/admin/customizations",
            icon: <FiEdit3 />,
        },
        {
            name: "Announcement",
            path: "/admin/announcement",
            icon: <FiVolume2 />,
        },
        {
            name: "Settings",
            path: "/admin/settings",
            icon: <FiSettings />,
        },
        {
            name: "Policies",
            path: "/admin/policies",
            icon: <FiFileText />,
        },
        {
            name: "Theme Builder",
            path: "/admin/colors",
            icon: <FiDroplet />,
        },
        {
            name: "Checkout",
            path: "/admin/checkout",
            icon: <FiCreditCard />,
        },
    ];

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        localStorage.removeItem("adminAuth");
        setAuthToken(null);
        toast.warning("Logged out successfully.");
        navigate("/admin/login", { replace: true });
    };

    return (
        <>
            {/* Overlay */}

            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                />
            )}

            {/* Sidebar */}

            <aside
                className={`fixed lg:fixed top-0 left-0 z-50 h-screen flex flex-col ${collapsed ? 'w-20' : 'w-70'} bg-slate-900 text-white transform transition-all duration-300 ease-in-out
        ${sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }`}
                aria-hidden={!sidebarOpen && undefined}
            >
                {/* Header */}

                <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700">
                    <div className="flex items-center gap-1">
                        <h2
                            className={`text-2xl font-bold transition-all duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden" : ""
                                }`}
                        >
                            {siteName}
                        </h2>
                        {collapsed && (
                            <div className="text-lg font-bold">
                                {(siteName || "Comfort Seats")
                                    .split(" ")
                                    .map(word => word.charAt(0))
                                    .join("")
                                    .toUpperCase()}
                            </div>)}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto mt-4 min-h-0 scrollbar-hide">
                    <nav
                        className={`${collapsed ? "px-4" : "px-8"} transition-all duration-300`}
                    >
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center ${collapsed ? "justify-center px-0" : "gap-4 px-4"
                                    } py-3 rounded-xl mb-2 text-sm transition-all duration-500
        ${isActive
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "text-gray-300 hover:bg-orange-500 hover:text-white"
                                    }`
                                }
                            >
                                <span className="text-xl flex-shrink-0">
                                    {item.icon}
                                </span>

                                {!collapsed && <span>{item.name}</span>}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Floating chevron on right border (middle) - show only one based on state */}
                <div className="absolute top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300 ease-in-out"
                    style={{ right: collapsed ? '-20px' : '-20px' }}
                >
                    {/* Logic for chevron button */}
                    {/* On desktop, it's based on 'collapsed'. On mobile, it's based on 'sidebarOpen'. */}
                    {(window.innerWidth >= 1024 && !collapsed) || (window.innerWidth < 1024 && sidebarOpen) ? (
                        <button
                            title={window.innerWidth < 1024 ? "Close sidebar" : "Collapse sidebar"}
                            onClick={() => window.innerWidth < 1024 ? setSidebarOpen(false) : setCollapsed(true)}
                            className="w-8 h-8 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center shadow-lg hover:scale-95 transition"
                        >
                            <FiChevronLeft size={16} />
                        </button>
                    ) : (
                        <button
                            title={window.innerWidth < 1024 ? "Open sidebar" : "Expand sidebar"}
                            onClick={() => window.innerWidth < 1024 ? setSidebarOpen(true) : setCollapsed(false)}
                            className="w-8 h-8 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center shadow-lg hover:scale-95 transition"
                        >
                            <FiChevronRight size={16} />
                        </button>
                    )}
                </div>

                {/* Bottom */}
                <div className="flex-shrink-0 border-t border-slate-700 p-5">
                    <button
                        onClick={onChangePassword}
                        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-3'} 
                            w-full py-3 mb-2 rounded-xl bg-green-600 hover:bg-green-700 transition`}
                    >
                        <span className="text-lg"><FiLock /></span>
                        <span className={`${collapsed ? 'hidden' : ''}`}>Change Password</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-3'} 
                            w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 transition`}
                    >
                        <span className="text-lg"><FiLogOut /></span>
                        <span className={`${collapsed ? 'hidden' : ''}`}>Logout</span>
                    </button>

                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
