const activities = [
  "Employee Rahul added.",
  "Quiz created successfully.",
  "Certificate generated.",
  "Recognition award published.",
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">

      <h2 className="text-xl font-semibold mb-6">
        Recent Activities
      </h2>

      {activities.map((activity, index) => (
        <div
          key={index}
          className="border-b py-3"
        >
          {activity}
        </div>
      ))}

    </div>
  );
}