import { useState, useEffect } from "react";

const initialForm = {
  employeeId: "",
  name: "",
  department: "",
  designation: "",
  email: "",
  mobile: "",
  status: "Active",
};
import PhotoUpload from "./PhotoUpload";
import Modal from "../ui/Modal";
export default function EmployeeForm({
  isOpen,
  onClose,
  onSave,
  employee,
  isEdit,
}) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
      setImage(employee.photo || "");
    } else {
      setFormData({
        ...initialForm,
        employeeId: `EMP${Date.now().toString().slice(-4)}`,
      });
      setImage("");
    }
  }, [employee]);

  const [image, setImage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = (e) => {
  e.preventDefault();

  const employeeData = {
    ...formData,
    _id: employee?._id,
    employeeId:
      formData.employeeId ||
      `EMP${Date.now().toString().slice(-4)}`,
    photo: image || "https://i.pravatar.cc/100",
  };

  console.log("Employee Data:", employeeData);

  onSave(employeeData);
};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Employee" : "Add Employee"}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isEdit ? "Edit Employee" : "Add Employee"}
        </h2>

        <button onClick={onClose} className="text-2xl">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <PhotoUpload image={image} setImage={setImage} />

        <hr className="my-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label>Employee ID</label>

            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className="border w-full p-3 rounded-lg mt-1"
              readOnly
            />
          </div>

          <div>
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border w-full p-3 rounded-lg mt-1"
            />
          </div>

          <div>
            <label>Department</label>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="border w-full p-3 rounded-lg mt-1"
            >
              <option value="">Select</option>
              <option>IT</option>
              <option>HR</option>
              <option>Finance</option>
              <option>Sales</option>
            </select>
          </div>

          <div>
            <label>Designation</label>

            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="border w-full p-3 rounded-lg mt-1"
            />
          </div>

          <div>
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border w-full p-3 rounded-lg mt-1"
            />
          </div>

          <div>
            <label>Mobile</label>

            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="border w-full p-3 rounded-lg mt-1"
            />
          </div>

          <div>
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border w-full p-3 rounded-lg mt-1"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white"
          >
            {isEdit ? "Update Employee" : "Save Employee"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
