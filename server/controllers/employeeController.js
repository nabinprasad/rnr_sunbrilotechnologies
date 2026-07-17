import Employee from "../models/Employee.js";
import { getIO } from "../server.js";

const ALLOWED_EMPLOYEE_FIELDS = [
  "employeeId",
  "name",
  "department",
  "designation",
  "email",
  "mobile",
  "status",
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
