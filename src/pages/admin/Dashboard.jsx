import { useEffect, useState } from "react";
import {
  FaUsers,
  FaQuestionCircle,
  FaAward,
  FaCertificate,
  FaPlayCircle,
  FaCalendar,
  FaBuilding,
  FaBullhorn,
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

  // Get status color for event
  const getStatusColor = (status) => {
    switch (status) {
      case "Live":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Finished":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
  };

  const activeEmployees = employees.filter((emp) => emp.status === "Active").length;
  const approvalPending = employees.filter((emp) => emp.approvalStatus === "Pending").length;

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reward & Recognition Dashboard
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Live Event Monitoring & Management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <img
              src="/sunbrilologo.png"
              alt="Sunbrilo"
              className="h-14 w-auto bg-white rounded-xl shadow-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Featured Event Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-3xl shadow-2xl p-8 mb-8 border border-white/10 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400 font-semibold">
              Featured Event
            </p>
            <h2 className="mt-3 text-4xl font-black text-white">
              {event.title || "Reward & Recognition 2026"}
            </h2>
            <p className="mt-3 text-slate-300 text-lg">
              {event.subtitle || "Celebrating excellence together."}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-medium">
                Status
              </p>
              <p className="mt-2 text-xl font-bold text-white">
                {event.status || "Upcoming"}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-medium">
                Activity
              </p>
              <p className="mt-2 text-xl font-bold text-white">
                {event.currentActivity || "-"}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-medium">
                Date
              </p>
              <p className="mt-2 text-xl font-bold text-white truncate">
                {formattedDate}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-medium">
                Venue
              </p>
              <p className="mt-2 text-xl font-bold text-white">
                {event.venue || "TBD"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <DashboardCard
          title="Total Employees"
          value={employees.length}
          icon={<FaUsers className="text-2xl" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <DashboardCard
          title="Active Employees"
          value={activeEmployees}
          icon={<FaUsers className="text-2xl" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <DashboardCard
          title="Current Activity"
          value={event.currentActivity || "-"}
          icon={<FaQuestionCircle className="text-2xl" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
        <DashboardCard
          title="Event Status"
          value={event.status}
          icon={<FaPlayCircle className="text-2xl" />}
          color={
            event.status === "Live"
              ? "bg-gradient-to-br from-green-500 to-green-600"
              : event.status === "Finished"
              ? "bg-gradient-to-br from-red-500 to-red-600"
              : "bg-gradient-to-br from-purple-500 to-purple-600"
          }
        />
      </div>

      {/* Event Information & Features Grid */}
      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        {/* Event Info Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <FaBullhorn className="text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-slate-900">Event Details</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-2">
                  <FaCalendar className="text-slate-400" />
                  Date & Time
                </p>
                <h3 className="text-xl font-bold text-slate-900">
                  {formattedDate}
                </h3>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-2">
                  <FaBuilding className="text-slate-400" />
                  Venue
                </p>
                <h3 className="text-xl font-bold text-slate-900">
                  {event.venue || "TBD"}
                </h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-500 font-medium mb-1">Status</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-500 font-medium mb-1">Current Activity</p>
                <h3 className="text-xl font-bold text-slate-900">
                  {event.currentActivity || "-"}
                </h3>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-sm text-slate-500 font-medium mb-2">Event Announcement</p>
              <p className="text-slate-700">
                {event.announcement || "No announcements yet."}
              </p>
            </div>
          </div>
        </div>

        {/* Features & Messages Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <FaAward className="text-yellow-600 text-2xl" />
            <h2 className="text-2xl font-bold text-slate-900">Event Features</h2>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-slate-500 font-medium mb-3">Enabled Features</p>
            <div className="flex flex-wrap gap-2">
              {featureList.map((feature) => (
                <span
                  key={feature.label}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    feature.enabled
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {feature.label}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-2">Host Message</p>
            <p className="text-slate-700">
              {event.hostMessage || "No message from host yet."}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <QuickActions />
      <RecentActivity />
    </AdminLayout>
  );
}
