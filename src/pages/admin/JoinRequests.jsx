import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminLayout from "../../components/layout/AdminLayout";

import {
  getEmployees,
  approveEmployee,
} from "../../api/employeeApi";

export default function JoinRequests() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();

      const pending = res.data.employees.filter(
        (emp) => emp.approvalStatus === "Pending"
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
      toast.error(
        err.response?.data?.message ||
          "Unable to approve employee"
      );
    }
  };



  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-8">

        <h1 className="text-3xl font-bold mb-8">
          Join Requests
        </h1>

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

                <div>

                  <h2 className="text-xl font-semibold">
                    {emp.name}
                  </h2>

                  <p>{emp.employeeId}</p>

                  <p>{emp.department}</p>

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