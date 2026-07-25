import React from 'react';
import { FiGlobe, FiSend, FiZap, FiCalendar } from 'react-icons/fi';
import SearchPreview from './SearchPreview';
import SocialPreview from './SocialPreview';
import InfoTooltip from './InfoTooltip';
import { WIZARD_HELP_CONTENT } from './productWizardHelpContent';

const SeoPublishingStep = ({
    formData,
    onChange,
    errors = {},
    submitting = false
}) => {
    const handleFieldChange = (field, value) => {
        onChange({ ...formData, [field]: value });
    };

    // Auto-fill SEO metadata from product name & short description
    const handleAutoFillSeo = () => {
        const nameVal = formData.name || "";
        const descVal = formData.shortDescription || formData.description || "";
        const catVal = formData.category || "";
        const colorsList = (formData.colors || []).map(c => c.name).filter(Boolean).join(", ");

        onChange({
            ...formData,
            metaTitle: nameVal ? `${nameVal} | Comfort Seats PK` : formData.metaTitle,
            metaDescription: descVal ? descVal.substring(0, 155) : formData.metaDescription,
            metaKeywords: [catVal, nameVal, colorsList, "gaming chair", "ergonomic chair"].filter(Boolean).join(", "),
            metaOgTitle: nameVal,
            metaOgDescription: descVal ? descVal.substring(0, 155) : formData.metaOgDescription,
            canonicalUrl: formData.slug ? `https://comfortseatspk.com/product/${formData.slug}` : ""
        });
    };

    // Get cover image preview URL
    const getCoverImagePreview = () => {
        if (formData.metaOgImage) return formData.metaOgImage;

        const productImgs = formData.productImages || [];
        const cover = productImgs.find(img => img?.isCover) || productImgs.find(img => img && (img.preview || img.url));
        if (cover) {
            return cover.preview || cover.url || "";
        }

        const colorsList = formData.colors || [];
        for (const c of colorsList) {
            const cImgs = c.images || [];
            const cCover = cImgs.find(img => img?.isCover) || cImgs.find(img => img && (img.preview || img.url));
            if (cCover) {
                return cCover.preview || cCover.url || "";
            }
        }

        return "";
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Step 4 Header Info */}
            <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">
                    4
                </span>
                <div>
                    <h3 className="text-base font-bold text-gray-900">Step 4 — SEO & Publishing</h3>
                    <p className="text-xs text-gray-600">
                        Optimize search engine visibility, inspect live Google & social card previews, and choose publishing parameters.
                    </p>
                </div>
            </div>

            {/* SECTION 1: Search Engine Optimization */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2F6FED]">
                            <FiGlobe size={15} />
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                            <span>SEO Meta Fields</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.metaTitle} />
                        </h4>
                    </div>

                    <button
                        type="button"
                        onClick={handleAutoFillSeo}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#2F6FED] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                    >
                        <FiZap size={13} />
                        <span>Auto-fill from Product</span>
                        <InfoTooltip content={WIZARD_HELP_CONTENT.autoFillSeoBtn} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Meta Title */}
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="flex items-center text-sm font-semibold text-gray-800">
                                <span>Meta Title</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.metaTitle} />
                            </label>
                            <span className={`text-xs ${(formData.metaTitle || '').length > 60 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                                {(formData.metaTitle || '').length}/60 chars
                            </span>
                        </div>
                        <input
                            type="text"
                            value={formData.metaTitle || ''}
                            onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
                            maxLength={70}
                            placeholder={formData.name ? `${formData.name} | Comfort Seats PK` : "Executive Gaming Chair | Comfort Seats PK"}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:bg-white"
                        />
                    </div>

                    {/* Meta Description */}
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="flex items-center text-sm font-semibold text-gray-800">
                                <span>Meta Description</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.metaDescription} />
                            </label>
                            <span className={`text-xs ${(formData.metaDescription || '').length > 160 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                                {(formData.metaDescription || '').length}/160 chars
                            </span>
                        </div>
                        <textarea
                            value={formData.metaDescription || ''}
                            onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
                            maxLength={170}
                            rows={3}
                            placeholder="Buy executive ergonomic gaming chair in Pakistan with metallic stand option. Free nationwide shipping..."
                            className="block w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:bg-white"
                        />
                    </div>

                    {/* Meta Keywords */}
                    <div>
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>Meta Keywords</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.metaKeywords} />
                        </label>
                        <input
                            type="text"
                            value={formData.metaKeywords || ''}
                            onChange={(e) => handleFieldChange('metaKeywords', e.target.value)}
                            placeholder="gaming chair, ergonomic chair, comfort seats"
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:bg-white"
                        />
                    </div>

                    {/* Canonical URL */}
                    <div>
                        <label className="mb-1.5 flex items-center text-sm font-semibold text-gray-800">
                            <span>Canonical URL</span>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.canonicalUrl} />
                        </label>
                        <input
                            type="text"
                            value={formData.canonicalUrl || ''}
                            onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
                            placeholder="https://comfortseatspk.com/product/..."
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2F6FED] focus:bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 2: Live Search & Social Previews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Search Preview */}
                <SearchPreview
                    metaTitle={formData.metaTitle}
                    name={formData.name}
                    metaDescription={formData.metaDescription}
                    shortDescription={formData.shortDescription}
                    description={formData.description}
                    slug={formData.slug}
                    category={formData.category}
                />

                {/* Social Preview */}
                <SocialPreview
                    metaOgTitle={formData.metaOgTitle}
                    metaTitle={formData.metaTitle}
                    name={formData.name}
                    metaOgDescription={formData.metaOgDescription}
                    metaDescription={formData.metaDescription}
                    shortDescription={formData.shortDescription}
                    imagePreview={getCoverImagePreview()}
                />
            </div>

            {/* SECTION 3: Publishing Parameters */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <FiSend size={15} />
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Publishing Status</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Active / Publish Immediately */}
                    <button
                        type="button"
                        onClick={() => handleFieldChange('status', 'Active')}
                        className={`p-4 rounded-xl border text-left transition ${
                            (formData.status || 'Active') === 'Active'
                                ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900 flex items-center">
                                <span>Publish Immediately</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.publishStatusActive} />
                            </span>
                            <span className={`h-3 w-3 rounded-full ${ (formData.status || 'Active') === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        </div>
                        <p className="text-xs text-gray-500">Product will be live on website immediately after saving</p>
                    </button>

                    {/* Save as Draft */}
                    <button
                        type="button"
                        onClick={() => handleFieldChange('status', 'Draft')}
                        className={`p-4 rounded-xl border text-left transition ${
                            formData.status === 'Draft'
                                ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-sm"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900 flex items-center">
                                <span>Save as Draft</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.publishStatusDraft} />
                            </span>
                            <span className={`h-3 w-3 rounded-full ${ formData.status === 'Draft' ? 'bg-amber-500' : 'bg-gray-300'}`} />
                        </div>
                        <p className="text-xs text-gray-500">Hidden from storefront until published</p>
                    </button>

                    {/* Schedule Publishing */}
                    <button
                        type="button"
                        onClick={() => handleFieldChange('status', 'Scheduled')}
                        className={`p-4 rounded-xl border text-left transition ${
                            formData.status === 'Scheduled'
                                ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-sm"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900 flex items-center">
                                <span>Schedule</span>
                                <InfoTooltip content={WIZARD_HELP_CONTENT.publishStatusScheduled} />
                            </span>
                            <span className={`h-3 w-3 rounded-full ${ formData.status === 'Scheduled' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        </div>
                        <p className="text-xs text-gray-500">Set a future publication date and time</p>
                    </button>
                </div>

                {formData.status === 'Scheduled' && (
                    <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <FiCalendar className="text-blue-600" size={18} />
                            <div>
                                <span className="text-xs font-semibold text-gray-800 flex items-center">
                                    <span>Publication Date & Time</span>
                                    <InfoTooltip content={WIZARD_HELP_CONTENT.publishScheduleDate} />
                                </span>
                                <p className="text-[11px] text-gray-500">Auto-publish product when time arrives</p>
                            </div>
                        </div>
                        <input
                            type="datetime-local"
                            value={formData.publishDate || ''}
                            onChange={(e) => handleFieldChange('publishDate', e.target.value)}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 outline-none"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeoPublishingStep;
