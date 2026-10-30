import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:63080/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Uploaded machine photos/videos are served from the backend's own origin
 * (e.g. /uploads/photos/xxx.jpg), not the frontend's. Local sample assets
 * (/machines/...) and already-absolute URLs pass through unchanged.
 */
export function resolveMediaUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/uploads/')) return `${API_ORIGIN}${path}`;
  return path;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
// Render's free tier sleeps when idle; the first request after that fails
// (network error / 502 / 503) while the server boots, which takes up to ~60s.
// Retry reads so a first-time visitor sees data instead of an empty page.
const MAX_WAKE_RETRIES = 12;
const WAKE_RETRY_DELAY_MS = 5000;

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config;
    const status = error.response?.status;
    const serverAsleep = !error.response || status === 502 || status === 503 || status === 504;
    if (config && config.method === 'get' && serverAsleep && (config.__retryCount || 0) < MAX_WAKE_RETRIES) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      return new Promise((resolve) => setTimeout(resolve, WAKE_RETRY_DELAY_MS)).then(() => apiClient(config));
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
