import api from "./api";

export const getQuiz = () => api.get("/quiz");

export const addQuestion = (data) =>
  api.post("/quiz", data);

export const updateQuestion = (id, data) =>
  api.put(`/quiz/${id}`, data);

export const deleteQuestion = (id) =>
  api.delete(`/quiz/${id}`);