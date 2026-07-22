import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActivePoll, votePoll, checkVote } from "../../api/pollApi";
import { getEmployee } from "../../utils/employeeStorage";
import socket from "../../socket";
import toast from "react-hot-toast";

const pct = (votes, total) =>
  total === 0 ? 0 : Math.round((votes / total) * 100);

const totalVotes = (poll) =>
  poll?.options?.reduce((s, o) => s + o.votes, 0) || 0;

const OPTION_COLORS = [
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50 border-violet-300" },
  { bg: "from-blue-500 to-cyan-500", light: "bg-blue-50 border-blue-300" },
  { bg: "from-emerald-500 to-green-500", light: "bg-emerald-50 border-emerald-300" },
  { bg: "from-orange-500 to-yellow-400", light: "bg-orange-50 border-orange-300" },
  { bg: "from-pink-500 to-rose-500", light: "bg-pink-50 border-pink-300" },
  { bg: "from-indigo-500 to-blue-600", light: "bg-indigo-50 border-indigo-300" },
];

export default function EmployeeLivePoll() {
  const navigate = useNavigate();
  const employee = getEmployee();

  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    console.log("🔗 Employee Socket ID:", socket.id);
    loadActivePoll();
  }, []);

  // Calculate and update remaining time every second
  useEffect(() => {
    const updateRemainingTime = () => {
      if (poll && poll.status === "Active" && poll.activatedAt) {
        const activatedAt = new Date(poll.activatedAt).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - activatedAt) / 1000);
        const remaining = Math.max(0, (poll.duration || 60) - elapsed);
        setRemainingTime(remaining);
      } else {
        setRemainingTime(0);
      }
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [poll]);

  useEffect(() => {
    const handlePollUpdated = async (updatedPoll) => {
      console.log("📥 Employee pollUpdated event received:", updatedPoll);
      
      // If it's a new poll, reset hasVoted and selected
      if (poll?._id !== updatedPoll._id && updatedPoll.status === "Active") {
        setPoll(updatedPoll);
        setHasVoted(false);
        setSelected([]);
        if (employee?._id) {
          try {
            const voteRes = await checkVote(updatedPoll._id, employee._id);
            setHasVoted(voteRes.data.hasVoted);
          } catch (err) {
            console.log("Error checking vote for new poll:", err);
          }
        }
      } else {
        setPoll(updatedPoll);
        if (updatedPoll.status !== "Active") {
          toast("Poll has been closed by the admin", { icon: "📊" });
        }
      }
    };

    const handleConnect = () => {
      console.log("✅ Employee socket connected!");
    };

    const handleDisconnect = () => {
      console.log("❌ Employee socket disconnected!");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("pollUpdated", handlePollUpdated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("pollUpdated", handlePollUpdated);
    };
  }, [poll, employee]);

  const loadActivePoll = async () => {
    try {
      setLoading(true);
      const res = await getActivePoll();
      const activePoll = res.data.poll;
      setPoll(activePoll);

      if (activePoll && employee?._id) {
        const voteRes = await checkVote(activePoll._id, employee._id);
        setHasVoted(voteRes.data.hasVoted);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (index) => {
    if (hasVoted || submitting) return;

    if (poll?.allowMultiple) {
      setSelected((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setSelected([index]);
    }
  };

  const handleSubmit = async () => {
    if (!employee?._id) {
      toast.error("Please log in again");
      return;
    }
    if (selected.length === 0) {
      toast.error("Please select an option");
      return;
    }

    try {
      setSubmitting(true);
      const res = await votePoll(poll._id, {
        employeeId: employee._id,
        selectedOptions: selected,
      });
      setPoll(res.data.poll);
      setHasVoted(true);
      toast.success("🗳️ Vote submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  const tv = totalVotes(poll);

  // ── Loading ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse font-bold">Loading poll...</div>
      </div>
    );
  }

  // ── No active poll ──────────────────────────────
  if (!poll || poll.status !== "Active") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 max-w-lg w-full text-center text-white">
          <div className="text-7xl mb-6">⏳</div>
          <h2 className="text-3xl font-bold mb-3">
            {poll?.status === "Closed" ? "Poll Closed" : "No Active Poll"}
          </h2>
          <p className="text-white/70 mb-8">
            {poll?.status === "Closed"
              ? "The poll has ended. Thanks for participating!"
              : "Wait for the admin to launch a poll."}
          </p>
          <button
            onClick={() => navigate("/employee/home")}
            className="bg-white text-purple-800 font-bold px-8 py-3 rounded-xl hover:bg-purple-50 transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 flex items-center justify-center p-6">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.4s ease forwards; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pulse-dot { animation: pulse-dot 1.2s infinite; }
      `}</style>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
              <span className="text-green-300 text-xs font-bold uppercase tracking-widest">
                Live Poll
              </span>
            </div>
            {remainingTime > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-300 text-lg">⏱️</span>
                <span className={`font-black text-xl ${remainingTime <= 10 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                  {remainingTime}s
                </span>
              </div>
            )}
          </div>
          <h1 className="text-white text-2xl font-bold leading-snug">
            {poll.question}
          </h1>
          {poll.allowMultiple && (
            <p className="text-white/60 text-sm mt-1">
              Select all that apply
            </p>
          )}
        </div>

        <div className="p-8">
          {/* Voted — Show Results */}
          {hasVoted ? (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">✅</span>
                <h2 className="text-white font-bold text-lg">
                  Thanks for voting!
                </h2>
              </div>
              <p className="text-white/60 text-sm mb-6">
                Here are the live results ({tv} vote{tv !== 1 ? "s" : ""} so far):
              </p>

              {poll.options.map((opt, i) => {
                const p = pct(opt.votes, tv);
                const c = OPTION_COLORS[i % OPTION_COLORS.length];
                return (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between text-sm font-semibold mb-1">
                      <span className="text-white/90">{opt.text}</span>
                      <span className="text-white/60">
                        {opt.votes} · {p}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${c.bg} rounded-full transition-all duration-700`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => navigate("/employee/home")}
                className="mt-6 w-full border border-white/30 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition"
              >
                ← Back to Home
              </button>
            </div>
          ) : (
            /* Not Voted — Show Options */
            <div>
              <p className="text-white/60 text-sm mb-5">
                {poll.allowMultiple
                  ? "You can select multiple options"
                  : "Choose one option below"}
              </p>

              <div className="space-y-3">
                {poll.options.map((opt, i) => {
                  const isSelected = selected.includes(i);
                  const c = OPTION_COLORS[i % OPTION_COLORS.length];
                  return (
                    <button
                      key={i}
                      onClick={() => toggleOption(i)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200
                        ${
                          isSelected
                            ? `bg-gradient-to-r ${c.bg} border-transparent text-white shadow-lg scale-[1.01]`
                            : "bg-white/10 border-white/20 text-white/90 hover:bg-white/20"
                        }
                      `}
                    >
                      <span
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0
                          ${isSelected ? "border-white bg-white/30" : "border-white/30"}`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="font-semibold">{opt.text}</span>
                      {isSelected && (
                        <span className="ml-auto text-white text-lg">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleSubmit}
                disabled={selected.length === 0 || submitting}
                className={`mt-6 w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200
                  ${
                    selected.length > 0 && !submitting
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90 shadow-lg"
                      : "bg-white/10 text-white/40 cursor-not-allowed"
                  }`}
              >
                {submitting ? "Submitting..." : "🗳️ Submit Vote"}
              </button>

              <button
                onClick={() => navigate("/employee/home")}
                className="mt-3 w-full text-white/50 hover:text-white/80 text-sm py-2 transition"
              >
                ← Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
