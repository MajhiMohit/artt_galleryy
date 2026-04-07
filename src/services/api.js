import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://arttgalleryybackend-production.up.railway.app/api",
  timeout: 15000,
});


// ── Request Interceptor: attach JWT token ─────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const rawToken = localStorage.getItem("gallery_token") || "";
    const token = rawToken.replace(/^Bearer\s+/i, "").trim();
    const url = (config.url || "").toLowerCase();

    const isAuthRoute =
      url.includes("/users/login") ||
      url.includes("/users/register") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register");

    const isPublicUsersRoute = url.includes("/users");

    if (token && !isAuthRoute && !isPublicUsersRoute) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: unified error handling ──────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Token expired or invalid — clear session and redirect to login
      localStorage.removeItem("gallery_user");
      localStorage.removeItem("gallery_token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    const serverMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      (typeof error?.response?.data === "string"
        ? error.response.data
        : null);

    const normalizedMessage =
      serverMessage ||
      (status === 403
        ? "You do not have permission to perform this action."
        : null) ||
      (status === 404
        ? "The requested resource was not found."
        : null) ||
      (status >= 500
        ? "Server error. Please try again later."
        : null) ||
      (!error.response
        ? "Network error. Check your connection or backend server."
        : null) ||
      "Something went wrong. Please try again.";

    error.displayMessage = normalizedMessage;
    return Promise.reject(error);
  }
);

// ── Helper: extract display message from caught error ────────────────────
export const getApiError = (
  err,
  fallback = "An error occurred. Please try again."
) => err?.displayMessage || fallback;

export default API;