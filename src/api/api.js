import axios from "axios";

const apiBaseUrl = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "https://rnrapi-test.sunbrilotechnologies.com/api";

console.log("🔌 API Base URL:", apiBaseUrl);

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Automatically attach JWT Token
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

// Handle Unauthorized Response
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

export default api;