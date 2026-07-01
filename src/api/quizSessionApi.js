import api from "./api";

export const getQuizSession = () =>
  api.get("/quiz-session");

export const updateQuizSession = (data) =>
  api.put("/quiz-session", data);