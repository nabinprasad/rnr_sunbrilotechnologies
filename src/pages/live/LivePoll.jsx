import { useEffect, useState } from "react";
import { getActivePoll } from "../../api/pollApi";
import socket from "../../socket";

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

function OptionBar({ option, total, index, rank }) {
  const p = pct(option.votes, total);
  const c = COLORS[index % COLORS.length];
  const isLeader = rank === 0 && option.votes > 0;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-3">
          {isLeader && (
            <span className="text-2xl" title="Leading">👑</span>
          )}
          <span className="text-white font-bold text-xl">{option.text}</span>
        </div>
        <div className="text-right">
          <span className="text-white/90 text-2xl font-black">{p}%</span>
          <span className="text-white/50 text-sm ml-2">
            ({option.votes} vote{option.votes !== 1 ? "s" : ""})
          </span>
        </div>
      </div>

      <div className="h-10 w-full bg-white/10 rounded-full overflow-hidden relative">
        <div
          className={`h-full bg-gradient-to-r ${c.bar} rounded-full transition-all duration-1000 ease-out relative`}
          style={{
            width: `${p}%`,
            boxShadow: p > 0 ? `0 0 20px ${c.glow}80` : "none",
          }}
        >
          {p > 15 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold text-sm">
              {p}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LivePollScreen() {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    console.log("🔗 Socket ID:", socket.id);
    loadActivePoll();

    const handlePollUpdated = (updatedPoll) => {
      console.log("📥 pollUpdated event received:", updatedPoll);
      console.log("updatedPoll.status:", updatedPoll.status);
      console.log("updatedPoll.activatedAt:", updatedPoll.activatedAt);
      console.log("updatedPoll.duration:", updatedPoll.duration);
      setPoll(updatedPoll);
    };

    const handleConnect = () => {
      console.log("✅ Socket connected to server!");
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected!");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("pollUpdated", handlePollUpdated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("pollUpdated", handlePollUpdated);
    };
  }, []);

  // Calculate and update remaining time every second
  useEffect(() => {
    const updateRemainingTime = () => {
      console.log("updateRemainingTime called - poll:", poll);
      if (poll && poll.status === "Active" && poll.activatedAt) {
        const activatedAt = new Date(poll.activatedAt).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - activatedAt) / 1000);
        const remaining = Math.max(0, (poll.duration || 60) - elapsed);
        console.log("activatedAt:", activatedAt, "now:", now, "elapsed:", elapsed, "remaining:", remaining);
        setRemainingTime(remaining);
      } else {
        console.log("Setting remainingTime to 0 because poll not active or no activatedAt");
        setRemainingTime(0);
      }
    };

    updateRemainingTime();
    const tickInterval = setInterval(() => {
      setTick((t) => t + 1);
      updateRemainingTime();
    }, 1000);

    return () => clearInterval(tickInterval);
  }, [poll]);

  const loadActivePoll = async () => {
    try {
      const res = await getActivePoll();
      setPoll(res.data.poll);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const tv = totalVotes(poll);

  // Sort options by votes to determine rank
  const rankedOptions = poll
    ? [...poll.options]
        .map((opt, i) => ({ ...opt, originalIndex: i }))
        .sort((a, b) => b.votes - a.votes)
    : [];

  const rankMap = {};
  rankedOptions.forEach((opt, rank) => {
    rankMap[opt.originalIndex] = rank;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-white text-3xl font-bold animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!poll || poll.status !== "Active") {
    // Calculate percentages and find 100% option
    const percentages = poll?.options?.map(opt => ({
      ...opt,
      percentage: tv > 0 ? Math.round((opt.votes / tv) * 100) : 0
    })) || [];
    const hundredPercentOption = percentages.find(opt => opt.percentage === 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center text-center p-12">
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
          .float { animation: float 3s ease-in-out infinite; }
          @keyframes celebrate-pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); } 50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); } }
          .celebrate-pulse { animation: celebrate-pulse 1.5s ease-in-out infinite; }
        `}</style>

        {hundredPercentOption ? (
          <div className="mb-12">
            <div className="text-9xl mb-6 float">🏆</div>
            <h1 className="text-6xl md:text-7xl font-black text-green-400 mb-6">
              Winner!
            </h1>
            <div className="bg-green-500/20 border-4 border-green-400 rounded-3xl p-10 max-w-3xl mx-auto celebrate-pulse">
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
                {poll?.question}
              </h2>
              <div className="text-green-300 text-5xl md:text-6xl font-black">
                {hundredPercentOption.text}
              </div>
              <div className="text-white/70 text-xl mt-4">
                100% of {tv} vote{tv !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-9xl mb-8 float">📊</div>
            <h1 className="text-6xl font-black text-white mb-4">
              {poll?.status === "Closed" ? "Poll Closed" : "Waiting for Poll..."}
            </h1>
            <p className="text-white/50 text-2xl">
              {poll?.status === "Closed"
                ? "Thank you for participating!"
                : "The admin will launch a poll shortly"}
            </p>
          </>
        )}

        {poll?.status === "Closed" && (
          <div className="mt-12 bg-white/10 backdrop-blur rounded-3xl p-8 max-w-2xl w-full">
            <h2 className="text-white/70 text-xl font-bold mb-6">Final Results</h2>
            {poll.options.map((opt, i) => (
              <OptionBar
                key={i}
                option={opt}
                total={tv}
                index={i}
                rank={rankMap[i]}
              />
            ))}
            <p className="text-white/40 text-sm mt-4">
              {tv} total vote{tv !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 flex flex-col p-10 relative overflow-hidden">
      <style>{`
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }
        .pulse-dot { animation: pulse-dot 1.2s infinite; }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .scanline { animation: scanline 6s linear infinite; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        .slide-in { animation: slideIn 0.6s ease forwards; }
      `}</style>

      {/* Background decorative circles */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Scanline effect */}
      <div className="scanline absolute inset-x-0 h-1 bg-white/5 pointer-events-none" />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-10 slide-in">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-green-400 pulse-dot" />
          <span className="text-green-400 font-bold text-sm uppercase tracking-widest">
            Live Poll
          </span>
        </div>
        <div className="flex items-center gap-6">
          {remainingTime > 0 && (
            <div className="flex items-center gap-3 bg-yellow-500/20 border-2 border-yellow-400 rounded-xl px-6 py-3">
              <span className="text-yellow-400 text-5xl">⏱️</span>
              <span className={`font-black text-6xl ${remainingTime <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-300'}`}>
                {remainingTime}
              </span>
              <span className="text-yellow-300 text-2xl font-bold">SEC</span>
            </div>
          )}
          <span className="text-white/50 text-sm">{tv} vote{tv !== 1 ? "s" : ""}</span>
          <span className="w-px h-4 bg-white/20" />
          <span className="text-white/50 text-sm">Updates in real-time</span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-12 slide-in">
        <h1 className="text-5xl md:text-6xl font-black text-white leading-tight max-w-5xl">
          {poll.question}
        </h1>
        {poll.allowMultiple && (
          <p className="text-white/40 mt-3 text-xl">
            Multiple selections allowed
          </p>
        )}
      </div>

      {/* Option bars */}
      <div className="flex-1 max-w-5xl w-full mx-auto slide-in">
        {poll.options.map((opt, i) => (
          <OptionBar
            key={i}
            option={opt}
            total={tv}
            index={i}
            rank={rankMap[i]}
          />
        ))}
      </div>

      {/* Footer vote count */}
      <div className="mt-10 text-center text-white/30 text-sm">
        Total Responses: <span className="font-bold text-white/50 text-base">{tv}</span>
      </div>
    </div>
  );
}
