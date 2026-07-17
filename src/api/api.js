import axios from "axios";

const apiBaseUrl = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "https://rnrapi-test.sunbrilotechnologies.com/api";

console.log("🔌 API Base URL:", apiBaseUrl);

// Admin API instance (with auth and 401 redirect)
const api = axios.create({
  baseURL: apiBaseUrl,
});

// Automatically attach JWT Token to admin requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle Unauthorized Response for admin requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");

      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  }
);

// Public/Employee API instance (no auth, no redirect)
const publicApi = axios.create({
  baseURL: apiBaseUrl,
});

export default api;
export { publicApi };