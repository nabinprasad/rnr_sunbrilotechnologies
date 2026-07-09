import api, { publicApi } from "./api";

// Get certificates (public)
export const getCertificates = () => publicApi.get("/certificates");

// Get certificate (public)
export const getCertificate = (id) => publicApi.get(`/certificates/${id}`);

// Add certificate (admin)
export const addCertificate = (data) =>
    api.post("/certificates", data);

// Update certificate (admin)
export const updateCertificate = (id, data) =>
    api.put(`/certificates/${id}`, data);

// Delete certificate (admin)
export const deleteCertificate = (id) =>
    api.delete(`/certificates/${id}`);