import api, { publicApi } from "./api";

// Get tambola session (public)
export const getTambolaSession = () => publicApi.get("/tambola/session");

// Start tambola session (admin)
export const startTambolaSession = () => api.post("/tambola/session/start");

// Call tambola number (admin)
export const callTambolaNumber = () => api.post("/tambola/session/call");

// End tambola session (admin)
export const endTambolaSession = () => api.post("/tambola/session/end");

// Reset tambola session (admin)
export const resetTambolaSession = () => api.post("/tambola/session/reset");

// Get tambola ticket (public/employee)
export const getTambolaTicket = (employeeId) =>
  publicApi.get(`/tambola/ticket/${employeeId}`);

// Get tambola tickets (admin)
export const getTambolaTickets = () => api.get("/tambola/tickets");

// Submit tambola claim (public/employee)
export const submitTambolaClaim = (data) => publicApi.post("/tambola/claim", data);

// Get tambola claims (admin)
export const getTambolaClaims = () => api.get("/tambola/claims");

// Review tambola claim (admin)
export const reviewTambolaClaim = (claimId, action) =>
  api.put(`/tambola/claims/${claimId}`, { action });
