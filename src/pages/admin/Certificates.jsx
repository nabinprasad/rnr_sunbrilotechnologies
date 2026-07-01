import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";

export default function Certificates() {
  return (
    <AdminLayout>
      <PageHeader
        title="Certificate Management"
        subtitle="Generate and manage employee certificates"
      >
        <Button variant="success">
          + Generate Certificate
        </Button>
      </PageHeader>

      <div className="bg-white rounded-xl shadow p-10 text-center">
        Certificate Module Coming Next...
      </div>
    </AdminLayout>
  );
}