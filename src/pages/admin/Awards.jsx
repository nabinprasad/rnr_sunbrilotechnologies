import { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { awardData } from "../../data/awardData";

export default function Awards() {
  const [awards] = useState(awardData);

  return (
    <AdminLayout>
      <PageHeader
        title="Awards Management"
        subtitle="Manage award categories for the event"
      >
        <Button variant="success">
          + Add Award
        </Button>
      </PageHeader>

      <div className="grid md:grid-cols-3 gap-6">

        {awards.map((award) => (

          <div
            key={award.id}
            className="bg-white rounded-xl shadow p-6 text-center hover:shadow-lg transition"
          >

            <div className="text-6xl">
              {award.icon}
            </div>

            <h2 className="text-2xl font-bold mt-4">
              {award.title}
            </h2>

            <p className="text-gray-500 mt-2">
              {award.description}
            </p>

            <button className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg">
              Assign Winner
            </button>

          </div>

        ))}

      </div>

    </AdminLayout>
  );
}