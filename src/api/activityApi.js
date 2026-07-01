import api from "./api";

export const getActivities = () => api.get("/activities");

export const addActivity = (data) =>
  api.post("/activities", data);

export const updateActivity = (id, data) =>
  api.put(`/activities/${id}`, data);

export const deleteActivity = (id) =>
  api.delete(`/activities/${id}`);