import React from 'react';
import { FiDollarSign, FiTruck, FiList, FiLayers, FiSliders } from 'react-icons/fi';
import DynamicPriceCalculator from './DynamicPriceCalculator';
import InfoTooltip from './InfoTooltip';
import { WIZARD_HELP_CONTENT } from './productWizardHelpContent';
import RichTextEditor from '../../common/RichTextEditor';

const PricingInventoryStep = ({
    formData,
    onChange,
    errors = {},
    submitting = false
}) => {
    const handleFieldChange = (field, value) => {
        onChange({ ...formData, [field]: value });
    };

    const actual = Number(formData.actualPrice || formData.price || 0);
    const discount = Number(formData.discountPrice || 0);
    const discountPct = (formData.isDiscountEnabled && actual > 0 && discount > 0 && discount <= actual)
        ? Math.round(((actual - discount) / actual) * 100)
        : 0;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Step 3 Header Info */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                    3
                </span>
                <div>
                    <h3 className="text-base font-bold text-gray-900">Step 3 — Pricing & Inventory</h3>
                    <p className="text-xs text-gray-600">
                        Configure base pricing, custom color prices & stock, metallic stand upgrade fee, live calculator, and specifications.
                    </p>
                </div>
            </div>

            {/* SECTION 1: Pricing Summary & Control */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <FiDollarSign size={15} />
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                            <span>Pricing Summary</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.pricingSummarySection} />
                        </h4>
                    </div>

                    {discountPct > 0 && (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                            {discountPct}% OFF Active
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                        <span className="text-xs text-gray-500 font-medium flex items-center">
                            Base / Actual Price
                            <InfoTooltip content={WIZARD_HELP_CONTENT.actualPrice} />
                        </span>
                        <p className="text-base font-bold text-gray-900 mt-0.5">Rs. {actual.toLocaleString()}</p>
                    </div>

                    <div>
                        <span className="text-xs text-gray-500 font-medium flex items-center">
                            Discount Status
                            <InfoTooltip content={WIZARD_HELP_CONTENT.discountPrice} />
                        </span>
                        <p className="text-sm font-semibold mt-0.5">
                            {formData.isDiscountEnabled ? (
                                <span className="text-red-600 font-bold">Rs. {discount.toLocaleString()}</span>
                            ) : (
                                <span className="text-gray-400">Disabled</span>
                            )}
                        </p>
                    </div>

                    <div>
                        <span className="text-xs text-gray-500 font-medium block">Customer Savings</span>
                        <p className="text-sm font-bold text-emerald-600 mt-0.5">
                            {discountPct > 0 ? `Rs. ${(actual - discount).toLocaleString()} saved` : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Color Variant Pricing & Stock Inventory */}
            {Array.isArray(formData.colors) && formData.colors.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                <FiLayers size={15} />
                            </span>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                                    <span>Color Variant Pricing & Stock</span>
                                    <InfoTooltip content={WIZARD_HELP_CONTENT.colorPricingStockGrid} />
                                </h4>
                                <p className="text-xs text-gray-500">Set Extra prices and stock quantities for each selected color</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500 font-semibold">
                            {formData.colors.length} color{formData.colors.length > 1 ? 's' : ''} configured
                        </span>
                    </div>

                    <div className="space-y-3">
                        {formData.colors.map((color, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50/70">
                                <div className="flex items-center gap-3 min-w-[140px]">
                                    <span
                                        className="h-6 w-6 rounded-full border border-gray-300 shrink-0 shadow-xs"
                                        style={{ backgroundColor: color.hex || '#CCCCCC' }}
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{color.name || `Color #${idx + 1}`}</p>
                                        <p className="text-[11px] text-gray-400 font-mono">{color.hex || 'No hex'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 flex-1">
                                    <div className="flex-1 min-w-[120px]">
                                        <label className="flex items-center text-[11px] font-semibold text-gray-500 mb-1">
                                            <span>Price (Rs. optional)</span>
                                            <InfoTooltip content={WIZARD_HELP_CONTENT.colorPricingStockGrid} />
                                        </label>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs.</span>
                                            <input
                                                type="number"
                                                value={color.price ?? ''}
                                                onChange={(e) => {
                                                    const updatedColors = [...formData.colors];
                                                    updatedColors[idx] = { ...color, price: e.target.value };
                                                    onChange({ ...formData, colors: updatedColors });
                                                }}
                                                min="0"
                                                placeholder="Same as base"
                                                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-2.5 text-xs text-gray-900 outline-none focus:border-[#2F6FED]"
                                            />
                                        </div>
                                    </div>

                                    <div className="w-28">
                                        <label className="flex items-center text-[11px] font-semibold text-gray-500 mb-1">
                                            <span>Stock Qty</span>
                                            <InfoTooltip content={WIZARD_HELP_CONTENT.stock} />
                                        </label>
                                        <input
                                            type="number"
                                            value={color.stock ?? 0}
                                            onChange={(e) => {
                                                const updatedColors = [...formData.colors];
                                                updatedColors[idx] = { ...color, stock: Number(e.target.value) };
                                                onChange({ ...formData, colors: updatedColors });
                                            }}
                                            min="0"
                                            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-[#2F6FED]"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 sm:pt-0">
                                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={color.inStock !== false}
                                                onChange={(e) => {
                                                    const updatedColors = [...formData.colors];
                                                    updatedColors[idx] = { ...color, inStock: e.target.checked };
                                                    onChange({ ...formData, colors: updatedColors });
                                                }}
                                                className="h-4 w-4 rounded border-gray-300 text-[#2F6FED] focus:ring-[#2F6FED]"
                                            />
                                            In Stock
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SECTION 3: Metallic Stand Upgrade Price */}
            {formData.hasMetallicStand && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <FiSliders size={15} />
                            </span>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                                    <span>Metallic Stand Upgrade Price</span>
                                    <InfoTooltip content={WIZARD_HELP_CONTENT.metallicStandFee} />
                                </h4>
                                <p className="text-xs text-gray-500">Configure additional fee charged when customer selects metallic stand upgrade</p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                            Upgrade Enabled
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                                <span>Stand Option Label</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.metallicStandFee} />
                            </label>
                            <input
                                type="text"
                                value={formData.metallicStandName || 'Metallic Stand'}
                                onChange={(e) => handleFieldChange('metallicStandName', e.target.value)}
                                className="block w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none focus:border-[#2F6FED]"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                                <span>Additional Upgrade Fee (Rs.)</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.metallicStandFee} />
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs.</span>
                                <input
                                    type="number"
                                    value={formData.metallicStandPrice || '3500'}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const updatedStandTypes = [{ type: 'Metallic', price: val, images: formData.metallicStandImages || [] }];
                                        onChange({
                                            ...formData,
                                            metallicStandPrice: val,
                                            standTypes: updatedStandTypes
                                        });
                                    }}
                                    min="0"
                                    step="0.01"
                                    placeholder="3500"
                                    className="block w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3.5 text-sm text-gray-900 outline-none focus:border-[#2F6FED]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 4: Interactive Dynamic Price Calculator */}
            <DynamicPriceCalculator
                basePrice={actual}
                isDiscountEnabled={formData.isDiscountEnabled}
                discountPrice={discount}
                colors={formData.colors || []}
                standTypes={formData.standTypes || []}
            />

            {/* SECTION 3: Specifications & Features */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2F6FED]">
                            <FiList size={15} />
                        </span>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                                <span>Specifications & Features</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.specificationsList} />
                            </h4>
                            <p className="text-xs text-gray-500">Rich formatted technical specifications, features, and parameter tables</p>
                        </div>
                    </div>
                </div>

                <RichTextEditor
                    value={
                        typeof formData.specifications === 'string'
                            ? formData.specifications
                            : Array.isArray(formData.specifications) && formData.specifications.length > 0
                            ? (formData.specifications.every(s => typeof s === 'string' && s.startsWith('<'))
                                ? formData.specifications.join('')
                                : `<ul>${formData.specifications.filter(s => s && s.trim()).map(s => `<li>${s}</li>`).join('')}</ul>`)
                            : ''
                    }
                    onChange={(html) => onChange({ ...formData, specifications: html })}
                    placeholder="Create custom specification tables, feature bullet points, and technical parameter matrices..."
                />
            </div>

            {/* SECTION 4: Shipping & Dimensions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <FiTruck size={15} />
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                        <span>Shipping & Package Specs</span>
                        <InfoTooltip content={WIZARD_HELP_CONTENT.shippingDimensions} />
                    </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Weight */}
                    <div>
                        <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                            <span>Weight (kg)</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.shippingWeight} />
                        </label>
                        <input
                            type="number"
                            value={formData.shippingWeight || ''}
                            onChange={(e) => handleFieldChange('shippingWeight', e.target.value)}
                            min="0"
                            step="0.1"
                            placeholder="22.5"
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED]"
                        />
                    </div>

                    {/* Length */}
                    <div>
                        <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                            <span>Length (cm)</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.shippingDimensions} />
                        </label>
                        <input
                            type="number"
                            value={formData.shippingDimensions?.length || ''}
                            onChange={(e) => handleFieldChange('shippingDimensions', { ...formData.shippingDimensions, length: e.target.value })}
                            min="0"
                            placeholder="85"
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED]"
                        />
                    </div>

                    {/* Width */}
                    <div>
                        <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                            <span>Width (cm)</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.shippingDimensions} />
                        </label>
                        <input
                            type="number"
                            value={formData.shippingDimensions?.width || ''}
                            onChange={(e) => handleFieldChange('shippingDimensions', { ...formData.shippingDimensions, width: e.target.value })}
                            min="0"
                            placeholder="65"
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED]"
                        />
                    </div>

                    {/* Height */}
                    <div>
                        <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                            <span>Height (cm)</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.shippingDimensions} />
                        </label>
                        <input
                            type="number"
                            value={formData.shippingDimensions?.height || ''}
                            onChange={(e) => handleFieldChange('shippingDimensions', { ...formData.shippingDimensions, height: e.target.value })}
                            min="0"
                            placeholder="35"
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingInventoryStep;
