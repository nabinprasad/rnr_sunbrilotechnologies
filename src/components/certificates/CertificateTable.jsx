import { FaDownload, FaEdit, FaTrash } from "react-icons/fa";

export default function CertificateTable({
    certificates,
    onEdit,
    onDownload,
    onDelete,
}) {
    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th className="p-4">Employee</th>
                            <th>Template</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {certificates.map((cert) => (
                            <tr key={cert._id} className="border-t">
                                <td className="p-4">{cert.employeeName}</td>
                                <td>{cert.templateName}</td>
                                <td>
                                    {new Date(cert.createdAt).toLocaleDateString()}
                                </td>

                                <td>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            className="text-blue-600"
                                            onClick={() => onDownload(cert)}
                                        >
                                            <FaDownload />
                                        </button>

                                        <button
                                            className="text-green-600"
                                            onClick={() => onEdit(cert)}
                                        >
                                            <FaEdit />
                                        </button>

                                        <button
                                            className="text-red-600"
                                            onClick={() => onDelete(cert)}
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
    );
}