import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import socket from "../../socket";
import { getQuizSession } from "../../api/quizSessionApi";
import { getTambolaSession } from "../../api/tambolaApi";
import { getActivePoll } from "../../api/pollApi";
import { getEvent } from "../../api/eventApi";
import { getEmployeeStatus } from "../../api/employeeApi";
import { getEmployee, setEmployee } from "../../utils/employeeStorage";
import { getEmployeePhotoUrl, DEFAULT_EMPLOYEE_PHOTO } from "../../utils/employeePhoto.js";

function resolveLiveActivity(event, quizSession, tambolaSession) {
  const quizLive = quizSession?.status === "Live";
  const tambolaLive = tambolaSession?.status === "Live";

  if (event?.currentActivity === "Tambola" && tambolaLive) return "Tambola";
  if (event?.currentActivity === "Quiz" && quizLive) return "Quiz";
  if (tambolaLive) return "Tambola";
  if (quizLive) return "Quiz";

  return null;
}

export default function EmployeeHome() {
  const navigate = useNavigate();
  const employee = getEmployee();

  const [employeeData, setEmployeeData] = useState(employee);
  const [event, setEvent] = useState(null);
  const [quizSession, setQuizSession] = useState(null);
  const [tambolaSession, setTambolaSession] = useState(null);
  const [activePoll, setActivePoll] = useState(null);

  useEffect(() => {
    loadEmployee();
    loadLiveData();

    const interval = setInterval(loadLiveData, 3000);

    const storedEmployee = getEmployee();
    if (storedEmployee?._id) {
      socket.emit("joinEmployee", storedEmployee._id);
    }

    socket.on("employeeApproved", (data) => {
      setEmployee(data.employee);
      setEmployeeData(data.employee);
      navigate("/employee/lobby");
    });

    const handleQuizSession = (session) => {
      if (session) setQuizSession(session);
    };

    const handleTambolaSession = (session) => {
      if (session) setTambolaSession(session);
    };

    socket.on("quizSessionUpdated", handleQuizSession);
    socket.on("tambolaSessionUpdated", handleTambolaSession);

    const handlePollUpdated = (poll) => {
      if (poll?.status === "Active") {
        setActivePoll(poll);
      } else {
        setActivePoll(null);
      }
    };
    socket.on("pollUpdated", handlePollUpdated);

    return () => {
      clearInterval(interval);
      socket.off("employeeApproved");
      socket.off("quizSessionUpdated", handleQuizSession);
      socket.off("tambolaSessionUpdated", handleTambolaSession);
      socket.off("pollUpdated", handlePollUpdated);
    };
  }, [navigate]);

  const loadLiveData = async () => {
    try {
      const [eventRes, quizRes, tambolaRes, pollRes] = await Promise.all([
        getEvent(),
        getQuizSession(),
        getTambolaSession(),
        getActivePoll(),
      ]);

      setEvent(eventRes.data.event);
      setQuizSession(quizRes.data.session);
      setTambolaSession(tambolaRes.data.session);
      if (pollRes.data.poll?.status === "Active") {
        setActivePoll(pollRes.data.poll);
      } else {
        setActivePoll(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const loadEmployee = async () => {
    try {
      const storedEmployee = getEmployee();
      if (!storedEmployee?._id) return;

      const res = await getEmployeeStatus(storedEmployee._id);
      setEmployee(res.data.employee);
      setEmployeeData(res.data.employee);
    } catch (err) {
      console.log(err);
    }
  };

  const liveActivity = resolveLiveActivity(event, quizSession, tambolaSession);
  const isWaiting =
    employeeData.approvalStatus === "Approved" &&
    !liveActivity &&
    quizSession?.status !== "Finished" &&
    tambolaSession?.status !== "Finished";

  const isFinished =
    employeeData.approvalStatus === "Approved" &&
    !liveActivity &&
    (quizSession?.status === "Finished" || tambolaSession?.status === "Finished");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-20%] w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Main Container */}
      <div className="w-full max-w-2xl relative z-10 animate-fadeIn">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.2); }
            50% { box-shadow: 0 0 40px rgba(250, 204, 21, 0.4); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}</style>

        {/* Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6 animate-float">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-purple-500 rounded-full blur opacity-70 animate-pulse-glow" />
              <img
                src={getEmployeePhotoUrl(employeeData.photo)}
                alt={employeeData.name}
                className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_EMPLOYEE_PHOTO;
                }}
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white/90 mb-2">
              Welcome
            </h2>
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
              {employeeData.name}
            </h1>
            <p className="text-slate-300 text-lg sm:text-xl font-semibold">
              {employeeData.department}
              {employeeData.designation && <span className="text-slate-400 text-sm block mt-1">{employeeData.designation}</span>}
            </p>
          </div>

          {/* Status & Action Cards */}
          <div className="mt-8 space-y-4">
            {employeeData.approvalStatus !== "Approved" && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center animate-fadeIn">
                <div className="text-4xl mb-3">⏳</div>
                <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-2">
                  Waiting For Admin Approval
                </h2>
                <p className="text-yellow-200/80 text-sm sm:text-base">
                  Your join request has been sent successfully. We'll be with you shortly!
                </p>
              </div>
            )}

            {employeeData.approvalStatus === "Approved" && (
              <>
                {isWaiting && (
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 text-center animate-fadeIn">
                      <div className="text-4xl mb-3">🎯</div>
                      <h2 className="text-xl sm:text-2xl font-bold text-blue-400 mb-2">
                        Waiting For Host...
                      </h2>
                      <p className="text-blue-200/80 text-sm sm:text-base">
                        Event will begin shortly. Get ready!
                      </p>
                    </div>

                    <Link
                      to="/employee/lobby"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <span className="text-xl">🏠</span>
                      Enter Event Lobby
                    </Link>
                  </div>
                )}

                {liveActivity === "Quiz" && (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center animate-fadeIn">
                      <div className="text-4xl mb-3">🧠</div>
                      <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-2">
                        Quiz is Live!
                      </h2>
                      <p className="text-green-200/80 text-sm sm:text-base">
                        Click below to participate and show your knowledge!
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/employee/live-quiz")}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-green-500/20 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <span className="text-xl">🚀</span>
                      Join Live Quiz
                    </button>
                  </div>
                )}

                {liveActivity === "Tambola" && (
                  <div className="space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 text-center animate-fadeIn">
                      <div className="text-4xl mb-3">🎲</div>
                      <h2 className="text-xl sm:text-2xl font-bold text-purple-400 mb-2">
                        Tambola is Live!
                      </h2>
                      <p className="text-purple-200/80 text-sm sm:text-base">
                        Your ticket is ready. Let's play!
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/employee/tambola")}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <span className="text-xl">🎟️</span>
                      Join Tambola
                    </button>
                  </div>
                )}

                {activePoll && (
                  <div className="space-y-4">
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 text-center animate-fadeIn">
                      <div className="text-4xl mb-3">📊</div>
                      <h2 className="text-xl sm:text-2xl font-bold text-indigo-400 mb-2">
                        Live Poll Active!
                      </h2>
                      <p className="text-indigo-200/80 text-sm sm:text-base">
                        {activePoll.question}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/employee/live-poll")}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <span className="text-xl">🗳️</span>
                      Vote Now
                    </button>
                  </div>
                )}

                {isFinished && (
                  <div className="space-y-4">
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6 text-center animate-fadeIn">
                      <div className="text-4xl mb-3">🎉</div>
                      <h2 className="text-xl sm:text-2xl font-bold text-orange-400 mb-2">
                        Activity Finished!
                      </h2>
                      <p className="text-orange-200/80 text-sm sm:text-base">
                        Thank you for participating. You were amazing!
                      </p>
                    </div>

                    <Link
                      to="/employee/lobby"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <span className="text-xl">🏠</span>
                      Back to Lobby
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
