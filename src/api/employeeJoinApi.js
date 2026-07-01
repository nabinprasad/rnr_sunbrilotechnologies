import api from "./api";

export const joinEmployee = (employeeId) =>
  api.post("/employees/join", {
    employeeId,
  });