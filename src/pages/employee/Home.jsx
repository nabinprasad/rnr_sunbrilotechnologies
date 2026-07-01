import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import socket from "../../socket";
import { getQuizSession } from "../../api/quizSessionApi";
import { getTambolaSession } from "../../api/tambolaApi";
import { getEvent } from "../../api/eventApi";
import { getEmployeeStatus } from "../../api/employeeApi";
import { getEmployee, setEmployee } from "../../utils/employeeStorage";

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

    return () => {
      clearInterval(interval);
      socket.off("employeeApproved");
      socket.off("quizSessionUpdated", handleQuizSession);
      socket.off("tambolaSessionUpdated", handleTambolaSession);
    };
  }, [navigate]);

  const loadLiveData = async () => {
    try {
      const [eventRes, quizRes, tambolaRes] = await Promise.all([
        getEvent(),
        getQuizSession(),
        getTambolaSession(),
      ]);

      setEvent(eventRes.data.event);
      setQuizSession(quizRes.data.session);
      setTambolaSession(tambolaRes.data.session);
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg text-center">
        <img
          src={employeeData.photo || "https://i.pravatar.cc/150"}
          alt={employeeData.name}
          className="w-28 h-28 rounded-full mx-auto object-cover"
        />

        <h2 className="text-3xl font-bold mt-5">Welcome</h2>
        <h1 className="text-2xl mt-2">{employeeData.name}</h1>
        <p className="text-gray-500">{employeeData.department}</p>

        {employeeData.approvalStatus !== "Approved" && (
          <div className="mt-8 bg-yellow-100 border border-yellow-300 rounded-xl p-6">
            <h2 className="text-xl font-bold text-yellow-700">
              Waiting For Admin Approval
            </h2>
            <p className="mt-3 text-gray-600">
              Your join request has been sent successfully.
            </p>
          </div>
        )}

        {employeeData.approvalStatus === "Approved" && (
          <div className="mt-8">
            {isWaiting && (
              <>
                <div className="bg-blue-50 rounded-xl p-6">
                  <h2 className="text-xl font-bold">Waiting For Host...</h2>
                  <p className="text-gray-500 mt-2">
                    Event will begin shortly.
                  </p>
                </div>

                <Link
                  to="/employee/lobby"
                  className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                >
                  Enter Event Lobby
                </Link>
              </>
            )}

            {liveActivity === "Quiz" && (
              <div className="bg-green-100 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-green-700">
                  Quiz is Live
                </h2>
                <p className="mt-3">Click below to participate.</p>
                <button
                  onClick={() => navigate("/employee/live-quiz")}
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
                >
                  Join Live Quiz
                </button>
              </div>
            )}

            {liveActivity === "Tambola" && (
              <div className="bg-purple-100 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-purple-700">
                  Tambola is Live
                </h2>
                <p className="mt-3">Your ticket is ready. Join the game now.</p>
                <button
                  onClick={() => navigate("/employee/tambola")}
                  className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg"
                >
                  Join Tambola
                </button>
              </div>
            )}

            {isFinished && (
              <div className="bg-orange-100 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-orange-700">
                  Activity Finished
                </h2>
                <p className="mt-3">Thank you for participating.</p>
                <Link
                  to="/employee/lobby"
                  className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                >
                  Back to Lobby
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
