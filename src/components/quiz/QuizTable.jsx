export default function QuizTable({ quiz, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="p-4">#</th>

            <th className="text-left">Question</th>

            <th>Category</th>

            <th>Difficulty</th>

            <th>Timer</th>

            <th>Points</th>

            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {quiz.map((item, index) => (
            <tr key={item.id} className="border-b">
              <td className="p-4">{index + 1}</td>

              <td>{item.question}</td>

              <td>{item.category}</td>

              <td>{item.difficulty}</td>

              <td>{item.timer}s</td>

              <td>{item.points}</td>

              <td className="space-x-3">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 font-semibold hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
