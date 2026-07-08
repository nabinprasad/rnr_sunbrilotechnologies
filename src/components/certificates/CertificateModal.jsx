import { useState, useEffect } from "react";
import { generateCertificate } from "../../utils/certificateGenerator";
import {
    addCertificate,
    updateCertificate,
} from "../../api/certificateApi";
import { getAwards } from "../../api/awardApi";

export default function CertificateModal({
    isOpen,
    onClose,
    employees,
    editData,
    isEdit,
}) {
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [awards, setAwards] = useState([]);
    const [selectedAward, setSelectedAward] = useState(null);

    useEffect(() => {
        fetchAwards();
    }, []);

    const fetchAwards = async () => {
        try {
            const res = await getAwards();
            setAwards(res.data.awards || []);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (editData) {
            setSelectedTemplate(editData.templateName);

            const emp = employees.find(
                (e) => e._id === editData.employeeId
            );

            setSelectedEmployee(emp);
            setSelectedAward(awards.find(a => a._id === editData.awardId) || null);
        } else {
            setSelectedTemplate("");
            setSelectedEmployee(null);
            setSelectedAward(null);
        }
    }, [editData, employees, awards]);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        try {
            if (!selectedTemplate || !selectedEmployee) {
                alert("Select template and employee");
                return;
            }

            const payload = {
                employeeId: selectedEmployee._id,
                employeeName: selectedEmployee.name,
                templateName: selectedTemplate,
                awardId: selectedAward?._id || null,
                awardTitle: selectedAward?.title || "Quality Champion",
            };

            let savedCertId = null;

            if (isEdit) {
                const res = await updateCertificate(editData._id, payload);
                savedCertId = editData._id;
                alert("Certificate Updated");
            } else {
                const res = await addCertificate(payload);
                savedCertId = res.data?._id || res.data?.certificate?._id;
                alert("Certificate Added");
            }

            if (savedCertId) {
                await generateCertificate(
                    selectedTemplate,
                    selectedEmployee.name,
                    savedCertId
                );
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

                <label className="block mb-2">Select Award (Optional)</label>
                <select
                    className="border p-3 w-full rounded mb-4"
                    value={selectedAward?._id || ""}
                    onChange={(e) => {
                        const award = awards.find(
                            (item) => item._id === e.target.value
                        );
                        setSelectedAward(award);
                    }}
                >
                    <option value="">None (Default: Quality Champion)</option>

                    {awards.map((award) => (
                        <option key={award._id} value={award._id}>
                            {award.title}
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