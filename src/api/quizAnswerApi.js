import api from "./api";

export const getQuizAnswers = () => api.get("/quiz-answer");

export const submitAnswer = (data) =>
  api.post("/quiz-answer/submit", data);

export const resetQuizAnswers = () =>
  api.delete("/quiz-answer/reset");

export const resetEmployeeAnswers = (employeeId) =>
  api.delete(`/quiz-answer/reset-employee/${employeeId}`);