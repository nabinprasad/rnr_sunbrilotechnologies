import { useState, useEffect } from "react";
import { quizData } from "../../data/quizData";

export default function LiveQuiz() {
  const [currentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  const question = quizData[currentQuestion];
  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-10">
        <h2 className="text-4xl font-bold text-center mb-10">Live Quiz</h2>
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-red-600">{timeLeft}</div>

          <p className="text-gray-500">Seconds Remaining</p>
        </div>
        <div className="text-xl font-semibold mb-8">{question.question}</div>

        <div className="grid md:grid-cols-2 gap-5">
          <button className="p-5 rounded-xl bg-blue-100 hover:bg-blue-500 hover:text-white transition">
            A. {question.optionA}
          </button>

          <button className="p-5 rounded-xl bg-blue-100 hover:bg-blue-500 hover:text-white transition">
            B. {question.optionB}
          </button>

          <button className="p-5 rounded-xl bg-blue-100 hover:bg-blue-500 hover:text-white transition">
            C. {question.optionC}
          </button>

          <button className="p-5 rounded-xl bg-blue-100 hover:bg-blue-500 hover:text-white transition">
            D. {question.optionD}
          </button>
        </div>
      </div>
    </div>
  );
}
