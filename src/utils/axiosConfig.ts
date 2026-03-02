import axios from 'axios';

// Tạo axios instance với base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Request Interceptor: Tự động gắn JWT Token vào header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý lỗi 401 (token hết hạn)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ → xóa data và chuyển về login
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Chỉ redirect nếu không phải đang ở trang login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
