import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'https://isinhvien-backend-ohq9.onrender.com/api/v1';

// Auto-append /api/v1 if it is missing
if (API_URL && !API_URL.endsWith('/api/v1') && !API_URL.endsWith('/api/v1/')) {
  const sanitized = API_URL.replace(/\/$/, '');
  API_URL = `${sanitized}/api/v1`;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we have not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Call refresh token endpoint directly (not using the interceptor instance to avoid loops)
          const res = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (res.status === 200 && res.data?.data?.accessToken) {
            const { accessToken } = res.data.data;
            localStorage.setItem('accessToken', accessToken);

            // Update header and retry
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token expired or invalid -> log out
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
        }
      }
    }

    return Promise.reject(error);
  }
);
