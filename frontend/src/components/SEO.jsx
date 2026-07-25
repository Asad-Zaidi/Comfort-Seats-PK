// import { Helmet } from "react-helmet-async";
// import { useSiteConfig } from "../utils/siteConfig";

// // Helper to normalize URL - removes trailing slash from base URL
// const normalizeUrl = (url) => url ? url.replace(/\/+$/, '') : '';

// // const logo =
// //     logoUrl?.startsWith("http")
// //         ? logoUrl
// //         : `${siteUrl}${logoUrl || "/logo.png"}`;

// // Generate Organization schema for the furniture business
// const generateOrganizationSchema = (siteName, siteUrl, logoUrl) => ({
//     "@context": "https://schema.org",
//     "@type": "FurnitureStore",
//     "@id": `${siteUrl}#organization`,
//     "name": siteName,
//     "url": siteUrl,
//     "logo": logoUrl ? `${siteUrl}${logoUrl}` : `${siteUrl}/logo.png`,
//     "image": `${siteUrl}/og-image.png`,
//     "priceRange": "$$",
//     "description": siteName ? `Premium office chairs, gaming chairs, sofas & office furniture in Lahore. ${siteName} - Years of craftsmanship experience.` : "Premium office chairs, gaming chairs, sofas & office furniture in Lahore",
//     "address": {
//         "@type": "PostalAddress",
//         "addressLocality": "Lahore",
//         "addressCountry": "PK"
//     },
//     "telephone": "+92-318-4346146",
//     "email": "comfortseats.pk@gmail.com",
//     "openingHoursSpecification": [
//         {
//             "@type": "OpeningHoursSpecification",
//             "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
//             "opens": "10:00",
//             "closes": "20:00"
//         }
//     ],
//     "sameAs": [
//         "https://www.facebook.com/comfortseats.pk",
//         "https://instagram.com/comfortseats"
//     ]
// });

// // Generate Product schema markup
// const generateProductSchema = (product, siteUrl, siteName) => {
//     if (!product) return null;

//     // Handle category as array or string for URL construction
//     const productCategory = Array.isArray(product.category) ? product.category[0] : product.category;
//     const productSlug = product.slug || product._id;
//     const productUrl = productCategory ? `${siteUrl}/products/${productCategory}/${productSlug}` : `${siteUrl}/products/${productSlug}`;

//     const images = [];

//     // Add base product image
//     if (product.imageUrl) {
//         images.push(product.imageUrl);
//     }

//     // Add color variant images
//     if (product.colorVariants?.length > 0) {
//         product.colorVariants.forEach(variant => {
//             if (variant.imageUrl) images.push(variant.imageUrl);
//         });
//     }

//     // If no images, use a default placeholder
//     if (images.length === 0) {
//         images.push("https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=1200");
//     }

//     const schema = {
//         "@context": "https://schema.org/",
//         "@type": "Product",
//         "name": product.name,
//         "image": images,
//         "description": product.description || product.detail || "Premium furniture product",
//         "sku": product.sku || product._id,
//         "productID": product._id,
//         "url": productUrl,
//         "brand": {
//             "@type": "Brand",
//             "name": siteName
//         },
//         "offers": {
//             "@type": "Offer",
//             "url": productUrl,
//             "priceCurrency": "PKR",
//             "price": product.price,
//             "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
//             "itemCondition": "https://schema.org/NewCondition",
//             "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
//             "seller": {
//                 "@type": "Organization",
//                 "name": siteName,
//                 "@id": `${siteUrl}#organization`
//             }
//         },
//         "aggregateRating": product.avgRating ? {
//             "@type": "AggregateRating",
//             "ratingValue": product.avgRating,
//             "reviewCount": product.totalReviews || 0
//         } : undefined
//     };

//     // Remove undefined properties
//     Object.keys(schema).forEach(key => {
//         if (schema[key] === undefined) delete schema[key];
//     });

//     return schema;
// };

// // Generate Breadcrumb schema
// const generateBreadcrumbSchema = (items) => {
//     if (!items || items.length === 0) return null;

//     return {
//         "@context": "https://schema.org",
//         "@type": "BreadcrumbList",
//         "itemListElement": items.map((item, index) => ({
//             "@type": "ListItem",
//             "position": index + 1,
//             "name": item.name,
//             "item": item.url
//         }))
//     };
// };

// // Generate Website schema
// const generateWebsiteSchema = (siteName, siteUrl) => ({
//     "@context": "https://schema.org",
//     "@type": "WebSite",
//     "@id": `${siteUrl}#website`,
//     "name": siteName,
//     "url": siteUrl,
//     "potentialAction": {
//         "@type": "SearchAction",
//         "target": `${siteUrl}/search?q={search_term_string}`,
//         "query-input": "required name=search_term_string"
//     }
// });

// // Generate CollectionPage schema for product listings
// const generateCollectionPageSchema = (products, siteUrl, siteName, category) => {
//     if (!products || products.length === 0) return null;

//     const itemList = products.map((product, index) => {
//         const prodCategory = Array.isArray(product.category) ? product.category[0] : product.category;
//         const prodSlug = product.slug || product._id;
//         return {
//             "@type": "ListItem",
//             "position": index + 1,
//             "url": prodCategory ? `${siteUrl}/products/${prodCategory}/${prodSlug}` : `${siteUrl}/products/${prodSlug}`
//         };
//     });

//     return {
//         "@context": "https://schema.org",
//         "@type": "CollectionPage",
//         "name": category ? `${category} Products - ${siteName}` : `Products - ${siteName}`,
//         "description": "Browse our collection of premium furniture products",
//         "url": `${siteUrl}/products${category ? `?category=${encodeURIComponent(category)}` : ''}`,
//         mainEntity: {
//             "@type": "ItemList",
//             "itemListElement": itemList
//         }
//     };
// };

// const SEO = ({
//     title,
//     description = `Premium office chairs, gaming chairs, sofas & office furniture in Lahore. Shop ergonomic seating crafted for comfort and durability.`,
//     canonicalUrl,
//     ogImage,
//     ogType = "website",
//     keywords = `office chairs, gaming chairs, office furniture, Pakistan, furniture, ergonomic chairs`,
//     product,
//     breadcrumbs,
//     includeOrganization = true,
//     includeWebsite = true,
//     products,
//     category
// }) => {
//     const { siteName, siteUrl, siteTitle, logoUrl } = useSiteConfig();
//     const normalizedSiteUrl = normalizeUrl(siteUrl);
//     const fullTitle = (title || siteTitle).includes("-") ? (title || siteTitle) : `${title || siteTitle} - ${siteName}`;
//     const url = canonicalUrl
//         ? normalizeUrl(canonicalUrl)
//         : window.location.href;
//     const image =
//         ogImage?.startsWith("http")
//             ? ogImage
//             : `${normalizedSiteUrl}${ogImage || "/og-image.png"}`;

//     // Build schema array
//     const schemas = [];

//     // Always include Organization schema on all pages
//     if (includeOrganization) {
//         schemas.push(generateOrganizationSchema(siteName, normalizedSiteUrl, logoUrl));
//     }

//     // Include Website schema for non-product pages
//     if (includeWebsite && !product) {
//         schemas.push(generateWebsiteSchema(siteName, normalizedSiteUrl));
//     }

//     // Product-specific schema
//     if (product) {
//         const productSchema = generateProductSchema(product, normalizedSiteUrl, siteName);
//         if (productSchema) schemas.push(productSchema);
//     }

//     // Breadcrumb schema
//     if (breadcrumbs && breadcrumbs.length > 0) {
//         const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
//         if (breadcrumbSchema) schemas.push(breadcrumbSchema);
//     }

//     // CollectionPage schema for product listings
//     if (products?.length > 0) {
//         const collectionSchema = generateCollectionPageSchema(products, normalizedSiteUrl, siteName, category);
//         if (collectionSchema) schemas.push(collectionSchema);
//     }

//     return (
//         <Helmet>
//             <title>{fullTitle}</title>
//             <meta name="description" content={description} />
//             <meta name="keywords" content={keywords} />
//             <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"></meta>
//             <meta name="author" content={siteName} />
//             <meta charSet="utf-8" />
//             <meta name="viewport" content="width=device-width, initial-scale=1" />
//             <meta name="theme-color" content="#000000" />
//             <meta property="og:title" content={fullTitle} />
//             <meta property="og:description" content={description} />
//             <meta property="og:type" content={ogType} />
//             <meta property="og:url" content={url} />
//             <meta property="og:image" content={image} />
//             <meta property="og:site_name" content={siteName} />
//             <meta property="og:image:width" content="1200" />
//             <meta property="og:image:height" content="630" />
//             <meta property="og:image:type" content="image/png" />
//             <meta name="twitter:card" content="summary_large_image" />
//             <meta name="twitter:title" content={fullTitle} />
//             <meta name="twitter:description" content={description} />
//             <meta name="twitter:image" content={image} />
//             <meta name="twitter:site" content="@comfortseats" />
//             <meta property="og:locale" content="en_PK" />
//             <link rel="canonical" href={url} />

//             {/* JSON-LD Schema Markup */}
//             {schemas.map((schema, index) => (
//                 <script key={index} type="application/ld+json">
//                     {JSON.stringify(schema)}
//                 </script>
//             ))}
//         </Helmet>
//     );
// };

// export default SEO;

// // Export schema generators for use in other components
// export { generateProductSchema, generateOrganizationSchema, generateBreadcrumbSchema };


import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSiteConfig } from "../utils/siteConfig";

// Helper to normalize URL - removes trailing slash consistently
const normalizeUrl = (url) => url ? url.replace(/\/+$/, '') : '';

// Generate Organization schema for the furniture business
const generateOrganizationSchema = (siteName, siteUrl, logoUrl) => {
    const formattedLogo = logoUrl ? (logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`) : '/logo.png';
    return {
        "@context": "https://schema.org",
        "@type": "FurnitureStore",
        "@id": `${siteUrl}/#organization`,
        "name": siteName,
        "url": siteUrl,
        "logo": `${siteUrl}${formattedLogo}`,
        "image": `${siteUrl}/og-image.png`,
        "priceRange": "$$",
        "description": siteName ? `Premium office chairs, gaming chairs, sofas & office furniture in Lahore. ${siteName} - Years of craftsmanship experience.` : "Premium office chairs, gaming chairs, sofas & office furniture in Lahore",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Lahore",
            "addressCountry": "PK"
        },
        "telephone": "+92-318-4346146",
        "email": "comfortseats.pk@gmail.com",
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "10:00",
                "closes": "20:00"
            }
        ],
        "sameAs": [
            "https://www.facebook.com/comfortseats.pk",
            "https://www.instagram.com/comfortseatspk?igsh=ZDZxMTlvcnpyemJm"
        ]
    };
};

// Generate Product schema markup
const generateProductSchema = (product, siteUrl, siteName) => {
    if (!product) return null;

    const productCategory = Array.isArray(product.category) ? product.category[0] : product.category;
    const productSlug = product.slug || product._id;
    const productUrl = productCategory ? `${siteUrl}/products/${productCategory}/${productSlug}` : `${siteUrl}/products/${productSlug}`;

    const images = [];
    if (product.imageUrl) images.push(product.imageUrl);

    if (product.colorVariants?.length > 0) {
        product.colorVariants.forEach(variant => {
            if (variant.imageUrl) images.push(variant.imageUrl);
        });
    }

    if (images.length === 0) {
        images.push("https://images.unsplash.com/photo-1505843490701-5be5d6f48db6?w=1200");
    }

    const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": images,
        "description": product.description || product.detail || "Premium furniture product",
        "sku": product.sku || product._id,
        "productID": product._id,
        "url": productUrl,
        "brand": {
            "@type": "Brand",
            "name": siteName
        },
        "offers": {
            "@type": "Offer",
            "url": productUrl,
            "priceCurrency": "PKR",
            "price": product.price,
            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "",
                    "currency": "USD"
                }
            },
            "seller": {
                "@type": "Organization",
                "name": siteName,
                "@id": `${siteUrl}/#organization`
            }
        },
        "aggregateRating": product.avgRating ? {
            "@type": "AggregateRating",
            "ratingValue": product.avgRating,
            "reviewCount": product.totalReviews || 0
        } : undefined
    };

    Object.keys(schema).forEach(key => {
        if (schema[key] === undefined) delete schema[key];
    });

    return schema;
};

// Generate Breadcrumb schema
const generateBreadcrumbSchema = (items) => {
    if (!items || items.length === 0) return null;

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
};

// Generate Website schema
const generateWebsiteSchema = (siteName, siteUrl) => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    "name": siteName,
    "url": siteUrl,
    "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
    }
});

// Generate CollectionPage schema for product listings
const generateCollectionPageSchema = (products, siteUrl, siteName, category) => {
    if (!products || products.length === 0) return null;

    const itemList = products.map((product, index) => {
        const prodCategory = Array.isArray(product.category) ? product.category[0] : product.category;
        const prodSlug = product.slug || product._id;
        return {
            "@type": "ListItem",
            "position": index + 1,
            "url": prodCategory ? `${siteUrl}/products/${prodCategory}/${prodSlug}` : `${siteUrl}/products/${prodSlug}`
        };
    });

    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": category ? `${category} Products - ${siteName}` : `Products - ${siteName}`,
        "description": "Browse our collection of premium furniture products",
        "url": `${siteUrl}/products${category ? `?category=${encodeURIComponent(category)}` : ''}`,
        mainEntity: {
            "@type": "ItemList",
            "itemListElement": itemList
        }
    };
};

const SEO = ({
    title,
    description = `Premium office chairs, gaming chairs, sofas & office furniture in Lahore. Shop ergonomic seating crafted for comfort and durability.`,
    canonicalUrl,
    ogImage,
    ogType = "website",
    keywords = `office chairs, gaming chairs, office furniture, Pakistan, furniture, ergonomic chairs`,
    product,
    breadcrumbs,
    includeOrganization = true,
    includeWebsite = true,
    products,
    category
}) => {
    const { siteName, siteUrl, siteTitle, logoUrl } = useSiteConfig();
    const normalizedSiteUrl = normalizeUrl(siteUrl);
    const fullTitle = (title || siteTitle).includes("-") ? (title || siteTitle) : `${title || siteTitle} - ${siteName}`;

    const [currentUrl, setCurrentUrl] = useState(canonicalUrl ? normalizeUrl(canonicalUrl) : normalizedSiteUrl);

    useEffect(() => {
        if (!canonicalUrl && typeof window !== "undefined") {
            setCurrentUrl(window.location.href);
        }
    }, [canonicalUrl]);

    const image = ogImage?.startsWith("http")
        ? ogImage
        : `${normalizedSiteUrl}${ogImage ? (ogImage.startsWith('/') ? ogImage : `/${ogImage}`) : "/og-image.png"}`;

    // Build schema array
    const schemas = [];

    if (includeOrganization) {
        schemas.push(generateOrganizationSchema(siteName, normalizedSiteUrl, logoUrl));
    }

    if (includeWebsite && !product) {
        schemas.push(generateWebsiteSchema(siteName, normalizedSiteUrl));
    }

    if (product) {
        const productSchema = generateProductSchema(product, normalizedSiteUrl, siteName);
        if (productSchema) schemas.push(productSchema);
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
        const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
        if (breadcrumbSchema) schemas.push(breadcrumbSchema);
    }

    if (products?.length > 0) {
        const collectionSchema = generateCollectionPageSchema(products, normalizedSiteUrl, siteName, category);
        if (collectionSchema) schemas.push(collectionSchema);
    }

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
            <meta name="author" content={siteName} />
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#000000" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:type" content="image/png" />

            <meta property="og:locale" content="en_PK" />
            <link rel="canonical" href={currentUrl} />

            {/* JSON-LD Schema Markup */}
            {schemas.map((schema, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
};

export default SEO;
export { generateProductSchema, generateOrganizationSchema, generateBreadcrumbSchema };