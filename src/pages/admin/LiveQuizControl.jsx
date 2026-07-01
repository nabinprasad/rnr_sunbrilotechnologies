import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import toast from "react-hot-toast";

import { getQuiz } from "../../api/quizApi";
import { getQuizSession, updateQuizSession } from "../../api/quizSessionApi";
import { resetQuizAnswers } from "../../api/quizAnswerApi";
import { resetEmployeePoints } from "../../api/employeeApi";

export default function LiveQuizControl() {
  const [questions, setQuestions] = useState([]);
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadQuestions();
    loadSession();
  }, []);

  const loadQuestions = async () => {
    const res = await getQuiz();
    setQuestions(res.data.questions);
  };

  const loadSession = async () => {
    const res = await getQuizSession();
    setSession(res.data.session);
  };
const startQuiz = async () => {
  if (questions.length === 0) {
    toast.error("No Questions Added");
    return;
  }

  try {
    // 1. Reset previous quiz answers
    await resetQuizAnswers();

    // 2. Reset employee points (VERY IMPORTANT if new quiz)
    await resetEmployeePoints();

    // 3. Always restart from clean session state
    const firstQuestion = questions[0];

    await updateQuizSession({
      status: "Live",
      questionNumber: 1,
      currentQuestion: firstQuestion._id,
      timer: Number(firstQuestion.timer || 30),
    });

    setCurrentIndex(0);

    // 4. Reload session after update
    await loadSession();

    toast.success("Quiz Started");
  } catch (err) {
    console.log(err);
    toast.error("Unable to start quiz");
  }
};

  const nextQuestion = async () => {
    const next = currentIndex + 1;

    if (next >= questions.length) {
      toast.success("Quiz Finished");

      await updateQuizSession({
        status: "Finished",
      });

      loadSession();

      return;
    }

    await updateQuizSession({
      status: "Live",
      questionNumber: next + 1,
      currentQuestion: questions[next]._id,
      timer: questions[next].timer,
    });

    setCurrentIndex(next);

    loadSession();
  };

  const endQuiz = async () => {
    await updateQuizSession({
      status: "Finished",
    });

    toast.success("Quiz Ended");

    loadSession();
  };
const currentQuestion = questions.find(
  q => q._id === session?.currentQuestion
);
  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Live Quiz Control</h1>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-blue-600 text-white rounded-xl p-6">
            <p>Status</p>

            <h2 className="text-2xl font-bold mt-2">{session?.status}</h2>
          </div>

          <div className="bg-green-600 text-white rounded-xl p-6">
            <p>Total Questions</p>

            <h2 className="text-2xl font-bold mt-2">{questions.length}</h2>
          </div>

          <div className="bg-orange-600 text-white rounded-xl p-6">
            <p>Current Question</p>

            <h2 className="text-2xl font-bold mt-2">
              {session?.questionNumber || 0}
            </h2>
          </div>

          <div className="bg-purple-600 text-white rounded-xl p-6">
            <p>Timer</p>

            <h2 className="text-2xl font-bold mt-2">{session?.timer || 0}s</h2>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button
            onClick={startQuiz}
            className="bg-green-600 text-white px-8 py-3 rounded-lg"
          >
            ▶ Start Quiz
          </button>

          <button
            onClick={nextQuestion}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg"
          >
            Next Question
          </button>

          <button
            onClick={endQuiz}
            className="bg-red-600 text-white px-8 py-3 rounded-lg"
          >
            End Quiz
          </button>
        </div>

       {currentQuestion && (
  <div className="mt-10 border rounded-xl p-6">

    <h2 className="text-xl font-bold mb-4">
      Current Question
    </h2>

    <p className="text-lg font-semibold mb-5">
      {currentQuestion.question}
    </p>

    <div className="grid md:grid-cols-2 gap-4">

      {currentQuestion.options.map((op, index) => (
        <div
          key={index}
          className="border rounded-lg p-3 bg-slate-50"
        >
          {op}
        </div>
      ))}

    </div>

  </div>
)}
      </div>
    </AdminLayout>
  );
}
