import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/ui/PageHeader";

export default function Reports() {
  return (
    <AdminLayout>
      <PageHeader
        title="Reports & Analytics"
        subtitle="View event statistics and reports"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-blue-600 text-white rounded-xl p-6 shadow">
          <p>Total Employees</p>
          <h2 className="text-4xl font-bold mt-2">120</h2>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-6 shadow">
          <p>Quiz Completed</p>
          <h2 className="text-4xl font-bold mt-2">98</h2>
        </div>

        <div className="bg-purple-600 text-white rounded-xl p-6 shadow">
          <p>Awards Given</p>
          <h2 className="text-4xl font-bold mt-2">15</h2>
        </div>

        <div className="bg-orange-500 text-white rounded-xl p-6 shadow">
          <p>Certificates Generated</p>
          <h2 className="text-4xl font-bold mt-2">90</h2>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">
          Event Summary
        </h2>

        <table className="w-full border">
          <tbody>
            <tr className="border-b">
              <td className="p-3 font-semibold">Employees Registered</td>
              <td className="p-3">120</td>
            </tr>

            <tr className="border-b">
              <td className="p-3 font-semibold">Quiz Participants</td>
              <td className="p-3">98</td>
            </tr>

            <tr className="border-b">
              <td className="p-3 font-semibold">Average Quiz Score</td>
              <td className="p-3">82%</td>
            </tr>

            <tr className="border-b">
              <td className="p-3 font-semibold">Awards Distributed</td>
              <td className="p-3">15</td>
            </tr>

            <tr>
              <td className="p-3 font-semibold">Certificates Generated</td>
              <td className="p-3">90</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}