import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  getPolls,
  createPoll,
  updatePoll,
  deletePoll,
} from "../../api/pollApi";
import socket from "../../socket";
import toast from "react-hot-toast";

// ── helpers ──────────────────────────────────────────
const totalVotes = (poll) =>
  poll.options.reduce((s, o) => s + o.votes, 0);

const pct = (votes, total) =>
  total === 0 ? 0 : Math.round((votes / total) * 100);

const STATUS_COLOR = {
  Draft: "bg-yellow-100 text-yellow-700",
  Active: "bg-green-100 text-green-700",
  Closed: "bg-slate-100 text-slate-500",
};

// ── sub-components ────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div className={`${color} text-white rounded-2xl p-5 flex flex-col gap-1 shadow`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}

function ResultBar({ option, total, index }) {
  const p = pct(option.votes, total);
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-green-500",
    "from-orange-500 to-yellow-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-600",
  ];

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm font-semibold mb-1">
        <span className="text-slate-700">{option.text}</span>
        <span className="text-slate-500">
          {option.votes} vote{option.votes !== 1 ? "s" : ""} — {p}%
        </span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
}

// ── Create Poll Modal ─────────────────────────────────
function CreatePollModal({ onClose, onCreated }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };

  const removeOption = (i) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  };

  const setOption = (i, val) => {
    const copy = [...options];
    copy[i] = val;
    setOptions(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filled = options.filter((o) => o.trim());
    if (!question.trim()) return toast.error("Question is required");
    if (filled.length < 2) return toast.error("At least 2 options required");

    try {
      setLoading(true);
      await createPoll({ question: question.trim(), options: filled, allowMultiple });
      toast.success("Poll created!");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Create New Poll</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Poll Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which department had the best performance this quarter?"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Options
            </label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-red-400 hover:text-red-600 font-bold text-xl px-2"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="text-purple-600 text-sm font-semibold hover:underline mt-1"
              >
                + Add Option
              </button>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="w-4 h-4 accent-purple-600"
            />
            <span className="text-sm text-slate-600 font-medium">
              Allow multiple selections
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 rounded-xl py-3 font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-3 font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Poll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedPoll, setExpandedPoll] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();

    const handlePollUpdated = (poll) => {
      setPolls((prev) =>
        prev.map((p) => (p._id === poll._id ? poll : p))
      );
    };

    socket.on("pollUpdated", handlePollUpdated);
    return () => socket.off("pollUpdated", handlePollUpdated);
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getPolls();
      setPolls(res.data.polls);
    } catch (err) {
      toast.error("Failed to load polls");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (poll, newStatus) => {
    try {
      await updatePoll(poll._id, { status: newStatus });
      toast.success(
        newStatus === "Active"
          ? "🟢 Poll is now LIVE!"
          : newStatus === "Closed"
          ? "Poll closed"
          : "Poll set to Draft"
      );
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update poll");
    }
  };

  const handleDelete = async (poll) => {
    if (!window.confirm(`Delete poll "${poll.question}"?`)) return;
    try {
      await deletePoll(poll._id);
      toast.success("Poll deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete poll");
    }
  };

  // Stats
  const allVotes = polls.reduce((s, p) => s + totalVotes(p), 0);
  const activeCount = polls.filter((p) => p.status === "Active").length;
  const draftCount = polls.filter((p) => p.status === "Draft").length;
  const closedCount = polls.filter((p) => p.status === "Closed").length;
  const activePoll = polls.find((p) => p.status === "Active");

  return (
    <AdminLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pulse-dot { animation: pulse-dot 1.2s infinite; }
      `}</style>

      {showModal && (
        <CreatePollModal
          onClose={() => setShowModal(false)}
          onCreated={load}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Live Poll Management</h1>
          <p className="text-slate-500 mt-1">Create, launch, and track polls in real-time</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/live-poll"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-purple-300 text-purple-700 px-4 py-2 rounded-xl font-semibold hover:bg-purple-50 transition text-sm"
          >
            📺 Live Screen
          </a>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition shadow text-sm"
          >
            + Create Poll
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Polls" value={polls.length} color="bg-gradient-to-br from-slate-600 to-slate-700" />
        <StatCard label="Active" value={activeCount} color="bg-gradient-to-br from-green-500 to-emerald-600" />
        <StatCard label="Draft" value={draftCount} color="bg-gradient-to-br from-yellow-500 to-orange-500" />
        <StatCard label="Closed" value={closedCount} color="bg-gradient-to-br from-slate-400 to-slate-500" />
        <StatCard label="Total Votes" value={allVotes} color="bg-gradient-to-br from-purple-600 to-indigo-600" />
      </div>

      {/* Live results strip (if active poll) */}
      {activePoll && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 pulse-dot" />
            <h3 className="font-bold text-green-800 text-lg">LIVE: {activePoll.question}</h3>
          </div>
          <div className="mt-2">
            {activePoll.options.map((opt, i) => (
              <ResultBar
                key={i}
                option={opt}
                total={totalVotes(activePoll)}
                index={i}
              />
            ))}
          </div>
          <p className="text-xs text-green-600 mt-3 font-medium">
            {totalVotes(activePoll)} total vote{totalVotes(activePoll) !== 1 ? "s" : ""} · Updates in real-time
          </p>
        </div>
      )}

      {/* Poll List */}
      {loading ? (
        <div className="text-center text-slate-400 py-20 text-lg">Loading polls...</div>
      ) : polls.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-slate-600">No polls yet</h3>
          <p className="text-slate-400 mt-2">Create your first poll to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
          >
            Create Poll
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const tv = totalVotes(poll);
            const isExpanded = expandedPoll === poll._id;

            return (
              <div
                key={poll._id}
                className={`bg-white rounded-2xl shadow-sm border transition-all ${
                  poll.status === "Active"
                    ? "border-green-300 shadow-green-100"
                    : "border-slate-100"
                }`}
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap self-start ${STATUS_COLOR[poll.status]}`}
                  >
                    {poll.status === "Active" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
                    )}
                    {poll.status}
                  </span>

                  {/* Question */}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-base leading-snug">
                      {poll.question}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {poll.options.length} options · {tv} vote{tv !== 1 ? "s" : ""}
                      {poll.allowMultiple ? " · Multi-select" : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() =>
                        setExpandedPoll(isExpanded ? null : poll._id)
                      }
                      className="text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition font-medium"
                    >
                      {isExpanded ? "Hide Results" : "View Results"}
                    </button>

                    {poll.status === "Draft" && (
                      <button
                        onClick={() => handleStatusChange(poll, "Active")}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        🟢 Launch
                      </button>
                    )}

                    {poll.status === "Active" && (
                      <button
                        onClick={() => handleStatusChange(poll, "Closed")}
                        className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition font-medium"
                      >
                        ⏹ Close Poll
                      </button>
                    )}

                    {poll.status === "Closed" && (
                      <button
                        onClick={() => handleStatusChange(poll, "Active")}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        ↩ Reopen
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(poll)}
                      className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition font-medium"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>

                {/* Expanded Results */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4 bg-slate-50 rounded-b-2xl">
                    <h4 className="text-sm font-bold text-slate-600 mb-3">
                      Live Results
                    </h4>
                    {poll.options.map((opt, i) => (
                      <ResultBar key={i} option={opt} total={tv} index={i} />
                    ))}
                    <p className="text-xs text-slate-400 mt-3">
                      {tv} total response{tv !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}