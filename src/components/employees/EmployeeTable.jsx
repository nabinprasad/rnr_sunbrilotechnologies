import { useState } from "react";
import { FaEye, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  DEFAULT_EMPLOYEE_PHOTO,
  getEmployeePhotoUrl,
} from "../../utils/employeePhoto";

export default function EmployeeTable({ employees, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate paginated data
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = employees.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {/* Scrollable Table */}
      <div className="overflow-x-auto">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full">
            <thead className="bg-slate-800 text-white sticky top-0 z-10">
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
              {currentEmployees.map((emp, index) => (
                <tr key={emp._id} className="border-b hover:bg-slate-50">
                  <td className="p-4">{startIndex + index + 1}</td>
                  <td className="p-4">
                    <img
                      src={getEmployeePhotoUrl(emp.photo)}
                      alt={emp.name}
                      className="w-12 h-12 rounded-full object-cover bg-slate-200"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = DEFAULT_EMPLOYEE_PHOTO;
                      }}
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
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {employees.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border-t border-slate-200">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-sm font-medium">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-500 text-sm">
              of {employees.length} employees
            </span>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
            >
              <FaChevronLeft />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
