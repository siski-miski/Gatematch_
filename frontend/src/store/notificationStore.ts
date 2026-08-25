import { create } from 'zustand';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface NotificationState {
    unreadCount: number;
    toasts: Toast[];
    setUnreadCount: (n: number) => void;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    removeToast: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    unreadCount: 0,
    toasts: [],
    setUnreadCount: (n) => set({ unreadCount: n }),
    addToast: (message, type = 'info') => {
        const id = Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 4000);
    },
    removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
