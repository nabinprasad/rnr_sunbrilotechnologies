import { useEffect, useState, useRef } from "react";
import socket from "../../socket";
import { getTambolaSession } from "../../api/tambolaApi";

const CLAIM_LABELS = {
  earlyFive: "Early Five",
  middleLine: "Middle Line",
  fullHouse: "Full House",
};

export default function LiveTambola() {
  const [session, setSession] = useState(null);
  const prevWinners = useRef({ earlyFive: null, middleLine: null, fullHouse: null });
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiWinner, setConfettiWinner] = useState("");

  useEffect(() => {
    loadSession();

    const handleSessionUpdate = (updatedSession) => {
      // Check for new winners
      if (updatedSession?.winners) {
        Object.keys(CLAIM_LABELS).forEach((key) => {
          if (
            updatedSession.winners[key] && 
            updatedSession.winners[key] !== prevWinners.current[key]
          ) {
            // New winner!
            setConfettiWinner(`${CLAIM_LABELS[key]}: ${updatedSession.winners[key]}`);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        });
        prevWinners.current = updatedSession.winners;
      }
      setSession(updatedSession);
    };

    socket.on("tambolaSessionUpdated", handleSessionUpdate);

    const interval = setInterval(loadSession, 3000);

    return () => {
      clearInterval(interval);
      socket.off("tambolaSessionUpdated", handleSessionUpdate);
    };
  }, []);

  const loadSession = async () => {
    try {
      const res = await getTambolaSession();
      setSession(res.data.session);
    } catch (err) {
      console.error(err);
    }
  };

  const recentNumbers = session?.calledNumbers?.slice(-20) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-10 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 flex flex-col items-center justify-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-10 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-5xl font-black text-yellow-400 mb-2">
              We Have a Winner!
            </h2>
            <p className="text-3xl font-bold text-white">{confettiWinner}</p>
          </div>
          <Confetti />
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <p className="text-purple-200 uppercase tracking-widest text-sm font-semibold">
              Live Tambola
            </p>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-2">
            Reward & Recognition 2026
          </h1>
          <p className="text-purple-200 text-xl">
            {session?.status || "Waiting"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current Number */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 text-center">
              <p className="text-purple-200 text-xl mb-6">Current Number</p>
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6 animate-bounce">
                <span className="text-9xl font-black text-purple-950">
                  {session?.currentNumber || "—"}
                </span>
              </div>
              <p className="text-purple-200">
                {session?.calledNumbers?.length || 0} of 90 numbers called
              </p>
            </div>

            {/* Recent Numbers */}
            {recentNumbers.length > 0 && (
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold mb-6 text-center">Recent Numbers</h2>
                <div className="flex flex-wrap gap-3 justify-center">
                  {recentNumbers.map((num, index) => (
                    <div
                      key={index}
                      className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl font-black transition-all ${
                        num === session?.currentNumber
                          ? "bg-gradient-to-br from-green-500 to-emerald-600 scale-110 shadow-lg"
                          : "bg-white/20 hover:bg-white/30"
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Winners Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
              🏆 Winners
            </h2>
            <div className="grid grid-cols-1 gap-5">
              {Object.entries(CLAIM_LABELS).map(([key, label]) => {
                const hasWinner = !!session?.winners?.[key];
                
                return (
                  <div
                    key={key}
                    className={`rounded-2xl p-6 border-2 transition-all ${
                      hasWinner
                        ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400"
                        : "bg-white/10 border-white/20"
                    }`}
                  >
                    <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${
                      hasWinner ? "text-yellow-300" : "text-purple-200"
                    }`}>
                      {label}
                    </p>
                    <p className={`text-3xl font-black ${
                      hasWinner ? "text-yellow-400" : "text-white/40"
                    }`}>
                      {session?.winners?.[key] || "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple confetti component
function Confetti() {
  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 100 }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          top: `-10%`,
          width: `${Math.random() * 10 + 5}px`,
          height: `${Math.random() * 10 + 5}px`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${Math.random() * 3 + 2}s`,
        };
        
        return (
          <div
            key={i}
            className="confetti-piece absolute"
            style={style}
          />
        );
      })}
      
      <style>{`
        .confetti-piece {
          animation: fall linear infinite;
        }
        
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
