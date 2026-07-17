import api, { publicApi } from "./api";

export const getQuizAnswers = () => publicApi.get("/quiz-answer");

// Submit answer (public/employee)
export const submitAnswer = (data) =>
  publicApi.post("/quiz-answer/submit", data);

// Reset quiz answers (admin)
export const resetQuizAnswers = () =>
  api.delete("/quiz-answer/reset");

// Reset employee answers (admin)
export const resetEmployeeAnswers = (employeeId) =>
  api.delete(`/quiz-answer/reset-employee/${employeeId}`);