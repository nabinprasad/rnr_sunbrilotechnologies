import { useState, useEffect, useRef, useCallback } from "react";
import socket from "../../socket";
import { getQuizSession } from "../../api/quizSessionApi";
import { getQuiz } from "../../api/quizApi";
import { getLeaderboard } from "../../api/employeeApi";
import { getEmployeePhotoUrl } from "../../utils/employeePhoto";

function PodiumSpot({ emp, place, heightClass, ringClass, medal, isWinner }) {
  return (
    <div className="flex flex-col items-center w-1/3 max-w-[180px]">
      <div
        className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 ${ringClass} mb-3 ${
          isWinner ? "winner-pulse" : ""
        }`}
      >
        <img
          src={getEmployeePhotoUrl(emp.photo)}
          alt={emp.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://i.pravatar.cc/150";
          }}
        />
      </div>
      <div className="text-3xl mb-1">{medal}</div>
      <p className="font-black text-white text-lg truncate max-w-full">{emp.name}</p>
      <p className="text-blue-200 text-xs truncate max-w-full mb-2">{emp.department}</p>
      <p className="text-yellow-300 font-black text-xl mb-3">{emp.points} pts</p>
      <div
        className={`w-full ${heightClass} bg-white/10 border border-white/20 rounded-t-xl flex items-start justify-center pt-2`}
      >
        <span className="text-4xl font-black text-white/40">{place}</span>
      </div>
    </div>
  );
}

export default function LiveQuiz() {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const countdownRef = useRef(null);
  const questionMusicRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const timerStartedAtRef = useRef(null);
  const sessionRef = useRef(null);
  const questionsRef = useRef([]);
  const leaderboardRef = useRef([]);
  const lastQuestionId = useRef(null);
  const sessionLoadedRef = useRef(false);
  const questionsLoadedRef = useRef(false);

  const findQuestionById = useCallback((questionId) => {
    if (!questionId) return null;
    return questionsRef.current.find(
      (q) => String(q._id) === String(questionId),
    );
  }, []);

  const applySessionToState = useCallback((sess) => {
    if (!sess) return;
    sessionRef.current = sess;
    setSession(sess);

    // Timer handling
    if (sess.status === "Live" && sess.timerStartedAt) {
      timerStartedAtRef.current = new Date(sess.timerStartedAt).getTime();
      const duration = Number(sess.timerDuration || sess.timer || 30);
      const elapsed = Math.floor((Date.now() - timerStartedAtRef.current) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimer(remaining);
      if (!countdownRef.current) {
        countdownRef.current = setInterval(() => {
          if (!timerStartedAtRef.current || !sessionRef.current) return;
          const d = Number(
            sessionRef.current.timerDuration || sessionRef.current.timer || 30,
          );
          const e = Math.floor((Date.now() - timerStartedAtRef.current) / 1000);
          const r = Math.max(0, d - e);
          setTimer(r);
          if (r <= 0 && countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
        }, 250);
      }
    } else if (sess.status !== "Live") {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      timerStartedAtRef.current = null;
      setTimer(0);
    }

    // Update question if questions are loaded
    if (questionsLoadedRef.current) {
      const currentId =
        sess.currentQuestion?._id || sess.currentQuestion;
      if (currentId && String(currentId) !== String(lastQuestionId.current)) {
        const q = findQuestionById(currentId);
        if (q) {
          lastQuestionId.current = String(q._id);
          setCurrentQuestion(q);
        }
      }
    }
  }, [findQuestionById]);

  const syncQuestionIfReady = useCallback(() => {
    if (sessionLoadedRef.current && questionsLoadedRef.current && sessionRef.current) {
      const currentId =
        sessionRef.current.currentQuestion?._id ||
        sessionRef.current.currentQuestion;
      if (currentId) {
        const q = findQuestionById(currentId);
        if (q && String(q._id) !== String(lastQuestionId.current)) {
          lastQuestionId.current = String(q._id);
          setCurrentQuestion(q);
        } else if (!currentQuestion && q) {
          setCurrentQuestion(q);
        }
      } else {
        setCurrentQuestion(null);
      }
    }
  }, [findQuestionById, currentQuestion]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const res = await getLeaderboard();
      const topEmployees = res.data.employees
        .filter(
          (emp) =>
            emp.approvalStatus === "Approved" && emp.status === "Active",
        )
        .slice(0, 10);
      leaderboardRef.current = topEmployees;
      setLeaderboard(topEmployees);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadAllInitial = async () => {
      try {
        const [sessionRes, quizRes] = await Promise.all([
          getQuizSession(),
          getQuiz(),
        ]);
        if (!mounted) return;
        const sess = sessionRes.data.session;
        const quizQuestions = quizRes.data.questions;

        questionsRef.current = quizQuestions;
        setQuestions(quizQuestions);
        questionsLoadedRef.current = true;

        sessionLoadedRef.current = true;
        applySessionToState(sess);
        syncQuestionIfReady();

        await loadLeaderboard();
      } catch (err) {
        console.error("Failed to load initial data:", err);
      }
    };

    const refreshSession = async () => {
      try {
        const res = await getQuizSession();
        if (!mounted) return;
        applySessionToState(res.data.session);
        syncQuestionIfReady();
      } catch (e) {
        // ignore
      }
    };

    loadAllInitial();

    const handleSessionUpdate = (updatedSession) => {
      console.log("🔔 LiveQuiz (LiveScreen): quizSessionUpdated received");
      applySessionToState(updatedSession);
      syncQuestionIfReady();
    };

    const handleLeaderboardUpdate = (payload) => {
      console.log("🔔 LiveQuiz: leaderboardUpdated received");
      // Update the specific employee in the leaderboard if present, else refresh
      const updated = payload?.updatedEmployee;
      if (!updated) {
        loadLeaderboard();
        return;
      }
      const currentBoard = [...leaderboardRef.current];
      const idx = currentBoard.findIndex(
        (e) => String(e._id) === String(updated._id),
      );
      if (idx >= 0) {
        currentBoard[idx] = { ...currentBoard[idx], ...updated };
      } else {
        currentBoard.push(updated);
      }
      currentBoard.sort((a, b) => Number(b.points || 0) - Number(a.points || 0));
      const filtered = currentBoard
        .filter(
          (emp) =>
            emp.approvalStatus === "Approved" && emp.status === "Active",
        )
        .slice(0, 10);
      leaderboardRef.current = filtered;
      setLeaderboard(filtered);
    };

    const handleLeaderboardReset = () => {
      console.log("🔔 LiveQuiz: leaderboardReset received");
      leaderboardRef.current = [];
      setLeaderboard([]);
      loadLeaderboard();
    };

    const handleConnect = () => {
      console.log("✅ LiveQuiz: Socket connected!");
      loadAllInitial();
    };

    const handleDisconnect = () => {
      console.log("❌ LiveQuiz: Socket disconnected!");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("quizSessionUpdated", handleSessionUpdate);
    socket.on("leaderboardUpdated", handleLeaderboardUpdate);
    socket.on("leaderboardReset", handleLeaderboardReset);

    // Fallback session refresh every 3 seconds as safety net
    const sessionInterval = setInterval(() => {
      if (mounted) refreshSession();
    }, 3000);

    // Fallback leaderboard refresh every 10s as safety net
    const leaderboardInterval = setInterval(() => {
      if (mounted) loadLeaderboard();
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(sessionInterval);
      clearInterval(leaderboardInterval);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("quizSessionUpdated", handleSessionUpdate);
      socket.off("leaderboardUpdated", handleLeaderboardUpdate);
      socket.off("leaderboardReset", handleLeaderboardReset);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [applySessionToState, syncQuestionIfReady, loadLeaderboard]);

  // Play background music while a question is live, restarting for each new question
  useEffect(() => {
    const audio = questionMusicRef.current;
    if (!audio || !soundEnabled) return;

    if (currentQuestion && session?.status === "Live") {
      audio.currentTime = 0;
      audio.volume = 0.4;
      audio.play().catch((err) => console.log("Quiz music playback failed:", err));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    return () => {
      audio.pause();
    };
  }, [currentQuestion?._id, session?.status, soundEnabled]);

  const handleEnableSound = () => {
    const audio = questionMusicRef.current;
    if (audio) {
      // Unlock audio playback with this real user gesture so later
      // programmatic play() calls (triggered by socket events) aren't blocked.
      audio.volume = 0.4;
      audio
        .play()
        .then(() => audio.pause())
        .catch((err) => console.log("Sound unlock failed:", err));
    }
    setSoundEnabled(true);
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
      <audio ref={questionMusicRef} src="/music/Quiz-question.mp3" />

      {!soundEnabled && (
        <button
          onClick={handleEnableSound}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm text-white"
        >
          <span className="text-6xl">🔊</span>
          <span className="text-2xl font-bold">Click to Enable Sound</span>
          <span className="text-blue-200 text-sm">Required once by your browser to play question music</span>
        </button>
      )}

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
                      timer <= 5 ? "text-red-500 animate-pulse" : "text-yellow-400"
                    }`}>
                      {timer || 0}
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
                <style>{`
                  @keyframes winner-pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(250, 204, 21, 0.3); } 50% { transform: scale(1.03); box-shadow: 0 0 40px rgba(250, 204, 21, 0.6); } }
                  .winner-pulse { animation: winner-pulse 1.6s ease-in-out infinite; }
                `}</style>
                <div className="text-7xl mb-4">🎉</div>
                <h2 className="text-5xl font-black mb-2">Quiz Complete!</h2>
                <p className="text-xl text-blue-200 mb-10">Thank you for participating!</p>

                {leaderboard.length > 0 && (
                  <div className="flex items-end justify-center gap-4 md:gap-6 max-w-3xl mx-auto">
                    {/* 2nd place */}
                    {leaderboard[1] && (
                      <PodiumSpot
                        emp={leaderboard[1]}
                        place={2}
                        heightClass="h-40"
                        ringClass="border-gray-300"
                        medal="🥈"
                      />
                    )}

                    {/* 1st place */}
                    <PodiumSpot
                      emp={leaderboard[0]}
                      place={1}
                      heightClass="h-56"
                      ringClass="border-yellow-400"
                      medal="🥇"
                      isWinner
                    />

                    {/* 3rd place */}
                    {leaderboard[2] && (
                      <PodiumSpot
                        emp={leaderboard[2]}
                        place={3}
                        heightClass="h-28"
                        ringClass="border-amber-600"
                        medal="🥉"
                      />
                    )}
                  </div>
                )}
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
                {session?.status === "Finished" ? "🏆 Final Results" : "🏆 Live Leaderboard"}
              </h3>

              <div className="space-y-3">
                {leaderboard.length > 0 ? (
                  leaderboard.map((emp, index) => {
                    const isWinner = session?.status === "Finished" && index === 0;
                    return (
                    <div
                      key={emp._id}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        isWinner
                          ? "bg-yellow-400/20 border-2 border-yellow-400"
                          : index < 3
                          ? "bg-white/20"
                          : "bg-white/10"
                      } hover:bg-white/30`}
                    >
                      <div className={`text-3xl font-black ${getRankColor(index)} w-12 text-center`}>
                        {getRankIcon(index)}
                      </div>

                      <div className={`w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0 ${
                        isWinner ? "border-yellow-400" : "border-white/30"
                      }`}>
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
                        <p className="font-bold text-lg truncate flex items-center gap-2">
                          {emp.name}
                          {isWinner && (
                            <span className="text-xs font-bold uppercase tracking-wider bg-yellow-400/20 text-yellow-300 border border-yellow-400 rounded-full px-2 py-0.5">
                              Winner
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-blue-200 truncate">{emp.department}</p>
                      </div>

                      <div className="text-2xl font-black text-yellow-400">
                        {emp.points} pts
                      </div>
                    </div>
                    );
                  })
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
