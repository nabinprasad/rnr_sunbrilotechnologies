import Employee from "../models/Employee.js";
import { getIO } from "../server.js";
import XLSX from "xlsx";

const ALLOWED_EMPLOYEE_FIELDS = [
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

function sanitizeEmployeeData(body = {}, file) {
  const employeeData = {};

  ALLOWED_EMPLOYEE_FIELDS.forEach((field) => {
    if (body[field] !== undefined && body[field] !== "") {
      employeeData[field] = body[field];
    }
  });

  if (file) {
    employeeData.photo = file.path.replace(/\\/g, "/");
  } else if (
    body.photo &&
    !String(body.photo).startsWith("blob:") &&
    !String(body.photo).startsWith("data:")
  ) {
    employeeData.photo = body.photo;
  }

  return employeeData;
}

// ==========================
// Get All Employees
// ==========================
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get Single Employee
// ==========================
export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Approve Employee
// ==========================
export const approveEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "Approved",
      },
      {
        new: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Notify only this employee using namespaced room
    const room = `employee:${employee._id.toString()}`;
    getIO().to(room).emit("employeeApproved", {
      success: true,
      employee,
    });

    res.json({
      success: true,
      message: "Employee Approved Successfully",
      employee,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// ==========================
// Add Employee
// ==========================
export const createEmployee = async (req, res) => {
  try {
    console.log("========== CREATE ==========");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const employeeData = sanitizeEmployeeData(req.body, req.file);

    const employee = await Employee.create(employeeData);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update Employee
// ==========================
export const updateEmployee = async (req, res) => {
  try {
    const employeeData = sanitizeEmployeeData(req.body, req.file);

const employee = await Employee.findByIdAndUpdate(
  req.params.id,
  employeeData,
  {
    new: true,
    runValidators: true,
  }
);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Delete Employee
// ==========================
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const joinEmployee = async (req, res) => {
  try {
    console.log("JOIN API HIT");
    console.log(req.body);

    const { employeeId } = req.body;

    const employee = await Employee.findOne({ employeeId });

    console.log(employee);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    employee.approvalStatus = "Pending";
    await employee.save();

    console.log("Saved Successfully");

    res.json({
      success: true,
      message: "Join request sent",
      employee,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



export const resetEmployeePoints = async (req, res) => {
  try {
    await Employee.updateMany({}, { points: 0 });

    res.json({
      success: true,
      message: "Employee points reset successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// Get Employee Status
export const getEmployeeStatus = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Leaderboard (sorted by points)
export const getLeaderboard = async (req, res) => {
  try {
    const employees = await Employee.find()
      .sort({ points: -1 })
      .select("name department designation photo points approvalStatus");

    res.json({
      success: true,
      employees,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Import Employees from Excel
export const importEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const importedEmployees = [];
    const errors = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      const employeeData = {
        employeeId: String(row["Employee ID"] || row["employeeId"] || "").trim(),
        name: String(row["Name"] || row["name"] || "").trim(),
        department: String(row["Department"] || row["department"] || "").trim(),
        designation: String(row["Designation"] || row["designation"] || "").trim(),
        email: String(row["Email"] || row["email"] || "").trim(),
        mobile: String(row["Mobile"] || row["mobile"] || "").trim(),
        status: row["Status"] || row["status"] || "Active",
        approvalStatus: row["Approval Status"] || row["approvalStatus"] || "Approved",
        rkOrg: String(row["RK ORG"] || row["rkOrg"] || "").trim(),
        project: String(row["Project"] || row["project"] || "").trim(),
      };

      if (!employeeData.employeeId || !employeeData.name) {
        errors.push({
          row: i + 2,
          message: "Employee ID and Name are required",
        });
        continue;
      }

      try {
        const existingEmployee = await Employee.findOne({ employeeId: employeeData.employeeId });
        
        if (existingEmployee) {
          await Employee.findByIdAndUpdate(existingEmployee._id, employeeData, { new: true });
        } else {
          const employee = await Employee.create(employeeData);
          importedEmployees.push(employee);
        }
      } catch (err) {
        errors.push({
          row: i + 2,
          message: err.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully imported ${importedEmployees.length} employees`,
      importedCount: importedEmployees.length,
      errors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export Employees to Excel
export const exportEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    
    const worksheetData = employees.map(emp => ({
      "Employee ID": emp.employeeId,
      "Name": emp.name,
      "Department": emp.department,
      "Designation": emp.designation,
      "Email": emp.email,
      "Mobile": emp.mobile,
      "Status": emp.status,
      "RK ORG": emp.rkOrg,
      "Project": emp.project,
      "Points": emp.points,
      "Approval Status": emp.approvalStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=employees.xlsx");
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
