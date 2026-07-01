import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  getQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../api/quizApi";
import toast from "react-hot-toast";

const initialForm = {
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  points: 10,
  timer: 30,
  status: "Active",
};

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await getQuiz();
      setQuestions(res.data.questions);
    } catch {
      toast.error("Unable to load questions");
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...form.options];
    updated[index] = value;
    setForm({ ...form, options: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await updateQuestion(selectedId, form);
        toast.success("Question Updated");
      } else {
        await addQuestion(form);
        toast.success("Question Added");
      }

      setForm(initialForm);
      setIsEdit(false);
      setSelectedId(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const handleEdit = (q) => {
    setForm(q);
    setSelectedId(q._id);
    setIsEdit(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Question?")) return;

    await deleteQuestion(id);
    toast.success("Deleted");
    fetchQuestions();
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-8">

        <h2 className="text-3xl font-bold mb-6">
          Quiz Management
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Question"
            value={form.question}
            onChange={(e) =>
              setForm({ ...form, question: e.target.value })
            }
          />

          {form.options.map((op, index) => (
            <input
              key={index}
              className="w-full border p-3 rounded-lg"
              placeholder={`Option ${index + 1}`}
              value={op}
              onChange={(e) =>
                handleOptionChange(index, e.target.value)
              }
            />
          ))}

          <div className="grid md:grid-cols-3 gap-5">

            <select
              className="border p-3 rounded-lg"
              value={form.correctAnswer}
              onChange={(e) =>
                setForm({
                  ...form,
                  correctAnswer: Number(e.target.value),
                })
              }
            >
              <option value={0}>Correct Option 1</option>
              <option value={1}>Correct Option 2</option>
              <option value={2}>Correct Option 3</option>
              <option value={3}>Correct Option 4</option>
            </select>

            <input
              type="number"
              className="border p-3 rounded-lg"
              placeholder="Points"
              value={form.points}
              onChange={(e) =>
                setForm({
                  ...form,
                  points: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              className="border p-3 rounded-lg"
              placeholder="Timer"
              value={form.timer}
              onChange={(e) =>
                setForm({
                  ...form,
                  timer: Number(e.target.value),
                })
              }
            />

          </div>

          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg">
            {isEdit ? "Update Question" : "Add Question"}
          </button>

        </form>

      </div>

      <div className="bg-white rounded-xl shadow mt-8 overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-800 text-white">

            <tr>
              <th className="p-3">Question</th>
              <th>Points</th>
              <th>Timer</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {questions.map((q) => (

              <tr key={q._id} className="border-b">

                <td className="p-3">{q.question}</td>

                <td>{q.points}</td>

                <td>{q.timer} sec</td>

                <td>

                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                    onClick={() => handleEdit(q)}
                  >
                    Edit
                  </button>

                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(q._id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </AdminLayout>
  );
}