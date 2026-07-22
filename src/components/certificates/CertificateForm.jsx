import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { getEmployees } from "../../api/employeeApi";

const initialForm = {
    employeeId: "",
    employeeName: "",
    templateName: "/certificates/General.pdf",
    category: "",
    content: "",
};

export default function CertificateForm({
  isOpen,
  onClose,
  onSave,
  certificate,
  isEdit,
}) {
  const [formData, setFormData] = useState(initialForm);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getEmployees();
        setEmployees(res.data.employees);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
        if (certificate) {
            setFormData({
                employeeId: certificate.employeeId?._id || certificate.employeeId || "",
                employeeName: certificate.employeeName || "",
                templateName: certificate.templateName || "template1",
                category: certificate.category || "",
                content: certificate.content || "",
            });
        } else {
            setFormData(initialForm);
        }
    }, [certificate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "employeeId") {
      const selectedEmployee = employees.find((emp) => emp._id === value);
      setFormData((prev) => ({
        ...prev,
        employeeId: value,
        employeeName: selectedEmployee ? selectedEmployee.name : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Certificate" : "Add Certificate"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Employee
          </label>
          <select
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Certificate Template
          </label>
          <select
            name="templateName"
            value={formData.templateName}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="/certificates/ABOVE AND BEYOND.pdf">Above and Beyond</option>
            <option value="/certificates/Employee of the Year.pdf">Employee of the Year</option>
            <option value="/certificates/General.pdf">General</option>
            <option value="/certificates/Long Service.pdf">Long Service</option>
            <option value="/certificates/QUALITY CHAMPION.pdf">Quality Champion</option>
            <option value="/certificates/SPECIAL AWARDS.pdf">Special Awards</option>
            <option value="/certificates/TECHNICAL STEWARDSHIP.pdf">Technical Stewardship</option>
          </select>
        </div>



        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Quality Champion, Above and Beyond"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Certificate Content / Write-up
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={5}
            maxLength={275}
            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write the certificate description here (max 275 characters)"
          />
          <p className="text-xs text-slate-500 mt-1">
            {formData.content.length}/275 characters
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {isEdit ? "Update" : "Save"} Certificate
          </button>
        </div>
      </form>
    </Modal>
  );
}
