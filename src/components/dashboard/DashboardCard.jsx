export default function DashboardCard({
  title,
  value,
  icon,
  color,
}) {
  return (
    <div className={`${color} rounded-xl p-6 shadow-lg text-white`}>
      <div className="flex justify-between items-center">

        <div>
          <p className="text-sm opacity-80">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div className="text-5xl opacity-40">
          {icon}
        </div>

      </div>
    </div>
  );
}