import axios from "axios";

// Use VITE_API_URL env variable so this works in production too.
// In dev, the Vite proxy rewrites /api → http://localhost:5000/api,
// so baseURL can simply be "/api" — no hardcoded host needed.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler — clear stale token on 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — wipe it so the user is prompted to log in
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on a public page
      if (!window.location.pathname.match(/^\/(login|register)?$/)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
