export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
}) {
  return (
    <div>
      {label && (
        <label className="block mb-2 font-medium">
          {label}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}