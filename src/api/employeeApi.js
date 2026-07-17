import api, { publicApi } from "./api";

const EMPLOYEE_FORM_FIELDS = [
  "employeeId",
  "name",
  "department",
  "designation",
  "email",
  "mobile",
  "status",
  "rkOrg",
  "project",
];

function buildEmployeeFormData(employee) {
  const formData = new FormData();

  EMPLOYEE_FORM_FIELDS.forEach((key) => {
    if (employee[key] !== undefined && employee[key] !== null) {
      formData.append(key, employee[key]);
    }
  });

  if (employee.photoFile instanceof File) {
    formData.append("photoFile", employee.photoFile);
  }

  return formData;
}

// Get Employees (admin)
export const getEmployees = () => api.get("/employees");

// Add Employee (admin)
export const addEmployee = (employee) => {
  return api.post("/employees", buildEmployeeFormData(employee), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Update Employee (admin)
export const updateEmployee = (id, employee) => {
  return api.put(`/employees/${id}`, buildEmployeeFormData(employee), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete Employee (admin)
export const deleteEmployee = (id) =>
  api.delete(`/employees/${id}`);

// Approve Employee (admin)
export const approveEmployee = (id) =>
  api.put(`/employees/approve/${id}`);

// Join Employee (public/employee)
export const joinEmployee = (employeeId) =>
  publicApi.post("/employees/join", {
    employeeId,
  });

// Get Employee Status (public/employee)
export const getEmployeeStatus = (id) =>
  publicApi.get(`/employees/status/${id}`);

// Reset Employee Points (admin)
export const resetEmployeePoints = () =>
  api.put("/employees/reset-points");

// Get Leaderboard (public)
export const getLeaderboard = () =>
  publicApi.get("/employees/leaderboard");

// Import Employees (admin)
export const importEmployees = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/employees/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Export Employees (admin)
export const exportEmployees = () => {
  return api.get("/employees/export", {
    responseType: "blob",
  });
};
