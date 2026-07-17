import api, { publicApi } from "./api";

// Get event (public)
export const getEvent = () => publicApi.get("/event");

// Update event (admin)
export const updateEvent = (data) =>
  api.put(`/event`, data);