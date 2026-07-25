import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../components/animations/AnimationConfigs';

const AnimatedVariantSelector = ({ 
    label, 
    options, 
    selectedValue, 
    onSelect, 
    renderOption,
    className = "" 
}) => {
    const shouldAnimate = !prefersReducedMotion();

    const containerVariants = {
        hidden: shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: shouldAnimate ? { opacity: 0, scale: 0.95 } : { opacity: 1 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
            },
        },
    };

    if (!options || options.length === 0) return null;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {label && (
                <span className="mb-3 block text-sm font-semibold text-[#12131A]">
                    {label}
                </span>
            )}
            <div className="flex flex-wrap gap-2.5">
                {options.map((option, idx) => (
                    <motion.button
                        key={option.value || idx}
                        variants={itemVariants}
                        whileHover={shouldAnimate ? { scale: 1.03, y: -1 } : {}}
                        whileTap={shouldAnimate ? { scale: 0.97 } : {}}
                        type="button"
                        onClick={() => onSelect(option.value)}
                        className={`
                            relative flex items-center gap-2 rounded-xl border-2 px-3.5 py-2.5 text-sm font-semibold
                            transition-all duration-200
                            ${selectedValue === option.value
                                ? 'border-[#2F6FED] bg-[#2F6FED]/5 text-[#2F6FED] shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                            }
                            ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        disabled={option.disabled}
                    >
                        {renderOption ? renderOption(option, selectedValue === option.value) : (
                            <>
                                {option.swatch && (
                                    <span
                                        className={`h-5 w-5 rounded-full border-2 shrink-0 ${
                                            selectedValue === option.value ? 'border-[#2F6FED]' : 'border-gray-200'
                                        }`}
                                        style={{ backgroundColor: option.swatch || '#CCCCCC' }}
                                    />
                                )}
                                <span className="whitespace-nowrap">{option.label}</span>
                            </>
                        )}

                        {/* Active indicator */}
                        {selectedValue === option.value && !option.disabled && (
                            <motion.span
                                layoutId={`activeIndicator_${label || 'default'}`}
                                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2F6FED] text-[8px] text-white shadow-sm"
                            >
                                ✓
                            </motion.span>
                        )}

                        {/* Out of stock indicator */}
                        {option.disabled && (
                            <span className="text-[10px] text-gray-400 font-medium">(OOS)</span>
                        )}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

export default AnimatedVariantSelector;