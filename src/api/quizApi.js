import api, { publicApi } from "./api";

// Get quiz (public)
export const getQuiz = () => publicApi.get("/quiz");

// Add question (admin)
export const addQuestion = (data) =>
  api.post("/quiz", data);

// Update question (admin)
export const updateQuestion = (id, data) =>
  api.put(`/quiz/${id}`, data);

// Delete question (admin)
export const deleteQuestion = (id) =>
  api.delete(`/quiz/${id}`);