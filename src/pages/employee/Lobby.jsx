import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaAward,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaDice,
  FaGift,
  FaMapMarkerAlt,
  FaPoll,
  FaQuestionCircle,
  FaTrophy,
  FaUserShield,
} from "react-icons/fa";
import { getEmployeeStatus } from "../../api/employeeApi";
import { getEvent } from "../../api/eventApi";
import { getQuizSession } from "../../api/quizSessionApi";
import { getTambolaSession } from "../../api/tambolaApi";
import { getEmployee, setEmployee as setStoredEmployee } from "../../utils/employeeStorage";

export default function Lobby() {
  const [employee, setEmployee] = useState(getEmployee());
  const [event, setEvent] = useState(null);
  const [quizSession, setQuizSession] = useState(null);
  const [tambolaSession, setTambolaSession] = useState(null);
  const [countdown, setCountdown] = useState(300);

  useEffect(() => {
    loadEmployee();
    loadLiveData();

    const refreshInterval = setInterval(() => {
      loadEmployee();
      loadLiveData();
    }, 3000);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const loadEmployee = async () => {
    try {
      if (!employee?._id) return;

      const res = await getEmployeeStatus(employee._id);

      setEmployee(res.data.employee);
      setStoredEmployee(res.data.employee);
    } catch (err) {
      console.log(err);
    }
  };

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

  const getLiveActivity = () => {
    const quizLive = quizSession?.status === "Live";
    const tambolaLive = tambolaSession?.status === "Live";

    if (event?.currentActivity === "Tambola" && tambolaLive) return "Tambola";
    if (event?.currentActivity === "Quiz" && quizLive) return "Quiz";
    if (tambolaLive) return "Tambola";
    if (quizLive) return "Quiz";

    return null;
  };

  const liveActivity = getLiveActivity();

  const minutes = String(Math.floor(countdown / 60)).padStart(2, "0");
  const seconds = String(countdown % 60).padStart(2, "0");
  const isApproved = employee?.approvalStatus === "Approved";
  const eventDate = event?.eventDate
    ? new Date(event.eventDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Announcing soon";

  const activities = [
    { label: "Quiz", enabled: event?.quizEnabled, icon: <FaQuestionCircle /> },
    { label: "Poll", enabled: event?.pollEnabled, icon: <FaPoll /> },
    { label: "Tambola", enabled: event?.tambolaEnabled, icon: <FaDice /> },
    { label: "Lucky Draw", enabled: event?.luckyDrawEnabled, icon: <FaGift /> },
    { label: "Leaderboard", enabled: event?.leaderboardEnabled, icon: <FaTrophy /> },
    { label: "Awards", enabled: event?.awardEnabled, icon: <FaAward /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="min-h-screen bg-[linear-gradient(135deg,#eef2ff_0%,#fff7ed_48%,#ecfdf5_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center gap-6">
          <header className="overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 ring-white/30">
            <div className="relative min-h-52 sm:min-h-64">
              {event?.banner ? (
                <img
                  src={event.banner}
                  alt={event?.title || "Event banner"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#2563eb,#7c3aed_48%,#db2777)]" />
              )}
              <div className="absolute inset-0 bg-slate-950/45" />

              <div className="relative flex min-h-52 flex-col justify-between p-5 text-white sm:min-h-64 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                    <FaUserShield />
                    {isApproved ? "Approved" : "Approval Pending"}
                  </span>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900">
                    {event?.status || "Upcoming"}
                  </span>
                </div>

                <div className="max-w-3xl">
                  <h1 className="text-3xl font-black sm:text-5xl">
                    {event?.title || "Reward & Recognition"}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100 sm:text-lg">
                    {event?.subtitle || "Celebrating excellence together"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-2xl bg-white p-5 shadow-xl sm:p-6">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left lg:flex-col lg:items-center lg:text-center">
                <img
                  src={employee?.photo || "https://i.pravatar.cc/150"}
                  alt={employee?.name || "Employee"}
                  className="h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-lg ring-2 ring-blue-100 sm:h-32 sm:w-32"
                />

                <div className="mt-4 sm:ml-5 sm:mt-0 lg:ml-0 lg:mt-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Welcome
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                    {employee?.name || "Employee"}
                  </h2>
                  <p className="mt-1 text-slate-500">
                    {employee?.department || "Department"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-blue-50 p-4">
                  <FaCheckCircle className={isApproved ? "text-green-600" : "text-amber-500"} />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Approval
                  </p>
                  <p className="mt-1 font-bold text-slate-950">
                    {employee?.approvalStatus || "Pending"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-4">
                  <FaClock className="text-blue-600" />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Starts In
                  </p>
                  <p className="mt-1 font-bold text-slate-950">
                    {minutes}:{seconds}
                  </p>
                </div>
              </div>

              {liveActivity && isApproved && (
                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    Live Now
                  </p>
                  <p className="mt-1 font-bold text-slate-950">{liveActivity}</p>
                  <Link
                    to={
                      liveActivity === "Tambola"
                        ? "/employee/tambola"
                        : "/employee/live-quiz"
                    }
                    className={`mt-4 flex w-full items-center justify-center rounded-xl px-5 py-3 font-bold text-white shadow-lg transition ${
                      liveActivity === "Tambola"
                        ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/25"
                        : "bg-green-600 hover:bg-green-700 shadow-green-600/25"
                    }`}
                  >
                    Join {liveActivity}
                  </Link>
                </div>
              )}

              <div className="mt-6">
                {isApproved ? (
                  <Link
                    to="/employee/home"
                    className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                  >
                    Enter Event
                  </Link>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800">
                    Waiting for host approval
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-xl">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <FaCalendarAlt />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </p>
                      <p className="font-bold text-slate-950">{eventDate}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-xl">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-pink-700">
                      <FaMapMarkerAlt />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Venue
                      </p>
                      <p className="font-bold text-slate-950">
                        {event?.venue || "Venue will be shared soon"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {(event?.welcomeMessage || event?.announcement) && (
                <div className="rounded-2xl bg-white p-5 shadow-xl sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Host Message
                  </p>
                  <p className="mt-3 text-base leading-7 text-slate-700">
                    {event?.announcement || event?.welcomeMessage}
                  </p>
                </div>
              )}

              <div className="rounded-2xl bg-white p-5 shadow-xl sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Activities
                    </p>
                    <h3 className="text-xl font-black text-slate-950">
                      What is available today
                    </h3>
                  </div>
                  <span className="text-sm font-semibold text-slate-500">
                    {activities.filter((activity) => activity.enabled).length} active
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {activities.map((activity) => (
                    <div
                      key={activity.label}
                      className={`flex items-center justify-between rounded-xl border p-4 ${
                        activity.enabled
                          ? "border-blue-100 bg-blue-50 text-blue-800"
                          : "border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{activity.icon}</span>
                        <span className="font-bold">{activity.label}</span>
                      </div>
                      <span className="text-xs font-bold uppercase">
                        {activity.enabled ? "Open" : "Soon"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
