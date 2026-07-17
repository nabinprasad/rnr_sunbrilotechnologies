import { exportEmployeesToExcel } from "../../utils/excel";
import Button from "../ui/Button";

export default function ExportExcel({ employees }) {
  const handleExport = () => {
    exportEmployeesToExcel(employees);
  };

  return <Button variant="secondary" onClick={handleExport}>Export Excel</Button>;
}
