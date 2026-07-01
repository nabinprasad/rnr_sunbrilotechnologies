import {
  FaUserPlus,
  FaQuestionCircle,
  FaPoll,
  FaAward,
} from "react-icons/fa";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Employee",
      icon: <FaUserPlus />,
    },
    {
      title: "Create Quiz",
      icon: <FaQuestionCircle />,
    },
    {
      title: "Create Poll",
      icon: <FaPoll />,
    },
    {
      title: "Recognition",
      icon: <FaAward />,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">

      <h2 className="text-xl font-semibold mb-6">
        Quick Actions
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

        {actions.map((action) => (
          <button
            key={action.title}
            className="border rounded-xl p-6 hover:bg-blue-600 hover:text-white transition"
          >
            <div className="text-3xl mb-3">
              {action.icon}
            </div>

            {action.title}
          </button>
        ))}

      </div>
    </div>
  );
}