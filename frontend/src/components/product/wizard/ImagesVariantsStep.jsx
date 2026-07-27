import React from 'react';
import { FiImage, FiLayers, FiSliders, FiAlertCircle } from 'react-icons/fi';
import ProductImageUploader from '../ProductImageUploader';
import ColorVariantCard from '../ColorVariantCard';
import StandTypeCard from '../StandTypeCard';
import InfoTooltip from './InfoTooltip';
import { WIZARD_HELP_CONTENT } from './productWizardHelpContent';

const ImagesVariantsStep = ({
    formData,
    onChange,
    errors = {},
    submitting = false
}) => {
    // Handler to update product images array
    const handleProductImagesChange = (update) => {
        const current = Array.isArray(formData.productImages) ? formData.productImages : [];
        const next = typeof update === 'function' ? update(current) : update;
        onChange({ ...formData, productImages: next });
    };

    // Handler to update color variants
    const handleColorChange = (index, updatedColor) => {
        const updatedColors = (formData.colors || []).map((c, i) => i === index ? updatedColor : c);
        onChange({ ...formData, colors: updatedColors });
    };

    const handleSetDefaultColor = (defaultIndex) => {
        const updatedColors = (formData.colors || []).map((c, i) => ({
            ...c,
            isDefault: i === defaultIndex,
        }));
        onChange({ ...formData, colors: updatedColors });
    };

    const handleRemoveColor = (index) => {
        const currentColors = formData.colors || [];
        const wasDefault = currentColors[index]?.isDefault;
        const updatedColors = currentColors.filter((_, i) => i !== index);
        if (wasDefault && updatedColors.length > 0) {
            updatedColors[0] = { ...updatedColors[0], isDefault: true };
        }
        onChange({ ...formData, colors: updatedColors });
    };

    // Handler to update stand types
    const handleStandTypeChange = (index, updatedStand) => {
        const updatedStandTypes = (formData.standTypes || []).map((s, i) => i === index ? updatedStand : s);
        onChange({ ...formData, standTypes: updatedStandTypes });
    };

    const handleRemoveStandType = (index) => {
        const updatedStandTypes = (formData.standTypes || []).filter((_, i) => i !== index);
        onChange({ ...formData, standTypes: updatedStandTypes });
    };

    const generalImagesCount = (formData.productImages || []).filter(Boolean).length;
    const colorsList = Array.isArray(formData.colors) ? formData.colors : [];
    const standTypesList = (Array.isArray(formData.standTypes) && formData.standTypes.length > 0)
        ? formData.standTypes
        : (formData.hasMetallicStand ? [{ type: 'Metallic', price: formData.metallicStandPrice || '3500', images: formData.metallicStandImages || [] }] : []);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Step 2 Header Info */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
                    2
                </span>
                <div>
                    <h3 className="text-base font-bold text-gray-900">Step 2 — Images & Variants</h3>
                    <p className="text-xs text-gray-600">
                        Upload high-resolution general gallery images, color variant images, and metallic stand upgrade media.
                    </p>
                </div>
            </div>

            {/* SECTION 1: General Product Gallery */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2F6FED]">
                            <FiImage size={15} />
                        </span>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                                <span>General Product Gallery</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.generalGallerySection} />
                            </h4>
                            <p className="text-xs text-gray-500">Main images displayed in product detail slider (At least 1 required)</p>
                        </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        generalImagesCount >= 1 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                        {generalImagesCount} uploaded
                    </span>
                </div>

                <ProductImageUploader
                    images={formData.productImages || []}
                    onImagesChange={handleProductImagesChange}
                    errors={errors.productImages || []}
                    disabled={submitting}
                    label="Product Gallery Images"
                    showValidation={!!errors.productImages}
                />
            </div>

            {/* SECTION 2: Color Variant Images */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                            <FiLayers size={15} />
                        </span>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                                <span>Color Variant Media</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.colorVariantMediaSection} />
                            </h4>
                            <p className="text-xs text-gray-500">Each configured color variant MUST have at least 1 image</p>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 font-semibold">
                        {colorsList.length} color{colorsList.length !== 1 ? 's' : ''} configured
                    </span>
                </div>

                {colorsList.length > 0 ? (
                    <div className="space-y-5">
                        {colorsList.map((color, idx) => (
                            <ColorVariantCard
                                key={`color-var-${idx}`}
                                color={color}
                                index={idx}
                                onChange={handleColorChange}
                                onRemove={handleRemoveColor}
                                onSetDefault={handleSetDefaultColor}
                                errors={errors.colors?.[idx] || {}}
                                disabled={submitting}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <FiAlertCircle className="mx-auto text-amber-500 mb-2" size={24} />
                        <p className="text-sm font-semibold text-gray-800">No Color Variants Configured</p>
                        <p className="text-xs text-gray-500 mt-0.5">Please add at least one color variant in Step 1 to upload variant images.</p>
                    </div>
                )}
            </div>

            {/* SECTION 3: Metallic Stand Upgrade Images */}
            {formData.hasMetallicStand && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <FiSliders size={15} />
                            </span>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                                    <span>Metallic Stand Upgrade Images</span>
                                    <InfoTooltip content={WIZARD_HELP_CONTENT.metallicStandMediaSection} />
                                </h4>
                                <p className="text-xs text-gray-500">Upload images showcasing the chair with metallic stand base option</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {standTypesList.map((st, idx) => (
                            <StandTypeCard
                                key={st.type || idx}
                                standType={st}
                                index={idx}
                                onChange={handleStandTypeChange}
                                onRemove={handleRemoveStandType}
                                errors={errors.standTypes?.[idx] || {}}
                                disabled={submitting}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagesVariantsStep;
