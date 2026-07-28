import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiFeather,
  FiDollarSign,
  FiShield,
  FiCheckCircle,
  FiGrid,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  FaStar,
  FaChair,
  FaGamepad,
  FaCrown,
  FaUserTie,
  FaHourglassHalf,
  FaWineGlassAlt,
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaBriefcase,
  FaSun,
  FaUtensils,
  FaGem,
} from "react-icons/fa";
import SEO from "../components/SEO";
import { useSiteConfig } from "../utils/siteConfig";
import api from "../api/api";
import Footer from "../components/Footer";
import WhatsappFloatingButton from "../components/FloatingWhatsapp";
import ProductCard from "../components/ProductCard";
import QuoteSection from "../components/QuoteSection";
import { getProductCardImages } from "../utils/imageUtils";
import SearchBar from "../components/SearchBar";
import {
  SkeletonBanner,
  SkeletonProductCard,
  SkeletonTestimonial,
} from "../components/SkeletonLoaders";
import { AnimatedSection } from "../components/animations";
import {
  heroBannerText,
  heroImage,
  heroCta,
  searchBarReveal,
  sectionHeading,
  staggerContainer,
  staggerItem,
} from "../components/animations";

const iconMap = {
  FiFeather,
  FiDollarSign,
  FiShield,
  FiCheckCircle,
};

const getIcon = (iconName) => {
  return iconMap[iconName] || FiGrid;
};

const getCategoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("gaming")) return FaGamepad;
  if (n.includes("high")) return FaArrowUp;
  if (n.includes("low")) return FaArrowDown;
  if (n.includes("visitor")) return FaUsers;
  if (n.includes("bar")) return FaWineGlassAlt;
  if (n.includes("boss")) return FaCrown;
  if (n.includes("executive")) return FaUserTie;
  if (n.includes("waiting")) return FaHourglassHalf;
  if (n.includes("office")) return FaBriefcase;
  if (n.includes("outdoor")) return FaSun;
  if (n.includes("dining")) return FaUtensils;
  if (n.includes("luxury")) return FaGem;
  return FaChair;
};

const defaultHomeBanner = {
  eyebrow: "Trusted Since 1995",
  title: "Comfort, Built\nto Last.",
  description:
    "Premium office chairs, gaming chairs, sofas, and complete furniture solutions - crafted in Lahore with Years of experience.",
  primaryButtonText: "Shop Now",
  primaryButtonLink: "/products",
  secondaryButtonText: "Our Story",
  secondaryButtonLink: "/about",
  imageUrl: "https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=1000",
  desktopImage: "https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=1000",
  mobileImage: "https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=1000",
  imageAlt: "Premium office chair",
  statValue: "1995",
  statLabel: "25+ Years of craftsmanship",
};

const defaultWhyChooseUs = [
  { icon: "FiFeather", title: "Quality Craftsmanship", desc: "Every piece built with care and quality materials." },
  { icon: "FiDollarSign", title: "Affordable Pricing", desc: "Premium comfort without the premium price tag." },
  { icon: "FiShield", title: "Built to Last", desc: "Durability that holds up to everyday use." },
  { icon: "FiCheckCircle", title: "Years of Trusted", desc: "A legacy of customer satisfaction since 1995." },
];

const StarRating = ({ value = 0, size = 14 }) => {
  const clamped = Math.max(0, Math.min(5, value));
  const fillPercent = (clamped / 5) * 100;
  return (
    <div className="relative inline-flex">
      <div className="flex gap-0.5 text-gray-200">
        {[...Array(5)].map((_, i) => <FaStar key={i} size={size} />)}
      </div>
      <div className="absolute inset-0 flex gap-0.5 overflow-hidden text-[#F5A524]" style={{ width: `${fillPercent}%` }}>
        {[...Array(5)].map((_, i) => <FaStar key={i} size={size} />)}
      </div>
    </div>
  );
};

const cssVar = (name, fallback) => `var(--${name}, ${fallback})`;

const Home = () => {
  const { siteName } = useSiteConfig();
  const [homeBanner, setHomeBanner] = useState(defaultHomeBanner);
  const [categories, setCategories] = useState();
  const [whyChooseUs, setWhyChooseUs] = useState(defaultWhyChooseUs);
  const [testimonials, setTestimonials] = useState([]);
  const [quoteData, setQuoteData] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [itemsToShow, setItemsToShow] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);

  const primary = cssVar('primary', '#2F6FED');
  const secondary = cssVar('secondary', '#F5A524');
  const text = cssVar('textPrimary', '#12131A');
  const textSecondary = cssVar('textSecondary', '#6b7280');
  const bgSecondary = cssVar('backgroundSecondary', '#f8fafc');
  const bgTertiary = cssVar('backgroundTertiary', '#FAF9F6');
  const border = cssVar('border', '#e5e7eb');
  const cardBg = cssVar('card-bg', '#ffffff');

  const featuredScrollRef = useRef(null);

  const scrollFeatured = (direction) => {
    if (featuredScrollRef.current) {
      const scrollAmount = featuredScrollRef.current.clientWidth * 0.8;
      featuredScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const fetchSiteContent = async () => {
      try {
        const res = await api.get("/site-content");
        if (res.data?.success && res.data.data) {
          if (res.data.data.homeBanner) setHomeBanner((prev) => ({ ...prev, ...res.data.data.homeBanner }));
          if (Array.isArray(res.data.data.categories)) setCategories(res.data.data.categories);
          if (Array.isArray(res.data.data.whyChooseUs)) setWhyChooseUs(res.data.data.whyChooseUs);
          if (res.data.data.quoteSection) setQuoteData(res.data.data.quoteSection);
        }
      } catch (err) {
        console.error("Failed to load site content:", err);
      }
    };
    fetchSiteContent();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/products?isFeatured=true&limit=50");
        let list = res.data?.success ? res.data.data || [] : [];
        if (list.length === 0) {
          const fallbackRes = await api.get("/products?limit=50");
          list = fallbackRes.data?.success ? fallbackRes.data.data || [] : [];
        }
        setFeaturedProducts(list);
      } catch (err) {
        console.error("Failed to load featured products:", err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await api.get("/products/reviews/featured?limit=6&minRating=4");
        const fetched = res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
        setTestimonials(fetched);
      } catch (err) {
        console.error("Failed to load customer reviews:", err);
        setTestimonials([]);
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    const updateItems = () => {
      if (window.innerWidth < 768) setItemsToShow(1);
      else setItemsToShow(3); // Desktop & Tablet: ALWAYS 3 comments
    };
    updateItems();
    window.addEventListener("resize", updateItems);
    return () => window.removeEventListener("resize", updateItems);
  }, []);

  const handleNext = () => {
    if (!testimonials.length) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    if (!testimonials.length) return;
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(0);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 40) handleNext();
    else if (distance < -40) handlePrev();
  };

  const visibleTestimonials = useMemo(() => {
    if (!testimonials || testimonials.length === 0) return [];
    const count = Math.min(itemsToShow, testimonials.length);
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return result;
  }, [testimonials, currentIndex, itemsToShow]);

  const bannerTitleLines = (homeBanner.title || defaultHomeBanner.title).split("\n");

  const valueIcons = useMemo(() => whyChooseUs.map((val) => ({ ...val, Icon: getIcon(val.icon) })), [whyChooseUs]);

  // Beyond 15 items, spills into additional rows with decreasing caps (8, 7, 6, 5...).
  function chunkIntoPyramid(items) {
    const total = items.length;
    if (total === 0) return [];

    if (total <= 15) {
      const row1Size = Math.ceil(total / 2); // always <= 8 when total <= 15
      const row1 = items.slice(0, row1Size);
      const row2 = items.slice(row1Size);
      return row2.length > 0 ? [row1, row2] : [row1];
    }

    // total > 15: fixed decreasing caps starting at 8
    const rows = [];
    let remaining = [...items];
    let cap = 8;
    while (remaining.length > 0) {
      const take = Math.min(cap, remaining.length);
      rows.push(remaining.slice(0, take));
      remaining = remaining.slice(take);
      cap = Math.max(cap - 1, 1);
    }
    return rows;
  }

  return (
    <div style={{ backgroundColor: cssVar('bg', '#ffffff') }}>
      <SEO title={`Premium Office Chairs & Furniture in Lahore - ${siteName}`} description={`Contact ${siteName} - Lahore furniture manufacturer.`} />
      <WhatsappFloatingButton />

      {/* Hero Banner */}
      <section className="relative aspect-[3/4] w-full md:h-[600px] lg:h-[600px]">
        <AnimatePresence mode="wait">
          {!pageLoaded ? (
            <motion.div key="skeleton" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <SkeletonBanner />
            </motion.div>
          ) : (
            <motion.div
              key="banner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0">
                {(() => {
                  const defaultDesktop = defaultHomeBanner.desktopImage || defaultHomeBanner.imageUrl || "https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=1000";
                  const defaultMobile = defaultHomeBanner.mobileImage || defaultDesktop;
                  const desktopSrc = homeBanner.desktopImage || homeBanner.mobileImage || homeBanner.imageUrl || defaultDesktop;
                  const mobileSrc = homeBanner.mobileImage || homeBanner.desktopImage || homeBanner.imageUrl || defaultMobile;
                  return (
                    <motion.picture variants={heroImage} initial="initial" animate="animate">
                      <source media="(min-width: 768px)" srcSet={desktopSrc} />
                      <img
                        src={mobileSrc}
                        alt={homeBanner.imageAlt || "Home banner"}
                        className="h-full w-full object-cover"
                        loading="eager"
                        fetchpriority="high"
                      />
                    </motion.picture>
                  );
                })()}
                <div className="absolute inset-0 bg-black/50" />
              </div>
              <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-5 lg:px-8">
                <motion.div className="text-center" variants={heroBannerText.container} initial="initial" animate="animate">
                  <motion.span variants={heroBannerText.item} className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: secondary }}>{homeBanner.eyebrow}</motion.span>
                  <motion.h1 variants={heroBannerText.item} className="my-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    {bannerTitleLines.map((line, index) => (<span key={`${line}-${index}`} className="block">{line}</span>))}
                  </motion.h1>
                  <motion.div variants={searchBarReveal} className="flex justify-center">
                    <SearchBar />
                  </motion.div>
                  <motion.p variants={heroBannerText.item} className="mt-6 text-lg leading-8 text-gray-200">{homeBanner.description}</motion.p>
                  <motion.div variants={heroCta} className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    {homeBanner.primaryButtonText && (
                      <Link to={homeBanner.primaryButtonLink || "/products"} className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition" style={{ backgroundColor: primary }}>
                        {homeBanner.primaryButtonText} <FiArrowRight size={16} />
                      </Link>
                    )}
                    {homeBanner.secondaryButtonText && (
                      <Link to={homeBanner.secondaryButtonLink || "/about"} className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                        {homeBanner.secondaryButtonText}
                      </Link>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AnimatedSection>
        <QuoteSection quoteData={quoteData} />
      </AnimatedSection>

      {/* Shop by Category */}
      {/* {categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: secondary }}>Browse Our Collection</span>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl" style={{ color: text }}>Shop by Category</h2>
              <p className="mt-2 text-sm" style={{ color: textSecondary }}>Find the perfect fit for your space.</p>
            </div>
            <Link to="/products" className="hidden items-center gap-1.5 text-sm font-semibold hover:underline sm:inline-flex" style={{ color: primary }}>View All <FiArrowRight size={14} /></Link>
          </div>
          <div className="mt-8">
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-wrap justify-center gap-30 sm:gap-20">
                {categories.slice(0, 4).map((cat) => {
                  const catName = cat.name || cat;
                  const CatIcon = getCategoryIcon(catName);
                  return (
                    <Link key={catName} to={`/products?category=${encodeURIComponent(catName)}`} className="group flex flex-col items-center gap-2 p-2 transition hover:opacity-70" title={catName}>
                      <div className="flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                        {cat.image ? (<img src={cat.image} alt={catName} className="h-full w-full object-contain" />) : (<CatIcon size={40} style={{ color: textSecondary }} />)}
                      </div>
                      <span className="text-xs font-medium text-center" style={{ color: textSecondary }}>{catName}</span>
                    </Link>
                  );
                })}
              </div>
              {categories.length > 4 && (
                <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                  {categories.slice(4, 7).map((cat) => {
                    const catName = cat.name || cat;
                    const CatIcon = getCategoryIcon(catName);
                    return (
                      <Link key={catName} to={`/products?category=${encodeURIComponent(catName)}`} className="group flex flex-col items-center gap-2 p-2 transition hover:opacity-70" title={catName}>
                        <div className="flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                          {cat.image ? (<img src={cat.image} alt={catName} className="h-full w-full object-contain" />) : (<CatIcon size={40} style={{ color: textSecondary }} />)}
                        </div>
                        <span className="text-xs font-medium text-center" style={{ color: textSecondary }}>{catName}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )} */}

      <AnimatedSection>
        <section className="py-8" style={{ backgroundColor: bgSecondary }}>
          {categories && categories.length > 0 && (
            <div className="mx-auto max-w-full px-5 lg:px-32">
              <motion.div className="flex items-end justify-between" variants={sectionHeading}>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: secondary }}>Browse Our Collection</span>
                  <h2 className="mt-2 text-2xl font-bold sm:text-3xl" style={{ color: text }}>Shop by Category</h2>
                  <p className="mt-2 text-sm" style={{ color: textSecondary }}>Find the perfect fit for your space.</p>
                </div>
                <Link to="/products" className="hidden items-center gap-1.5 text-sm font-semibold hover:underline sm:inline-flex" style={{ color: primary }}>View All <FiArrowRight size={14} /></Link>
              </motion.div>
              <div className="mt-4 flex flex-col items-center gap-6">
                {chunkIntoPyramid(categories).map((row, rowIdx) => (
                  <motion.div key={rowIdx} className="flex flex-wrap justify-center gap-6 sm:gap-10" variants={staggerContainer} initial="initial" animate="animate">
                    {row.map((cat) => {
                      const catName = cat.name || cat;
                      const CatIcon = getCategoryIcon(catName);
                      return (
                        <motion.div key={catName} variants={staggerItem}>
                          <Link to={`/products?category=${encodeURIComponent(catName)}`} className="group flex flex-col items-center gap-2 p-2 transition hover:opacity-70" title={catName}>
                            <div className="flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                              {cat.image ? (<img src={cat.image} alt={catName} className="h-full w-full object-contain" />) : (<CatIcon size={40} style={{ color: textSecondary }} />)}
                            </div>
                            <span className="text-xs font-medium text-center" style={{ color: textSecondary }}>{catName}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="py-8" style={{ backgroundColor: bgTertiary }}>
          <div className="mx-auto max-w-full px-12 lg:px-32">
            <motion.div className="flex items-end justify-between" variants={sectionHeading}>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: secondary }}>Handpicked</span>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl" style={{ color: text }}>Featured Products</h2>
                <p className="mt-2 text-sm" style={{ color: textSecondary }}>Our top recommended and featured products for you.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: primary }}>
                  View All <FiArrowRight size={14} />
                </Link>
              </div>
            </motion.div>

            {/* Slider Container with side overlay navigation arrows */}
            <div className="relative mt-8 group">
              {/* Left Arrow Button */}
              <button
                type="button"
                onClick={() => scrollFeatured("left")}
                aria-label="Scroll featured products left"
                className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full border shadow-md transition-all duration-200 hover:scale-110 hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white active:scale-95"
                style={{ backgroundColor: cardBg, borderColor: border, color: text }}
              >
                <FiChevronLeft size={22} />
              </button>

              {/* Products Horizontal Scroll Track */}
              <div
                ref={featuredScrollRef}
                className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-hide gap-6 pb-4"
              >
                {loadingFeatured ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="snap-start shrink-0 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]">
                      <SkeletonProductCard />
                    </div>
                  ))
                ) : featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => {
                    const { primaryImage, hoverImage } = getProductCardImages(product);
                    return (
                      <div key={product._id} className="snap-start shrink-0 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] flex justify-center">
                        <ProductCard
                          to={`/products/${product.slug}`}
                          image={primaryImage || product.imageUrl || "https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=500"}
                          hoverImage={hoverImage}
                          name={product.name}
                          price={product.price}
                          description={product.shortDescription || product.description || product.detail || ""}
                          rating={product.avgRating || 0}
                          reviews={product.totalReviews || 0}
                          category={product.category}
                          isCustomizable={product.isCustomizable === true}
                          product={product}
                        />
                      </div>
                    );
                  })
                ) : (
                  <p className="w-full py-10 text-center text-sm text-gray-400">No featured products available yet.</p>
                )}
              </div>

              {/* Right Arrow Button */}
              <button
                type="button"
                onClick={() => scrollFeatured("right")}
                aria-label="Scroll featured products right"
                className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full border shadow-md transition-all duration-200 hover:scale-110 hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white active:scale-95"
                style={{ backgroundColor: cardBg, borderColor: border, color: text }}
              >
                <FiChevronRight size={22} />
              </button>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="mx-auto max-w-full px-5 py-16 lg:px-32">
          <motion.div className="mx-auto max-w-2xl text-center" variants={sectionHeading}>
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: text }}>Why Choose Us</h2>
          </motion.div>
          <motion.div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" variants={staggerContainer} initial="initial" animate="animate">
            {valueIcons.map(({ icon, title, desc, Icon }) => (
              <motion.div key={title} variants={staggerItem} className="rounded-2xl border p-6 text-center shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={{ borderColor: border, backgroundColor: cardBg }}>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${secondary}20`, color: secondary }}><Icon size={20} /></span>
                <h3 className="mt-4 font-semibold" style={{ color: text }}>{title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: textSecondary }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="py-12" style={{ backgroundColor: bgTertiary }}>
          <div className="mx-auto max-w-full px-5 text-center lg:px-32">
            <motion.span variants={sectionHeading} className="text-xs font-semibold uppercase tracking-wide" style={{ color: secondary }}>
              What Our Customers Say
            </motion.span>
            <motion.h2 variants={sectionHeading} className="mt-3 text-2xl font-bold sm:text-3xl" style={{ color: text }}>
              Loved by Homes and Offices Alike
            </motion.h2>

            {/* Carousel Wrapper */}
            <div
              className="group relative mt-8 px-4 sm:px-14"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Left Arrow Button */}
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border p-2.5 shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ borderColor: border, backgroundColor: cardBg, color: textSecondary }}
                aria-label="Previous testimonial"
              >
                <FiChevronLeft size={20} />
              </button>

              {loadingTestimonials ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <SkeletonTestimonial key={i} />
                  ))}
                </div>
              ) : visibleTestimonials.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {visibleTestimonials.map((review, idx) => (
                      <motion.div
                        key={review._id || `testi-${idx}-${currentIndex}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="flex h-48 flex-col rounded-3xl border p-5 px-6 shadow-sm transition-all duration-300 hover:shadow-md"
                        style={{ borderColor: border, backgroundColor: cardBg }}
                      >
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-center sm:justify-start">
                            <StarRating value={review.rating || 0} size={16} />
                          </div>
                          <div className="relative mt-3 overflow-hidden">
                            <p
                              className="line-clamp-3 break-words text-center text-sm italic leading-6 sm:text-left"
                              style={{
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 3,
                                overflow: "hidden",
                                color: textSecondary,
                              }}
                            >
                              "{review.text}"
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex-shrink-0 border-t pt-2.5" style={{ borderColor: border }}>
                          <p className="text-center font-semibold text-sm sm:text-left" style={{ color: text }}>
                            {review.name || "Anonymous"}
                          </p>
                          <p className="truncate text-center text-xs sm:text-left" style={{ color: textSecondary }}>
                            {review.productName ? `Reviewed ${review.productName}` : "Verified Customer"}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-xl text-sm leading-6" style={{ color: textSecondary }}>
                  No customer reviews yet.
                </motion.p>
              )}

              {/* Right Arrow Button */}
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border p-2.5 shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ borderColor: border, backgroundColor: cardBg, color: textSecondary }}
                aria-label="Next testimonial"
              >
                <FiChevronRight size={20} />
              </button>
            </div>

            {/* Pagination Indicators / Dots */}
            {testimonials.length > 0 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                {testimonials.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentIndex(dotIdx)}
                    className={`h-2 rounded-full transition-all duration-300 ${currentIndex === dotIdx ? "w-6" : "w-2 opacity-40 hover:opacity-70"
                      }`}
                    style={{ backgroundColor: currentIndex === dotIdx ? primary : textSecondary }}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="mx-auto max-w-full px-5 py-20 lg:px-32">
          <motion.div variants={sectionHeading} className="flex flex-col items-center justify-between gap-8 rounded-3xl border px-8 py-14 text-center lg:flex-row lg:text-left" style={{ borderColor: border, backgroundColor: bgSecondary }}>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: text }}>Ready to upgrade your space?</h2>
              <p className="mt-3 max-w-xl" style={{ color: textSecondary }}>Browse our full collection or get in touch.</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition" style={{ backgroundColor: primary }}>Shop Now <FiArrowRight size={16} /></Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold transition" style={{ borderColor: border, color: text }}>Contact Us</Link>
            </div>
          </motion.div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <Footer />
      </AnimatedSection>
    </div>
  );
};

export default Home;