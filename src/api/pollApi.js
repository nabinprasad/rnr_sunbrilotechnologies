import api, { publicApi } from "./api";

// Get all polls (public)
export const getPolls = () => publicApi.get("/polls");

// Get active poll (public)
export const getActivePoll = () => publicApi.get("/polls/active");

// Get poll votes (public)
export const getPollVotes = () => publicApi.get("/polls/votes");

// Create poll (admin)
export const createPoll = (data) => api.post("/polls", data);

// Update poll (admin)
export const updatePoll = (id, data) => api.put(`/polls/${id}`, data);

// Clear poll votes (admin)
export const clearPollVotes = (id) => api.put(`/polls/${id}/clear-votes`);

// Delete poll (admin)
export const deletePoll = (id) => api.delete(`/polls/${id}`);

// Vote poll (public/employee)
export const votePoll = (id, data) => publicApi.post(`/polls/${id}/vote`, data);

// Check vote (public)
export const checkVote = (id, employeeId) =>
  publicApi.get(`/polls/${id}/check-vote?employeeId=${employeeId}`);
