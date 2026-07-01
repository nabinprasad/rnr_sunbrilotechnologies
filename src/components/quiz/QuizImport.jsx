import { readQuizExcel } from "../../utils/excel";

export default function QuizImport({ onImport }) {
  const handleFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    readQuizExcel(file, (data) => {
      const questions = data.map((item, index) => ({
        id: Date.now() + index,

        question: item.Question,

        optionA: item.OptionA,

        optionB: item.OptionB,

        optionC: item.OptionC,

        optionD: item.OptionD,

        answer: item.Answer,

        category: item.Category,

        difficulty: item.Difficulty,

        timer: item.Timer,

        points: item.Points,
      }));

      onImport(questions);
    });
  };

  return (
    <label className="bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700">
      Import Excel

      <input
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={handleFile}
      />
    </label>
  );
}