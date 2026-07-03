import api from "./api";

export const getAwards = () => api.get("/awards");

export const createAward = (data) => api.post("/awards", data);

export const updateAward = (id, data) => api.put(`/awards/${id}`, data);

export const assignWinners = (id, employeeIds) => api.post(`/awards/${id}/assign`, { employeeIds });

export const assignNominees = (id, employeeIds) => api.post(`/awards/${id}/nominees`, { employeeIds });

export const deleteAward = (id) => api.delete(`/awards/${id}`);
