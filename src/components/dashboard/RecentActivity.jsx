import { FaCheckCircle, FaClock } from "react-icons/fa";

const activities = [
  { text: "Employee Rahul added.", time: "Just now" },
  { text: "Quiz created successfully.", time: "2 mins ago" },
  { text: "Certificate generated.", time: "5 mins ago" },
  { text: "Recognition award published.", time: "10 mins ago" },
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mt-8 border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <FaCheckCircle className="text-green-600 text-2xl" />
        <h2 className="text-2xl font-bold text-slate-900">Recent Activities</h2>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <FaCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-slate-700 font-medium">{activity.text}</p>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <FaClock className="text-xs" />
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}