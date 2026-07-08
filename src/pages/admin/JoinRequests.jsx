import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminLayout from "../../components/layout/AdminLayout";

import { getEmployees, approveEmployee } from "../../api/employeeApi";

export default function JoinRequests() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();

      const pending = res.data.employees.filter(
        (emp) => emp.approvalStatus === "Pending",
      );

      setEmployees(pending);
    } catch (err) {
      console.log(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveEmployee(id);

      toast.success(res.data.message);

      loadEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to approve employee");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(employees.map((emp) => emp._id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleApproveSelected = async () => {
    if (selectedEmployees.length === 0) {
      return toast.error("Please select at least one employee.");
    }

    try {
      await Promise.all(selectedEmployees.map((id) => approveEmployee(id)));

      toast.success(
        `${selectedEmployees.length} employee(s) approved successfully.`,
      );

      setSelectedEmployees([]);
      loadEmployees();
    } catch (err) {
      toast.error("Unable to approve selected employees.");
    }
  };

  return (
    <AdminLayout>
     
      <div className="bg-white rounded-xl shadow p-8">
         <div className="flex justify-between items-center mb-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={
              employees.length > 0 &&
              selectedEmployees.length === employees.length
            }
            onChange={handleSelectAll}
          />
          <span>Select All</span>
        </label>

        <button
          onClick={handleApproveSelected}
          disabled={selectedEmployees.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg"
        >
          Approve Selected ({selectedEmployees.length})
        </button>
      </div>
        <h1 className="text-3xl font-bold mb-8">Join Requests</h1>

        {employees.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No Pending Requests
          </div>
        ) : (
          <div className="space-y-5">
            {employees.map((emp) => (
              <div
                key={emp._id}
                className="border rounded-xl p-5 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(emp._id)}
                    onChange={() => handleSelectEmployee(emp._id)}
                    className="w-5 h-5"
                  />

                  <div>
                    <h2 className="text-xl font-semibold">{emp.name}</h2>
                    <p>{emp.employeeId}</p>
                    <p>{emp.department}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleApprove(emp._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
