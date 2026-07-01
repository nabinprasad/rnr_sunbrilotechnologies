import api from "./api";

export const getEvent = () => api.get("/event");

export const updateEvent = (data) =>
  api.put(`/event`, data);