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
    const [category, setCategory] = useState("");
    const [content, setContent] = useState("");

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
        console.log("🔍 CertificateModal: editData received", editData);
        if (editData) {
            console.log("📝 Setting content from editData:", editData.content);
            setSelectedTemplate(editData.templateName);
            setCategory(editData.category || "");
            setContent(editData.content || "");

            const emp = employees.find(
                (e) => (e._id === editData.employeeId) || (e._id === editData.employeeId?._id))

            setSelectedEmployee(emp);
            setSelectedAward(awards.find(a => a._id === editData.awardId) || null);
        } else {
            setSelectedTemplate("");
            setSelectedEmployee(null);
            setSelectedAward(null);
            setCategory("");
            setContent("");
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
                category: category,
                content: content,
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
                    savedCertId,
                    category,
                    content,
                    selectedAward?.title || null
                );
            }

            onClose();
        } catch (error) {
            console.log(error);
            alert("Operation Failed");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-[600px] max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    {isEdit ? "Edit Certificate" : "Generate Certificate"}
                </h2>

                <label className="block mb-2 font-medium text-slate-700">Select Template</label>
                <select
                    value={selectedTemplate}
                    className="border border-slate-300 p-3 w-full rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                    <option value="">Choose Template</option>
                    <option value="/certificates/ABOVE AND BEYOND.pdf">Above and Beyond</option>
                    <option value="/certificates/Employee of the Year.pdf">Employee of the Year</option>
                    <option value="/certificates/General.pdf">General</option>
                    <option value="/certificates/Long Service.pdf">Long Service</option>
                    <option value="/certificates/QUALITY CHAMPION.pdf">Quality Champion</option>
                    <option value="/certificates/SPECIAL AWARDS.pdf">Special Awards</option>
                    <option value="/certificates/TECHNICAL STEWARDSHIP.pdf">Technical Stewardship</option>
                </select>

                {/* Template Preview */}
                {selectedTemplate && (
                    <div className="mb-4 border rounded-lg p-2">
                        <p className="text-sm font-medium text-slate-700 mb-2">Template Preview:</p>
                        <div className="w-full h-64 bg-slate-50 flex items-center justify-center">
                            <iframe 
                                src={selectedTemplate} 
                                className="w-full h-full rounded" 
                                title="Certificate Template Preview"
                            />
                        </div>
                    </div>
                )}

                <label className="block mb-2 font-medium text-slate-700">Select Employee</label>
                <select
                    className="border border-slate-300 p-3 w-full rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            {emp.name} ({emp.employeeId})
                        </option>
                    ))}
                </select>



                <label className="block mb-2 font-medium text-slate-700">Category</label>
                <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Quality Champion, Above and Beyond"
                    className="border border-slate-300 p-3 w-full rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <label className="block mb-2 font-medium text-slate-700">Certificate Content / Write-up</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    maxLength={275}
                    placeholder="Write the certificate description here (max 275 characters)"
                    className="border border-slate-300 p-3 w-full rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mb-4">
                    {content.length}/275 characters
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        onClick={handleGenerate}
                    >
                        {isEdit ? "Update" : "Generate"}
                    </button>
                </div>
            </div>
        </div>
    );
}