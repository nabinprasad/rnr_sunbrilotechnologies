import { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/ui/PageHeader";
import { leaderboardData } from "../../data/leaderboardData";

export default function Leaderboard() {
  const [leaders] = useState(
    [...leaderboardData].sort((a, b) => b.score - a.score)
  );

  return (
    <AdminLayout>
      <PageHeader
        title="Live Leaderboard"
        subtitle="Top performers in the event"
      />

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-900 text-white">

            <tr>
              <th className="p-4">Rank</th>
              <th>Name</th>
              <th>Department</th>
              <th>Score</th>

            </tr>

          </thead>

          <tbody>

            {leaders.map((emp, index) => (

              <tr key={emp.id} className="border-b">

                <td className="p-4 font-bold">

                  {index === 0 && "🥇"}

                  {index === 1 && "🥈"}

                  {index === 2 && "🥉"}

                  {index > 2 && index + 1}

                </td>

                <td>{emp.name}</td>

                <td>{emp.department}</td>

                <td className="font-bold text-blue-600">
                  {emp.score}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </AdminLayout>
  );
}