import React from 'react';
import { FiChevronLeft, FiChevronRight, FiSave, FiCheckCircle, FiLoader } from 'react-icons/fi';
import InfoTooltip from './InfoTooltip';
import { WIZARD_HELP_CONTENT } from './productWizardHelpContent';

const StepNavigation = ({
    currentStep = 1,
    totalSteps = 4,
    onPrevious = () => {},
    onNext = () => {},
    onSaveDraft = () => {},
    onSubmit = () => {},
    isSubmitting = false,
    isEdit = false,
    draftSavedAt = null
}) => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur-md px-6 py-4 sm:px-8 z-30 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: Previous Step Button */}
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={onPrevious}
                        disabled={isFirstStep || isSubmitting}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
                            isFirstStep
                                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:scale-95 shadow-sm"
                        }`}
                    >
                        <FiChevronLeft size={18} />
                        <span>Previous</span>
                    </button>
                    {!isFirstStep && <InfoTooltip content={WIZARD_HELP_CONTENT.btnPrevious} />}
                </div>

                {/* Center: Auto Save Status Indicator */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    {draftSavedAt ? (
                        <>
                            <FiCheckCircle size={14} className="text-emerald-500" />
                            <span>Auto-saved to local draft ({draftSavedAt})</span>
                        </>
                    ) : (
                        <span>Form progress protected with local auto-save</span>
                    )}
                </div>

                {/* Right: Actions (Save Draft, Next / Submit) */}
                <div className="flex items-center justify-end gap-3">
                    {!isEdit && (
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={onSaveDraft}
                                disabled={isSubmitting}
                                className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-400 active:scale-95 shadow-sm"
                            >
                                <FiSave size={16} />
                                <span>Save Draft</span>
                            </button>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.btnSaveDraft} />
                        </div>
                    )}

                    {isEdit && !isLastStep && (
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 rounded-xl border border-[#2F6FED] bg-white px-5 py-2.5 text-sm font-semibold text-[#2F6FED] shadow-sm transition hover:bg-blue-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FiSave size={16} />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    )}

                    {!isLastStep ? (
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={onNext}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 rounded-xl bg-[#2F6FED] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2F6FED]/90 active:scale-95 disabled:opacity-60"
                            >
                                <span>Next Step</span>
                                <FiChevronRight size={18} />
                            </button>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.btnNext} />
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FiLoader className="animate-spin" size={18} />
                                        <span>{isEdit ? "Updating..." : "Creating..."}</span>
                                    </>
                                ) : (
                                    <span>{isEdit ? "Update Product" : "Create Product"}</span>
                                )}
                            </button>
                            <InfoTooltip content={WIZARD_HELP_CONTENT.btnSubmitProduct} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StepNavigation;
