import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const base = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
const api = axios.create({ baseURL: base });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('access');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config;
    const canRetry = err.response?.status === 401 && orig && !orig._retry && localStorage.getItem('refresh') && !orig.url.includes('/auth/');
    if (canRetry) {
      orig._retry = true;
      try {
        refreshing = refreshing || axios.post(`${base}/auth/refresh/`, { refresh: localStorage.getItem('refresh') });
        const { data } = await refreshing;
        refreshing = null;
        localStorage.setItem('access', data.access);
        orig.headers.Authorization = `Bearer ${data.access}`;
        return api(orig);
      } catch (e) {
        refreshing = null;
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export function errMsg(err, fallback = 'Something went wrong. Please try again.') {
  const d = err?.response?.data;
  if (!d) return err?.message === 'Network Error' ? 'Cannot reach the server. Make sure the backend is running.' : fallback;
  if (typeof d === 'string') return d.startsWith('<') ? fallback : d;
  if (d.detail) return Array.isArray(d.detail) ? d.detail[0] : d.detail;
  const first = Object.values(d)[0];
  return Array.isArray(first) ? first[0] : typeof first === 'string' ? first : fallback;
}

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reload = useCallback(() => {
    if (!url) return Promise.resolve();
    setLoading(true);
    return api
      .get(url)
      .then((r) => { setData(r.data); setError(null); })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [url]);
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload, setData };
}

export default api;
