export default function PageHeader({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      <div className="mt-4 md:mt-0 flex gap-3">
        {children}
      </div>
    </div>
  );
}