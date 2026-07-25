import React from 'react';
import { FiCheck, FiInfo, FiImage, FiDollarSign, FiGlobe } from 'react-icons/fi';

const STEPS = [
    {
        id: 1,
        title: "Basic Information",
        subtitle: "General, category & colors",
        icon: FiInfo,
    },
    {
        id: 2,
        title: "Images & Variants",
        subtitle: "Product & variant gallery",
        icon: FiImage,
    },
    {
        id: 3,
        title: "Pricing & Inventory",
        subtitle: "Breakdown & live preview",
        icon: FiDollarSign,
    },
    {
        id: 4,
        title: "SEO & Publishing",
        subtitle: "Search preview & publish",
        icon: FiGlobe,
    },
];

const StepIndicator = ({ currentStep = 1, completedSteps = [], onStepClick = () => {} }) => {
    const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

    return (
        <div className="w-full bg-white border-b border-gray-100 px-4 py-5 sm:px-8">
            {/* Top Step Summary & Progress Bar */}
            <div className="max-w-7xl mx-auto mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#2F6FED]">
                        Step {currentStep} of {STEPS.length}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">
                        {STEPS[currentStep - 1]?.title}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <span className="text-xs text-gray-500 font-medium">Completion Progress</span>
                        <p className="text-sm font-bold text-gray-800">{progressPercent}% Completed</p>
                    </div>
                    <div className="w-32 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-[#2F6FED] h-2.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Stepper Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {STEPS.map((step) => {
                    const isCurrent = step.id === currentStep;
                    const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
                    const isClickable = isCompleted || step.id <= currentStep;
                    const StepIcon = step.icon;

                    return (
                        <button
                            key={step.id}
                            type="button"
                            disabled={!isClickable}
                            onClick={() => isClickable && onStepClick(step.id)}
                            className={`group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-200 ${
                                isCurrent
                                    ? "bg-blue-50/70 border-[#2F6FED] shadow-sm ring-1 ring-[#2F6FED]/20"
                                    : isCompleted
                                    ? "bg-gray-50/80 border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer"
                                    : "bg-white border-gray-200 opacity-60 cursor-not-allowed"
                            }`}
                        >
                            {/* Step Badge / Icon */}
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm transition-transform group-hover:scale-105 ${
                                    isCompleted
                                        ? "bg-emerald-500 text-white shadow-sm"
                                        : isCurrent
                                        ? "bg-[#2F6FED] text-white shadow-md shadow-blue-500/20"
                                        : "bg-gray-100 text-gray-400 border border-gray-200"
                                }`}
                            >
                                {isCompleted ? <FiCheck size={18} /> : <StepIcon size={18} />}
                            </div>

                            {/* Step Labels */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                        isCurrent ? "text-[#2F6FED]" : isCompleted ? "text-emerald-600" : "text-gray-400"
                                    }`}>
                                        Step {step.id}
                                    </span>
                                </div>
                                <h4 className={`text-sm font-semibold truncate ${
                                    isCurrent ? "text-[#12131A]" : isCompleted ? "text-gray-800" : "text-gray-400"
                                }`}>
                                    {step.title}
                                </h4>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default StepIndicator;
