import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '../../components/animations/AnimationConfigs';

const AnimatedTabs = ({ tabs, activeTab, onTabClick, className = "" }) => {
    const shouldAnimate = !prefersReducedMotion();

    const tabVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
            },
        }),
    };

    return (
        <div className={className}>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab, idx) => (
                    <motion.button
                        key={tab.key}
                        custom={idx}
                        variants={shouldAnimate ? tabVariants : {}}
                        initial={shouldAnimate ? "hidden" : false}
                        animate="visible"
                        onClick={() => onTabClick(tab.key)}
                        className={`relative px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                            activeTab === tab.key
                                ? "text-[#2F6FED]"
                                : "text-gray-500 hover:text-[#2F6FED]"
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.key && (
                            <motion.span
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 h-0.5 w-full bg-[#2F6FED]"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={shouldAnimate ? { opacity: 0, y: 15 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldAnimate ? { opacity: 0, y: -15 } : false}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {tabs.find(t => t.key === activeTab)?.content}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AnimatedTabs;