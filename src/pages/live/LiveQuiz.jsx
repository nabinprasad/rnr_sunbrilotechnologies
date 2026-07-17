import { useState, useEffect } from "react";
import socket from "../../socket";
import { getQuizSession } from "../../api/quizSessionApi";
import { getQuiz } from "../../api/quizApi";
import { getLeaderboard } from "../../api/employeeApi";
import { getEmployeePhotoUrl } from "../../utils/employeePhoto";

export default function LiveQuiz() {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    loadInitialData();

    const handleSessionUpdate = (updatedSession) => {
      setSession(updatedSession);
    };

    socket.on("quizSessionUpdated", handleSessionUpdate);

    // Refresh leaderboard every 3 seconds
    const leaderboardInterval = setInterval(() => {
      loadLeaderboard();
    }, 3000);

    return () => {
      socket.off("quizSessionUpdated", handleSessionUpdate);
      clearInterval(leaderboardInterval);
    };
  }, []);

  useEffect(() => {
    if (session?.currentQuestion && questions.length > 0) {
      const q = questions.find((q) => q._id === session.currentQuestion);
      setCurrentQuestion(q);
    }
  }, [session?.currentQuestion, questions]);

  const loadInitialData = async () => {
    try {
      const [sessionRes, quizRes] = await Promise.all([
        getQuizSession(),
        getQuiz(),
      ]);
      setSession(sessionRes.data.session);
      setQuestions(quizRes.data.questions);
      await loadLeaderboard();
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await getLeaderboard();
      // Filter to only approved active employees and take top 10
      const topEmployees = res.data.employees.filter(
        (emp) => emp.approvalStatus === "Approved" && emp.status === "Active"
      ).slice(0, 10);
      setLeaderboard(topEmployees);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white p-10 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <p className="text-blue-200 uppercase tracking-widest text-sm font-semibold">
              Live Quiz
            </p>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-2">
            Reward & Recognition 2026
          </h1>
          <p className="text-blue-200 text-xl">
            {session?.status === "Live"
              ? `Question ${session?.questionNumber || 0}`
              : session?.status === "Finished"
              ? "Quiz Finished"
              : "Waiting to Start"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Question Section */}
          <div className="lg:col-span-2 space-y-8">
            {currentQuestion && session?.status === "Live" ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20">
                {/* Timer */}
                <div className="flex justify-center mb-8">
                  <div className="flex flex-col items-center">
                    <p className="text-blue-200 text-sm uppercase tracking-wider mb-2">Time Remaining</p>
                    <div className={`text-8xl font-black ${
                      session?.timer <= 5 ? "text-red-500 animate-pulse" : "text-yellow-400"
                    }`}>
                      {session?.timer || 0}
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-10">
                  <p className="text-3xl md:text-4xl font-bold text-center leading-relaxed">
                    {currentQuestion.question}
                  </p>
                  <p className="text-center text-blue-200 mt-3">
                    {currentQuestion.points} Points
                  </p>
                </div>

                {/* Options */}
                <div className="grid md:grid-cols-2 gap-5">
                  {currentQuestion.options.map((option, index) => {
                    const labels = ["A", "B", "C", "D"];
                    const colors = [
                      "from-blue-500 to-blue-600",
                      "from-purple-500 to-purple-600",
                      "from-green-500 to-green-600",
                      "from-orange-500 to-orange-600",
                    ];

                    return (
                      <div
                        key={index}
                        className={`bg-gradient-to-br ${colors[index]} rounded-2xl p-6 text-center border-4 border-transparent hover:scale-105 transition-transform`}
                      >
                        <div className="text-2xl font-black mb-2">{labels[index]}</div>
                        <div className="text-xl font-semibold">{option}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : session?.status === "Finished" ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 text-center">
                <div className="text-8xl mb-6">🎉</div>
                <h2 className="text-5xl font-black mb-4">Quiz Complete!</h2>
                <p className="text-2xl text-blue-200">Thank you for participating!</p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 text-center">
                <div className="text-8xl mb-6">⏳</div>
                <h2 className="text-4xl font-bold mb-4">Waiting for Quiz to Start</h2>
                <p className="text-xl text-blue-200">Get ready, the quiz will begin soon!</p>
              </div>
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                🏆 Live Leaderboard
              </h3>

              <div className="space-y-3">
                {leaderboard.length > 0 ? (
                  leaderboard.map((emp, index) => (
                    <div
                      key={emp._id}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        index < 3 ? "bg-white/20" : "bg-white/10"
                      } hover:bg-white/30`}
                    >
                      <div className={`text-3xl font-black ${getRankColor(index)} w-12 text-center`}>
                        {getRankIcon(index)}
                      </div>

                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
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
                        <p className="font-bold text-lg truncate">{emp.name}</p>
                        <p className="text-sm text-blue-200 truncate">{emp.department}</p>
                      </div>

                      <div className="text-2xl font-black text-yellow-400">
                        {emp.points} pts
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-blue-200">
                    <div className="text-5xl mb-3">📊</div>
                    <p className="text-lg">Waiting for participants...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
