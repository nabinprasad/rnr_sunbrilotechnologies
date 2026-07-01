import api from "./api";

export const submitAnswer = (data) =>
  api.post("/quiz-answer/submit", data);

export const resetQuizAnswers = () =>
  api.delete("/quiz-answer/reset");