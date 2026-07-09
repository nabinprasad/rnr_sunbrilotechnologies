import api, { publicApi } from "./api";

// Get activities (public)
export const getActivities = () => publicApi.get("/activities");

// Add activity (admin)
export const addActivity = (data) =>
  api.post("/activities", data);

// Update activity (admin)
export const updateActivity = (id, data) =>
  api.put(`/activities/${id}`, data);

// Delete activity (admin)
export const deleteActivity = (id) =>
  api.delete(`/activities/${id}`);