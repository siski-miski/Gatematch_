import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const AUTH_PAGES = ['/login', '/register', '/forgot-password'];
const PROTECTED_PATH_PREFIXES = ['/dashboard', '/profile/me', '/admin', '/messages'];

const client = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Auto refresh interceptor
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl: string = originalRequest?.url ?? '';
        const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;
            try {
                await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
                return client(originalRequest);
            } catch {
                const path = window.location.pathname;
                const onAuthPage = AUTH_PAGES.includes(path);
                const onProtectedPage = PROTECTED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));

                if (!onAuthPage && onProtectedPage) {
                    window.location.assign('/login');
                }
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default client;
