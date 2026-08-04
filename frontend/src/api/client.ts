import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL as string;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
});

let csrfReady: Promise<void> | null = null;

/** Sanctum SPA auth requires a CSRF cookie before the first state-changing request. */
export async function ensureCsrfCookie() {
  if (!csrfReady) {
    csrfReady = axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true }).then(() => undefined);
  }
  return csrfReady;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method ?? 'get').toLowerCase();
  if (method !== 'get') {
    await ensureCsrfCookie();
  }
  return config;
});

export function googleLoginUrl() {
  return `${API_URL}/auth/google/redirect`;
}
