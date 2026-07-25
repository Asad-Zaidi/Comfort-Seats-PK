import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import Breadcrumb from "../components/Breadcrumb";
import api from "../api/api";
import { useToast } from "../components/ToastNotification";
import { useSiteConfig } from "../utils/siteConfig";
import { getProductCardImages } from "../utils/imageUtils";
import { SkeletonProductCard } from "../components/SkeletonLoaders";
import { AnimatedSection } from "../components/animations";
import { sectionHeading, staggerContainer, staggerItem, productCardReveal, prefersReducedMotion } from "../components/animations";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

// Dual-thumb price range slider
const PriceRangeSlider = ({ min, max, value, onChange }) => {
  const [low, high] = value;
  const range = Math.max(1, max - min);
  const lowPct = ((low - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;

  return (
    <div className="px-1">
      <div className="mb-4 flex items-center justify-between text-sm font-medium text-[#12131A]">
        <span>Rs. {low.toLocaleString()}</span>
        <span>Rs. {high.toLocaleString()}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-gray-200">
        <div
          className="absolute h-1.5 rounded-full bg-[#2F6FED]"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={low}
          onChange={(e) =>
            onChange([Math.min(Number(e.target.value), high - 1), high])
          }
          className="pointer-events-none absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 appearance-none bg-transparent
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#2F6FED] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#2F6FED] [&::-moz-range-thumb]:bg-white"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={high}
          onChange={(e) =>
            onChange([low, Math.max(Number(e.target.value), low + 1)])
          }
          className="pointer-events-none absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 appearance-none bg-transparent
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#2F6FED] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#2F6FED] [&::-moz-range-thumb]:bg-white"
        />
      </div>

      {/* Manual min/max inputs */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Min
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              Rs.
            </span>
            <input
              type="number"
              min={min}
              max={high}
              value={low}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isNaN(v)) return;
                onChange([Math.min(Math.max(v, min), high - 1), high]);
              }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-7 pr-2 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
            />
          </div>
        </div>
        <span className="mt-5 text-gray-400">–</span>
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Max
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              Rs.
            </span>
            <input
              type="number"
              min={low}
              max={high}
              value={high}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isNaN(v)) return;
                onChange([low, Math.max(Math.min(v, max), low + 1)]);
              }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-7 pr-2 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FiltersContent = ({
  categories,
  selectedCategory,
  onSelectCategory,
  subcategoryOptions = [],
  selectedSubcategory,
  onSelectSubcategory,
  subcategoriesByCategory = {},
  onSelectCategoryAndSub,
  search,
  onSearch,
  priceBounds,
  priceValue,
  onPriceChange,
  sort,
  onSortChange,
  onClearAll,
}) => {
  const [openFlyout, setOpenFlyout] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);

  const closeFlyout = () => {
    setOpenFlyout(null);
    setAnchorRect(null);
  };

  return (
  <div className="space-y-7">
    {/* Search */}
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        Search
      </label>
      <div className="relative">
        <FiSearch
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
        />
      </div>
    </div>

    {/* Categories */}
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Categories
      </h3>
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            onClick={() => onSelectCategory("")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
              selectedCategory === ""
                ? "bg-[#2F6FED] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Products
            {selectedCategory === "" && <FiChevronDown size={14} className="rotate-90" />}
          </button>
        </li>
        {categories.map((cat) => {
          const name = cat.name || cat;
          const active = selectedCategory === name;
          const subs = subcategoriesByCategory[name] || [];
          return (
            <li key={name} className="relative">
              <button
                type="button"
                onClick={(e) => {
                  if (subs.length === 0) {
                    onSelectCategory(name);
                    return;
                  }
                  const rect = e.currentTarget.getBoundingClientRect();
                  setOpenFlyout((prev) => (prev === name ? null : name));
                  setAnchorRect((prev) =>
                    prev && openFlyout === name ? null : rect
                  );
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[#2F6FED] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{name}</span>
                {subs.length > 0 ? (
                  <FiChevronDown
                    size={14}
                    className={`transition ${
                      openFlyout === name ? "rotate-180" : ""
                    } ${active ? "text-white" : "text-gray-400"}`}
                  />
                ) : (
                  active && <FiChevronDown size={14} className="rotate-90" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Subcategory popup rendered in a portal to <body> so it escapes the
          sidebar's stacking context and always appears above other content */}
      {openFlyout && anchorRect && subcategoriesByCategory[openFlyout] && createPortal(
        (() => {
          const subs = subcategoriesByCategory[openFlyout] || [];
          const activeCat = selectedCategory === openFlyout;
          const left = Math.min(
            anchorRect.right + 8,
            (typeof window !== "undefined" ? window.innerWidth : 9999) - 220
          );
          return (
            <>
              <div
                className="fixed inset-0 z-[999]"
                onClick={closeFlyout}
                aria-hidden="true"
              />
              <ul
                className="fixed z-[1000] w-52 rounded-xl border border-gray-100 bg-white p-2 shadow-xl"
                style={{ top: anchorRect.top, left }}
              >
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategoryAndSub(openFlyout, "");
                      closeFlyout();
                    }}
                    className="mb-1 block w-full rounded-lg px-3 py-1.5 text-left text-sm font-semibold text-[#2F6FED] transition hover:bg-[#2F6FED]/10"
                  >
                    All {openFlyout}
                  </button>
                </li>
                {subs.map((sub) => {
                  const subActive = activeCat && selectedSubcategory === sub;
                  return (
                    <li key={sub}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategoryAndSub(openFlyout, sub);
                          closeFlyout();
                        }}
                        className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                          subActive
                            ? "bg-[#2F6FED]/10 font-semibold text-[#2F6FED]"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {sub}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          );
        })(),
        document.body
      )}
    </div>

    {/* Price Range */}
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Price Range
      </h3>
      <PriceRangeSlider
        min={priceBounds[0]}
        max={priceBounds[1]}
        value={priceValue}
        onChange={onPriceChange}
      />
    </div>

    {/* Sort */}
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Sort By
      </h3>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#12131A] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
      >
        <option value="default">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>

    <button
      type="button"
      onClick={onClearAll}
      className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
    >
      Clear All Filters
    </button>
  </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { siteUrl, siteName } = useSiteConfig();
  const [pageLoaded, setPageLoaded] = useState(false);

	const initialCategory = searchParams.get("category") || "";
	const initialSubcategory = searchParams.get("subcategory") || "";

  const [search, setSearch] = useState(searchParams.get("search") || "");
	const [selectedCategory, setSelectedCategory] = useState(initialCategory);
	const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [priceValue, setPriceValue] = useState([0, 0]);
  const [priceBounds, setPriceBounds] = useState([0, 0]);
  const [sort, setSort] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const isSearchResultsPage = useMemo(() => {
    const q = searchParams.get("search");
    return Boolean(q && q.trim().length > 0);
  }, [searchParams]);

  // Sync selected category with URL ?category= param
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	const handleSelectCategory = useCallback(
		(cat) => {
			setSelectedCategory(cat);
			setSelectedSubcategory("");
			if (cat) {
				setSearchParams({ category: cat }, { replace: true });
			} else {
				setSearchParams({}, { replace: true });
			}
			setMobileFiltersOpen(false);
		},
		[setSearchParams]
	);

	// Handler for subcategory filter (preserves the parent category).
	const handleSelectSubcategory = useCallback(
		(sub) => {
			setSelectedSubcategory(sub);
			if (sub) {
				setSearchParams(
					{ category: selectedCategory, subcategory: sub },
					{ replace: true }
				);
			} else {
				setSearchParams(
					selectedCategory ? { category: selectedCategory } : {},
					{ replace: true }
				);
			}
			setMobileFiltersOpen(false);
		},
		[setSearchParams, selectedCategory]
	);

	// Handler for picking a subcategory from a category's right-side flyout popup.
	const handleSelectCategoryAndSub = useCallback(
		(category, sub) => {
			setSelectedCategory(category);
			setSelectedSubcategory(sub || "");
			if (category && sub) {
				setSearchParams({ category, subcategory: sub }, { replace: true });
			} else if (category) {
				setSearchParams({ category }, { replace: true });
			} else {
				setSearchParams({}, { replace: true });
			}
			setMobileFiltersOpen(false);
		},
		[setSearchParams]
	);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [prodRes, siteRes] = await Promise.all([
          api.get("/products"),
          api.get("/site-content").catch(() => null),
        ]);

        const list = prodRes.data?.success ? prodRes.data.data || [] : [];
        setProducts(list);

        if (list.length > 0) {
          const prices = list.map((p) => Number(p.price) || 0);
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setPriceBounds([min, max]);
          setPriceValue((prev) =>
            prev[1] === 0 ? [min, max] : prev
          );
        }

        if (siteRes?.data?.success && Array.isArray(siteRes.data.data?.categories)) {
          setCategories(
            siteRes.data.data.categories.filter((c) => c.name)
          );
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err.message || "Failed to load products.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filtered = useMemo(() => {
    let result = [...products];
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || p.detail || "").toLowerCase().includes(q) ||
          (Array.isArray(p.category) ? p.category.join(" ") : (p.category || "")).toLowerCase().includes(q)
      );
    }
		if (selectedCategory) {
			result = result.filter(
				(p) => (Array.isArray(p.category) ? p.category[0] : p.category || "") === selectedCategory
			);
		}
		if (selectedSubcategory) {
			result = result.filter(
				(p) => (p.subcategory || "") === selectedSubcategory
			);
		}
    result = result.filter((p) => {
      const price = Number(p.price) || 0;
      return price >= priceValue[0] && price <= priceValue[1];
    });

    if (sort === "price-asc") result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sort === "price-desc") result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    else if (sort === "rating") result.sort((a, b) => (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0));

    return result;
  }, [products, search, selectedCategory, selectedSubcategory, priceValue, sort]);

	const handleClearAll = () => {
		setSearch("");
		setSelectedCategory("");
		setSelectedSubcategory("");
		setPriceValue(priceBounds);
		setSort("default");
		setSearchParams({}, { replace: true });
		setMobileFiltersOpen(false);
	};

  const breadcrumbs = useMemo(() => {
		const crumbs = [{ name: "Home", url: `${siteUrl}/` }];
		if (selectedCategory) {
			crumbs.push({ name: "Products", url: `${siteUrl}/products` });
			crumbs.push({ name: selectedCategory, url: `${siteUrl}/products?category=${encodeURIComponent(selectedCategory)}` });
			if (selectedSubcategory) {
				crumbs.push({ name: selectedSubcategory, url: `${siteUrl}/products?category=${encodeURIComponent(selectedCategory)}&subcategory=${encodeURIComponent(selectedSubcategory)}` });
			}
		} else {
			crumbs.push({ name: "Products", url: `${siteUrl}/products` });
		}
		return crumbs;
	}, [selectedCategory, selectedSubcategory, siteUrl]);

  // Derive the list of subcategories for the currently selected category.
  const subcategoryOptions = useMemo(() => {
    if (!selectedCategory) return [];
    const set = new Set();
    products.forEach((p) => {
      const cat = Array.isArray(p.category) ? p.category[0] : p.category;
      if (cat === selectedCategory && p.subcategory) {
        set.add(p.subcategory);
      }
    });
    return Array.from(set).sort();
  }, [products, selectedCategory]);

  // Derive subcategories grouped by every category, used for the right-side flyout popup.
  const subcategoriesByCategory = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const cat = Array.isArray(p.category) ? p.category[0] : p.category;
      if (!cat) return;
      if (!map[cat]) map[cat] = new Set();
      if (p.subcategory) map[cat].add(p.subcategory);
    });
    Object.keys(map).forEach((k) => {
      map[k] = Array.from(map[k]).sort();
    });
    return map;
  }, [products]);

  const productSkeletons = useMemo(() => [...Array(6)], []);

  return (
    <div className="mx-auto max-w-full py-6 px-12 lg:px-32">
      <Breadcrumb crumbs={breadcrumbs.map(b => ({ name: b.name, path: b.url.replace(siteUrl, '') }))} />
      <SEO
        title={`Products${selectedCategory ? ` - ${selectedCategory}` : ""} - ${siteName}`}
        description="Browse our full range of premium office chairs, gaming chairs, sofas, and office furniture in Lahore. Shop ergonomic seating at Comfort Seats PK."
        canonicalUrl={`${siteUrl}/products${selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : ''}`}
        products={products}
        breadcrumbs={breadcrumbs}
        category={selectedCategory}
      />

      <AnimatedSection>
        {/* Header / Mobile filter toggle */}
        <motion.div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" variants={sectionHeading}>
          <div>
            <h1 className="text-2xl font-bold text-[#12131A] sm:text-3xl">
              {isSearchResultsPage ? `Search Results` : (selectedSubcategory || selectedCategory || "All Products")}
            </h1>
            {isSearchResultsPage && (
              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Loading..."
                  : `${filtered.length} product${filtered.length === 1 ? "" : "s"} found`}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#12131A] transition hover:bg-gray-50 lg:hidden"
          >
            <FiFilter size={16} />
            Filters
          </button>
        </motion.div>
      </AnimatedSection>

      <div className="mt-6 flex gap-8">
        {/* Desktop Sidebar */}
        <AnimatedSection direction="right">
          <aside className="hidden w-64 shrink-0 lg:block">
            <motion.div variants={sectionHeading} className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <FiltersContent
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                subcategoryOptions={subcategoryOptions}
                selectedSubcategory={selectedSubcategory}
                onSelectSubcategory={handleSelectSubcategory}
                subcategoriesByCategory={subcategoriesByCategory}
                onSelectCategoryAndSub={handleSelectCategoryAndSub}
                search={search}
                onSearch={setSearch}
                priceBounds={priceBounds}
                priceValue={priceValue}
                onPriceChange={setPriceValue}
                sort={sort}
                onSortChange={setSort}
                onClearAll={handleClearAll}
              />
            </motion.div>
          </aside>
        </AnimatedSection>

        {/* Product Grid */}
        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
                  {productSkeletons.map((_, i) => (
                    <SkeletonProductCard key={i} />
                  ))}
                </div>
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-red-600">{error}</motion.div>
            ) : filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-gray-500">
                {isSearchResultsPage
                  ? <>No products match your search.<div className="mt-4"><button type="button" onClick={handleClearAll} className="rounded-xl bg-[#2F6FED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90">Clear Search</button></div></>
                  : <>No products match your filters.<div className="mt-4"><button type="button" onClick={handleClearAll} className="rounded-xl bg-[#2F6FED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90">Clear Filters</button></div></>}
              </motion.div>
            ) : (
              <motion.div key="products" variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
                {filtered.map((product) => {
                  const { primaryImage, hoverImage } = getProductCardImages(product);

                  return (
                    <motion.div key={product._id} variants={prefersReducedMotion() ? staggerItem : productCardReveal}>
                      <ProductCard
                        to={product.slug ? `/products/${product.slug}` : `/products/${product.slug}`}
                        image={primaryImage || product.imageUrl || "https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=500"}
                        hoverImage={hoverImage}
                        name={product.name}
                        price={product.price}
                        description={product.description || product.detail || "No description available."}
                        rating={product.avgRating || 0}
                        reviews={product.totalReviews || 0}
                        category={product.category}
                        isCustomizable={product.isCustomizable === true}
                        product={product}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          <div
            className="absolute inset-0 bg-[#0F1320]/60 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-[#12131A]">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close filters"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FiltersContent
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                subcategoryOptions={subcategoryOptions}
                selectedSubcategory={selectedSubcategory}
                onSelectSubcategory={handleSelectSubcategory}
                subcategoriesByCategory={subcategoriesByCategory}
                onSelectCategoryAndSub={handleSelectCategoryAndSub}
                search={search}
                onSearch={setSearch}
                priceBounds={priceBounds}
                priceValue={priceValue}
                onPriceChange={setPriceValue}
                sort={sort}
                onSortChange={setSort}
                onClearAll={handleClearAll}
              />
            </div>
            <div className="border-t border-gray-100 p-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-xl bg-[#2F6FED] py-3 text-sm font-semibold text-white transition hover:bg-[#2F6FED]/90"
              >
                Show {filtered.length} Result{filtered.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;