import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: แนบ Token ไปกับทุก Request
axiosInstance.interceptors.request.use((config) => {
  const token = getCookie('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: จัดการ Error ที่เกี่ยวกับ Authentication/Authorization
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // 401 Unauthorized: Token หมดอายุหรือไม่ถูกต้อง
      if (status === 401) {
        console.error('Authentication error: Token expired or invalid');
        deleteCookie('auth-token');

        // Redirect to login only if not already there
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // 403 Forbidden: ไม่มีสิทธิ์เข้าถึง
      if (status === 403) {
        console.error('Authorization error: Insufficient permissions');

        // Show error message (will be handled by toast in components)
        if (typeof window !== 'undefined') {
          // You can dispatch a custom event here if needed
          console.warn('User does not have permission to access this resource');
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;