import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/ui/PageHeader";
import { getLeaderboard } from "../../api/employeeApi";
import { resetEmployeeAnswers } from "../../api/quizAnswerApi";
import { getEmployeePhotoUrl, DEFAULT_EMPLOYEE_PHOTO } from "../../utils/employeePhoto.js";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [confirmReset, setConfirmReset] = useState(null);

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await getLeaderboard();
      const employees = res.data.employees || [];
      setLeaders(employees);
      
      if (employees.length > 0) {
        setWinner(employees[0]);
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleResetEmployee = async (employeeId, employeeName) => {
    try {
      setResettingId(employeeId);
      await resetEmployeeAnswers(employeeId);
      alert(`✅ ${employeeName}'s answers have been reset. They can now participate again!`);
      setConfirmReset(null);
      loadLeaderboard();
    } catch (err) {
      alert(`❌ Error resetting answers: ${err.response?.data?.message || err.message}`);
    } finally {
      setResettingId(null);
    }
  };

  if (loading) return <AdminLayout><div className="text-center mt-20">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <PageHeader
        title="Live Leaderboard"
        subtitle="Top performers in the event"
      />

      {/* Winner Banner */}
      {winner && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 p-8 shadow-lg">
          <div className="text-center text-white">
            <p className="text-sm uppercase tracking-widest opacity-90">Champion</p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <img 
                src={getEmployeePhotoUrl(winner.photo)} 
                alt={winner.name}
                className="h-20 w-20 rounded-full border-4 border-white object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_EMPLOYEE_PHOTO;
                }}
              />
              <div>
                <h2 className="text-4xl font-black">{winner.name}</h2>
                <p className="text-lg opacity-90">{winner.department}</p>
                <p className="mt-2 text-3xl font-bold">🏆 {winner.points} Points</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-4">Rank</th>
              <th className="text-left">Name</th>
              <th className="text-left">Department</th>
              <th className="text-left">Designation</th>
              <th className="text-center">Points</th>
              <th className="text-center">Speed Winner</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((emp, index) => {
              const isSpeedWinner = index === 0;
              return (
                <tr 
                  key={emp._id} 
                  className={`border-b transition ${
                    index === 0 
                      ? "bg-yellow-50 hover:bg-yellow-100" 
                      : index === 1
                      ? "bg-slate-50 hover:bg-slate-100"
                      : index === 2
                      ? "bg-orange-50 hover:bg-orange-100"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <td className="p-4 font-bold text-center">
                    {index === 0 && <span className="text-2xl">🥇</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    {index > 2 && <span className="text-lg">{index + 1}</span>}
                  </td>
                  <td className="p-4 font-semibold">{emp.name}</td>
                  <td className="p-4 text-slate-600">{emp.department || "-"}</td>
                  <td className="p-4 text-slate-600">{emp.designation || "-"}</td>
                  <td className="p-4 text-center font-bold text-blue-600 text-lg">
                    {emp.points}
                  </td>
                  <td className="p-4 text-center">
                    {isSpeedWinner && <span className="text-2xl">⚡</span>}
                  </td>
                  <td className="p-4 text-center">
                    {confirmReset === emp._id ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleResetEmployee(emp._id, emp.name)}
                          disabled={resettingId === emp._id}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm disabled:opacity-50"
                        >
                          {resettingId === emp._id ? "Resetting..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmReset(null)}
                          className="px-3 py-1 bg-slate-400 hover:bg-slate-500 text-white rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmReset(emp._id)}
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition"
                      >
                        Reset Answers
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
