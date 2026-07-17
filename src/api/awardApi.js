import api, { publicApi } from "./api";

// Get awards (public)
export const getAwards = () => publicApi.get("/awards");

// Create award (admin)
export const createAward = (data) => api.post("/awards", data);

// Update award (admin)
export const updateAward = (id, data) => api.put(`/awards/${id}`, data);

// Assign winners (admin)
export const assignWinners = (id, employeeIds) => api.post(`/awards/${id}/assign`, { employeeIds });

// Assign nominees (admin)
export const assignNominees = (id, employeeIds) => api.post(`/awards/${id}/nominees`, { employeeIds });

// Delete award (admin)
export const deleteAward = (id) => api.delete(`/awards/${id}`);
