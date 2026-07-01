import { useEffect, useState } from "react";
import {
  FaUsers,
  FaQuestionCircle,
  FaAward,
  FaCertificate,
  FaPlayCircle,
} from "react-icons/fa";

import AdminLayout from "../../components/layout/AdminLayout";
import DashboardCard from "../../components/dashboard/DashboardCard";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentActivity from "../../components/dashboard/RecentActivity";

import { getEmployees } from "../../api/employeeApi";
import { getEvent } from "../../api/eventApi";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [event, setEvent] = useState({
    status: "Waiting",
    currentActivity: "-",
    hostMessage: "",
  });

  const featureList = [
    { label: "Quiz", enabled: event.quizEnabled },
    { label: "Poll", enabled: event.pollEnabled },
    { label: "Tambola", enabled: event.tambolaEnabled },
    { label: "Memory", enabled: event.memoryEnabled },
    { label: "Lucky Draw", enabled: event.luckyDrawEnabled },
    { label: "Leaderboard", enabled: event.leaderboardEnabled },
    { label: "Awards", enabled: event.awardEnabled },
  ];

  const formattedDate = event.eventDate
    ? new Date(event.eventDate).toLocaleString()
    : "-";

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const empRes = await getEmployees();
      setEmployees(empRes.data.employees);

      const eventRes = await getEvent();

      if (eventRes.data.event) {
        setEvent(eventRes.data.event);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Reward & Recognition Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Live Event Monitoring
            </p>
          </div>

          <div className="flex items-center gap-4">
            <img
              src="/sunbrilologo.png"
              alt="Sunbrilo"
              className="h-12 w-auto"
            />
            <img
              src="/riskonnectlogo.png"
              alt="Riskonnect"
              className="h-12 w-auto"
            />
          </div>
        </div>

      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-slate-200">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              Featured Event
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              {event.title || "Reward & Recognition 2026"}
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              {event.subtitle || "Celebrating excellence together."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Status
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {event.status || "Upcoming"}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Activity
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {event.currentActivity || "-"}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Date
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {formattedDate}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Venue
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {event.venue || "TBD"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <DashboardCard
          title="Employees"
          value={employees.length}
          icon={<FaUsers />}
          color="bg-blue-600"
        />

        <DashboardCard
          title="Active Employees"
          value={
            employees.filter(
              (emp) => emp.status === "Active"
            ).length
          }
          icon={<FaUsers />}
          color="bg-green-600"
        />

        <DashboardCard
          title="Current Activity"
          value={event.currentActivity || "-"}
          icon={<FaQuestionCircle />}
          color="bg-orange-500"
        />

        <DashboardCard
          title="Event Status"
          value={event.status}
          icon={<FaPlayCircle />}
          color={
            event.status === "Live"
              ? "bg-green-600"
              : event.status === "Finished"
              ? "bg-red-600"
              : "bg-purple-600"
          }
        />

      </div>

      {/* Event Information */}

      <div className="bg-white rounded-xl shadow mt-8 p-6">

        <h2 className="text-2xl font-bold mb-5">
          Current Event
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div>
            <p className="text-gray-500">Event Title</p>
            <h3 className="text-xl font-bold">
              {event.title || "Untitled Event"}
            </h3>
          </div>

          <div>
            <p className="text-gray-500">Date & Time</p>
            <h3 className="text-xl font-bold">
              {formattedDate}
            </h3>
          </div>

          <div>
            <p className="text-gray-500">Venue</p>
            <h3 className="text-xl font-bold">
              {event.venue || "TBD"}
            </h3>
          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-6">

          <div>
            <p className="text-gray-500">Status</p>
            <h3 className="text-xl font-bold">{event.status}</h3>
          </div>

          <div>
            <p className="text-gray-500">Current Activity</p>
            <h3 className="text-xl font-bold">
              {event.currentActivity || "-"}
            </h3>
          </div>

          <div>
            <p className="text-gray-500">Host Message</p>
            <h3 className="text-lg">
              {event.hostMessage || "No Message"}
            </h3>
          </div>

        </div>

        <div className="mt-6">
          <p className="text-gray-500 mb-3">Event Announcement</p>
          <p className="text-lg text-gray-700">
            {event.announcement || "No announcements yet."}
          </p>
        </div>

        <div className="mt-6">
          <p className="text-gray-500 mb-3">Enabled Features</p>
          <div className="flex flex-wrap gap-2">
            {featureList.map((feature) => (
              <span
                key={feature.label}
                className={`px-3 py-2 rounded-full text-sm font-semibold ${
                  feature.enabled
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {feature.label}
              </span>
            ))}
          </div>
        </div>

      </div>

      <QuickActions />

      <RecentActivity />

    </AdminLayout>
  );
}