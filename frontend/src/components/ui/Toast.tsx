import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../../store/notificationStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
    const { toasts, removeToast } = useNotificationStore();

    const icons = {
        success: <CheckCircle size={16} className="text-green-custom" />,
        error: <AlertCircle size={16} className="text-red-custom" />,
        info: <Info size={16} className="text-gold" />,
    };

    return (
        <div className="fixed top-20 right-4 z-[10000] flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="flex items-center gap-3 px-4 py-3 bg-navy-mid border border-border-light rounded-xl shadow-lg min-w-[280px]"
                    >
                        {icons[toast.type]}
                        <span className="text-sm text-white-custom flex-1">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="text-slate-custom hover:text-white-custom bg-transparent border-none cursor-pointer">
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
