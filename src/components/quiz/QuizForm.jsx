import { useState, useEffect } from "react";
import Modal from "../ui/Modal";

const initialForm = {
  id: "",
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  answer: "",
  category: "",
  difficulty: "Easy",
  timer: "20",
  points: "10",
};

export default function QuizForm({
  isOpen,
  onClose,
  onSave,
  question,
  isEdit,
}) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = (e) => {
    e.preventDefault();

    onSave({
      id: form.id || Date.now(),

      question: form.question,

      options: [form.optionA, form.optionB, form.optionC, form.optionD],

      correctAnswer: Number(form.answer),

      timer: Number(form.timer),

      points: Number(form.points),

      category: form.category,

      difficulty: form.difficulty,
    });

    setForm(initialForm);
    onClose();
  };

  useEffect(() => {
    if (question) {
      setForm({ ...question });
    } else {
      setForm(initialForm);
    }
  }, [question, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Quiz Question" : "Add Quiz Question"}
      width="max-w-4xl"
    >
      <form onSubmit={submit} className="space-y-5">
        <textarea
          name="question"
          value={form.question}
          onChange={handleChange}
          placeholder="Question"
          className="w-full border rounded-xl p-3"
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="optionA"
            value={form.optionA}
            onChange={handleChange}
            placeholder="Option A"
            className="border rounded-xl p-3"
          />

          <input
            name="optionB"
            value={form.optionB}
            onChange={handleChange}
            placeholder="Option B"
            className="border rounded-xl p-3"
          />

          <input
            name="optionC"
            value={form.optionC}
            onChange={handleChange}
            placeholder="Option C"
            className="border rounded-xl p-3"
          />

          <input
            name="optionD"
            value={form.optionD}
            onChange={handleChange}
            placeholder="Option D"
            className="border rounded-xl p-3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            name="answer"
            value={form.answer}
            onChange={handleChange}
            className="border rounded-xl p-3"
          >
            <option value="">Correct Answer</option>
            <option value="0">Option A</option>
            <option value="1">Option B</option>
            <option value="2">Option C</option>
            <option value="3">Option D</option>
          </select>

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            className="border rounded-xl p-3"
          />

          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="border rounded-xl p-3"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <input
            type="number"
            name="timer"
            value={form.timer}
            onChange={handleChange}
            className="border rounded-xl p-3"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border px-5 py-2 rounded-xl"
          >
            Cancel
          </button>

          <button className="bg-blue-600 text-white px-5 py-2 rounded-xl">
            {isEdit ? "Update Question" : "Save Question"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
