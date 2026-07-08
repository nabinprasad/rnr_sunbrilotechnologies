import api from "./api";

const EMPLOYEE_FORM_FIELDS = [
  "employeeId",
  "name",
  "department",
  "designation",
  "email",
  "mobile",
  "status",
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

// Get Employees
export const getEmployees = () => api.get("/employees");

// Add Employee
export const addEmployee = (employee) => {
  return api.post("/employees", buildEmployeeFormData(employee), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Update Employee
export const updateEmployee = (id, employee) => {
  return api.put(`/employees/${id}`, buildEmployeeFormData(employee), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

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

export const getLeaderboard = () =>
  api.get("/employees/leaderboard");
