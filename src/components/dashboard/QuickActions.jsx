import {
  FaUserPlus,
  FaQuestionCircle,
  FaPoll,
  FaAward,
  FaCalendarAlt,
} from "react-icons/fa";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Employee",
      icon: <FaUserPlus />,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Create Quiz",
      icon: <FaQuestionCircle />,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Create Poll",
      icon: <FaPoll />,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Recognition",
      icon: <FaAward />,
      color: "from-yellow-500 to-orange-600",
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mt-8 border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <FaCalendarAlt className="text-purple-600 text-2xl" />
        <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action) => (
          <button
            key={action.title}
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
          </button>
        ))}
      </div>
    </div>
  );
}