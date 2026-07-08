import { useEffect, useState } from "react";
import socket from "../../socket";
import { getTambolaSession } from "../../api/tambolaApi";

const CLAIM_LABELS = {
  earlyFive: "Early Five",
  middleLine: "Middle Line",
  fullHouse: "Full House",
};

export default function LiveTambola() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    loadSession();

    const handleSession = (updatedSession) => {
      setSession(updatedSession);
    };

    socket.on("tambolaSessionUpdated", handleSession);

    const interval = setInterval(loadSession, 3000);

    return () => {
      clearInterval(interval);
      socket.off("tambolaSessionUpdated", handleSession);
    };
  }, []);

  const loadSession = async () => {
    try {
      const res = await getTambolaSession();
      setSession(res.data.session);
    } catch (err) {
      console.log(err);
    }
  };

  const recentNumbers = session?.calledNumbers?.slice(-20) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-purple-200 uppercase tracking-widest text-sm">
            Live Tambola
          </p>
          <h1 className="text-5xl font-bold mt-2">Reward & Recognition 2026</h1>
          <p className="text-purple-200 mt-2">{session?.status || "Waiting"}</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-3xl p-12 text-center mb-12">
          <p className="text-purple-200 text-xl mb-4">Current Number</p>
          <div className="text-[120px] font-bold leading-none">
            {session?.currentNumber ?? "—"}
          </div>
          <p className="text-purple-200 mt-6">
            {session?.calledNumbers?.length || 0} of 90 numbers called
          </p>
        </div>

        {recentNumbers.length > 0 && (
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">Recent Numbers</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {recentNumbers.map((num) => (
                <span
                  key={num}
                  className={`w-16 h-16 flex items-center justify-center rounded-2xl text-2xl font-bold ${
                    num === session.currentNumber
                      ? "bg-green-500"
                      : "bg-white/20"
                  }`}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Winners</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CLAIM_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="bg-white/10 rounded-2xl p-5 text-center"
              >
                <p className="text-purple-200 text-sm">{label}</p>
                <p className="text-2xl font-bold mt-2">
                  {session?.winners?.[key] || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
