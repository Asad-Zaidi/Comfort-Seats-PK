/**
 * Simplified Help Content for Add/Edit Product Wizard
 * Only contains concise info about what to enter in each field.
 */

export const WIZARD_HELP_CONTENT = {
    // ----------------------------------------------------
    // STEP 1 — BASIC INFORMATION
    // ----------------------------------------------------
    name: {
        title: "Product Name",
        description: "The customer-facing title of your product displayed on cards, detail pages, and receipts."
    },
    slug: {
        title: "Product Slug / URL Path",
        description: "The unique web address for this product's detail page. Auto-generated from name & category."
    },
    brand: {
        title: "Brand Name",
        description: "The manufacturer or brand identity for this seat model. Defaults to 'Comfort Seats PK'."
    },
    shortDescription: {
        title: "Short Description",
        description: "A quick summary snippet shown below the price on product detail and quick view cards."
    },
    description: {
        title: "Full Description",
        description: "Comprehensive product details including ergonomics, build materials, warranty, and maintenance."
    },
    category: {
        title: "Primary Category",
        description: "The main catalog classification for this product (e.g., Gaming Seats, Executive Office, Waiting Area)."
    },
    subcategory: {
        title: "Subcategory",
        description: "A secondary tag (e.g., Ergonomic, Mesh, Recliner, Leather) for refined catalog filtering."
    },
    actualPrice: {
        title: "Actual / Base Price (Rs.)",
        description: "The standard selling price in PKR before any discounts. Must be greater than 0."
    },
    discountPrice: {
        title: "Discount Price (Rs.)",
        description: "The reduced promotional price shown when discount is enabled. Must be lower than actual price."
    },
    enableDiscount: {
        title: "Enable Discount Pricing",
        description: "Toggles sale pricing mode on or off. When enabled, displays sale badges and strikes out the original price."
    },
    colorVariantsSection: {
        title: "Available Color Variants",
        description: "Define color choices (e.g., Black, Red, Blue) for this product. Each color can have its own pricing & stock."
    },
    metallicStandToggle: {
        title: "Metallic Stand Upgrade Toggle",
        description: "Enables an optional premium metallic base upgrade option for customers during purchase."
    },
    sku: {
        title: "SKU Code (Stock Keeping Unit)",
        description: "Your unique internal inventory tracking identifier for this product (e.g., CS-GAM-001)."
    },
    stock: {
        title: "Stock Quantity",
        description: "The total number of available physical units currently in stock."
    },
    lowStockWarning: {
        title: "Low Stock Warning Threshold",
        description: "The stock level at which the system alerts admins that inventory is running low."
    },
    stockStatusRadio: {
        title: "Stock Status Setting",
        description: "Manually force product availability to 'In Stock' or 'Out of Stock'."
    },
    isFeatured: {
        title: "Featured Product Badge",
        description: "Highlights this product in featured carousels and homepage sections."
    },
    isNewArrival: {
        title: "New Arrival Badge",
        description: "Marks product as a newly launched model with a 'New' badge."
    },
    isBestSeller: {
        title: "Best Seller Badge",
        description: "Marks product as a top customer recommendation with a 'Best Seller' badge."
    },
    isCustomizable: {
        title: "Customize Button Toggle",
        description: "Replaces standard 'Buy Now' with a WhatsApp customization button for bespoke orders."
    },

    // ----------------------------------------------------
    // STEP 2 — IMAGES & VARIANTS
    // ----------------------------------------------------
    generalGallerySection: {
        title: "General Product Gallery",
        description: "Main default gallery images showcasing the product from multiple angles. Minimum 1 required."
    },
    coverImageBadge: {
        title: "Cover Image Marker",
        description: "Designates the primary thumbnail image for this product across the website."
    },
    addImageSlot: {
        title: "Add Image Slot",
        description: "Opens a file selector to upload additional general product images."
    },
    deleteImageSlot: {
        title: "Delete Image Slot",
        description: "Removes the selected image from the product gallery."
    },
    colorVariantMediaSection: {
        title: "Color Variant Media",
        description: "Specific gallery photos for each configured color option. At least 1 photo per color required."
    },
    metallicStandMediaSection: {
        title: "Metallic Stand Upgrade Media",
        description: "Photos of the chair installed with the premium metallic stand base option."
    },

    // ----------------------------------------------------
    // STEP 3 — PRICING & INVENTORY
    // ----------------------------------------------------
    pricingSummarySection: {
        title: "Pricing Summary Overview",
        description: "Consolidated breakdown of base price, active discount, and savings calculation."
    },
    colorPricingStockGrid: {
        title: "Color Variant Pricing & Stock",
        description: "Set optional custom override prices and individual warehouse stock for each color choice."
    },
    metallicStandFee: {
        title: "Metallic Stand Surcharge Fee (Rs.)",
        description: "The additional amount added to product base price when metallic stand upgrade is selected."
    },
    dynamicPriceCalculator: {
        title: "Dynamic Live Pricing Preview",
        description: "Interactive pricing simulator to test final customer checkout price combinations."
    },
    specificationsList: {
        title: "Specifications & Features List",
        description: "Bullet-point specifications displayed in the Specifications tab on the product detail page."
    },
    shippingWeight: {
        title: "Shipping Weight (kg)",
        description: "Gross weight of boxed product package in kilograms."
    },
    shippingDimensions: {
        title: "Package Dimensions (L × W × H in cm)",
        description: "Length, Width, and Height of boxed product container in centimeters."
    },

    // ----------------------------------------------------
    // STEP 4 — SEO & PUBLISHING
    // ----------------------------------------------------
    metaTitle: {
        title: "SEO Meta Title",
        description: "Title tag displayed in search engine results. Keep under 60 characters."
    },
    metaDescription: {
        title: "SEO Meta Description",
        description: "Summary text displayed under meta title in search results. Keep between 140–160 characters."
    },
    metaKeywords: {
        title: "SEO Meta Keywords",
        description: "Comma-separated keywords representing main terms related to this product."
    },
    canonicalUrl: {
        title: "Canonical URL",
        description: "The authoritative URL for this product page. Prevents duplicate content penalties."
    },
    autoFillSeoBtn: {
        title: "Auto-fill SEO Fields",
        description: "Automatically populates Meta Title, Description, Keywords, and Canonical URL using Step 1 data."
    },
    searchPreview: {
        title: "Google Search Engine Preview",
        description: "Real-time visual simulation of how this product will look in Google search results."
    },
    socialPreview: {
        title: "Social Media Share Card Preview",
        description: "Real-time preview of Open Graph share cards for WhatsApp, Facebook, or Twitter."
    },
    publishStatusActive: {
        title: "Publish Immediately (Active)",
        description: "Publishes product live on the storefront immediately upon saving."
    },
    publishStatusDraft: {
        title: "Save as Draft",
        description: "Saves product data without making it visible on the customer website."
    },
    publishStatusScheduled: {
        title: "Schedule Publication",
        description: "Set a future date and time for automatic publication."
    },
    publishScheduleDate: {
        title: "Publication Date & Time",
        description: "Target timestamp when product should automatically go live on storefront."
    },

    // ----------------------------------------------------
    // WIZARD ACTION BUTTONS & NAVIGATION
    // ----------------------------------------------------
    btnPrevious: {
        title: "Previous Step Button",
        description: "Navigates back to the preceding wizard step without resetting data."
    },
    btnNext: {
        title: "Next Step Button",
        description: "Validates current step fields and moves to the next step."
    },
    btnSaveDraft: {
        title: "Save Draft Button",
        description: "Saves current progress as a draft so you can continue editing later."
    },
    btnSubmitProduct: {
        title: "Create / Update Product Button",
        description: "Finalizes product setup and sends data to the backend API server."
    },
    draftRestoreBanner: {
        title: "Local Draft Protection",
        description: "Automatically saves unsubmitted form data to browser local storage."
    }
};

export default WIZARD_HELP_CONTENT;