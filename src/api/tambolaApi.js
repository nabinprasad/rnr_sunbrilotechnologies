import api from "./api";

export const getTambolaSession = () => api.get("/tambola/session");

export const startTambolaSession = () => api.post("/tambola/session/start");

export const callTambolaNumber = () => api.post("/tambola/session/call");

export const endTambolaSession = () => api.post("/tambola/session/end");

export const resetTambolaSession = () => api.post("/tambola/session/reset");

export const getTambolaTicket = (employeeId) =>
  api.get(`/tambola/ticket/${employeeId}`);

export const getTambolaTickets = () => api.get("/tambola/tickets");

export const submitTambolaClaim = (data) => api.post("/tambola/claim", data);

export const getTambolaClaims = () => api.get("/tambola/claims");

export const reviewTambolaClaim = (claimId, action) =>
  api.put(`/tambola/claims/${claimId}`, { action });
