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
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                    Template
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                    Award Title
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                    Content
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-slate-200">
                            {certificates.map((cert) => (
                                <tr key={cert._id} className="hover:bg-slate-50 transition-colors duration-150">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {cert.employeeName}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                        {cert.templateName}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                        {cert.awardTitle}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                        {cert.category || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        <div className="max-w-xs break-all">
                                            {cert.content || "-"}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                        {new Date(cert.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200"
                                                onClick={() => onDownload(cert)}
                                                title="Download"
                                            >
                                                <FaDownload size={16} />
                                            </button>

                                            <button
                                                className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-100 transition-all duration-200"
                                                onClick={() => onEdit(cert)}
                                                title="Edit"
                                            >
                                                <FaEdit size={16} />
                                            </button>

                                            <button
                                                className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-100 transition-all duration-200"
                                                onClick={() => onDelete(cert)}
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
        </div>
    );
}