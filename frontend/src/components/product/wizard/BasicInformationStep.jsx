import React from 'react';
import { FiDollarSign, FiTag, FiBox, FiEye, FiLayers } from 'react-icons/fi';
import ColorVariantManager from '../ColorVariantManager';
import InfoTooltip from './InfoTooltip';
import { WIZARD_HELP_CONTENT } from './productWizardHelpContent';

const defaultCategories = ["Gaming", "Waiting"];
const usedSubcategories = ["Executive", "Ergonomic", "Mesh", "Leather", "Recliner"];

const BasicInformationStep = ({
    formData,
    onChange,
    categories = defaultCategories,
    errors = {},
    submitting = false
}) => {
    const handleFieldChange = (field, value) => {
        onChange({ ...formData, [field]: value });
    };

    // Auto-generate slug if user hasn't explicitly edited it or slug is empty
    const handleNameChange = (nameVal) => {
        const slugified = nameVal
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/-+/g, '-');

        const updated = {
            ...formData,
            name: nameVal,
        };

        if (!formData.isSlugCustom) {
            const primaryCat = (formData.category || categories[0] || '').toLowerCase().replace(/\s+/g, '-');
            const subCat = (formData.subcategory || '').toLowerCase().replace(/\s+/g, '-');
            updated.slug = subCat
                ? `${primaryCat}/${subCat}/${slugified}`
                : `${primaryCat}/${slugified}`;
        }

        onChange(updated);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Step 1 Header Info */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2F6FED] text-white font-bold">
                    1
                </span>
                <div>
                    <h3 className="text-base font-bold text-gray-900">Step 1 — Basic Information</h3>
                    <p className="text-xs text-gray-600">
                        Specify core product details, categories, prices, color choices, inventory thresholds, and visibility settings.
                    </p>
                </div>
            </div>

            {/* SECTION 1: General Product Details */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2F6FED]">
                        <FiTag size={15} />
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">General Information</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Product Name */}
                    <div className="md:col-span-2">
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>Product Name</span>
                            <span className="text-red-500 ml-0.5">*</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.name} />
                        </label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="e.g. Executive Ergonomic Racing Chair"
                            className={`block w-full rounded-xl border bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10 ${errors.name ? "border-red-400 bg-red-50/30" : "border-gray-200"
                                }`}
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>}
                    </div>

                    {/* Brand */}
                    <div>
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>Brand Name</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.brand} />
                        </label>
                        <input
                            type="text"
                            value={formData.brand || ''}
                            onChange={(e) => handleFieldChange('brand', e.target.value)}
                            placeholder="Comfort Seats PK"
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                        />
                    </div>

                    {/* Short Description */}
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="flex items-center text-sm font-semibold text-gray-800">
                                <span>Short Description</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.shortDescription} />
                            </label>
                            <span className="text-xs text-gray-400">{(formData.shortDescription || '').length}/200</span>
                        </div>
                        <textarea
                            value={formData.shortDescription || ''}
                            onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
                            maxLength={200}
                            rows={2}
                            placeholder="Concise overview snippet shown under price on product detail page..."
                            className="block w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                        />
                    </div>

                    {/* Full Description */}
                    <div className="md:col-span-2">
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>Full Description</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.description} />
                        </label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => handleFieldChange('description', e.target.value)}
                            rows={4}
                            placeholder="Detailed product features, materials, ergonomics, and maintenance guidelines..."
                            className="block w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 2: Category & Subcategory */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <FiLayers size={15} />
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Category & Subcategory</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Category */}
                    <div>
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>Category</span>
                            <span className="text-red-500 ml-0.5">*</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.category} />
                        </label>
                        <select
                            value={formData.category || categories[0] || defaultCategories[0]}
                            onChange={(e) => handleFieldChange('category', e.target.value)}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Subcategory */}
                    <div>
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>Subcategory</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.subcategory} />
                        </label>
                        <input
                            type="text"
                            value={formData.subcategory || ''}
                            onChange={(e) => handleFieldChange('subcategory', e.target.value)}
                            list="subcategory-options-list"
                            placeholder="e.g. Ergonomic, Recliner"
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10"
                        />
                        <datalist id="subcategory-options-list">
                            {usedSubcategories.map((s) => (
                                <option key={s} value={s} />
                            ))}
                        </datalist>
                    </div>
                </div>
            </div>

            {/* SECTION 3: Basic Pricing & Discounts */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <FiDollarSign size={15} />
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Base Pricing</h4>
                    </div>

                    {/* Discount Toggle */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-700 flex items-center">
                            Enable Discount
                            <InfoTooltip content={WIZARD_HELP_CONTENT.enableDiscount} />
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={formData.isDiscountEnabled}
                            onClick={() => {
                                const nextDisc = !formData.isDiscountEnabled;
                                onChange({
                                    ...formData,
                                    isDiscountEnabled: nextDisc,
                                    discountPrice: nextDisc && !formData.discountPrice ? formData.price : formData.discountPrice
                                });
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${formData.isDiscountEnabled ? 'bg-red-500' : 'bg-gray-300'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${formData.isDiscountEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Actual / Base Price */}
                    <div>
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>Actual Price (Rs.)</span>
                            <span className="text-red-500 ml-0.5">*</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.actualPrice} />
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">Rs.</span>
                            <input
                                type="number"
                                value={formData.price || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    onChange({
                                        ...formData,
                                        price: val,
                                        actualPrice: val
                                    });
                                }}
                                min="0"
                                step="0.01"
                                placeholder="35000"
                                className={`block w-full rounded-xl border bg-gray-50/50 py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10 ${errors.price ? "border-red-400 bg-red-50/30" : "border-gray-200"
                                    }`}
                                required
                            />
                        </div>
                        {errors.price && <p className="mt-1 text-xs text-red-600 font-medium">{errors.price}</p>}
                    </div>

                    {/* Discount Price */}
                    <div className={!formData.isDiscountEnabled ? "opacity-50 pointer-events-none" : ""}>
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>Discount Price (Rs.)</span>
                            {formData.isDiscountEnabled && <span className="text-red-500 ml-0.5">*</span>}
                            <InfoTooltip content={WIZARD_HELP_CONTENT.discountPrice} />
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">Rs.</span>
                            <input
                                type="number"
                                value={formData.discountPrice || ''}
                                onChange={(e) => handleFieldChange('discountPrice', e.target.value)}
                                min="0"
                                step="0.01"
                                disabled={!formData.isDiscountEnabled}
                                placeholder="29999"
                                className={`block w-full rounded-xl border bg-gray-50/50 py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10 ${errors.discountPrice ? "border-red-400 bg-red-50/30" : "border-gray-200"
                                    }`}
                            />
                        </div>
                        {errors.discountPrice && <p className="mt-1 text-xs text-red-600 font-medium">{errors.discountPrice}</p>}
                    </div>
                </div>
            </div>

            {/* SECTION 4: Available Color Variants */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <ColorVariantManager
                    colors={Array.isArray(formData.colors) ? formData.colors : []}
                    onColorsChange={(update) => {
                        const current = Array.isArray(formData.colors) ? formData.colors : [];
                        const next = typeof update === 'function' ? update(current) : update;
                        handleFieldChange('colors', next);
                    }}
                    errors={errors.colors || {}}
                    disabled={submitting}
                    showImages={false}
                    hidePricingAndStock={true}
                />
            </div>            {/* SECTION 5: Metallic Stand Upgrade Toggle */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                            <span>Metallic Stand Upgrade</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.metallicStandToggle} />
                        </h4>
                        <p className="text-xs text-gray-500">Enable optional metallic stand upgrade for customers (configure upgrade price in Step 3)</p>
                    </div>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={formData.hasMetallicStand}
                        onClick={() => {
                            const enabled = !formData.hasMetallicStand;
                            const defaultPrice = formData.metallicStandPrice || '3500';
                            const updatedStandTypes = enabled
                                ? [{ type: 'Metallic', price: defaultPrice, images: formData.metallicStandImages || [] }]
                                : [];
                            onChange({
                                ...formData,
                                hasMetallicStand: enabled,
                                metallicStandPrice: enabled ? defaultPrice : '',
                                standTypes: updatedStandTypes
                            });
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${formData.hasMetallicStand ? 'bg-[#2F6FED]' : 'bg-gray-300'
                            }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${formData.hasMetallicStand ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                    </button>
                </div>
            </div>

            {/* SECTION 6: Inventory & Stock */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <FiBox size={15} />
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Inventory & Availability</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* SKU */}
                    <div>
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>SKU Code</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.sku} />
                        </label>
                        <input
                            type="text"
                            value={formData.sku || ''}
                            onChange={(e) => handleFieldChange('sku', e.target.value)}
                            placeholder="CS-GAM-001"
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#2F6FED] focus:bg-white"
                        />
                    </div>

                    {/* Stock Quantity */}
                    <div>
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>Stock Quantity</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.stock} />
                        </label>
                        <input
                            type="number"
                            value={formData.stock || 0}
                            onChange={(e) => {
                                const qty = Math.max(0, Number(e.target.value));
                                onChange({
                                    ...formData,
                                    stock: qty,
                                    inStock: qty > 0
                                });
                            }}
                            min="0"
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#2F6FED] focus:bg-white"
                        />
                    </div>

                    {/* Low Stock Warning */}
                    <div>
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>Low Stock Warning Level</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.lowStockWarning} />
                        </label>
                        <input
                            type="number"
                            value={formData.lowStockWarning || 5}
                            onChange={(e) => handleFieldChange('lowStockWarning', Math.max(0, Number(e.target.value)))}
                            min="0"
                            placeholder="5"
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#2F6FED] focus:bg-white"
                        />
                    </div>
                </div>

                {/* Stock Toggle */}
                <div className="flex items-center gap-6 pt-2">
                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            type="radio"
                            name="inStockRadio"
                            checked={formData.inStock}
                            onChange={() => handleFieldChange('inStock', true)}
                            className="h-4 w-4 text-[#2F6FED]"
                        />
                        <span className="text-sm font-medium text-gray-800 flex items-center">
                            In Stock
                            <InfoTooltip content={WIZARD_HELP_CONTENT.stockStatusRadio} />
                        </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            type="radio"
                            name="inStockRadio"
                            checked={!formData.inStock}
                            onChange={() => {
                                onChange({
                                    ...formData,
                                    inStock: false,
                                    stock: 0
                                });
                            }}
                            className="h-4 w-4 text-red-500"
                        />
                        <span className="text-sm font-medium text-gray-800">Out of Stock</span>
                    </label>
                </div>
            </div>

            {/* SECTION 7: Visibility & Badges */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <FiEye size={15} />
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Visibility & Product Badges</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Featured */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                        <div>
                            <span className="text-xs font-semibold text-gray-800 flex items-center">
                                Featured Product
                                <InfoTooltip content={WIZARD_HELP_CONTENT.isFeatured} />
                            </span>
                            <span className="text-[10px] text-gray-400">Show in featured section</span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={!!formData.isFeatured}
                            onClick={() => handleFieldChange('isFeatured', !formData.isFeatured)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${formData.isFeatured ? 'bg-purple-600' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${formData.isFeatured ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* New Arrival */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                        <div>
                            <span className="text-xs font-semibold text-gray-800 flex items-center">
                                New Arrival
                                <InfoTooltip content={WIZARD_HELP_CONTENT.isNewArrival} />
                            </span>
                            <span className="text-[10px] text-gray-400">Show new arrival badge</span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={!!formData.isNewArrival}
                            onClick={() => handleFieldChange('isNewArrival', !formData.isNewArrival)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${formData.isNewArrival ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${formData.isNewArrival ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Best Seller */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                        <div>
                            <span className="text-xs font-semibold text-gray-800 flex items-center">
                                Best Seller
                                <InfoTooltip content={WIZARD_HELP_CONTENT.isBestSeller} />
                            </span>
                            <span className="text-[10px] text-gray-400">Show best seller badge</span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={!!formData.isBestSeller}
                            onClick={() => handleFieldChange('isBestSeller', !formData.isBestSeller)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${formData.isBestSeller ? 'bg-amber-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${formData.isBestSeller ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Product Customization */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                        <div>
                            <span className="text-xs font-semibold text-gray-800 flex items-center">
                                Customize Button
                                <InfoTooltip content={WIZARD_HELP_CONTENT.isCustomizable} />
                            </span>
                            <span className="text-[10px] text-gray-400">Show 'Customize Now'</span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={!!formData.isCustomizable}
                            onClick={() => handleFieldChange('isCustomizable', !formData.isCustomizable)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${formData.isCustomizable ? 'bg-[#2F6FED]' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${formData.isCustomizable ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInformationStep;
