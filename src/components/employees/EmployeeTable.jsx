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
        <div className="max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-20">Photo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider min-w-[200px]">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">RK ORG</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Project</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-24">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-32">Action</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-200">
              {currentEmployees.map((emp, index) => (
                <tr key={emp._id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 font-medium">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <img
                      src={getEmployeePhotoUrl(emp.photo)}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover bg-slate-200 border border-slate-300"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = DEFAULT_EMPLOYEE_PHOTO;
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{emp.employeeId}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900">{emp.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{emp.department || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{emp.designation || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div className="break-all max-w-xs">{emp.email || "-"}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{emp.mobile || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{emp.rkOrg || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{emp.project || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        emp.status === "Active"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="text-sky-600 hover:text-sky-800 p-1.5 rounded-lg hover:bg-sky-100 transition-all duration-200"
                        title="View"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(emp)}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(emp._id)}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-100 transition-all duration-200"
                        title="Delete"
                      >
                        <FaTrash size={16} />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-slate-50 border-t border-slate-200">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-sm font-medium">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
              className="p-2 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-all duration-200"
            >
              <FaChevronLeft size={16} />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-all duration-200"
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
