import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function EmployeeTable({ employees, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4">#</th>

              <th className="p-4">Photo</th>

              <th className="p-4 text-left">Employee ID</th>

              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">Department</th>

              <th className="p-4 text-left">Designation</th>

              <th className="p-4 text-left">Email</th>

              <th className="p-4 text-left">Mobile</th>

              <th className="p-4 text-center">Status</th>

              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp, index) => (
              <tr key={emp._id} className="border-b hover:bg-slate-50">
                <td className="p-4">{index + 1}</td>

                <td className="p-4">
                  <img
                    src={emp.photo}
                    alt={emp.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </td>

                <td className="p-4">{emp.employeeId}</td>

                <td className="p-4 font-medium">{emp.name}</td>

                <td className="p-4">{emp.department}</td>

                <td className="p-4">{emp.designation}</td>

                <td className="p-4 w-56">
                  <div className="break-all">{emp.email}</div>
                </td>

                <td className="p-4">{emp.mobile}</td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      emp.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-4">
                    <button
                      className="text-sky-600 hover:scale-110"
                      title="View"
                    >
                      <FaEye />
                    </button>

                    <button
                      onClick={() => onEdit(emp)}
                      className="text-blue-600 hover:scale-110 transition"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => onDelete(emp._id)}
                      className="text-red-600 hover:scale-110 transition"
                    >
                      {" "}
                      <FaTrash />{" "}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
