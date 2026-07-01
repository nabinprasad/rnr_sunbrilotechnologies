import { useEffect, useState, useRef } from "react";
import { getQuiz } from "../../api/quizApi";
import { getQuizSession } from "../../api/quizSessionApi";
import { submitAnswer } from "../../api/quizAnswerApi";
import toast from "react-hot-toast";

export default function EmployeeLiveQuiz() {
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);
  const lastQuestionId = useRef(null);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const quizRes = await getQuiz();
      const sessionRes = await getQuizSession();

      const allQuestions = quizRes.data.questions;
      const quizSession = sessionRes.data.session;

      setSession(quizSession);

      const currentId =
        quizSession.currentQuestion?._id || quizSession.currentQuestion;

      const current = allQuestions.find(
        (q) => String(q._id) === String(currentId),
      );

      // Reset only when question changes
      if (current && current._id !== lastQuestionId.current) {
        lastQuestionId.current = current._id;

        setCurrentQuestion(current);

        setSelectedAnswer(null);

        setSubmitted(false);
      }

      setCurrentQuestion(current);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (session) {
      setTimer(session.timer);
    }
  }, [session?.questionNumber]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (timer === 0 && !submitted) {
      handleSubmit();
    }
  }, [timer]);

 const handleSubmit = async () => {
  if (submitted) return;

  if (!currentQuestion) {
    toast.error("Question not loaded");
    return;
  }

  if (selectedAnswer === null) {
    toast.error("Please select an answer");
    return;
  }

  try {
    const employee = JSON.parse(localStorage.getItem("employee"));

    if (!employee?._id) {
      toast.error("Employee not found. Please login again.");
      return;
    }

    const res = await submitAnswer({
      employeeId: employee._id,
      questionId: currentQuestion._id,
      selectedAnswer,
    });

    setSubmitted(true);

    if (res.data.isCorrect) {
      toast.success(`✅ Correct! +${res.data.earnedPoints} Points`);
    } else {
      toast.error("❌ Wrong Answer");
    }

    console.log(res.data);

  } catch (err) {
    console.log(err.response?.data);

    toast.error(
      err.response?.data?.message || "Something went wrong"
    );
  }
};
  if (!session) return <h2 className="text-center mt-20">Loading...</h2>;

  if (session.status === "Waiting")
    return (
      <div className="min-h-screen flex items-center justify-center text-4xl font-bold">
        Waiting for Quiz...
      </div>
    );

  if (session.status === "Finished")
    return (
      <div className="min-h-screen flex items-center justify-center text-4xl font-bold">
        🎉 Quiz Finished
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
            Question {session.questionNumber}
          </h2>

          <div className="bg-red-600 text-white px-5 py-2 rounded-lg text-lg font-bold">
            ⏱ {timer}s
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-10">
          {currentQuestion?.question}
        </h1>

        <div className="grid md:grid-cols-2 gap-5">
          {currentQuestion?.options?.map((option, index) => (
            <button
              key={index}
              disabled={submitted}
              onClick={() => {
                if (!submitted) {
                  setSelectedAnswer(index);
                }
              }}
              className={`border rounded-xl p-5 text-left text-lg transition-all

              ${
                selectedAnswer === index
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-blue-100"
              }

              ${submitted ? "opacity-70 cursor-not-allowed" : ""}
              `}
            >
              <span className="font-bold mr-2">
                {String.fromCharCode(65 + index)}.
              </span>

              {option}
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            disabled={submitted}
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-10 py-3 rounded-lg text-lg"
          >
            {submitted ? "✓ Answer Submitted" : "Submit Answer"}
          </button>
        </div>
      </div>
    </div>
  );
}
