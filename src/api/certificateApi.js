import api from "./api";

export const getCertificates = () => api.get("/certificates");

export const getCertificate = (id) => api.get(`/certificates/${id}`);

export const addCertificate = (data) =>
    api.post("/certificates", data);

export const updateCertificate = (id, data) =>
    api.put(`/certificates/${id}`, data);

export const deleteCertificate = (id) =>
    api.delete(`/certificates/${id}`);