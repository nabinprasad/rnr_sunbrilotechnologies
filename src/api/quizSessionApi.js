import api, { publicApi } from "./api";

// Get quiz session (public)
export const getQuizSession = () =>
  publicApi.get("/quiz-session");

// Update quiz session (admin)
export const updateQuizSession = (data) =>
  api.put("/quiz-session", data);