import { useState, useEffect } from "react";
import { generateCertificate } from "../../utils/certificateGenerator";
import {
    addCertificate,
    updateCertificate,
} from "../../api/certificateApi";

export default function CertificateModal({
    isOpen,
    onClose,
    employees,
    editData,
    isEdit,
}) {
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    useEffect(() => {
        if (editData) {
            setSelectedTemplate(editData.templateName);

            const emp = employees.find(
                (e) => e._id === editData.employeeId
            );

            setSelectedEmployee(emp);
        } else {
            setSelectedTemplate("");
            setSelectedEmployee(null);
        }
    }, [editData, employees]);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        try {
            if (!selectedTemplate || !selectedEmployee) {
                alert("Select template and employee");
                return;
            }

            await generateCertificate(
                selectedTemplate,
                selectedEmployee.name
            );

            const payload = {
                employeeId: selectedEmployee._id,
                employeeName: selectedEmployee.name,
                templateName: selectedTemplate,
            };

            if (isEdit) {
                await updateCertificate(editData._id, payload);
                alert("Certificate Updated");
            } else {
                await addCertificate(payload);
                alert("Certificate Added");
            }

            onClose();
        } catch (error) {
            console.log(error);
            alert("Operation Failed");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white rounded-xl p-6 w-[500px]">
                <h2 className="text-xl font-bold mb-4">
                    {isEdit ? "Edit Certificate" : "Generate Certificate"}
                </h2>

                <label className="block mb-2">Select Template</label>
                <select
                    value={selectedTemplate}
                    className="border p-3 w-full rounded mb-4"
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                    <option value="">Choose Template</option>
                    <option value="/certificates/template1.pdf">
                        Template 1
                    </option>
                    <option value="/certificates/template2.pdf">
                        Template 2
                    </option>
                    <option value="/certificates/template3.pdf">
                        Template 3
                    </option>
                </select>

                <label className="block mb-2">Select Employee</label>
                <select
                    className="border p-3 w-full rounded mb-4"
                    value={selectedEmployee?._id || ""}
                    onChange={(e) => {
                        const emp = employees.find(
                            (item) => item._id === e.target.value
                        );
                        setSelectedEmployee(emp);
                    }}
                >
                    <option value="">Choose Employee</option>

                    {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                            {emp.name}
                        </option>
                    ))}
                </select>

                <div className="flex justify-end gap-3">
                    <button
                        className="bg-gray-300 px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded"
                        onClick={handleGenerate}
                    >
                        {isEdit ? "Update" : "Generate"}
                    </button>
                </div>
            </div>
        </div>
    );
}