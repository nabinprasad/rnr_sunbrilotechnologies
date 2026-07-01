import { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { pollData } from "../../data/pollData";

export default function Polls() {
  const [polls, setPolls] = useState(pollData);

  return (
    <AdminLayout>
      <PageHeader
        title="Live Poll Management"
        subtitle="Create and manage live event polls"
      >
        <Button variant="success">
          + Create Poll
        </Button>
      </PageHeader>

      <div className="grid md:grid-cols-4 gap-5 mb-6">

        <div className="bg-blue-600 text-white p-5 rounded-xl">
          <p>Total Polls</p>
          <h2 className="text-3xl font-bold">
            {polls.length}
          </h2>
        </div>

        <div className="bg-green-600 text-white p-5 rounded-xl">
          <p>Active</p>
          <h2 className="text-3xl font-bold">
            {polls.filter(p=>p.status==="Active").length}
          </h2>
        </div>

        <div className="bg-yellow-500 text-white p-5 rounded-xl">
          <p>Draft</p>
          <h2 className="text-3xl font-bold">
            {polls.filter(p=>p.status==="Draft").length}
          </h2>
        </div>

        <div className="bg-purple-600 text-white p-5 rounded-xl">
          <p>Total Votes</p>
          <h2 className="text-3xl font-bold">
            {polls.reduce(
              (sum, poll) =>
                sum +
                poll.options.reduce(
                  (a, b) => a + b.votes,
                  0
                ),
              0
            )}
          </h2>
        </div>

      </div>
    </AdminLayout>
  );
}