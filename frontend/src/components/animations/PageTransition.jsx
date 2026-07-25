import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * PageTransition — wraps page content with professional entrance
 * and exit animations.
 *
 * On mount:  fades in + slides up from 20px
 * On unmount: fades out + slides down
 *
 * Usage:
 *   <PageTransition>
 *     <YourPageContent />
 *   </PageTransition>
 */
const PageTransition = ({ children }) => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                    duration: 0.45,
                    ease: [0.25, 0.1, 0.25, 1],
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default PageTransition;
