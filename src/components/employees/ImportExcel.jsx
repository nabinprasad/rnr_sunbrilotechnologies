import { useState, useRef } from "react";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { importEmployees } from "../../api/employeeApi";

export default function ImportExcel({ onImportSuccess }) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const res = await importEmployees(file);
      toast.success(res.data.message);
      
      if (res.data.errors && res.data.errors.length > 0) {
        toast.warning(`There were ${res.data.errors.length} errors during import`);
        console.log("Import errors:", res.data.errors);
      }

      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to import employees");
    } finally {
      setIsImporting(false);
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <Button variant="secondary" onClick={handleImportClick} disabled={isImporting}>
        {isImporting ? "Importing..." : "Import Excel"}
      </Button>
    </>
  );
}
