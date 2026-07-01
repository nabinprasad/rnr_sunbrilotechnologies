export const EMPLOYEE_STORAGE_KEY = "employee";

export const getEmployee = () => {
  const stored =
    sessionStorage.getItem(EMPLOYEE_STORAGE_KEY) ||
    localStorage.getItem(EMPLOYEE_STORAGE_KEY);

  if (!stored) return {};

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to parse employee storage", error);
    return {};
  }
};

export const setEmployee = (employee) => {
  const value = JSON.stringify(employee || {});
  sessionStorage.setItem(EMPLOYEE_STORAGE_KEY, value);
  localStorage.setItem(EMPLOYEE_STORAGE_KEY, value);
};

export const clearEmployee = () => {
  sessionStorage.removeItem(EMPLOYEE_STORAGE_KEY);
  localStorage.removeItem(EMPLOYEE_STORAGE_KEY);
};
