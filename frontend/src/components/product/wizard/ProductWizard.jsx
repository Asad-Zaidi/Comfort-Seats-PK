import React, { useState, useEffect } from 'react';
import { FiX, FiPackage } from 'react-icons/fi';
import StepIndicator from './StepIndicator';
import StepNavigation from './StepNavigation';
import BasicInformationStep from './BasicInformationStep';
import ImagesVariantsStep from './ImagesVariantsStep';
import PricingInventoryStep from './PricingInventoryStep';
import SeoPublishingStep from './SeoPublishingStep';
import InfoTooltip from './InfoTooltip';
import { WIZARD_HELP_CONTENT } from './productWizardHelpContent';
import { useToast } from '../../ToastNotification';
import api from '../../../api/api';

const DRAFT_STORAGE_KEY = 'cs_product_wizard_draft';
const defaultCategories = ["Gaming", "Waiting"];


const defaultFormState = {
    name: '',
    slug: '',
    isSlugCustom: false,
    brand: 'Comfort Seats PK',
    shortDescription: '',
    description: '',
    category: defaultCategories[0],
    subcategory: '',
    price: '',
    actualPrice: '',
    discountPrice: '',
    isDiscountEnabled: false,
    colors: [],
    hasMetallicStand: false,
    metallicStandName: 'Metallic Stand',
    metallicStandPrice: '3500',
    metallicStandImages: [],
    standTypes: [],
    sku: '',
    stock: 0,
    inStock: true,
    lowStockWarning: 5,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isCustomizable: false,
    size: '',
    specifications: [''],
    productImages: [],
    shippingWeight: '',
    shippingDimensions: { length: '', width: '', height: '' },
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    metaOgTitle: '',
    metaOgDescription: '',
    metaOgImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonicalUrl: '',
    status: 'Active',
    publishDate: '',
};

const ProductWizard = ({
    open = false,
    onClose = () => { },
    onSubmit = null,
    initialData = null,
    isEdit = false
}) => {
    const toast = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [formData, setFormData] = useState(defaultFormState);
    const [categories, setCategories] = useState(defaultCategories);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [draftRestored, setDraftRestored] = useState(false);
    const [draftSavedAt, setDraftSavedAt] = useState(null);

    // Fetch site categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/site-content");
                if (res.data?.success && Array.isArray(res.data.data?.categories)) {
                    const fetched = res.data.data.categories
                        .map(cat => cat.name)
                        .filter(Boolean);
                    if (fetched.length > 0) setCategories(fetched);
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Initialize state when modal opens or initialData changes
    useEffect(() => {
        if (!open) return;

        if (initialData && isEdit) {
            // Populate form for Edit Product
            const metallicStands = Array.isArray(initialData.standTypes) ? initialData.standTypes : [];
            const initialMetallicImgs = Array.isArray(initialData.metallicStandImages) ? initialData.metallicStandImages : [];

            const hasStand = initialData.hasMetallicStand === true
                || metallicStands.length > 0
                || initialMetallicImgs.length > 0
                || !!initialData.metallicStandPrice;

            const existingProductImgs = (initialData.productImages || []).map(img => ({
                url: typeof img === 'string' ? img : img.url,
                preview: typeof img === 'string' ? img : (img.preview || img.url),
                publicId: typeof img === 'object' ? img.publicId : null,
                isCover: typeof img === 'object' ? img.isCover : false
            }));

            if (existingProductImgs.length === 0 && initialData.imageUrl) {
                existingProductImgs.push({
                    url: initialData.imageUrl,
                    preview: initialData.imageUrl,
                    publicId: initialData.cloudinaryPublicId,
                    isCover: true
                });
            }

            const rawColors = initialData.colors || [];
            const hasDefaultColor = rawColors.some(c => c.isDefault === true);
            const mappedColors = rawColors.map((c, idx) => ({
                name: c.name || '',
                hex: c.hex || '#000000',
                price: c.price ?? '',
                stock: c.stock ?? 0,
                inStock: c.inStock !== false,
                isDefault: hasDefaultColor ? c.isDefault === true : idx === 0,
                images: Array.isArray(c.images)
                    ? c.images.map(img => {
                        const urlStr = typeof img === 'string' ? img : (img.url || img.preview || '');
                        return {
                            url: urlStr,
                            preview: urlStr,
                            publicId: typeof img === 'object' ? img.publicId : null,
                            isCover: typeof img === 'object' ? img.isCover : false
                        };
                    })
                    : [],
            }));

            const standImagesRaw = (metallicStands[0] && Array.isArray(metallicStands[0].images) && metallicStands[0].images.length > 0)
                ? metallicStands[0].images
                : initialMetallicImgs;

            const mappedStandImages = standImagesRaw.map(img => {
                const urlStr = typeof img === 'string' ? img : (img.url || img.preview || '');
                return {
                    url: urlStr,
                    preview: urlStr,
                    publicId: typeof img === 'object' ? img.publicId : null,
                    isCover: typeof img === 'object' ? img.isCover : false
                };
            });

            const standTypesToUse = (metallicStands.length > 0)
                ? metallicStands.map(st => ({
                    type: st.type || 'Metallic',
                    price: String(st.price || initialData.metallicStandPrice || '3500'),
                    images: Array.isArray(st.images) && st.images.length > 0
                        ? st.images.map(img => {
                            const urlStr = typeof img === 'string' ? img : (img.url || img.preview || '');
                            return {
                                url: urlStr,
                                preview: urlStr,
                                publicId: typeof img === 'object' ? img.publicId : null,
                                isCover: typeof img === 'object' ? img.isCover : false
                            };
                        })
                        : mappedStandImages
                }))
                : (hasStand ? [{
                    type: 'Metallic',
                    price: String(initialData.metallicStandPrice || '3500'),
                    images: mappedStandImages
                }] : []);

            setFormData({
                name: initialData.name || '',
                slug: initialData.slug || '',
                isSlugCustom: !!initialData.slug,
                brand: initialData.brand || 'Comfort Seats PK',
                shortDescription: initialData.shortDescription || '',
                description: initialData.description || '',
                category: Array.isArray(initialData.category)
                    ? (initialData.category[0] || categories[0] || defaultCategories[0])
                    : (initialData.category || categories[0] || defaultCategories[0]),
                subcategory: initialData.subcategory || '',
                price: initialData.price ? String(initialData.price) : '',
                actualPrice: initialData.actualPrice ? String(initialData.actualPrice) : (initialData.price ? String(initialData.price) : ''),
                discountPrice: initialData.discountPrice ? String(initialData.discountPrice) : '',
                isDiscountEnabled: !!initialData.isDiscountEnabled,
                colors: mappedColors,
                hasMetallicStand: hasStand,
                metallicStandName: (metallicStands[0]?.type || initialData.metallicStandName || 'Metallic Stand'),
                metallicStandPrice: String(metallicStands[0]?.price || initialData.metallicStandPrice || '3500'),
                metallicStandImages: mappedStandImages,
                standTypes: standTypesToUse,
                sku: initialData.sku || '',
                stock: initialData.stock || 0,
                inStock: initialData.inStock !== undefined ? !!initialData.inStock : (initialData.stock > 0),
                lowStockWarning: initialData.lowStockWarning || 5,
                isFeatured: !!initialData.isFeatured,
                isNewArrival: !!initialData.isNewArrival,
                isBestSeller: !!initialData.isBestSeller,
                isCustomizable: !!initialData.isCustomizable,
                size: initialData.size || '',
                specifications: Array.isArray(initialData.specifications) && initialData.specifications.length > 0
                    ? initialData.specifications
                    : [''],
                productImages: existingProductImgs,
                shippingWeight: initialData.shippingWeight ? String(initialData.shippingWeight) : '',
                shippingDimensions: initialData.shippingDimensions || { length: '', width: '', height: '' },
                metaTitle: initialData.metaTitle || '',
                metaDescription: initialData.metaDescription || '',
                metaKeywords: initialData.metaKeywords || '',
                metaOgTitle: initialData.metaOgTitle || '',
                metaOgDescription: initialData.metaOgDescription || '',
                metaOgImage: initialData.metaOgImage || '',
                twitterTitle: initialData.twitterTitle || '',
                twitterDescription: initialData.twitterDescription || '',
                twitterImage: initialData.twitterImage || '',
                canonicalUrl: initialData.canonicalUrl || '',
                status: initialData.status || 'Active',
                publishDate: initialData.publishDate || '',
            });
            setCurrentStep(1);
            setCompletedSteps([1, 2, 3, 4]);
            setErrors({});
            setDraftRestored(false);
        } else {
            // Check for saved local draft for Add Product
            try {
                const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && parsed.formData) {
                        setFormData(parsed.formData);
                        setCurrentStep(parsed.currentStep || 1);
                        setCompletedSteps(parsed.completedSteps || []);
                        setDraftRestored(true);
                        setDraftSavedAt(parsed.savedAt || new Date().toLocaleTimeString());
                        setErrors({});
                        return;
                    }
                }
            } catch (e) {
                console.error("Error restoring draft:", e);
            }

            // Reset form for fresh product
            setFormData({
                ...defaultFormState,
                category: categories[0] || defaultCategories[0],
            });
            setCurrentStep(1);
            setCompletedSteps([]);
            setErrors({});
            setDraftRestored(false);
        }
    }, [open, initialData, isEdit, categories]);

    // Local Storage Auto Save (for Add Product)
    useEffect(() => {
        if (!open || isEdit) return;

        const timer = setTimeout(() => {
            try {
                const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                // Clean file objects before saving to localStorage
                const cleanState = {
                    ...formData,
                    productImages: (formData.productImages || []).map(img => img ? { url: img.url, preview: img.url, publicId: img.publicId, isCover: img.isCover } : null).filter(Boolean),
                    colors: (formData.colors || []).map(c => ({
                        ...c,
                        images: (c.images || []).map(img => img ? { url: img.url, preview: img.url, publicId: img.publicId, isCover: img.isCover } : null).filter(Boolean)
                    })),
                    standTypes: (formData.standTypes || []).map(st => ({
                        ...st,
                        images: (st.images || []).map(img => img ? { url: img.url, preview: img.url, publicId: img.publicId, isCover: img.isCover } : null).filter(Boolean)
                    }))
                };
                localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
                    formData: cleanState,
                    currentStep,
                    completedSteps,
                    savedAt: now
                }));
                setDraftSavedAt(now);
            } catch (e) {
                console.error("Auto save failed:", e);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [formData, currentStep, completedSteps, open, isEdit]);

    // Clear Draft Handler
    const handleDiscardDraft = () => {
        try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            setFormData({
                ...defaultFormState,
                category: categories[0] || defaultCategories[0]
            });
            setCurrentStep(1);
            setCompletedSteps([]);
            setDraftRestored(false);
            setDraftSavedAt(null);
            setErrors({});
            toast.info("Saved draft discarded.");
        } catch (e) {
            console.error(e);
        }
    };

    // Escape key handler
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        if (open) {
            window.addEventListener("keydown", onKey);
            document.body.style.overflow = "hidden";
        }
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    // Clean blob URLs on unmount
    useEffect(() => {
        return () => {
            (formData.productImages || []).forEach(img => {
                if (img?.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
            });
            (formData.colors || []).forEach(c => {
                (c.images || []).forEach(img => {
                    if (img?.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
                });
            });
            (formData.standTypes || []).forEach(st => {
                (st.images || []).forEach(img => {
                    if (img?.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
                });
            });
        };
    }, [formData]);

    // --- STEP VALIDATIONS ---
    const validateStep = (stepNumber) => {
        const newErrors = {};
        let isValid = true;

        if (stepNumber === 1) {
            // Step 1 Validation
            if (!formData.name?.trim()) {
                newErrors.name = "Product name is required.";
                isValid = false;
            }

            const priceNum = Number(formData.price);
            if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
                newErrors.price = "Valid price > 0 is required.";
                isValid = false;
            }

            if (formData.isDiscountEnabled) {
                const discountNum = Number(formData.discountPrice);
                const actualNum = Number(formData.actualPrice || formData.price);
                if (!formData.discountPrice || isNaN(discountNum) || discountNum < 0) {
                    newErrors.discountPrice = "Discount price is required when discount is enabled.";
                    isValid = false;
                } else if (discountNum > actualNum) {
                    newErrors.discountPrice = "Discount price cannot exceed actual price.";
                    isValid = false;
                }
            }

            // Colors validation
            const colorsList = formData.colors || [];
            if (colorsList.length === 0) {
                newErrors.colors = { _global: "Please add at least one color variant." };
                isValid = false;
            } else {
                const nameCounts = {};
                colorsList.forEach(c => {
                    const n = c.name?.trim()?.toLowerCase();
                    if (n) nameCounts[n] = (nameCounts[n] || 0) + 1;
                });

                const colorErrs = colorsList.map((c) => {
                    const ce = {};
                    if (!c.name?.trim()) {
                        ce.name = "Color name required";
                        isValid = false;
                    } else if (nameCounts[c.name.trim().toLowerCase()] > 1) {
                        ce.name = "Duplicate color name";
                        isValid = false;
                    }
                    if (!c.hex?.trim() || !/^#[0-9A-Fa-f]{6}$/.test(c.hex.trim())) {
                        ce.hex = "Valid hex code required";
                        isValid = false;
                    }
                    return ce;
                });

                if (colorErrs.some(ce => Object.keys(ce).length > 0)) {
                    newErrors.colors = colorErrs;
                }
            }
        }

        if (stepNumber === 2) {
            // Step 2 Validation: Product Gallery & Variant Images
            const generalUploaded = (formData.productImages || []).filter(Boolean).length;
            if (generalUploaded < 1) {
                newErrors.productImages = ["At least 1 product image is required."];
                isValid = false;
            }

            // Each color must have at least 1 image
            const colorsList = formData.colors || [];
            const colorErrs = colorsList.map((c) => {
                const ce = {};
                const colorImgsCount = (c.images || []).filter(Boolean).length;
                if (colorImgsCount < 1) {
                    ce.images = ["At least 1 image is required for this color."];
                    isValid = false;
                }
                return ce;
            });

            if (colorErrs.some(ce => Object.keys(ce).length > 0)) {
                newErrors.colors = colorErrs;
            }
        }

        if (stepNumber === 3) {
            // Step 3 Validation: Price & Stock
            if (Number(formData.stock) < 0) {
                newErrors.stock = "Stock quantity cannot be negative.";
                isValid = false;
            }
        }

        if (stepNumber === 4) {
            // Step 4 Validation: Publishing fields
            if (formData.status === 'Scheduled' && !formData.publishDate) {
                newErrors.publishDate = "Publish date is required for scheduled publishing.";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    // Navigation Step Handlers
    const handleNext = () => {
        if (!validateStep(currentStep)) {
            toast.error(`Please Enter Data in Step ${currentStep} before proceeding.`);
            return;
        }

        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps(prev => [...prev, currentStep]);
        }

        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleStepClick = (stepId) => {
        // Can move backward anytime, or forward if steps completed
        if (stepId < currentStep || completedSteps.includes(currentStep) || validateStep(currentStep)) {
            if (!completedSteps.includes(currentStep) && validateStep(currentStep)) {
                setCompletedSteps(prev => [...prev, currentStep]);
            }
            setCurrentStep(stepId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            toast.warning(`Please complete Step ${currentStep} before jumping ahead.`);
        }
    };

    // Submission Handler
    const handleFinalSubmit = async () => {
        // Validate all steps
        let allValid = true;
        for (let s = 1; s <= 4; s++) {
            if (!validateStep(s)) {
                allValid = false;
                setCurrentStep(s);
                toast.error(`Validation error in Step ${s}. Please fix before submitting.`);
                break;
            }
        }

        if (!allValid) return;

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("name", formData.name);
            fd.append("slug", formData.slug);
            fd.append("brand", formData.brand || 'Comfort Seats PK');
            fd.append("price", formData.price);
            fd.append("actualPrice", formData.actualPrice || formData.price);
            fd.append("isDiscountEnabled", formData.isDiscountEnabled ? "true" : "false");
            if (formData.isDiscountEnabled) {
                fd.append("discountPrice", formData.discountPrice);
            }

            fd.append("category", formData.category);
            if (formData.subcategory) fd.append("subcategory", formData.subcategory.trim());
            fd.append("stock", formData.inStock ? formData.stock : 0);
            fd.append("inStock", formData.inStock ? "true" : "false");
            fd.append("lowStockWarning", formData.lowStockWarning || 5);
            fd.append("sku", formData.sku || '');

            fd.append("isFeatured", formData.isFeatured ? "true" : "false");
            fd.append("isNewArrival", formData.isNewArrival ? "true" : "false");
            fd.append("isBestSeller", formData.isBestSeller ? "true" : "false");
            fd.append("isCustomizable", formData.isCustomizable ? "true" : "false");
            fd.append("status", formData.status || 'Active');
            if (formData.publishDate) fd.append("publishDate", formData.publishDate);

            fd.append("shortDescription", formData.shortDescription || '');
            fd.append("description", formData.description || '');
            fd.append("detail", formData.description || '');
            if (formData.size) fd.append("size", formData.size);

            // Specifications
            if (typeof formData.specifications === 'string' && formData.specifications.trim()) {
                fd.append("specifications", JSON.stringify([formData.specifications.trim()]));
            } else {
                const validSpecs = (Array.isArray(formData.specifications) ? formData.specifications : []).filter(s => s && s.trim() !== "");
                if (validSpecs.length > 0) {
                    fd.append("specifications", JSON.stringify(validSpecs));
                }
            }

            // SEO Metadata
            fd.append("metaTitle", formData.metaTitle || formData.name);
            fd.append("metaDescription", formData.metaDescription || formData.shortDescription || formData.description);
            fd.append("metaKeywords", formData.metaKeywords || [formData.category, formData.name].filter(Boolean).join(", "));
            if (formData.metaOgTitle) fd.append("metaOgTitle", formData.metaOgTitle);
            if (formData.metaOgDescription) fd.append("metaOgDescription", formData.metaOgDescription);
            if (formData.canonicalUrl) fd.append("canonicalUrl", formData.canonicalUrl);

            // Shipping
            if (formData.shippingWeight) fd.append("shippingWeight", formData.shippingWeight);
            if (formData.shippingDimensions) fd.append("shippingDimensions", JSON.stringify(formData.shippingDimensions));

            // Stand Types
            const standImagesArray = (formData.standTypes && formData.standTypes[0] && Array.isArray(formData.standTypes[0].images) && formData.standTypes[0].images.length > 0)
                ? formData.standTypes[0].images
                : (Array.isArray(formData.metallicStandImages) ? formData.metallicStandImages : []);

            const existingStandImages = [];
            const newStandFiles = [];

            standImagesArray.forEach(img => {
                if (!img) return;
                if (img.file) {
                    newStandFiles.push(img.file);
                } else {
                    const urlStr = typeof img === 'string' ? img : (img.url || img.preview || '');
                    if (urlStr) {
                        existingStandImages.push({
                            url: urlStr,
                            publicId: typeof img === 'object' ? (img.publicId || null) : null,
                            isCover: typeof img === 'object' ? !!img.isCover : false
                        });
                    }
                }
            });

            const standTypesToSend = formData.hasMetallicStand
                ? [{
                    type: 'Metallic',
                    price: Number(formData.metallicStandPrice) || 0,
                    images: existingStandImages
                }]
                : [];

            if (standTypesToSend.length > 0) {
                fd.append("standTypes", JSON.stringify(standTypesToSend));
                newStandFiles.forEach(file => {
                    fd.append("standImages_0", file);
                });
            }

            // General Product Images
            const existingProductImageUrls = [];
            let hasNewProductImages = false;
            (formData.productImages || []).forEach((img) => {
                if (img?.file) {
                    fd.append('productImages', img.file);
                    hasNewProductImages = true;
                } else if (img?.url) {
                    existingProductImageUrls.push(img.url);
                }
            });
            if (hasNewProductImages || isEdit) {
                fd.append('existingProductImageUrls', JSON.stringify(existingProductImageUrls));
            }

            // Color Variant Images
            const hasSubmitDefaultColor = (formData.colors || []).some(c => c.isDefault === true);
            const colorsData = (formData.colors || []).map((color, colorIdx) => {
                const existingImages = [];
                (color.images || []).forEach((img) => {
                    if (img?.file) {
                        fd.append(`colorImages_${colorIdx}`, img.file);
                    } else if (img?.url) {
                        existingImages.push({ url: img.url, publicId: img.publicId });
                    }
                });
                return {
                    name: color.name.trim(),
                    hex: color.hex.trim(),
                    price: Number(color.price) || 0,
                    stock: Number(color.stock) || 0,
                    inStock: color.inStock !== false,
                    isDefault: hasSubmitDefaultColor ? color.isDefault === true : colorIdx === 0,
                    images: existingImages.length > 0 ? existingImages : undefined,
                };
            });
            fd.append('colors', JSON.stringify(colorsData));

            const result = await onSubmit(fd);
            if (result === false) return;

            // Clear draft on successful creation/update
            try {
                localStorage.removeItem(DRAFT_STORAGE_KEY);
            } catch (e) {
                console.error(e);
            }

            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save product. Please check form input.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-wizard-title"
        >
            {/* Top Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sm:px-8 shrink-0 bg-white z-20">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F6FED]/10 text-[#2F6FED]">
                        <FiPackage size={20} />
                    </span>
                    <div>
                        <h3 id="product-wizard-title" className="text-lg font-bold text-gray-900 flex items-center">
                            <span>{isEdit ? "Edit Product Wizard" : "Add Product Wizard"}</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.draftRestoreBanner} />
                        </h3>
                        <p className="text-xs text-gray-500">
                            {isEdit ? "Update product settings step by step" : "Create a new product with structured multi-step workflow"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {draftRestored && !isEdit && (
                        <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs text-amber-800 font-medium">
                            <span>Restored local draft</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.draftRestoreBanner} />
                            <button
                                type="button"
                                onClick={handleDiscardDraft}
                                className="text-red-600 font-bold hover:underline ml-1"
                            >
                                Discard Draft
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                        <FiX size={20} />
                    </button>
                </div>
            </div>

            {/* Stepper Progress Bar Header */}
            <StepIndicator
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={handleStepClick}
            />

            {/* Scrollable Form Step Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 bg-gray-50/40">
                <div className="max-w-6xl mx-auto">
                    {currentStep === 1 && (
                        <BasicInformationStep
                            formData={formData}
                            onChange={setFormData}
                            categories={categories}
                            errors={errors}
                            submitting={submitting}
                        />
                    )}

                    {currentStep === 2 && (
                        <ImagesVariantsStep
                            formData={formData}
                            onChange={setFormData}
                            errors={errors}
                            submitting={submitting}
                        />
                    )}

                    {currentStep === 3 && (
                        <PricingInventoryStep
                            formData={formData}
                            onChange={setFormData}
                            errors={errors}
                            submitting={submitting}
                        />
                    )}

                    {currentStep === 4 && (
                        <SeoPublishingStep
                            formData={formData}
                            onChange={setFormData}
                            errors={errors}
                            submitting={submitting}
                        />
                    )}
                </div>
            </div>

            {/* Sticky Bottom Navigation Footer */}
            <StepNavigation
                currentStep={currentStep}
                totalSteps={4}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSaveDraft={handleFinalSubmit}
                onSubmit={handleFinalSubmit}
                isSubmitting={submitting}
                isEdit={isEdit}
                draftSavedAt={draftSavedAt}
            />
        </div>
    );
};

export default ProductWizard;
