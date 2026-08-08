import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Customize from "../pages/Customize";
import Policy from "../pages/Policy";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminRoutes from "../routes/AdminRoutes";
import Cart from "../pages/Cart";
import FavoriteProduct from "../pages/FavoriteProduct";
import Checkout from "../pages/Checkout";
import NotFound from "../pages/NotFound";
import Blog from "../pages/Blog";
import BlogDetail from "../pages/BlogDetail";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/products" element={<Products />} />
            <Route path="/search" element={<Products />} />
            {/* SEO-friendly product detail URLs: /products/category-slug/product-name */}
            <Route path="/products/:categorySlug/:nameSlug" element={<ProductDetail />} />
            {/* SEO-friendly product detail URLs with subcategory: /products/category-slug/subcategory-slug/product-name */}
            <Route path="/products/:categorySlug/:subcategorySlug/:nameSlug" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/customization" element={<Customize />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/policies" element={<Navigate to="/policy" replace />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/favorites" element={<FavoriteProduct />} />
            <Route path="/favourites" element={<Navigate to="/favorites" replace />} />
            <Route path="/wishlist" element={<Navigate to="/favorites" replace />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Redirect old /product-detail to products */}
            <Route path="/product-detail" element={<Navigate to="/products" replace />} />
            {/* Redirect old /products/slug/... to clean URL - preserve the slug segments */}
            <Route path="/products/slug/:categorySlug/:nameSlug" element={<Navigate to={`/products/${window.location.pathname.split('/slug/')[1] || ''}`} replace />} />

            {/* 404 - Catch all unmatched routes */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;