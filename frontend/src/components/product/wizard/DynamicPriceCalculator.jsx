import React, { useState } from 'react';
import { FiDollarSign, FiPlus, FiCheck } from 'react-icons/fi';
import InfoTooltip from './InfoTooltip';
import { WIZARD_HELP_CONTENT } from './productWizardHelpContent';

const DynamicPriceCalculator = ({
    basePrice = 0,
    isDiscountEnabled = false,
    discountPrice = 0,
    colors = [],
    standTypes = []
}) => {
    const [selectedColorIdx, setSelectedColorIdx] = useState(0);
    const [isStandSelected, setIsStandSelected] = useState(false);

    // Calculate effective base price
    const effectiveBasePrice = (isDiscountEnabled && Number(discountPrice) > 0)
        ? Number(discountPrice)
        : Number(basePrice || 0);

    const colorsList = Array.isArray(colors) ? colors : [];
    const standTypesList = Array.isArray(standTypes) ? standTypes : [];

    const selectedColor = colorsList[selectedColorIdx] || null;
    let colorAddonPrice = 0;
    if (selectedColor && selectedColor.price !== undefined && selectedColor.price !== null) {
        const cp = Number(selectedColor.price) || 0;
        const bp = Number(effectiveBasePrice || 0);
        const abp = Number(basePrice || 0);
        if (cp === bp || cp === abp || cp === 0) {
            colorAddonPrice = 0;
        } else {
            colorAddonPrice = cp;
        }
    }

    const metallicStand = standTypesList.find(st => st.type === 'Metallic') || null;
    const standAddonPrice = isStandSelected && metallicStand ? Number(metallicStand.price || 0) : 0;

    const finalCalculatedPrice = effectiveBasePrice + colorAddonPrice + standAddonPrice;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold">
                        <FiDollarSign size={16} />
                    </span>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 flex items-center">
                            <span>Dynamic Live Pricing Preview</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.dynamicPriceCalculator} />
                        </h4>
                        <p className="text-xs text-gray-400">Calculates customer checkout total instantly</p>
                    </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Live Calculation
                </span>
            </div>

            {/* Test Controls */}
            <div className="grid sm:grid-cols-2 gap-3 mb-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                {/* Color Selector */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Test Color Variant</label>
                    <select
                        value={selectedColorIdx}
                        onChange={(e) => setSelectedColorIdx(Number(e.target.value))}
                        disabled={colorsList.length === 0}
                        className="w-full text-xs rounded-lg border border-gray-200 bg-white p-2 text-gray-800 font-medium outline-none focus:border-[#2F6FED]"
                    >
                        {colorsList.length > 0 ? (
                            colorsList.map((c, i) => (
                                <option key={i} value={i}>
                                    {c.name || `Color #${i+1}`} ({c.price ? `Rs. ${c.price}` : 'Default Price'})
                                </option>
                            ))
                        ) : (
                            <option value={0}>No colors configured</option>
                        )}
                    </select>
                </div>

                {/* Stand Toggle */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Test Metallic Stand Upgrade</label>
                    <button
                        type="button"
                        disabled={!metallicStand}
                        onClick={() => setIsStandSelected(prev => !prev)}
                        className={`w-full text-xs rounded-lg border p-2 font-medium flex items-center justify-between transition ${
                            isStandSelected && metallicStand
                                ? "bg-[#2F6FED] text-white border-[#2F6FED]"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                        } ${!metallicStand ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <span>Metallic Stand {metallicStand ? `(+Rs. ${metallicStand.price || 0})` : '(Disabled)'}</span>
                        {isStandSelected && metallicStand && <FiCheck size={14} />}
                    </button>
                </div>
            </div>

            {/* Calculation Flow */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-emerald-50/70 p-4 rounded-xl border border-blue-100 text-xs sm:text-sm font-semibold text-gray-800">
                <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-normal">Base:</span>
                    <span className="text-gray-900 font-bold">Rs. {effectiveBasePrice.toLocaleString()}</span>
                </div>

                <FiPlus className="text-gray-400" />

                <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-normal">Color Add-on:</span>
                    <span className="text-gray-900 font-bold">Rs. {colorAddonPrice.toLocaleString()}</span>
                </div>

                <FiPlus className="text-gray-400" />

                <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-normal">Stand:</span>
                    <span className="text-gray-900 font-bold">Rs. {standAddonPrice.toLocaleString()}</span>
                </div>

                <span className="text-gray-400 font-bold">=</span>

                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
                    <span className="text-emerald-700 font-normal">Final Total:</span>
                    <span className="text-emerald-700 font-extrabold text-base">Rs. {finalCalculatedPrice.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default DynamicPriceCalculator;
