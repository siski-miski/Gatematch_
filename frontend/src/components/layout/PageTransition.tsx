import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
