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


import { useState, useEffect, useRef } from "react";
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
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownItemRefs = useRef([]);
    const dropdownTimeoutRef = useRef(null);
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

    // Scroll to highlighted item
    useEffect(() => {
        if (highlightedIndex >= 0 && dropdownItemRefs.current[highlightedIndex]) {
            dropdownItemRefs.current[highlightedIndex].scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex]);

    // Hide the regular navbar on any admin route
    if (location.pathname.startsWith("/admin")) return null;

    const closeAll = () => {
        setMenuOpen(false);
        setMobileCategoriesOpen(false);
    };

    const handleProductsMouseEnter = () => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
        setHighlightedIndex(-1); // Reset on mouse enter
        setProductsDropdownOpen(true);
    };

    const handleProductsMouseLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setProductsDropdownOpen(false);
            setHighlightedIndex(-1); // Reset on mouse leave
        }, 200); // 200ms delay
    };

    const handleKeyDown = (e) => {
        if (!productsDropdownOpen || categories.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prevIndex =>
                prevIndex < categories.length - 1 ? prevIndex + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prevIndex =>
                prevIndex > 0 ? prevIndex - 1 : categories.length - 1
            );
        } else if (e.key === 'Enter') {
            if (highlightedIndex >= 0) {
                e.preventDefault();
                // Manually navigate using the ref's click method or direct navigation
                if (dropdownItemRefs.current[highlightedIndex]) {
                    dropdownItemRefs.current[highlightedIndex].click();
                }
            }
        } else if (e.key === 'Escape') {
            setProductsDropdownOpen(false);
        }
    };

    return (
        <header
            className="sticky top-0 z-[50] backdrop-blur-md border-b shadow-sm transition-colors duration-300"
            style={{
                backgroundColor: 'var(--header-bg)',
                color: 'var(--header-text)',
                borderColor: 'var(--border)',
            }}
        >
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
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? 'var(--header-active-link, var(--primary))' : 'transparent',
                                color: isActive ? '#ffffff' : 'var(--header-text)',
                            })}
                            className="px-3 py-1.5 rounded-xl text-base lg:text-md font-semibold transition-all duration-300 hover:opacity-90"
                        >
                            Home
                        </NavLink>

                        {/* Products with Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={handleProductsMouseEnter}
                            onMouseLeave={handleProductsMouseLeave}
                            onKeyDown={handleKeyDown}
                        >
                            <NavLink
                                to="/products"
                                style={({ isActive }) => ({
                                    backgroundColor: isActive ? 'var(--header-active-link, var(--primary))' : 'transparent',
                                    color: isActive ? '#ffffff' : 'var(--header-text)',
                                })}
                                className="px-3 py-1.5 rounded-xl text-base lg:text-md font-semibold transition-all duration-300 hover:opacity-90"
                            >
                                Products
                            </NavLink>

                            {/* Dropdown Menu */}
                            {productsDropdownOpen && categories.length > 0 && (
                                <div
                                    className="absolute top-full left-0 mt-2 w-72 rounded-xl shadow-2xl border py-2 z-50 transition-colors"
                                    style={{
                                        backgroundColor: 'var(--header-dropdown-bg, var(--card-bg))',
                                        borderColor: 'var(--border)',
                                    }}
                                >
                                    <div className="max-h-96 overflow-y-auto" role="listbox">
                                        {categories.map((cat, index) => {
                                            const catName = cat.name || cat;
                                            return (
                                                <NavLink
                                                    key={catName}
                                                    ref={el => dropdownItemRefs.current[index] = el}
                                                    to={`/products?category=${encodeURIComponent(catName)}`}
                                                    className={`flex items-center gap-3 px-4 py-3 transition-colors hover:opacity-80 ${highlightedIndex === index ? 'bg-opacity-20' : ''}`}
                                                    style={{
                                                        color: 'var(--header-dropdown-text, var(--text))',
                                                        backgroundColor: highlightedIndex === index ? 'var(--primary-hover)' : 'transparent'
                                                    }}
                                                    onClick={() => setProductsDropdownOpen(false)}
                                                    onMouseEnter={() => setHighlightedIndex(index)}
                                                >
                                                    {cat.image && (
                                                        <img
                                                            src={cat.image}
                                                            alt={catName}
                                                            className="w-8 h-8 rounded object-cover border"
                                                            style={{ borderColor: 'var(--border)' }}
                                                        />
                                                    )}
                                                    <span className="text-sm font-medium">
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
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? 'var(--header-active-link, var(--primary))' : 'transparent',
                                color: isActive ? '#ffffff' : 'var(--header-text)',
                            })}
                            className="px-3 py-1.5 rounded-xl text-base lg:text-md font-semibold transition-all duration-300 hover:opacity-90"
                        >
                            About Us
                        </NavLink>

                        <NavLink
                            to="/contact"
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? 'var(--header-active-link, var(--primary))' : 'transparent',
                                color: isActive ? '#ffffff' : 'var(--header-text)',
                            })}
                            className="px-3 py-1.5 rounded-xl text-base lg:text-md font-semibold transition-all duration-300 hover:opacity-90"
                        >
                            Contact Us
                        </NavLink>

                        <NavLink
                            to="/customization"
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? 'var(--header-active-link, var(--primary))' : 'transparent',
                                color: isActive ? '#ffffff' : 'var(--header-text)',
                            })}
                            className="px-3 py-1.5 rounded-xl text-base lg:text-md font-semibold transition-all duration-300 hover:opacity-90"
                        >
                            Customize
                        </NavLink>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden relative z-[101]"
                        style={{ color: 'var(--header-text)' }}
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

            {/* Backdrop overlay */}
            <div
                className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-[90] ${
                    menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={closeAll}
                aria-hidden="true"
            />

            {/* Mobile Navigation */}
            <div
                className={`md:hidden absolute top-full left-0 w-full backdrop-blur-md shadow-lg border-t overflow-hidden transition-all duration-300 z-[95] ${
                    menuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
                }`}
                style={{
                    backgroundColor: 'var(--header-bg)',
                    borderColor: 'var(--border)',
                }}
            >
                <nav className="overflow-y-auto max-h-[32rem]">
                    {navItems.map((item) => {
                        const isProducts = item.path === "/products";

                        if (isProducts) {
                            return (
                                <div key={item.path} className="border-b" style={{ borderColor: 'var(--border)' }}>
                                    <div className="flex items-center">
                                        <NavLink
                                            to={item.path}
                                            onClick={closeAll}
                                            style={({ isActive }) => ({
                                                backgroundColor: isActive ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'transparent',
                                                color: isActive ? 'var(--primary)' : 'var(--header-text)',
                                            })}
                                            className="flex-1 px-6 py-4 text-base font-medium transition-colors"
                                        >
                                            {item.name}
                                        </NavLink>

                                        {categories.length > 0 && (
                                            <button
                                                type="button"
                                                aria-label="Toggle product categories"
                                                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                                                className="px-6 py-4"
                                                style={{ color: 'var(--header-text)' }}
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

                                    {/* Nested category list */}
                                    {categories.length > 0 && (
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ${
                                                mobileCategoriesOpen ? "max-h-80" : "max-h-0"
                                            }`}
                                        >
                                            <div className="max-h-80 overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                                {categories.map((cat) => {
                                                    const catName = cat.name || cat;
                                                    return (
                                                        <NavLink
                                                            key={catName}
                                                            to={`/products?category=${encodeURIComponent(catName)}`}
                                                            onClick={closeAll}
                                                            className="flex items-center gap-3 pl-10 pr-6 py-3 text-sm font-medium transition-colors hover:opacity-80"
                                                            style={{ color: 'var(--text)' }}
                                                        >
                                                            {cat.image && (
                                                                <img
                                                                    src={cat.image}
                                                                    alt={catName}
                                                                    className="w-6 h-6 rounded object-cover border"
                                                                    style={{ borderColor: 'var(--border)' }}
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
                                style={({ isActive }) => ({
                                    backgroundColor: isActive ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'transparent',
                                    color: isActive ? 'var(--primary)' : 'var(--header-text)',
                                    borderColor: 'var(--border)',
                                })}
                                className="block px-6 py-4 text-base font-medium border-b transition-colors"
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