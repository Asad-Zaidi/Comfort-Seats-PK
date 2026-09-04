import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../../components/animations/AnimationConfigs';

const AnimatedButton = ({ 
    children, 
    onClick, 
    disabled = false, 
    variant = 'primary',
    className = "",
    style = {},
    ...props 
}) => {
    const shouldAnimate = !prefersReducedMotion();

    const baseClasses = "flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-sm transition-all duration-300";
    
    const variantStyles = {
        primary: { backgroundColor: 'var(--btn-primary-bg, var(--primary))', color: 'var(--btn-primary-text, #ffffff)' },
        secondary: { backgroundColor: 'var(--btn-secondary-bg, var(--secondary))', color: 'var(--btn-secondary-text, #ffffff)' },
        outline: { backgroundColor: 'var(--btn-outline-bg, transparent)', color: 'var(--btn-outline-text, var(--primary))', border: '2px solid var(--btn-outline-border, var(--primary))' },
        danger: { backgroundColor: 'var(--btn-danger-bg, #E5484D)', color: 'var(--btn-danger-text, #ffffff)' },
    };

    return (
        <motion.button
            whileHover={shouldAnimate && !disabled ? { 
                scale: 1.02, 
                y: -2,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            } : {}}
            whileTap={shouldAnimate && !disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled}
            style={{ ...variantStyles[variant], ...style }}
            className={`
                ${baseClasses}
                disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none
                ${disabled ? 'pointer-events-none opacity-60' : ''}
                ${className}
            `}
            {...props}
        >
            <motion.span
                className="flex items-center gap-2"
                initial={false}
            >
                {children}
            </motion.span>
        </motion.button>
    );
};

export const AnimatedActionButton = ({ onClick, children, disabled, variant = 'primary', className = "", ...props }) => {
    return (
        <AnimatedButton
            onClick={onClick}
            disabled={disabled}
            variant={variant}
            className={className}
            {...props}
        >
            {children}
        </AnimatedButton>
    );
};

export const AnimatedIconButton = ({ 
    children, 
    onClick, 
    disabled = false, 
    className = "",
    ...props 
}) => {
    const shouldAnimate = !prefersReducedMotion();

    return (
        <motion.button
            whileHover={shouldAnimate && !disabled ? { scale: 1.05, rotate: 5 } : {}}
            whileTap={shouldAnimate && !disabled ? { scale: 0.95, rotate: -5 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={`
                inline-flex items-center justify-center rounded-xl border-2 p-3 
                transition-all duration-300
                border-gray-200 bg-white text-gray-600 
                hover:border-[#2F6FED] hover:text-[#2F6FED] hover:shadow-sm
                disabled:cursor-not-allowed disabled:opacity-50
                ${className}
            `}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default AnimatedButton;