import * as XLSX from "xlsx";

export const readQuizExcel = (file, callback) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);

    const workbook = XLSX.read(data, {
      type: "array",
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const json = XLSX.utils.sheet_to_json(sheet);

    callback(json);
  };

  reader.readAsArrayBuffer(file);
};

export const readEmployeeExcel = (file, callback) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    callback(json);
  };

  reader.readAsArrayBuffer(file);
};

export const exportEmployeesToExcel = (employees, filename = "employees.xlsx") => {
  const worksheetData = employees.map(emp => ({
    "Employee ID": emp.employeeId || "",
    "Name": emp.name || "",
    "Department": emp.department || "",
    "Designation": emp.designation || "",
    "Email": emp.email || "",
    "Mobile": emp.mobile || "",
    "Status": emp.status || "",
    "RK ORG": emp.rkOrg || "",
    "Project": emp.project || "",
    "Points": emp.points || 0,
    "Approval Status": emp.approvalStatus || ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
  XLSX.writeFile(workbook, filename);
};