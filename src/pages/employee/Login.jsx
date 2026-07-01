import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { joinEmployee } from "../../api/employeeApi";
import socket from "../../socket";

export default function EmployeeLogin() {
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!employeeId.trim()) {
      toast.error("Please enter your Employee ID");
      return;
    }

    setLoading(true);
    try {
      const res = await joinEmployee(employeeId.trim());
      const emp = res.data.employee;
      localStorage.setItem("employee", JSON.stringify(emp));

      // Join personal socket room
      try { socket.emit("joinEmployee", emp._id); } catch (e) {}

      toast.success(res.data.message || "Joined successfully");
      navigate("/employee/lobby");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-50 via-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-4xl grid gap-8 grid-cols-1 md:grid-cols-2 items-center">
          <div className="hidden md:flex flex-col gap-6 p-8 rounded-2xl bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-4">
              <img src="/sunbrilologo.png" alt="Sunbrilo" className="h-12 w-auto" />
              <img src="/riskonnectlogo.png" alt="Riskonnect" className="h-12 w-auto" />
            </div>

            <h2 className="text-3xl font-bold text-slate-900">Welcome to Reward & Recognition</h2>
            <p className="text-slate-600 leading-relaxed">Enter your Employee ID below to join the event. You’ll be added to the lobby and can participate in live quizzes, polls and activities.</p>

            <div className="mt-4 flex gap-3">
              <div className="rounded-lg bg-gradient-to-br from-sky-50 to-sky-100 p-4 shadow-sm">
                <p className="text-sm text-slate-500">Fast</p>
                <p className="mt-1 font-semibold text-slate-900">Instant access</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 shadow-sm">
                <p className="text-sm text-slate-500">Secure</p>
                <p className="mt-1 font-semibold text-slate-900">One-time join</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900">Employee Login</h1>
              <p className="mt-2 text-sm text-slate-500">Quickly join the event using your Employee ID</p>
            </div>

            <div className="space-y-4">
              <label className="relative block">
                <span className="sr-only">Employee ID</span>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">👤</span>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter Employee ID"
                  className="w-full rounded-xl border border-slate-200 bg-white/80 py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </label>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 py-3 text-white font-semibold shadow-lg hover:opacity-95 disabled:opacity-60 transition"
              >
                {loading ? "Joining..." : "Join Event"}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <button
                  className="underline-offset-2 hover:underline"
                  onClick={() => { navigator.clipboard.writeText('EMPLOYEE123'); toast.success('Sample ID copied'); }}
                >
                  Copy sample ID
                </button>

                <a className="text-sky-600 hover:underline" href="/admin/login">Admin?</a>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">By joining you agree to the event rules. Be respectful and have fun.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
