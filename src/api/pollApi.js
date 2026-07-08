import api from "./api";

export const getPolls = () => api.get("/polls");

export const getActivePoll = () => api.get("/polls/active");

export const getPollVotes = () => api.get("/polls/votes");

export const createPoll = (data) => api.post("/polls", data);

export const updatePoll = (id, data) => api.put(`/polls/${id}`, data);

export const deletePoll = (id) => api.delete(`/polls/${id}`);

export const votePoll = (id, data) => api.post(`/polls/${id}/vote`, data);

export const checkVote = (id, employeeId) =>
  api.get(`/polls/${id}/check-vote?employeeId=${employeeId}`);
