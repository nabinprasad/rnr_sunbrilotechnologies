import {
  FaUserPlus,
  FaQuestionCircle,
  FaPoll,
  FaAward,
  FaCalendarAlt,
  FaTv,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Employee",
      path: "/admin/employees",
      icon: <FaUserPlus />,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Create Quiz",
      path: "/admin/quiz",
      icon: <FaQuestionCircle />,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Create Poll",
      path: "/admin/polls",
      icon: <FaPoll />,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Recognition",
      path: "/admin/awards",
      icon: <FaAward />,
      color: "from-yellow-500 to-orange-600",
    },
  ];

  const liveScreens = [
    { title: "Live Quiz", path: "/live-quiz", icon: "🧠" },
    { title: "Live Poll", path: "/live-poll", icon: "📊" },
    { title: "Live Tambola", path: "/live-tambola", icon: "🎟️" },
    { title: "Live Awards", path: "/live-awards", icon: "🏆" },
    { title: "Live Results", path: "/live-results", icon: "📈" },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <FaCalendarAlt className="text-purple-600 text-2xl" />
          <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action) => (
            <NavLink
              key={action.title}
              to={action.path}
              className="group border-2 border-slate-200 rounded-2xl p-8 hover:border-transparent transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="text-4xl mb-4 text-slate-600 group-hover:text-white transition-colors duration-300">
                  {action.icon}
                </div>
                <span className="text-lg font-semibold text-slate-700 group-hover:text-white transition-colors duration-300">
                  {action.title}
                </span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Live Screens */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <FaTv className="text-blue-600 text-2xl" />
          <h2 className="text-2xl font-bold text-slate-900">Live Screens</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {liveScreens.map((screen) => (
            <NavLink
              key={screen.title}
              to={screen.path}
              target="_blank"
              className="group border-2 border-slate-200 rounded-2xl p-6 hover:border-transparent transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-3xl mb-3 text-slate-600 group-hover:text-white transition-colors duration-300">
                  {screen.icon}
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-white transition-colors duration-300">
                  {screen.title}
                </span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}