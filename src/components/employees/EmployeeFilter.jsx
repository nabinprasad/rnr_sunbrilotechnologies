export default function EmployeeFilter({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5 mb-6">

      <div className="grid md:grid-cols-3 gap-4">

        <input
          type="text"
          placeholder="Search Employee"
          className="border rounded-lg p-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded-lg p-3"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          <option>Technical</option>
          <option>HR</option>
        </select>

        <select
          className="border rounded-lg p-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

      </div>

    </div>
  );
}