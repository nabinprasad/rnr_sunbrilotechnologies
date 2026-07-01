import api from "./api";

export const getEvent = () => api.get("/activities");

export const updateEvent = (id, data) =>
  api.put(`/activities/${id}`, data);