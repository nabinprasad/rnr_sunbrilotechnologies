import api from "./api";

// Get Employees
export const getEmployees = () => api.get("/employees");

// Add Employee
export const addEmployee = (data) => api.post("/employees", data);

// Update Employee
export const updateEmployee = (id, data) =>
  api.put(`/employees/${id}`, data);

// Delete Employee
export const deleteEmployee = (id) =>
  api.delete(`/employees/${id}`);

export const approveEmployee = (id) =>
  api.put(`/employees/approve/${id}`);

export const joinEmployee = (employeeId) =>
  api.post("/employees/join", {
    employeeId,
  });

  export const getEmployeeStatus = (id) =>
  api.get(`/employees/status/${id}`);

  export const resetEmployeePoints = () =>
  api.put("/employees/reset-points");

