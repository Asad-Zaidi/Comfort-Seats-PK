// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { NavLink } from "react-router-dom";
// import { HiX } from "react-icons/hi";
// import { FaBars } from "react-icons/fa";
// import Logo from "../assets/Logo.png";
// import { useSiteConfig } from "../utils/siteConfig";
// import api from "../api/api";

// const Navbar = () => {
//     const [menuOpen, setMenuOpen] = useState(false);
//     const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
//     const [categories, setCategories] = useState([]);
//     const location = useLocation();
//     const { logoUrl, siteName } = useSiteConfig();

//     const navItems = [
//         { name: "Home", path: "/" },
//         { name: "Products", path: "/products" },
//         { name: "About Us", path: "/about" },
//         { name: "Contact Us", path: "/contact" },
//         { name: "Customize", path: "/customization" },
//     ];

//     // Fetch categories from API
//     useEffect(() => {
//         const fetchCategories = async () => {
//             try {
//                 const res = await api.get("/site-content");
//                 if (res.data?.success && Array.isArray(res.data.data?.categories)) {
//                     setCategories(res.data.data.categories.filter(cat => cat.name));
//                 }
//             } catch (err) {
//                 console.error("Failed to load categories:", err);
//             }
//         };
//         fetchCategories();
//     }, []);

//     // Hide the regular navbar on any admin route
//     if (location.pathname.startsWith("/admin")) return null;

//     return (
//         <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-md border-b border-gray-200 shadow-sm">
//             <div className="max-w-7xl mx-auto px-5 lg:px-2">
//                 <div className="flex items-center justify-between h-16">
//                     {/* Logo */}
//                     <NavLink
//                         to="/"
//                         className="text-2xl md:text-3xl font-bold tracking-wide"
//                         onClick={() => setMenuOpen(false)}
//                     >
//                         <img
//                             src={logoUrl || Logo}
//                             alt={`${siteName} - Premium Furniture in Lahore`}
//                             loading="eager"
//                             className="h-12 w-auto"
//                         />
//                     </NavLink>

//                     {/* Desktop Navigation */}
//                     <nav className="hidden md:flex items-center gap-4">
//                         <NavLink
//                             to="/"
//                             end
//                             className={({ isActive }) =>
//                                 `px-2 py-1 rounded-xl text-base lg:text-md font-semibold transition-all duration-300
//                                 ${isActive
//                                     ? "bg-orange-500 text-white"
//                                     : "text-gray-800 hover:text-orange-500 hover:bg-orange-50"
//                                 }`
//                             }
//                         >
//                             Home
//                         </NavLink>

//                         {/* Products with Dropdown */}
//                         <div
//                             className="relative"
//                             onMouseEnter={() => setProductsDropdownOpen(true)}
//                             onMouseLeave={() => setProductsDropdownOpen(false)}
//                         >
//                             <NavLink
//                                 to="/products"
//                                 className={({ isActive }) =>
//                                     `px-2 py-1 rounded-xl text-base lg:text-md font-semibold transition-all duration-300
//                                     ${isActive
//                                         ? "bg-orange-500 text-white"
//                                         : "text-gray-800 hover:text-orange-500 hover:bg-orange-50"
//                                     }`
//                                 }
//                             >
//                                 Products
//                             </NavLink>

//                             {/* Dropdown Menu */}
//                             {productsDropdownOpen && categories.length > 0 && (
//                                 <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
//                                     <div className="max-h-96 overflow-y-auto">
//                                         {categories.map((cat) => {
//                                             const catName = cat.name || cat;
//                                             return (
//                                                 <NavLink
//                                                     key={catName}
//                                                     to={`/products?category=${encodeURIComponent(catName)}`}
//                                                     className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors"
//                                                     onClick={() => setProductsDropdownOpen(false)}
//                                                 >
//                                                     {cat.image && (
//                                                         <img
//                                                             src={cat.image}
//                                                             alt={catName}
//                                                             className="w-8 h-8"
//                                                         />
//                                                     )}
//                                                     <span className="text-sm font-medium text-gray-800 hover:text-orange-600">
//                                                         {catName}
//                                                     </span>
//                                                 </NavLink>
//                                             );
//                                         })}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         <NavLink
//                             to="/about"
//                             className={({ isActive }) =>
//                                 `px-2 py-1 rounded-xl text-base lg:text-md font-semibold transition-all duration-300
//                                 ${isActive
//                                     ? "bg-orange-500 text-white"
//                                     : "text-gray-800 hover:text-orange-500 hover:bg-orange-50"
//                                 }`
//                             }
//                         >
//                             About Us
//                         </NavLink>

//                         <NavLink
//                             to="/contact"
//                             className={({ isActive }) =>
//                                 `px-2 py-1 rounded-xl text-base lg:text-md font-semibold transition-all duration-300
//                                 ${isActive
//                                     ? "bg-orange-500 text-white"
//                                     : "text-gray-800 hover:text-orange-500 hover:bg-orange-50"
//                                 }`
//                             }
//                         >
//                             Contact Us
//                         </NavLink>

//                         <NavLink
//                             to="/customization"
//                             className={({ isActive }) =>
//                                 `px-2 py-1 rounded-xl text-base lg:text-md font-semibold transition-all duration-300
//                                 ${isActive
//                                     ? "bg-orange-500 text-white"
//                                     : "text-gray-800 hover:text-orange-500 hover:bg-orange-50"
//                                 }`
//                             }
//                         >
//                             Customize
//                         </NavLink>
//                     </nav>

//                     {/* Mobile Menu Button */}
//                     <button
//                         className="md:hidden text-gray-800"
//                         onClick={() => setMenuOpen(!menuOpen)}
//                     >
//                         {menuOpen ? (
//                             <HiX size={20} />
//                         ) : (
//                             <FaBars size={20} />
//                         )}
//                     </button>
//                 </div>
//             </div>

//             {/* Mobile Navigation */}
//             <div
//                 className={`md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
//                     }`}
//             >
//                 <nav className="bg-white">
//                     {navItems.map((item) => (
//                         <NavLink
//                             key={item.path}
//                             to={item.path}
//                             end={item.path === "/"}
//                             onClick={() => setMenuOpen(false)}
//                             className={({ isActive }) =>
//                                 `block z-100 px-6 py-4 text-base font-medium border-b border-gray-100 transition-colors ${item.path === "/"
//                                     ? "text-blue-600 bg-blue-50"
//                                     : "text-gray-800 hover:text-orange-500 hover:bg-gray-50"
//                                 }`
//                             }
//                         >
//                             {item.name}
//                         </NavLink>
//                     ))}

//                     {/* Mobile Categories */}
//                     {categories.length > 0 && (
//                         <div className="border-b border-gray-100 max-h-64 overflow-y-auto">
//                             <div className="px-6 py-3 bg-gray-50 sticky top-0">
//                                 <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categories</span>
//                             </div>
//                             {categories.map((cat) => {
//                                 const catName = cat.name || cat;
//                                 return (
//                                     <NavLink
//                                         key={catName}
//                                         to={`/products?category=${encodeURIComponent(catName)}`}
//                                         onClick={() => setMenuOpen(false)}
//                                         className="flex items-center gap-3 px-6 py-3 text-base font-medium text-gray-800 hover:text-orange-500 hover:bg-gray-50"
//                                     >
//                                         {cat.image && (
//                                             <img
//                                                 src={cat.image}
//                                                 alt={catName}
//                                                 className="w-6 h-6 rounded object-cover border border-gray-200"
//                                             />
//                                         )}
//                                         <span>{catName}</span>
//                                     </NavLink>
//                                 );
//                             })}
//                         </div>
//                     )}
//                 </nav>
//             </div>
//         </header>
//     );
// };

// export default Navbar;


import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { HiX, HiChevronDown } from "react-icons/hi";
import { FaBars } from "react-icons/fa";
import Logo from "../assets/Logo.png";
import { useSiteConfig } from "../utils/siteConfig";
import api from "../api/api";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const location = useLocation();
    const { logoUrl, siteName } = useSiteConfig();

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
        { name: "About Us", path: "/about" },
        { name: "Contact Us", path: "/contact" },
        { name: "Customize", path: "/customization" },
    ];

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/site-content");
                if (res.data?.success && Array.isArray(res.data.data?.categories)) {
                    setCategories(res.data.data.categories.filter(cat => cat.name));
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Reset mobile categories collapse whenever the menu itself closes
    useEffect(() => {
        if (!menuOpen) setMobileCategoriesOpen(false);
    }, [menuOpen]);

    // Hide the regular navbar on any admin route
    if (location.pathname.startsWith("/admin")) return null;

    const closeAll = () => {
        setMenuOpen(false);
        setMobileCategoriesOpen(false);
    };

    return (
        <header className="sticky top-0 z-[50] bg-white/30 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-full mx-auto px-5 lg:px-32">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <NavLink
                        to="/"
                        className="text-2xl md:text-3xl font-bold tracking-wide"
                        onClick={closeAll}
                    >
                        <img
                            src={logoUrl || Logo}
                            alt={`${siteName} - Premium Furniture in Lahore`}
                            loading="eager"
                            className="h-12 w-auto"
                        />
                    </NavLink>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-4">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `px-2 py-1 rounded-xl text-base lg:text-md font-semibold transition-all duration-300
                                ${isActive
                                    ? "bg-orange-500 text-white"
                                    : "text-gray-800 hover:text-orange-500 hover:bg-orange-50"
                                }`
                            }
                        >
                            Home
                        </NavLink>

                        {/* Products with Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setProductsDropdownOpen(true)}
                            onMouseLeave={() => setProductsDropdownOpen(false)}
                        >
                            <NavLink
                                to="/products"
                                className={({ isActive }) =>
                                    `px-2 py-1 rounded-xl text-base lg:text-md font-semibold transition-all duration-300
                                    ${isActive
                                        ? "bg-orange-500 text-white"
                                        : "text-gray-800 hover:text-orange-500 hover:bg-orange-50"
                                    }`
                                }
                            >
                                Products
                            </NavLink>

                            {/* Dropdown Menu */}
                            {productsDropdownOpen && categories.length > 0 && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                                    <div className="max-h-96 overflow-y-auto">
                                        {categories.map((cat) => {
                                            const catName = cat.name || cat;
                                            return (
                                                <NavLink
                                                    key={catName}
                                                    to={`/products?category=${encodeURIComponent(catName)}`}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors"
                                                    onClick={() => setProductsDropdownOpen(false)}
                                                >
                                                    {cat.image && (
                                                        <img
                                                            src={cat.image}
                                                            alt={catName}
                                                            className="w-8 h-8"
                                                        />
                                                    )}
                                                    <span className="text-sm font-medium text-gray-800 hover:text-orange-600">
                                                        {catName}
                                                    </span>
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <NavLink
                            to="/about"
                            className={({ isActive }) =>
                                `px-2 py-1 rounded-xl text-base lg:text-md font-semibold transition-all duration-300
                                ${isActive
                                    ? "bg-orange-500 text-white"
                                    : "text-gray-800 hover:text-orange-500 hover:bg-orange-50"
                                }`
                            }
                        >
                            About Us
                        </NavLink>

                        <NavLink
                            to="/contact"
                            className={({ isActive }) =>
                                `px-2 py-1 rounded-xl text-base lg:text-md font-semibold transition-all duration-300
                                ${isActive
                                    ? "bg-orange-500 text-white"
                                    : "text-gray-800 hover:text-orange-500 hover:bg-orange-50"
                                }`
                            }
                        >
                            Contact Us
                        </NavLink>

                        <NavLink
                            to="/customization"
                            className={({ isActive }) =>
                                `px-2 py-1 rounded-xl text-base lg:text-md font-semibold transition-all duration-300
                                ${isActive
                                    ? "bg-orange-500 text-white"
                                    : "text-gray-800 hover:text-orange-500 hover:bg-orange-50"
                                }`
                            }
                        >
                            Customize
                        </NavLink>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-800 relative z-[101]"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? (
                            <HiX size={20} />
                        ) : (
                            <FaBars size={20} />
                        )}
                    </button>
                </div>
            </div>

            {/* Backdrop overlay - dims & blurs the page behind the mobile menu */}
            <div
                className={`md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 z-[90] ${
                    menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={closeAll}
                aria-hidden="true"
            />

            {/* Mobile Navigation */}
            <div
                className={`md:hidden absolute top-full left-0 w-full bg-white/90 backdrop-blur-md shadow-lg border-t border-gray-200 overflow-hidden transition-all duration-300 z-[95] ${
                    menuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <nav className="overflow-y-auto max-h-[32rem]">
                    {navItems.map((item) => {
                        const isProducts = item.path === "/products";

                        if (isProducts) {
                            return (
                                <div key={item.path} className="border-b border-gray-100">
                                    <div className="flex items-center">
                                        <NavLink
                                            to={item.path}
                                            onClick={closeAll}
                                            className={({ isActive }) =>
                                                `flex-1 px-6 py-4 text-base font-medium transition-colors ${isActive
                                                    ? "text-blue-600 bg-blue-50"
                                                    : "text-gray-800 hover:text-orange-500 hover:bg-gray-50"
                                                }`
                                            }
                                        >
                                            {item.name}
                                        </NavLink>

                                        {categories.length > 0 && (
                                            <button
                                                type="button"
                                                aria-label="Toggle product categories"
                                                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                                                className="px-6 py-4 text-gray-500 hover:text-orange-500"
                                            >
                                                <HiChevronDown
                                                    size={18}
                                                    className={`transition-transform duration-300 ${
                                                        mobileCategoriesOpen ? "rotate-180" : ""
                                                    }`}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {/* Nested category list - only visible once expanded */}
                                    {categories.length > 0 && (
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ${
                                                mobileCategoriesOpen ? "max-h-80" : "max-h-0"
                                            }`}
                                        >
                                            <div className="max-h-80 overflow-y-auto bg-gray-50">
                                                {categories.map((cat) => {
                                                    const catName = cat.name || cat;
                                                    return (
                                                        <NavLink
                                                            key={catName}
                                                            to={`/products?category=${encodeURIComponent(catName)}`}
                                                            onClick={closeAll}
                                                            className="flex items-center gap-3 pl-10 pr-6 py-3 text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-100"
                                                        >
                                                            {cat.image && (
                                                                <img
                                                                    src={cat.image}
                                                                    alt={catName}
                                                                    className="w-6 h-6 rounded object-cover border border-gray-200"
                                                                />
                                                            )}
                                                            <span>{catName}</span>
                                                        </NavLink>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                                onClick={closeAll}
                                className={({ isActive }) =>
                                    `block px-6 py-4 text-base font-medium border-b border-gray-100 transition-colors ${isActive
                                        ? "text-blue-600 bg-blue-50"
                                        : "text-gray-800 hover:text-orange-500 hover:bg-gray-50"
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;