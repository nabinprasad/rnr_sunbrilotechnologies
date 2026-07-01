import api from "./api";

// Login
export const loginAdmin = (data) => api.post("/auth/login", data);

// Register (optional)
export const registerAdmin = (data) => api.post("/auth/register", data);