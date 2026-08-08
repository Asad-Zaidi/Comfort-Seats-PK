import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../pages/admin/AdminLayout";

import Dashboard from "../pages/admin/Dashboard";
import AdminHomeScreen from "../pages/admin/AdminHomeScreen";
import AdminAbout from "../pages/admin/AdminAbout";
import AdminProducts from "../pages/admin/AdminProducts";
import AddCategory from "../pages/admin/AddCategory";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminContact from "../pages/admin/AdminContact";
import AdminCustomizations from "../pages/admin/AdminCustomizations";
import Settings from "../pages/admin/Settings";
import AdminPolicies from "../pages/admin/AdminPolicies";
import AdminAnnouncement from "../pages/admin/AdminAnnouncement";
import AdminColor from "../pages/admin/AdminColor";
import AdminCheckout from "../pages/admin/AdminCheckout";
import AdminReviews from "../pages/admin/AdminReviews";
import AdminMessages from "../pages/admin/AdminMessages";
import AdminBlog from "../pages/admin/AdminBlog";

const AdminRoutes = () => {
    const isAuthenticated = typeof window !== "undefined" && !!localStorage.getItem("adminToken");

    return (
        <Routes>
            {/* Admin Layout - protect admin routes by redirecting to login when not authenticated */}
            <Route element={isAuthenticated ? <AdminLayout /> : <Navigate to="/admin/login" replace />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="home-screen" element={<AdminHomeScreen />} />
                <Route path="about-us" element={<AdminAbout />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AddCategory />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="contacts" element={<AdminContact />} />
                <Route path="customizations" element={<AdminCustomizations />} />
                <Route path="announcement" element={<AdminAnnouncement />} />
                <Route path="settings" element={<Settings />} />
                <Route path="policies" element={<AdminPolicies />} />
                <Route path="colors" element={<AdminColor />} />
                <Route path="checkout" element={<AdminCheckout />} />
                <Route path="blogs" element={<AdminBlog />} />

                {/* Default Route */}
                <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
