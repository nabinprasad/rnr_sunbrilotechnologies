export default function DashboardCard({
  title,
  value,
  icon,
  color,
}) {
  return (
    <div className={`${color} rounded-3xl p-8 shadow-2xl text-white hover:shadow-3xl transition-all duration-300 hover:-translate-y-2`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm uppercase tracking-wide opacity-80 font-medium">
            {title}
          </p>
          <h2 className="text-5xl font-extrabold mt-3">
            {value}
          </h2>
        </div>
        <div className="ml-4 text-6xl opacity-30">
          {icon}
        </div>
      </div>
    </div>
  );
}