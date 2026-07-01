export default function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      {label && (
        <label className="block mb-2 font-medium">
          {label}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}