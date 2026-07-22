import { useState, useEffect } from "react";
import socket from "../../socket";
import { getQuizSession } from "../../api/quizSessionApi";
import { getQuiz } from "../../api/quizApi";
import { getLeaderboard } from "../../api/employeeApi";
import { getEmployeePhotoUrl } from "../../utils/employeePhoto";
import { getActivePoll } from "../../api/pollApi";
import { getTambolaSession } from "../../api/tambolaApi";

const CLAIM_LABELS = {
  earlyFive: "Early Five",
  middleLine: "Middle Line",
  fullHouse: "Full House",
};

const pct = (votes, total) =>
  total === 0 ? 0 : Math.round((votes / total) * 100);
const totalVotes = (poll) =>
  poll?.options?.reduce((s, o) => s + o.votes, 0) || 0;

const COLORS = [
  { bar: "from-violet-500 to-purple-600", glow: "#a855f7" },
  { bar: "from-blue-500 to-cyan-400", glow: "#3b82f6" },
  { bar: "from-emerald-500 to-green-400", glow: "#10b981" },
  { bar: "from-orange-500 to-yellow-400", glow: "#f97316" },
  { bar: "from-pink-500 to-rose-400", glow: "#ec4899" },
  { bar: "from-indigo-500 to-blue-600", glow: "#6366f1" },
];

function PollOptionBar({ option, total, index, rank }) {
  const p = pct(option.votes, total);
  const c = COLORS[index % COLORS.length];
  const isLeader = rank === 0 && option.votes > 0;

  return (
    <div className="mb-3">
      <div className="flex justify-between items-end mb-1">
        <div className="flex items-center gap-2">
          {isLeader && <span className="text-lg" title="Leading">👑</span>}
          <span className="text-white font-bold text-sm">{option.text}</span>
        </div>
        <div className="text-right">
          <span className="text-white/90 text-sm font-black">{p}%</span>
          <span className="text-white/50 text-xs ml-1">
            ({option.votes} vote{option.votes !== 1 ? "s" : ""})
          </span>
        </div>
      </div>

      <div className="h-6 w-full bg-white/10 rounded-full overflow-hidden relative">
        <div
          className={`h-full bg-gradient-to-r ${c.bar} rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: `${p}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function LiveResults() {
  // Quiz
  const [quizSession, setQuizSession] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLeaderboard, setQuizLeaderboard] = useState([]);

  // Poll
  const [activePoll, setActivePoll] = useState(null);

  // Tambola
  const [tambolaSession, setTambolaSession] = useState(null);

  useEffect(() => {
    loadInitialData();

    // Socket listeners
    const handleQuizSessionUpdate = (updatedSession) => {
      setQuizSession(updatedSession);
    };

    const handlePollUpdated = (updatedPoll) => {
      setActivePoll(updatedPoll);
    };

    const handleTambolaSessionUpdate = (updatedSession) => {
      setTambolaSession(updatedSession);
    };

    socket.on("quizSessionUpdated", handleQuizSessionUpdate);
    socket.on("pollUpdated", handlePollUpdated);
    socket.on("tambolaSessionUpdated", handleTambolaSessionUpdate);

    // Refresh leaderboard every 5 seconds
    const leaderboardInterval = setInterval(() => {
      loadLeaderboard();
    }, 5000);

    const tambolaInterval = setInterval(() => {
      loadTambolaSession();
    }, 5000);

    return () => {
      socket.off("quizSessionUpdated", handleQuizSessionUpdate);
      socket.off("pollUpdated", handlePollUpdated);
      socket.off("tambolaSessionUpdated", handleTambolaSessionUpdate);
      clearInterval(leaderboardInterval);
      clearInterval(tambolaInterval);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [quizRes, quizSessionRes, pollRes, tambolaRes] = await Promise.all([
        getQuiz(),
        getQuizSession(),
        getActivePoll(),
        getTambolaSession(),
      ]);
      setQuizQuestions(quizRes.data.questions);
      setQuizSession(quizSessionRes.data.session);
      setActivePoll(pollRes.data.poll);
      setTambolaSession(tambolaRes.data.session);
      await loadLeaderboard();
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await getLeaderboard();
      const topEmployees = res.data.employees.filter(
        (emp) => emp.approvalStatus === "Approved" && emp.status === "Active"
      ).slice(0, 8);
      setQuizLeaderboard(topEmployees);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    }
  };

  const loadTambolaSession = async () => {
    try {
      const res = await getTambolaSession();
      setTambolaSession(res.data.session);
    } catch (err) {
      console.error("Failed to load tambola session:", err);
    }
  };

  const getRankColor = (index) => {
    if (index === 0) return "text-yellow-400";
    if (index === 1) return "text-gray-300";
    if (index === 2) return "text-amber-600";
    return "text-white";
  };

  const getRankIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}.`;
  };

  const pollTv = totalVotes(activePoll);
  const rankedPollOptions = activePoll
    ? [...activePoll.options]
        .map((opt, i) => ({ ...opt, originalIndex: i }))
        .sort((a, b) => b.votes - a.votes)
    : [];
  const pollRankMap = {};
  rankedPollOptions.forEach((opt, rank) => {
    pollRankMap[opt.originalIndex] = rank;
  });

  const recentTambolaNumbers = tambolaSession?.calledNumbers?.slice(-12) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <p className="text-blue-200 uppercase tracking-widest text-sm font-semibold">
              Live Results
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
            Reward & Recognition 2026
          </h1>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quiz Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                🧠 Quiz
              </h3>
              <span className="text-xs text-blue-200 uppercase tracking-wide">
                {quizSession?.status || "Waiting"}
              </span>
            </div>

            {quizSession?.status === "Live" && (
              <div className="text-center mb-4">
                <p className="text-2xl font-black text-yellow-400">
                  Q{quizSession?.questionNumber || 0}
                </p>
                <p className="text-sm text-blue-200">
                  {quizSession?.timer || 0}s
                </p>
              </div>
            )}

            {quizSession?.status === "Finished" && (
              <div className="text-center">
                <p className="text-lg font-bold text-green-400">Complete!</p>
              </div>
            )}

            {quizSession?.status === "Not Started" && (
              <div className="text-center">
                <p className="text-blue-200">Waiting to start</p>
              </div>
            )}
          </div>

          {/* Poll Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                📊 Poll
              </h3>
              <span className="text-xs text-purple-200 uppercase tracking-wide">
                {activePoll?.status || "Waiting"}
              </span>
            </div>

            {activePoll?.status === "Active" && (
              <div>
                <p className="text-sm font-semibold mb-3 truncate">
                  {activePoll.question}
                </p>
                {activePoll.options.map((opt, i) => (
                  <PollOptionBar
                    key={i}
                    option={opt}
                    total={pollTv}
                    index={i}
                    rank={pollRankMap[i]}
                  />
                ))}
                <p className="text-xs text-white/50 text-center mt-2">
                  {pollTv} vote{pollTv !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {activePoll?.status === "Closed" && (
              <div className="text-center">
                <p className="text-sm font-bold text-orange-400">Poll Closed</p>
              </div>
            )}

            {!activePoll && (
              <div className="text-center">
                <p className="text-purple-200">Waiting for poll</p>
              </div>
            )}
          </div>

          {/* Tambola Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                🎟️ Tambola
              </h3>
              <span className="text-xs text-purple-200 uppercase tracking-wide">
                {tambolaSession?.status || "Waiting"}
              </span>
            </div>

            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-2">
                <span className="text-3xl font-black text-purple-950">
                  {tambolaSession?.currentNumber || "—"}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                {tambolaSession?.calledNumbers?.length || 0}/90
              </p>
            </div>

            {recentTambolaNumbers.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {recentTambolaNumbers.map((num, index) => (
                  <div
                    key={index}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-black ${
                      num === tambolaSession?.currentNumber
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 scale-110"
                        : "bg-white/20"
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
              🏆 Leaderboard
            </h3>

            <div className="space-y-2">
              {quizLeaderboard.length > 0 ? (
                quizLeaderboard.map((emp, index) => (
                  <div
                    key={emp._id}
                    className={`flex items-center gap-2 p-2 rounded-xl ${
                      index < 3 ? "bg-white/20" : "bg-white/10"
                    }`}
                  >
                    <div className={`text-lg font-black ${getRankColor(index)} w-6 text-center`}>
                      {getRankIcon(index)}
                    </div>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                      <img
                        src={getEmployeePhotoUrl(emp.photo)}
                        alt={emp.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://i.pravatar.cc/150";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{emp.name}</p>
                    </div>
                    <div className="text-sm font-black text-yellow-400">
                      {emp.points}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-blue-200">
                  <p className="text-sm">Waiting for participants...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
