// import { useEffect, useMemo, useState, useCallback } from "react";
// import {
//     FaStar,
//     FaCheckCircle,
//     FaMinus,
//     FaPlus,
//     FaTruck,
//     FaHeart,
// } from "react-icons/fa";
// import {
//     FiArrowLeft,
// } from "react-icons/fi";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import SEO from "../components/SEO";
// import api, { postMultipart } from "../api/api";
// import { getColorName } from "../utils/ColorName";
// import Breadcrumb from "../components/Breadcrumb";
// import { useToast } from "../components/ToastNotification";
// import { useSiteConfig } from "../utils/siteConfig";
// import WhatsappFloatingButton from "../components/FloatingWhatsapp";
// import ShareMenu from "../components/ShareMenu";
// import Footer from "../components/Footer";
// import Features from "../components/Features";
// import { 
//     getProductImageObjects, 
//     getCoverImageIndex, 
// } from "../utils/imageUtils";
// import { buildCustomizationMessage, buildWhatsAppUrl } from "../utils/whatsappUtils";
// import { calculateTotalPrice, formatPrice, buildOrderProduct } from "../utils/priceCalculator";

// // Animation components
// import { SkeletonProductDetail } from "../components/SkeletonLoaders";
// import { FadeInUp, ScaleIn } from "../components/product/AnimatedProductContent";
// import AnimatedProductGallery from "../components/product/AnimatedProductGallery";
// import AnimatedPrice from "../components/product/AnimatedPrice";
// import AnimatedVariantSelector from "../components/product/AnimatedVariantSelector";
// import { AnimatedActionButton, AnimatedIconButton } from "../components/product/AnimatedButtons";
// import AnimatedRelatedProducts from "../components/product/AnimatedRelatedProducts";
// import AnimatedReview from "../components/product/AnimatedReview";

// // Helper to resolve WhatsApp number from contact API response
// const resolveWhatsappNumber = (value) => {
//     if (!value) return '';
//     return String(value).replace(/[^\d]/g, '');
// };

// // Helper to normalize URL - removes trailing slash from base URL
// const normalizeUrl = (url) => url ? url.replace(/\/+$/, '') : '';

// // Renders a 5-star rating
// const StarRating = ({ value = 0, size = 16, className = "" }) => {
//     const clamped = Math.max(0, Math.min(5, value));
//     return (
//         <div className={`inline-flex items-center gap-1 ${className}`} aria-label={`${clamped} out of 5 stars`}>
//             {[...Array(5)].map((_, i) => (
//                 <FaStar
//                     key={i}
//                     size={size}
//                     className={i < Math.round(clamped) ? "text-[#F5A524]" : "text-gray-200"}
//                 />
//             ))}
//         </div>
//     );
// };

// /**
//  * Extract color variant options from product data (supports new and legacy formats)
//  */
// const extractColorOptions = (product) => {
//     if (!product) return [];
//     // New structure: colors array with name/hex
//     if (Array.isArray(product.colors) && product.colors.length > 0) {
//         return product.colors.filter(c => c.name).map(c => ({
//             name: c.name,
//             hex: c.hex || '#CCCCCC',
//             price: c.price,
//             stock: c.stock,
//             inStock: c.inStock !== undefined ? c.inStock : true,
//             images: Array.isArray(c.images) ? c.images.map(img => img.url || img) : [],
//         }));
//     }
//     // Legacy: color array of hex strings
//     if (Array.isArray(product.color) && product.color.length > 0) {
//         return product.color.filter(Boolean).map(c => ({
//             name: getColorName(c),
//             hex: c,
//             images: [],
//         }));
//     }
//     // Legacy: colorVariants array
//     if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
//         return product.colorVariants.map(v => ({
//             name: getColorName(v.color),
//             hex: v.color,
//             price: v.price,
//             stock: v.stock,
//             inStock: v.inStock,
//             images: v.imageUrl ? [v.imageUrl] : [],
//         }));
//     }
//     return [];
// };

// const ProductDetail = () => {
//     const { categorySlug, subcategorySlug, nameSlug } = useParams();
//     const [quantity, setQuantity] = useState(1);
//     const [product, setProduct] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [selectedColor, setSelectedColor] = useState(null);
//     const [selectedSize, setSelectedSize] = useState(null);
//     const [selectedStandType, setSelectedStandType] = useState(null);
//     const [isWishlisted, setIsWishlisted] = useState(false);
//     const [activeImage, setActiveImage] = useState(0);
//     const [relatedProducts, setRelatedProducts] = useState([]);
//     const [activeTab, setActiveTab] = useState("Detail");
//     const [contactWhatsapp, setContactWhatsapp] = useState("");
//     const toast = useToast();
//     const { siteUrl, siteName } = useSiteConfig();
//     const navigate = useNavigate();

//     // Scroll to top on product change
//     useEffect(() => {
//         window.scrollTo(0, 0);
//     }, [categorySlug, nameSlug]);

//     // Fetch product
//     useEffect(() => {
//         const fetchProduct = async () => {
//             try {
//                 setLoading(true);
//                 setError("");
//                 setActiveImage(0);
//                 setSelectedColor(null);

//                 const slugPath = subcategorySlug
//                     ? `${categorySlug}/${subcategorySlug}/${nameSlug}`
//                     : `${categorySlug}/${nameSlug}`;

//                 const res = await api.get(`/products/slug/${slugPath}`);

//                 if (res.data?.success) {
//                     setProduct(res.data.data);
//                 } else {
//                     setError(res.data?.message || "Product not found.");
//                 }
//             } catch (err) {
//                 const message = err?.response?.data?.message || err.message || "Failed to load product.";
//                 setError(message);
//                 toast.error(message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (categorySlug && nameSlug) {
//             fetchProduct();
//         } else {
//             setLoading(false);
//             setError("Product slug is missing.");
//         }
//     }, [categorySlug, subcategorySlug, nameSlug, toast]);

//     // Extract color options (memoized)
//     const productColorOptions = useMemo(() => extractColorOptions(product), [product]);

//     // Extract general product images (memoized) using shared utility
//     const productGeneralImages = useMemo(() => {
//         if (!product) return [];
//         return getProductImageObjects(product).map(img => img.url);
//     }, [product]);

//     // Determine which images to show based on selected color and stand type
//     // Priority: color images > stand type images > general images
//     const galleryImages = useMemo(() => {
//         if (!product) return [];

//         let colorImages = [];
//         if (selectedColor && Array.isArray(product.colors)) {
//             const colorVariant = product.colors.find(c =>
//                 c.hex === selectedColor || c.name === selectedColor
//             );
//             if (colorVariant && Array.isArray(colorVariant.images) && colorVariant.images.length > 0) {
//                 colorImages = colorVariant.images.map(img => img.url || img).filter(Boolean);
//             }
//         }

//         // If color images exist, use them (highest priority)
//         if (colorImages.length > 0) {
//             // Merge: color-specific images first, then general images, deduped
//             const merged = [...colorImages, ...productGeneralImages];
//             return [...new Set(merged)];
//         }

//         // Stand type images (second priority)
//         if (selectedStandType && Array.isArray(product.standTypes)) {
//             const standType = product.standTypes.find(st => st.type === selectedStandType);
//             const standImageObjects = getProductImageObjects(product, { selectedStandType });
//             if (standImageObjects.length > 0) {
//                 const standImages = standImageObjects.map(img => img.url);
//                 const merged = [...standImages, ...productGeneralImages];
//                 return [...new Set(merged)];
//             }
//         }

//         // Fallback to general product images
//         return productGeneralImages;
//     }, [product, selectedColor, selectedStandType, productGeneralImages]);

//     // Get selected color variant data
//     const selectedColorVariant = useMemo(() => {
//         if (!selectedColor || !Array.isArray(product?.colors)) return null;
//         return product.colors.find(c =>
//             c.hex === selectedColor || c.name === selectedColor
//         ) || null;
//     }, [product, selectedColor]);

//     // Calculate total price using shared utility (discount-aware)
//     const priceCalculation = useMemo(() => {
//         if (!product) return { total: 0, actualTotal: 0, discountPercentage: 0, isDiscountEnabled: false, basePrice: 0, colorPrice: 0, standPrice: 0 };
//         return calculateTotalPrice(product, selectedColor, selectedStandType, true);
//     }, [product, selectedColor, selectedStandType]);

//     // Get the display price (for backward compatibility with Buy Now button)
//     const displayPrice = priceCalculation.total;

//     // Get stock based on selected color variant
//     const displayStock = useMemo(() => {
//         if (!product) return 0;
//         if (selectedColorVariant?.stock !== undefined) {
//             return selectedColorVariant.stock;
//         }
//         return product.stock;
//     }, [product, selectedColorVariant]);

//     // Check if selected color is in stock
//     const isColorInStock = useMemo(() => {
//         if (!product) return false;
//         if (selectedColorVariant?.inStock !== undefined) {
//             return selectedColorVariant.inStock;
//         }
//         return product.inStock;
//     }, [product, selectedColorVariant]);

//     // Compute the index of the cover image in galleryImages
//     const coverImageIndex = useMemo(() => {
//         if (!product || galleryImages.length === 0) return 0;

//         // Determine which image objects to use based on selection context
//         let imageObjects;
//         if (selectedColor && Array.isArray(product.colors)) {
//             const colorVariant = product.colors.find(c =>
//                 c.hex === selectedColor || c.name === selectedColor
//             );
//             if (colorVariant && Array.isArray(colorVariant.images) && colorVariant.images.length > 0) {
//                 imageObjects = getProductImageObjects(product, { selectedColor });
//             }
//         }

//         if (!imageObjects || imageObjects.length === 0) {
//             imageObjects = getProductImageObjects(product, { selectedStandType });
//         }

//         if (!imageObjects || imageObjects.length === 0) {
//             imageObjects = getProductImageObjects(product);
//         }

//         const coverIdx = getCoverImageIndex(imageObjects);
//         // If cover index is beyond galleryImages length, clamp to 0
//         return coverIdx < galleryImages.length ? coverIdx : 0;
//     }, [product, selectedColor, selectedStandType, galleryImages]);

//     // Handle color selection
//     const handleColorSelect = useCallback((colorValue) => {
//         setSelectedColor(colorValue);
//         // activeImage will be updated by the effect below when galleryImages updates
//     }, []);

//     // Keep activeImage in valid range when galleryImages changes, and set to cover
//     useEffect(() => {
//         setActiveImage(prev => {
//             if (galleryImages.length === 0) return 0;
//             // Always set to cover index when galleryImages change (e.g., color switch)
//             return coverImageIndex;
//         });
//     }, [galleryImages, coverImageIndex]);

//     // Auto-select first color on product load
//     useEffect(() => {
//         if (productColorOptions.length > 0 && !selectedColor) {
//             const first = productColorOptions[0];
//             setSelectedColor(first.hex || first.name);
//         }
//     }, [productColorOptions, selectedColor]);

//     // Set default size
//     useEffect(() => {
//         if (product?.size) setSelectedSize(product.size);
//     }, [product]);

//     // Fetch WhatsApp number from contact API
//     useEffect(() => {
//         const fetchContact = async () => {
//             try {
//                 const res = await api.get("/contact");
//                 if (res.data?.success && res.data.data?.whatsapp) {
//                     setContactWhatsapp(resolveWhatsappNumber(res.data.data.whatsapp));
//                 }
//             } catch (err) {
//                 console.error("Failed to fetch contact:", err);
//             }
//         };
//         fetchContact();
//     }, []);

//     // Fetch related products
//     useEffect(() => {
//         if (product?.category) {
//             const fetchRelated = async () => {
//                 try {
//                     const cat = Array.isArray(product.category) ? product.category[0] : product.category;
//                     const res = await api.get('/products', { params: { category: cat, limit: 5 } });
//                     if (res.data?.success) {
//                         const filtered = res.data.data.filter(p => p._id !== product._id).slice(0, 4);
//                         setRelatedProducts(filtered);
//                     }
//                 } catch (err) {
//                     console.error("Failed to fetch related products", err);
//                 }
//             };
//             fetchRelated();
//         }
//     }, [product]);

//     const reviewsList = Array.isArray(product?.reviews) ? product.reviews : [];

//     const handleReviewSubmit = async (payload) => {
//         if (!product?._id) throw new Error("Product ID is missing.");
//         // payload is FormData when image is present, otherwise it can be sent as multipart always
//         const res = await postMultipart(`/products/${product._id}/reviews`, payload);
//         if (!res.data?.success || !res.data?.data) {
//             throw new Error(res.data?.message || "Failed to submit review.");
//         }
//         setProduct(res.data.data);
//     };

//     const normalizedSiteUrl = normalizeUrl(siteUrl);
//     const productUrl = categorySlug && nameSlug
//         ? `${normalizedSiteUrl}/products/${categorySlug}/${nameSlug}`
//         : `${normalizedSiteUrl}/products`;

//     const handleBuyNow = () => {
//         // Build order product with discount info
//         const orderProduct = buildOrderProduct(product, displayPrice, selectedColor, selectedSize, selectedStandType);
//         navigate("/checkout", {
//             state: {
//                 product: orderProduct,
//                 quantity,
//                 selectedColor,
//                 selectedSize,
//                 selectedStandType,
//                 // Include price calculation details for checkout
//                 priceCalculation: {
//                     total: priceCalculation.total,
//                     actualTotal: priceCalculation.actualTotal,
//                     basePrice: priceCalculation.basePrice,
//                     colorPrice: priceCalculation.colorPrice,
//                     standPrice: priceCalculation.standPrice,
//                     discountPercentage: priceCalculation.discountPercentage,
//                     isDiscountEnabled: priceCalculation.isDiscountEnabled,
//                 },
//             },
//         });
//     };

//     const handleCustomizeNow = useCallback(() => {
//         if (!contactWhatsapp) {
//             toast.error("WhatsApp number is not configured.");
//             return;
//         }

//         const selectedColorName = selectedColorVariant?.name || selectedColor || '';
//         const category = Array.isArray(product?.category) ? product.category[0] : product?.category || '';

//         const message = buildCustomizationMessage({
//             productName: product?.name,
//             productSku: product?.sku,
//             category,
//             brand: siteName,
//             selectedColor: selectedColorName,
//             selectedStandType: selectedStandType || '',
//             quantity,
//             calculatedPrice: displayPrice,
//             productUrl,
//             siteName,
//         });

//         const waUrl = buildWhatsAppUrl(contactWhatsapp, message);
//         if (waUrl) {
//             window.open(waUrl, '_blank', 'noopener,noreferrer');
//         } else {
//             toast.error("Could not generate WhatsApp link.");
//         }
//     }, [product, selectedColorVariant, selectedColor, selectedStandType, quantity, displayPrice, productUrl, siteName, contactWhatsapp, toast, productColorOptions.length]);

//     const handleTabClick = (tabName) => setActiveTab(tabName);

//     // Handle wishlist toggle
//     const handleWishlistToggle = useCallback(() => {
//         setIsWishlisted(prev => !prev);
//         toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
//     }, [isWishlisted, toast]);

//     // --- Loading State ---
//     if (loading) {
//         return <SkeletonProductDetail />;
//     }

//     // --- Error State ---
//     if (error || !product) {
//         return (
//             <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
//                 <Link
//                     to="/products"
//                     className="mb-8 inline-flex items-center gap-2 text-gray-500 transition hover:text-[#2F6FED]"
//                 >
//                     <FiArrowLeft />
//                     Back to Products
//                 </Link>
//                 <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-red-600">
//                     {error || "Product not found."}
//                 </div>
//             </div>
//         );
//     }

//     // --- Derived Data ---
//     const rating = product.avgRating ?? 0;
//     const reviews = product.totalReviews ?? 0;
//     const description = product.detail || product.description || "No description available.";
//     const category = Array.isArray(product.category) ? product.category[0] : product.category;
//     const metaTitleTag = product.metaTitle || product.name;
//     const metaDesc = (product.metaDescription || description).substring(0, 160);

//     const showDiscount = priceCalculation.isDiscountEnabled && priceCalculation.discountPercentage > 0;
//     const discountedTotal = priceCalculation.total;
//     const actualTotal = priceCalculation.actualTotal;

//     return (
//         <div className="bg-gray-50/50">
//             <WhatsappFloatingButton product={product} productUrl={productUrl} />
//             <SEO
//                 title={`${metaTitleTag} - ${siteName}`}
//                 description={metaDesc}
//                 canonicalUrl={productUrl}
//                 ogType="product"
//                 product={product}
//             />
//             <div className="mx-auto max-w-full px-5 py-4 lg:px-32">
//                 {/* Breadcrumb */}
//                 <FadeInUp>
//                     <Breadcrumb category={category} subcategory={product.subcategory} productName={product.name} />
//                 </FadeInUp>

//                 <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
//                     {/* Left: Image Gallery */}
//                     <ScaleIn className="lg:col-span-5" delay={0.1}>
//                         <div className="sticky top-20 px-2 overflow-visible">
//                             <AnimatedProductGallery
//                                 images={galleryImages}
//                                 activeIndex={activeImage}
//                                 onActiveIndexChange={setActiveImage}
//                                 productName={product.name}
//                             />
//                         </div>
//                     </ScaleIn>

//                     {/* Right: Product Info */}
//                     <div className="lg:col-span-7">
//                         <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
//                             {/* Category Badge */}
//                             <FadeInUp delay={0.2}>
//                                 {category && (
//                                     <span className="inline-block rounded-full bg-[#2F6FED]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#2F6FED]">
//                                         {category}
//                                     </span>
//                                 )}
//                             </FadeInUp>

//                             {/* Title & Rating */}
//                             <FadeInUp delay={0.3}>
//                                 <h1 className="mt-4 text-2xl font-bold text-[#12131A] sm:text-3xl lg:text-4xl">
//                                     {product.name}
//                                 </h1>
//                             </FadeInUp>

//                             <FadeInUp delay={0.35}>
//                                 <div className="mt-3 flex flex-wrap items-center gap-3">
//                                     <StarRating value={rating} size={16} />
//                                     <span className="text-sm font-semibold text-[#12131A]">
//                                         {rating.toFixed ? rating.toFixed(1) : rating}
//                                     </span>
//                                     <span className="text-sm text-gray-400 underline-offset-2 hover:underline">
//                                         ({reviews} reviews)
//                                     </span>
//                                     <span className="text-sm text-gray-400 font-medium">
//                                         {product.buyCount > 0 ? `${product.buyCount} bought` : "No one bought yet"}
//                                     </span>
//                                 </div>
//                             </FadeInUp>

//                             {/* Price - Animated */}
//                             <FadeInUp delay={0.4}>
//                                 <AnimatedPrice
//                                     price={discountedTotal}
//                                     oldPrice={showDiscount ? actualTotal : null}
//                                     inStock={isColorInStock}
//                                     stockCount={displayStock}
//                                 />
//                             </FadeInUp>

//                             {/* Price breakdown when discount is enabled */}
//                             {showDiscount && priceCalculation.colorPrice > 0 && (
//                                 <FadeInUp delay={0.45}>
//                                     <div className="mt-2 text-xs text-gray-400 space-y-0.5">
//                                         <div>Base: Rs. {formatPrice(priceCalculation.basePrice)}</div>
//                                         {priceCalculation.colorPrice > 0 && <div>Color: +Rs. {formatPrice(priceCalculation.colorPrice)}</div>}
//                                         {priceCalculation.standPrice > 0 && <div>Stand: +Rs. {formatPrice(priceCalculation.standPrice)}</div>}
//                                     </div>
//                                 </FadeInUp>
//                             )}

//                             <FadeInUp delay={0.5}>
//                                 <div className="mt-4 flex w-full flex-wrap items-center justify-between gap-2">
//                                     <div className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-2 py-1 text-xs text-white">
//                                         <FaTruck size={16} />
//                                         <span>Free Shipping</span>
//                                     </div>

//                                     <div className="inline-flex text-xs font-semibold text-white bg-orange-600 px-2 py-1 rounded-lg items-center gap-1">
//                                         <FaTruck size={16} />
//                                         <span>Same Day Delivery in Lahore!</span>
//                                     </div>
//                                 </div>
//                             </FadeInUp>

//                             {/* Short Description */}
//                             <FadeInUp delay={0.55}>
//                                 <p className="mt-5 leading-7 text-gray-600">
//                                     {product.shortDescription || description}
//                                 </p>
//                             </FadeInUp>

//                             {/* Color Variant Selector - Animated */}
//                             <FadeInUp delay={0.6}>
//                                 <AnimatedVariantSelector
//                                     label="Color"
//                                     options={productColorOptions.map(c => ({
//                                         value: c.hex || c.name,
//                                         label: c.name,
//                                         swatch: c.hex,
//                                         disabled: c.inStock === false,
//                                     }))}
//                                     selectedValue={selectedColor}
//                                     onSelect={handleColorSelect}
//                                 />
//                             </FadeInUp>

//                             {/* Stand Type Selector - Animated */}
//                             {product.standTypes?.length > 0 && (
//                                 <FadeInUp delay={0.7}>
//                                     <AnimatedVariantSelector
//                                         label="Stand Type"
//                                         options={product.standTypes.map(st => ({
//                                             value: st.type,
//                                             label: st.type,
//                                             disabled: false,
//                                         }))}
//                                         selectedValue={selectedStandType}
//                                         onSelect={(value) => setSelectedStandType(selectedStandType === value ? null : value)}
//                                     />
//                                 </FadeInUp>
//                             )}

//                             {/* Size Selector */}
//                             {product.size && (
//                                 <FadeInUp delay={0.75}>
//                                     <div className="mt-6">
//                                         <span className="mb-3 block text-sm font-semibold text-[#12131A]">Size</span>
//                                         <div className="flex flex-wrap gap-2">
//                                             {[product.size].map((s) => (
//                                                 <button
//                                                     key={s}
//                                                     type="button"
//                                                     onClick={() => setSelectedSize(s)}
//                                                     className={`h-11 min-w-[3.5rem] rounded-xl border px-4 text-sm font-semibold transition ${selectedSize === s
//                                                         ? "border-[#2F6FED] bg-[#2F6FED] text-white shadow-sm"
//                                                         : "border-gray-200 text-gray-600 hover:border-gray-300"
//                                                         }`}
//                                                 >
//                                                     {s}
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </FadeInUp>
//                             )}

//                             {/* Quantity & Actions */}
//                             <FadeInUp delay={0.8}>
//                                 <div className="mt-8 space-y-4">
//                                     <div className="flex items-center gap-4">
//                                         <label className="text-sm font-semibold text-[#12131A]">Qty:</label>
//                                         <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setQuantity((q) => Math.max(1, q - 1))}
//                                                 className="flex h-11 w-11 items-center justify-center text-gray-500 transition hover:bg-gray-200 hover:text-[#12131A]"
//                                                 aria-label="Decrease quantity"
//                                             >
//                                                 <FaMinus size={12} />
//                                             </button>
//                                             <span className="w-14 text-center text-base font-semibold text-[#12131A]">
//                                                 {quantity}
//                                             </span>
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setQuantity((q) => q + 1)}
//                                                 className="flex h-11 w-11 items-center justify-center text-gray-500 transition hover:bg-gray-200 hover:text-[#12131A]"
//                                                 aria-label="Increase quantity"
//                                             >
//                                                 <FaPlus size={12} />
//                                             </button>
//                                         </div>
//                                     </div>

//                                     <div className="flex flex-col gap-3 sm:flex-row">
//                                         {product.isCustomizable ? (
//                                             <AnimatedActionButton
//                                                 onClick={handleCustomizeNow}
//                                                 disabled={!isColorInStock}
//                                                 variant="secondary"
//                                                 className="flex-1"
//                                             >
//                                                 {isColorInStock ? "Customize Now" : "Out of Stock"}
//                                             </AnimatedActionButton>
//                                         ) : (
//                                             <AnimatedActionButton
//                                                 onClick={handleBuyNow}
//                                                 disabled={!isColorInStock}
//                                                 variant="primary"
//                                                 className="flex-1"
//                                             >
//                                                 {isColorInStock ? "Buy Now" : "Out of Stock"}
//                                             </AnimatedActionButton>
//                                         )}
//                                         <AnimatedIconButton
//                                             onClick={handleWishlistToggle}
//                                             aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//                                             className={isWishlisted ? "border-red-500 bg-red-50 text-red-500" : ""}
//                                         >
//                                             <FaHeart size={18} className={isWishlisted ? "fill-current" : ""} />
//                                         </AnimatedIconButton>
//                                         <ShareMenu
//                                             productUrl={productUrl}
//                                             productName={product.name}
//                                             productImage={galleryImages[0]}
//                                         />
//                                     </div>
//                                 </div>
//                             </FadeInUp>

//                             {/* Feature Checklist */}
//                             {(product.size || productColorOptions.length > 0) && (
//                                 <FadeInUp delay={0.85}>
//                                     <div className="mt-6 rounded-xl bg-gray-50 p-4">
//                                         <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Product Details</h4>
//                                         <div className="mt-3 space-y-2">
//                                             {product.size && (
//                                                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                                                     <FaCheckCircle className="shrink-0 text-[#10B981]" size={14} />
//                                                     <span>Size: {product.size}</span>
//                                                 </div>
//                                             )}
//                                             {productColorOptions.length > 0 && (
//                                                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                                                     <FaCheckCircle className="shrink-0 text-[#10B981]" size={14} />
//                                                     <span>{productColorOptions.length} color option{productColorOptions.length > 1 ? "s" : ""} available</span>
//                                                 </div>
//                                             )}
//                                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                                                 <FaCheckCircle className="shrink-0 text-[#10B981]" size={14} />
//                                                 <span>In stock: {displayStock || 0} units</span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </FadeInUp>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Features Section */}
//                 <FadeInUp delay={0.9}>
//                     <Features />
//                 </FadeInUp>

//                 {/* Tab Navigation Bar */}
//                 <FadeInUp delay={1.0}>
//                     <div className="mt-16 flex border-b border-gray-200">
//                         {["Detail", "Specification", "Reviews"].map((tab, idx) => (
//                             <button
//                                 key={tab}
//                                 onClick={() => handleTabClick(tab)}
//                                 className={`relative px-6 py-3 text-sm font-semibold transition-colors ${
//                                     activeTab === tab
//                                         ? "text-[#2F6FED]"
//                                         : "text-gray-500 hover:text-[#2F6FED]"
//                                 }`}
//                             >
//                                 {tab}
//                                 {activeTab === tab && (
//                                     <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#2F6FED] transition-all" />
//                                 )}
//                             </button>
//                         ))}
//                     </div>
//                 </FadeInUp>

//                 {/* Tab Content */}
//                 <div className="mt-8">
//                     {activeTab === "Detail" && (
//                         <FadeInUp key="detail">
//                             <section id="details" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-10">
//                                 <h2 className="text-xl font-bold text-[#12131A] sm:text-3xl">
//                                     Product Details
//                                 </h2>
//                                 <p className="mt-5 max-w-full leading-8 text-gray-600">{description}</p>
//                             </section>
//                         </FadeInUp>
//                     )}

//                     {activeTab === "Specification" && (
//                         <FadeInUp key="specification">
//                             <section id="specification" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-10">
//                                 <h2 className="text-xl font-bold text-[#12131A] sm:text-3xl">
//                                     Specifications
//                                 </h2>
//                                 <div className="mt-6 divide-y divide-gray-100">
//                                     {product.size && (
//                                         <div className="flex items-center justify-between py-3">
//                                             <span className="text-sm font-medium text-gray-500">Size</span>
//                                             <span className="text-sm font-semibold text-[#12131A]">{product.size}</span>
//                                         </div>
//                                     )}
//                                     {productColorOptions.length > 0 && (
//                                         <div className="flex items-center justify-between py-3">
//                                             <span className="text-sm font-medium text-gray-500">Available Colors</span>
//                                             <span className="text-sm font-semibold text-[#12131A]">{productColorOptions.map(c => c.name).join(", ")}</span>
//                                         </div>
//                                     )}
//                                     {product.price && (
//                                         <div className="flex items-center justify-between py-3">
//                                             <span className="text-sm font-medium text-gray-500">Price</span>
//                                             <span className="text-sm font-semibold text-[#12131A]">Rs. {formatPrice(displayPrice)}</span>
//                                         </div>
//                                     )}
//                                     {product.material && (
//                                         <div className="flex items-center justify-between py-3">
//                                             <span className="text-sm font-medium text-gray-500">Material</span>
//                                             <span className="text-sm font-semibold text-[#12131A]">{product.material}</span>
//                                         </div>
//                                     )}
//                                     {product.weight && (
//                                         <div className="flex items-center justify-between py-3">
//                                             <span className="text-sm font-medium text-gray-500">Weight</span>
//                                             <span className="text-sm font-semibold text-[#12131A]">{product.weight}</span>
//                                         </div>
//                                     )}

//                                     <div className="flex items-center justify-between py-3">
//                                         <span className="text-sm font-medium text-gray-500">Stock Status</span>
//                                         <span className={`text-sm font-semibold ${isColorInStock ? "text-[#10B981]" : "text-[#E5484D]"}`}>
//                                             {isColorInStock ? `In Stock (${displayStock || 0} left)` : "Out of Stock"}
//                                         </span>
//                                     </div>
//                                     <div className="flex items-center justify-between py-3">
//                                         <span className="text-sm font-medium text-gray-500">Free Shipping</span>
//                                         <span className="text-sm font-semibold text-[#10B981]">Yes</span>
//                                     </div>
//                                     {Array.isArray(product.specifications) && product.specifications.length > 0 && product.specifications.some(s => s.trim()) && (
//                                         <div className="py-3">
//                                             <span className="text-sm font-medium text-gray-500">Features</span>
//                                             <ul className="mt-2 list-disc list-inside space-y-1">
//                                                 {product.specifications.filter(s => s.trim()).map((spec, idx) => (
//                                                     <li key={idx} className="text-sm text-[#12131A]">{spec}</li>
//                                                 ))}
//                                             </ul>
//                                         </div>
//                                     )}
//                                 </div>
//                             </section>
//                         </FadeInUp>
//                     )}

//                     {activeTab === "Reviews" && (
//                         <FadeInUp key="reviews">
//                             <AnimatedReview reviews={reviewsList} onSubmit={handleReviewSubmit} />
//                         </FadeInUp>
//                     )}
//                 </div>
//             </div>

//             {/* Related Products */}
//             <div className="mx-auto max-w-7xl px-5 lg:px-8">
//                 <AnimatedRelatedProducts products={relatedProducts} />
//             </div>

//             <>
//                 <Footer />
//             </>
//         </div>
//     );
// };

// export default ProductDetail;

import { useEffect, useMemo, useState, useCallback } from "react";
import {
    FaStar,
    FaCheckCircle,
    FaMinus,
    FaPlus,
    FaTruck,
    FaHeart,
} from "react-icons/fa";
import {
    FiArrowLeft,
} from "react-icons/fi";
import { Link, useParams, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import api, { postMultipart } from "../api/api";
import { getColorName } from "../utils/ColorName";
import Breadcrumb from "../components/Breadcrumb";
import { useToast } from "../components/ToastNotification";
import { useSiteConfig } from "../utils/siteConfig";
import WhatsappFloatingButton from "../components/FloatingWhatsapp";
import ShareMenu from "../components/ShareMenu";
import Footer from "../components/Footer";
import Features from "../components/Features";
import {
    getProductImageObjects,
    getCoverImageIndex,
} from "../utils/imageUtils";
import { buildCustomizationMessage, buildWhatsAppUrl } from "../utils/whatsappUtils";
import { calculateTotalPrice, formatPrice, buildOrderProduct } from "../utils/priceCalculator";

// Animation components
import { SkeletonProductDetail } from "../components/SkeletonLoaders";
import { FadeInUp, ScaleIn } from "../components/product/AnimatedProductContent";
import AnimatedProductGallery from "../components/product/AnimatedProductGallery";
import AnimatedPrice from "../components/product/AnimatedPrice";
import AnimatedVariantSelector from "../components/product/AnimatedVariantSelector";
import { AnimatedActionButton, AnimatedIconButton } from "../components/product/AnimatedButtons";
import AnimatedRelatedProducts from "../components/product/AnimatedRelatedProducts";
import AnimatedReview from "../components/product/AnimatedReview";

// Helper to resolve WhatsApp number from contact API response
const resolveWhatsappNumber = (value) => {
    if (!value) return '';
    return String(value).replace(/[^\d]/g, '');
};

// Helper to normalize URL - removes trailing slash from base URL
const normalizeUrl = (url) => url ? url.replace(/\/+$/, '') : '';

// Renders a 5-star rating
const StarRating = ({ value = 0, size = 16, className = "" }) => {
    const clamped = Math.max(0, Math.min(5, value));
    return (
        <div className={`inline-flex items-center gap-1 ${className}`} aria-label={`${clamped} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
                <FaStar
                    key={i}
                    size={size}
                    className={i < Math.round(clamped) ? "text-[#F5A524]" : "text-gray-200"}
                />
            ))}
        </div>
    );
};

/**
 * Extract color variant options from product data (supports new and legacy formats)
 */
const extractColorOptions = (product) => {
    if (!product) return [];
    // New structure: colors array with name/hex
    if (Array.isArray(product.colors) && product.colors.length > 0) {
        return product.colors.filter(c => c.name).map(c => ({
            name: c.name,
            hex: c.hex || '#CCCCCC',
            price: c.price,
            stock: c.stock,
            inStock: c.inStock !== undefined ? c.inStock : true,
            images: Array.isArray(c.images) ? c.images.map(img => img.url || img) : [],
        }));
    }
    // Legacy: color array of hex strings
    if (Array.isArray(product.color) && product.color.length > 0) {
        return product.color.filter(Boolean).map(c => ({
            name: getColorName(c),
            hex: c,
            images: [],
        }));
    }
    // Legacy: colorVariants array
    if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
        return product.colorVariants.map(v => ({
            name: getColorName(v.color),
            hex: v.color,
            price: v.price,
            stock: v.stock,
            inStock: v.inStock,
            images: v.imageUrl ? [v.imageUrl] : [],
        }));
    }
    return [];
};

const ProductDetail = () => {
    const { categorySlug, subcategorySlug, nameSlug } = useParams();
    const [quantity, setQuantity] = useState(1);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedStandType, setSelectedStandType] = useState(null);
    const [activeVariantSource, setActiveVariantSource] = useState('color');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [activeTab, setActiveTab] = useState("Detail");
    const [contactWhatsapp, setContactWhatsapp] = useState("");
    const toast = useToast();
    const { siteUrl, siteName } = useSiteConfig();
    const navigate = useNavigate();

    // Scroll to top on product change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [categorySlug, nameSlug]);

    // Fetch product
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");
                setActiveImage(0);
                setSelectedColor(null);

                const slugPath = subcategorySlug
                    ? `${categorySlug}/${subcategorySlug}/${nameSlug}`
                    : `${categorySlug}/${nameSlug}`;

                const res = await api.get(`/products/slug/${slugPath}`);

                if (res.data?.success) {
                    setProduct(res.data.data);
                } else {
                    setError(res.data?.message || "Product not found.");
                }
            } catch (err) {
                const message = err?.response?.data?.message || err.message || "Failed to load product.";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        if (categorySlug && nameSlug) {
            fetchProduct();
        } else {
            setLoading(false);
            setError("Product slug is missing.");
        }
    }, [categorySlug, subcategorySlug, nameSlug, toast]);

    // Extract color options (memoized)
    const productColorOptions = useMemo(() => extractColorOptions(product), [product]);

    // Extract general product images (memoized) using shared utility
    const productGeneralImages = useMemo(() => {
        if (!product) return [];
        return getProductImageObjects(product).map(img => img.url);
    }, [product]);

    // Determine which images to show based on selected color, stand type, and activeVariantSource
    const galleryImages = useMemo(() => {
        if (!product) return [];

        const variantImageObjs = getProductImageObjects(product, { selectedColor, selectedStandType, activeVariantSource });
        const variantImageUrls = variantImageObjs.map(img => img.url).filter(Boolean);

        if (variantImageUrls.length > 0) {
            const merged = [...variantImageUrls, ...productGeneralImages];
            return [...new Set(merged)];
        }

        return productGeneralImages;
    }, [product, selectedColor, selectedStandType, activeVariantSource, productGeneralImages]);

    // Get selected color variant data
    const selectedColorVariant = useMemo(() => {
        if (!selectedColor || !Array.isArray(product?.colors)) return null;
        return product.colors.find(c =>
            c.hex === selectedColor || c.name === selectedColor
        ) || null;
    }, [product, selectedColor]);

    // Calculate total price using shared utility (discount-aware)
    const priceCalculation = useMemo(() => {
        if (!product) return { total: 0, actualTotal: 0, discountPercentage: 0, isDiscountEnabled: false, basePrice: 0, colorPrice: 0, standPrice: 0 };
        return calculateTotalPrice(product, selectedColor, selectedStandType, true);
    }, [product, selectedColor, selectedStandType]);

    // Get the display price (for backward compatibility with Buy Now button)
    const displayPrice = priceCalculation.total;

    // Get stock based on selected color variant
    const displayStock = useMemo(() => {
        if (!product) return 0;
        if (selectedColorVariant?.stock !== undefined) {
            return selectedColorVariant.stock;
        }
        return product.stock;
    }, [product, selectedColorVariant]);

    // Check if selected color is in stock
    const isColorInStock = useMemo(() => {
        if (!product) return false;
        if (selectedColorVariant?.inStock !== undefined) {
            return selectedColorVariant.inStock;
        }
        return product.inStock;
    }, [product, selectedColorVariant]);

    // Compute the index of the cover image in galleryImages
    const coverImageIndex = useMemo(() => {
        if (!product || galleryImages.length === 0) return 0;

        const imageObjects = getProductImageObjects(product, { selectedColor, selectedStandType, activeVariantSource });
        const coverIdx = getCoverImageIndex(imageObjects);
        return coverIdx < galleryImages.length ? coverIdx : 0;
    }, [product, selectedColor, selectedStandType, activeVariantSource, galleryImages]);

    // Handle color selection
    const handleColorSelect = useCallback((colorValue) => {
        setSelectedColor(prev => prev === colorValue ? null : colorValue);
        setActiveVariantSource('color');
        setActiveImage(0);
    }, []);

    // Handle stand type selection
    const handleStandTypeSelect = useCallback((standTypeValue) => {
        setSelectedStandType(prev => {
            const nextVal = prev === standTypeValue ? null : standTypeValue;
            setActiveVariantSource(nextVal ? 'standType' : 'color');
            return nextVal;
        });
        setActiveImage(0);
    }, []);

    // Keep activeImage in valid range when galleryImages changes, and set to cover
    useEffect(() => {
        setActiveImage(coverImageIndex || 0);
    }, [galleryImages, coverImageIndex, selectedColor, selectedStandType]);



    // Set default size
    useEffect(() => {
        if (product?.size) setSelectedSize(product.size);
    }, [product]);

    // Fetch WhatsApp number from contact API
    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await api.get("/contact");
                if (res.data?.success && res.data.data?.whatsapp) {
                    setContactWhatsapp(resolveWhatsappNumber(res.data.data.whatsapp));
                }
            } catch (err) {
                console.error("Failed to fetch contact:", err);
            }
        };
        fetchContact();
    }, []);

    // Fetch related products
    useEffect(() => {
        if (product?.category) {
            const fetchRelated = async () => {
                try {
                    const cat = Array.isArray(product.category) ? product.category[0] : product.category;
                    const res = await api.get('/products', { params: { category: cat, limit: 5 } });
                    if (res.data?.success) {
                        const filtered = res.data.data.filter(p => p._id !== product._id).slice(0, 4);
                        setRelatedProducts(filtered);
                    }
                } catch (err) {
                    console.error("Failed to fetch related products", err);
                }
            };
            fetchRelated();
        }
    }, [product]);

    const reviewsList = Array.isArray(product?.reviews) ? product.reviews : [];

    const handleReviewSubmit = async (payload) => {
        if (!product?._id) throw new Error("Product ID is missing.");
        // payload is FormData when image is present, otherwise it can be sent as multipart always
        const res = await postMultipart(`/products/${product._id}/reviews`, payload);
        if (!res.data?.success || !res.data?.data) {
            throw new Error(res.data?.message || "Failed to submit review.");
        }
        setProduct(res.data.data);
    };

    const normalizedSiteUrl = normalizeUrl(siteUrl);
    const productUrl = categorySlug && nameSlug
        ? `${normalizedSiteUrl}/products/${categorySlug}/${nameSlug}`
        : `${normalizedSiteUrl}/products`;

    const handleBuyNow = () => {
        if (productColorOptions.length > 0 && !selectedColor) {
            toast.error("Please select a color variant first.");
            return;
        }
        // Build order product with discount info
        const orderProduct = buildOrderProduct(product, displayPrice, selectedColor, selectedSize, selectedStandType);
        navigate("/checkout", {
            state: {
                product: orderProduct,
                quantity,
                selectedColor,
                selectedSize,
                selectedStandType,
                // Include price calculation details for checkout
                priceCalculation: {
                    total: priceCalculation.total,
                    actualTotal: priceCalculation.actualTotal,
                    basePrice: priceCalculation.basePrice,
                    colorPrice: priceCalculation.colorPrice,
                    standPrice: priceCalculation.standPrice,
                    discountPercentage: priceCalculation.discountPercentage,
                    isDiscountEnabled: priceCalculation.isDiscountEnabled,
                },
            },
        });
    };

    const handleCustomizeNow = useCallback(() => {
        if (productColorOptions.length > 0 && !selectedColor) {
            toast.error("Please select a color variant first.");
            return;
        }
        if (!contactWhatsapp) {
            toast.error("WhatsApp number is not configured.");
            return;
        }

        const selectedColorName = selectedColorVariant?.name || selectedColor || '';
        const category = Array.isArray(product?.category) ? product.category[0] : product?.category || '';

        const message = buildCustomizationMessage({
            productName: product?.name,
            productSku: product?.sku,
            category,
            brand: siteName,
            selectedColor: selectedColorName,
            selectedStandType: selectedStandType || '',
            quantity,
            calculatedPrice: displayPrice,
            productUrl,
            siteName,
        });

        const waUrl = buildWhatsAppUrl(contactWhatsapp, message);
        if (waUrl) {
            window.open(waUrl, '_blank', 'noopener,noreferrer');
        } else {
            toast.error("Could not generate WhatsApp link.");
        }
    }, [product, selectedColorVariant, selectedColor, selectedStandType, quantity, displayPrice, productUrl, siteName, contactWhatsapp, toast]);

    const handleTabClick = (tabName) => setActiveTab(tabName);

    // Handle wishlist toggle
    const handleWishlistToggle = useCallback(() => {
        setIsWishlisted(prev => !prev);
        toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    }, [isWishlisted, toast]);

    // --- Loading State ---
    if (loading) {
        return <SkeletonProductDetail />;
    }

    // --- Error State ---
    if (error || !product) {
        return (
            <div className="mx-auto max-w-full px-5 py-12 lg:px-32 sm:py-16">
                <Link
                    to="/products"
                    className="mb-6 inline-flex items-center gap-2 text-gray-500 transition hover:text-[#2F6FED]"
                >
                    <FiArrowLeft />
                    Back to Products
                </Link>
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
                    {error || "Product not found."}
                </div>
            </div>
        );
    }

    // --- Derived Data ---
    const rating = product.avgRating ?? 0;
    const reviews = product.totalReviews ?? 0;
    const description = product.detail || product.description || "No description available.";
    const category = Array.isArray(product.category) ? product.category[0] : product.category;
    const metaTitleTag = product.metaTitle || product.name;
    const metaDesc = (product.metaDescription || description).substring(0, 160);

    const showDiscount = priceCalculation.isDiscountEnabled && priceCalculation.discountPercentage > 0;
    const discountedTotal = priceCalculation.total;
    const actualTotal = priceCalculation.actualTotal;

    return (
        <div className="bg-gray-50/50">
            <WhatsappFloatingButton product={product} productUrl={productUrl} />
            <SEO
                title={`${metaTitleTag} - ${siteName}`}
                description={metaDesc}
                canonicalUrl={productUrl}
                ogType="product"
                product={product}
            />
            <div className="mx-auto max-w-full px-8 py-6 lg:px-32 sm:py-8">
                {/* Breadcrumb */}
                <FadeInUp>
                    <Breadcrumb category={category} subcategory={product.subcategory} productName={product.name} />
                </FadeInUp>

                {/* Main Product Grid */}
                <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* Left: Image Gallery */}
                    <ScaleIn className="lg:col-span-5" delay={0.1}>
                        <div className="sticky top-20 overflow-visible">
                            <AnimatedProductGallery
                                images={galleryImages}
                                activeIndex={activeImage}
                                onActiveIndexChange={setActiveImage}
                                productName={product.name}
                            />
                        </div>
                    </ScaleIn>

                    {/* Right: Product Info Card */}
                    <div className="lg:col-span-7">
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8 lg:p-10">
                            {/* Category Badge & Product Badges */}
                            <FadeInUp delay={0.2}>
                                <div className="flex flex-wrap items-center gap-2">
                                    {category && (
                                        <span className="inline-block rounded-full bg-[#2F6FED]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#2F6FED]">
                                            {category}
                                        </span>
                                    )}
                                    {product.isNewArrival && (
                                        <span className="inline-block rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white">
                                            New
                                        </span>
                                    )}
                                    {product.isBestSeller && (
                                        <span className="inline-block rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white">
                                            Best Seller
                                        </span>
                                    )}
                                    {product.isFeatured && (
                                        <span className="inline-block rounded-full bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white">
                                            Featured
                                        </span>
                                    )}
                                </div>
                            </FadeInUp>

                            {/* Title & Rating */}
                            <FadeInUp delay={0.3}>
                                <h1 className="mt-4 text-2xl font-bold text-[#12131A] sm:text-3xl lg:text-4xl">
                                    {product.name}
                                </h1>
                            </FadeInUp>

                            <FadeInUp delay={0.35}>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <StarRating value={rating} size={16} />
                                    <span className="text-sm font-semibold text-[#12131A]">
                                        {rating.toFixed ? rating.toFixed(1) : rating}
                                    </span>
                                    <span className="text-sm text-gray-400 underline-offset-2 hover:underline">
                                        ({reviews} reviews)
                                    </span>
                                    <span className="text-sm font-medium text-gray-400">
                                        {product.buyCount > 0 ? `${product.buyCount} bought` : "No one bought yet"}
                                    </span>
                                </div>
                            </FadeInUp>

                            {/* Price - Animated */}
                            <FadeInUp delay={0.4}>
                                <div className="mt-6">
                                    <AnimatedPrice
                                        price={discountedTotal}
                                        oldPrice={showDiscount ? actualTotal : null}
                                        inStock={isColorInStock}
                                        stockCount={displayStock}
                                    />
                                </div>
                            </FadeInUp>

                            {/* Price breakdown when discount is enabled */}
                            {showDiscount && priceCalculation.colorPrice > 0 && (
                                <FadeInUp delay={0.45}>
                                    <div className="mt-2 space-y-1 text-xs text-gray-400">
                                        <div>Base: Rs. {formatPrice(priceCalculation.basePrice)}</div>
                                        {priceCalculation.colorPrice > 0 && <div>Color: +Rs. {formatPrice(priceCalculation.colorPrice)}</div>}
                                        {priceCalculation.standPrice > 0 && <div>Stand: +Rs. {formatPrice(priceCalculation.standPrice)}</div>}
                                    </div>
                                </FadeInUp>
                            )}

                            {/* Shipping & Delivery Badges */}
                            <FadeInUp delay={0.5}>
                                <div className="mt-6 flex w-full flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">
                                        <FaTruck size={14} />
                                        <span>Free Shipping</span>
                                    </div>

                                    <div className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white">
                                        <FaTruck size={14} />
                                        <span>Same Day Delivery in Lahore!</span>
                                    </div>
                                </div>
                            </FadeInUp>

                            {/* Short Description */}
                            <FadeInUp delay={0.55}>
                                <p className="mt-6 leading-relaxed text-gray-600">
                                    {product.shortDescription || description}
                                </p>
                            </FadeInUp>

                            {/* Color Variant Selector */}
                            <FadeInUp delay={0.6}>
                                <div className="mt-6">
                                    <AnimatedVariantSelector
                                        label="Color"
                                        options={productColorOptions.map(c => ({
                                            value: c.hex || c.name,
                                            label: c.name,
                                            swatch: c.hex,
                                            disabled: c.inStock === false,
                                        }))}
                                        selectedValue={selectedColor}
                                        onSelect={handleColorSelect}
                                    />
                                </div>
                            </FadeInUp>

                            {/* Stand Type Selector */}
                            {product.standTypes?.some(st => st.type === 'Metallic' && (st.price > 0 || (st.images && st.images.length > 0))) && (
                                <FadeInUp delay={0.7}>
                                    <div className="mt-6">
                                        {(() => {
                                            const metallicStand = product.standTypes.find(st => st.type === 'Metallic');
                                            const addPrice = metallicStand?.price || 0;
                                            const priceLabel = addPrice > 0 ? ` (+Rs. ${formatPrice(addPrice)})` : '';
                                            return (
                                                <AnimatedVariantSelector
                                                    label="Stand Type"
                                                    options={[
                                                        {
                                                            value: 'Metallic',
                                                            label: `Metallic Stand${priceLabel}`,
                                                            disabled: false,
                                                        }
                                                    ]}
                                                    selectedValue={selectedStandType}
                                                    onSelect={handleStandTypeSelect}
                                                />
                                            );
                                        })()}
                                    </div>
                                </FadeInUp>
                            )}

                            {/* Size Selector */}
                            {product.size && (
                                <FadeInUp delay={0.75}>
                                    <div className="mt-6">
                                        <span className="mb-3 block text-sm font-semibold text-[#12131A]">Size</span>
                                        <div className="flex flex-wrap gap-3">
                                            {[product.size].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setSelectedSize(s)}
                                                    className={`h-11 min-w-[3.5rem] rounded-xl border px-4 text-sm font-semibold transition ${selectedSize === s
                                                        ? "border-[#2F6FED] bg-[#2F6FED] text-white shadow-sm"
                                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </FadeInUp>
                            )}

                            {/* Quantity & Actions */}
                            <FadeInUp delay={0.8}>
                                <div className="mt-8 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <label className="text-sm font-semibold text-[#12131A]">Qty:</label>
                                        <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                            <button
                                                type="button"
                                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                                className="flex h-11 w-11 items-center justify-center text-gray-500 transition hover:bg-gray-200 hover:text-[#12131A]"
                                                aria-label="Decrease quantity"
                                            >
                                                <FaMinus size={12} />
                                            </button>
                                            <span className="w-14 text-center text-base font-semibold text-[#12131A]">
                                                {quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setQuantity((q) => q + 1)}
                                                className="flex h-11 w-11 items-center justify-center text-gray-500 transition hover:bg-gray-200 hover:text-[#12131A]"
                                                aria-label="Increase quantity"
                                            >
                                                <FaPlus size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        {product.isCustomizable ? (
                                            <AnimatedActionButton
                                                onClick={handleCustomizeNow}
                                                disabled={!isColorInStock}
                                                variant="secondary"
                                                className="flex-1"
                                            >
                                                {isColorInStock ? "Customize Now" : "Out of Stock"}
                                            </AnimatedActionButton>
                                        ) : (
                                            <AnimatedActionButton
                                                onClick={handleBuyNow}
                                                disabled={!isColorInStock}
                                                variant="primary"
                                                className="flex-1"
                                            >
                                                {isColorInStock ? "Buy Now" : "Out of Stock"}
                                            </AnimatedActionButton>
                                        )}
                                        <AnimatedIconButton
                                            onClick={handleWishlistToggle}
                                            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                            className={isWishlisted ? "border-red-500 bg-red-50 text-red-500" : ""}
                                        >
                                            <FaHeart size={18} className={isWishlisted ? "fill-current" : ""} />
                                        </AnimatedIconButton>
                                        <ShareMenu
                                            productUrl={productUrl}
                                            productName={product.name}
                                            productImage={galleryImages[0]}
                                        />
                                    </div>
                                </div>
                            </FadeInUp>

                            {/* Feature Checklist */}
                            {(product.size || productColorOptions.length > 0) && (
                                <FadeInUp delay={0.85}>
                                    <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50/80 p-5">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Product Details</h4>
                                        <div className="mt-3 space-y-2.5">
                                            {product.size && (
                                                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                                    <FaCheckCircle className="shrink-0 text-[#10B981]" size={14} />
                                                    <span>Size: {product.size}</span>
                                                </div>
                                            )}
                                            {productColorOptions.length > 0 && (
                                                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                                    <FaCheckCircle className="shrink-0 text-[#10B981]" size={14} />
                                                    <span>{productColorOptions.length} color option{productColorOptions.length > 1 ? "s" : ""} available</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                                <FaCheckCircle className="shrink-0 text-[#10B981]" size={14} />
                                                <span>In stock: {displayStock || 0} units</span>
                                            </div>
                                        </div>
                                    </div>
                                </FadeInUp>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <FadeInUp delay={0.9}>
                    <div>
                        <Features />
                    </div>
                </FadeInUp>

                {/* Tab Navigation Bar */}
                <FadeInUp delay={1.0}>
                    <div className="mt-12 sm:mt-16 flex border-b border-gray-200">
                        {["Detail", "Specification", "Reviews"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabClick(tab)}
                                className={`relative px-6 py-3.5 text-sm font-semibold transition-colors ${activeTab === tab
                                    ? "text-[#2F6FED]"
                                    : "text-gray-500 hover:text-[#2F6FED]"
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#2F6FED] transition-all" />
                                )}
                            </button>
                        ))}
                    </div>
                </FadeInUp>

                {/* Tab Content */}
                <div className="mt-6 sm:mt-8">
                    {activeTab === "Detail" && (
                        <FadeInUp key="detail">
                            <section id="details" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8 lg:p-10">
                                <h2 className="text-xl font-bold text-[#12131A] sm:text-2xl lg:text-3xl">
                                    Product Details
                                </h2>
                                <p className="mt-6 max-w-full leading-relaxed text-gray-600">{description}</p>
                            </section>
                        </FadeInUp>
                    )}

                    {activeTab === "Specification" && (
                        <FadeInUp key="specification">
                            <section id="specification" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8 lg:p-10">
                                <h2 className="text-xl font-bold text-[#12131A] sm:text-2xl lg:text-3xl">
                                    Specifications
                                </h2>
                                <div className="mt-6 divide-y divide-gray-100">
                                    {product.size && (
                                        <div className="flex items-center justify-between gap-4 py-3.5">
                                            <span className="text-sm font-medium text-gray-500">Size</span>
                                            <span className="text-sm font-semibold text-[#12131A]">{product.size}</span>
                                        </div>
                                    )}
                                    {productColorOptions.length > 0 && (
                                        <div className="flex items-center justify-between gap-4 py-3.5">
                                            <span className="text-sm font-medium text-gray-500">Available Colors</span>
                                            <span className="text-sm font-semibold text-[#12131A]">{productColorOptions.map(c => c.name).join(", ")}</span>
                                        </div>
                                    )}
                                    {product.price && (
                                        <div className="flex items-center justify-between gap-4 py-3.5">
                                            <span className="text-sm font-medium text-gray-500">Price</span>
                                            <span className="text-sm font-semibold text-[#12131A]">Rs. {formatPrice(displayPrice)}</span>
                                        </div>
                                    )}
                                    {product.material && (
                                        <div className="flex items-center justify-between gap-4 py-3.5">
                                            <span className="text-sm font-medium text-gray-500">Material</span>
                                            <span className="text-sm font-semibold text-[#12131A]">{product.material}</span>
                                        </div>
                                    )}
                                    {product.weight && (
                                        <div className="flex items-center justify-between gap-4 py-3.5">
                                            <span className="text-sm font-medium text-gray-500">Weight</span>
                                            <span className="text-sm font-semibold text-[#12131A]">{product.weight}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between gap-4 py-3.5">
                                        <span className="text-sm font-medium text-gray-500">Stock Status</span>
                                        <span className={`text-sm font-semibold ${isColorInStock ? "text-[#10B981]" : "text-[#E5484D]"}`}>
                                            {isColorInStock ? `In Stock (${displayStock || 0} left)` : "Out of Stock"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 py-3.5">
                                        <span className="text-sm font-medium text-gray-500">Free Shipping</span>
                                        <span className="text-sm font-semibold text-[#10B981]">Yes</span>
                                    </div>
                                    {Array.isArray(product.specifications) && product.specifications.length > 0 && product.specifications.some(s => s.trim()) && (
                                        <div className="py-3.5">
                                            <span className="text-sm font-medium text-gray-500">Features</span>
                                            <ul className="mt-3 list-disc list-inside space-y-2">
                                                {product.specifications.filter(s => s.trim()).map((spec, idx) => (
                                                    <li key={idx} className="text-sm text-[#12131A]">{spec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </FadeInUp>
                    )}

                    {activeTab === "Reviews" && (
                        <FadeInUp key="reviews">
                            <AnimatedReview reviews={reviewsList} onSubmit={handleReviewSubmit} />
                        </FadeInUp>
                    )}
                </div>

                {/* Related Products */}
                <div className="mt-12 sm:mt-16">
                    <AnimatedRelatedProducts products={relatedProducts} />
                </div>
            </div >

            <Footer />
        </div >
    );
};

export default ProductDetail;