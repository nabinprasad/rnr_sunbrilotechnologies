export default function DashboardCard({
  title,
  value,
  color = "bg-blue-500",
}) {
  return (
    <div
      className={`${color} rounded-xl p-6 text-white shadow-lg`}
    >
      <h3 className="text-lg">{title}</h3>

      <p className="text-4xl font-bold mt-3">
        {value}
      </p>
    </div>
  );
}