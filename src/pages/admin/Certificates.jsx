import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import CertificateModal from "../../components/certificates/CertificateModal";
import CertificateTable from "../../components/certificates/CertificateTable";
import { getEmployees } from "../../api/employeeApi";
import {
  getCertificates,
  deleteCertificate,
} from "../../api/certificateApi";
import { generateCertificate } from "../../utils/certificateGenerator";

export default function Certificates() {
  const [openModal, setOpenModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchCertificates();
  }, []);

  const fetchEmployees = async () => {
    const res = await getEmployees();
    setEmployees(res.data.employees);
  };

  const fetchCertificates = async () => {
    const res = await getCertificates();
    console.log("✅ Certificates fetched:", res.data.certificates);
    setCertificates(res.data.certificates);
  };

  const handleAdd = () => {
    setEditData(null);
    setIsEdit(false);
    setOpenModal(true);
  };

  const handleEdit = (cert) => {
    setEditData(cert);
    setIsEdit(true);
    setOpenModal(true);
  };

  const handleDelete = async (cert) => {
    if (!window.confirm("Delete certificate?")) return;
    await deleteCertificate(cert._id);
    fetchCertificates();
  };

  const handleDownload = async (cert) => {
        const awardTitleToPass = cert.awardTitle === "Quality Champion" ? null : cert.awardTitle;
        await generateCertificate(
            cert.templateName,
            cert.employeeName,
            cert._id,
            cert.category,
            cert.content,
            awardTitleToPass,
            cert.leftSignatureName
        );
    };

  return (
    <AdminLayout>
      <PageHeader
              title="Certificate Management"
              subtitle="Generate and manage certificates"
            >
        <Button variant="success" onClick={handleAdd}>
          + Generate Certificate
        </Button>
      </PageHeader>

      <CertificateTable
        certificates={certificates}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />

      <CertificateModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditData(null);
          setIsEdit(false);
          fetchCertificates();
        }}
        employees={employees}
        editData={editData}
        isEdit={isEdit}
      />
    </AdminLayout>
  );
}