import { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import EmployeeTable from "../../components/employees/EmployeeTable";
import EmployeeForm from "../../components/employees/EmployeeForm";
import EmployeeFilter from "../../components/employees/EmployeeFilter";
import ImportExcel from "../../components/employees/ImportExcel";
import ExportExcel from "../../components/employees/ExportExcel";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import {

  getEmployees,
  addEmployee as addEmployeeApi,
  updateEmployee as updateEmployeeApi,
  deleteEmployee as deleteEmployeeApi,
  exportEmployees as exportEmployeesApi,
} from "../../api/employeeApi";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function Employees() {
  const [openModal, setOpenModal] = useState(false);
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

useEffect(() => {
  fetchEmployees();
}, []);

const fetchEmployees = async () => {
  try {
    const res = await getEmployees();
    setEmployees(res.data.employees);
  } catch (error) {
    toast.error("Unable to load employees");
  }
};

const handleExport = async () => {
  try {
    const res = await exportEmployeesApi();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'employees.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Employees exported successfully!");
  } catch (error) {
    console.error(error);
    toast.error("Failed to export employees");
  }
};

  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (department === "" || emp.department === department) &&
      (status === "" || emp.status === status)
    );
  });
 

const handleSave = async (employee) => {
  try {
    if (isEdit) {
      await updateEmployeeApi(employee._id, employee);
      toast.success("Employee Updated");
    } else {
      await addEmployeeApi(employee);
      toast.success("Employee Added");
    }

    await fetchEmployees();

    setOpenModal(false);
    setSelectedEmployee(null);
    setIsEdit(false);
  } catch (error) {
    console.log(error);
    console.log(error.response?.data);

    toast.error(error.response?.data?.message || error.message);
  }
};


  const editEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsEdit(true);
    setOpenModal(true);
  };
 
const handleDelete = async (id) => {
  console.log("Deleting ID:", id);

  if (!window.confirm("Delete Employee?")) return;

  try {
    await deleteEmployeeApi(id);

    toast.success("Employee Deleted");

    fetchEmployees();
  } catch (error) {
    console.log(error.response?.data);
    toast.error("Delete Failed");
  }
};

  return (
    <AdminLayout>
      <PageHeader
        title="Employee Management"
        subtitle="Manage employees participating in the Reward & Recognition Event"
      >
        <Button variant="success" onClick={() => setOpenModal(true)}>
          + Add Employee
        </Button>

        <ImportExcel onImportSuccess={fetchEmployees} />

        <Button variant="secondary" onClick={handleExport}>Export Excel</Button>
      </PageHeader>

      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <input
          type="text"
          placeholder="Search Employee..."
          className="border p-3 rounded-lg w-full md:w-96"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="bg-blue-600 text-white rounded-xl p-5 shadow">
          <p>Total Employees</p>
          <h2 className="text-3xl font-bold mt-2">{employees.length}</h2>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-5 shadow">
          <p>Active</p>
          <h2 className="text-3xl font-bold mt-2">
            {employees.filter((e) => e.status === "Active").length}
          </h2>
        </div>

        <div className="bg-red-600 text-white rounded-xl p-5 shadow">
          <p>Inactive</p>
          <h2 className="text-3xl font-bold mt-2">
            {employees.filter((e) => e.status === "Inactive").length}
          </h2>
        </div>

        <div className="bg-purple-600 text-white rounded-xl p-5 shadow">
          <p>Departments</p>
          <h2 className="text-3xl font-bold">4</h2>
        </div>
      </div>
      <EmployeeFilter
        search={search}
        setSearch={setSearch}
        department={department}
        setDepartment={setDepartment}
        status={status}
        setStatus={setStatus}
      />
      <EmployeeTable
        employees={filteredEmployees}
        onEdit={editEmployee}
        onDelete={handleDelete}
      />

      {openModal && (
        <EmployeeForm
          isOpen={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedEmployee(null);
            setIsEdit(false);
          }}
          onSave={handleSave}
          employee={selectedEmployee}
          isEdit={isEdit}
        />
      )}
    </AdminLayout>
  );
}
