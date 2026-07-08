import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getQuiz } from "../../api/quizApi";
import { getQuizSession } from "../../api/quizSessionApi";
import { submitAnswer } from "../../api/quizAnswerApi";
import toast from "react-hot-toast";
import { getEmployee } from "../../utils/employeeStorage";
import socket from "../../socket";

export default function EmployeeLiveQuiz() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [employeeName] = useState(() => getEmployee()?.name || "");
  const [questions, setQuestions] = useState([]);
  const lastQuestionId = useRef(null);
  const lastSessionQuestionId = useRef(null);
  const lastSessionStatus = useRef(null);
  const employeeFinished = useRef(false);
  const questionStartTime = useRef(null);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 2000);

    const handleSession = (session) => {
      if (!session) return;
      if (employeeFinished.current && session.status === "Live") return;

      if (session.status === "Waiting") {
        employeeFinished.current = false;
      }

      const currentId =
        session.currentQuestion?._id || session.currentQuestion;

      if (
        String(currentId) === String(lastSessionQuestionId.current) &&
        session.status === lastSessionStatus.current
      ) {
        return;
      }

      setSession(session);
    };

    socket.on("quizSessionUpdated", handleSession);

    return () => {
      clearInterval(interval);
      socket.off("quizSessionUpdated", handleSession);
    };
  }, []);

  async function loadData() {
    try {
      const quizRes = await getQuiz();
      const sessionRes = await getQuizSession();

      const allQuestions = quizRes.data.questions;
      const quizSession = sessionRes.data.session;

      setQuestions(allQuestions);

      if (employeeFinished.current && quizSession?.status === "Live") return;

      if (quizSession?.status === "Waiting") {
        employeeFinished.current = false;
      }

      const currentId =
        quizSession.currentQuestion?._id || quizSession.currentQuestion;
      const sessionStatus = quizSession?.status;

      if (
        String(currentId) === String(lastSessionQuestionId.current) &&
        sessionStatus === lastSessionStatus.current
      ) {
        return;
      }

      lastSessionQuestionId.current = currentId;
      lastSessionStatus.current = sessionStatus;
      setSession(quizSession);

      const current = allQuestions.find(
        (q) => String(q._id) === String(currentId),
      );

      // Reset only when question changes
      if (current && current._id !== lastQuestionId.current) {
        lastQuestionId.current = current._id;
        questionStartTime.current = Date.now();

        setCurrentQuestion(current);
        setSelectedAnswer(null);
        setSubmitted(false);
        setTimer(Number(current.timer || quizSession?.timer || 30));
      } else if (!current) {
        setCurrentQuestion(null);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (session?.status !== "Live" || !currentQuestion || submitted) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.status, currentQuestion?._id, submitted]);

  useEffect(() => {
    if (submitted || timer !== 0 || !currentQuestion) return;
    if (!questionStartTime.current) return;

    if (selectedAnswer === null || selectedAnswer === undefined) {
      setTimeout(() => setSubmitted(true), 0);
      toast.error("Time is up! You did not select an answer.");
      return;
    }

    handleSubmit();
  }, [timer, submitted, currentQuestion?._id, selectedAnswer]);

 function moveToNextQuestion() {
  const currentIndex = questions.findIndex(
    (question) => String(question._id) === String(currentQuestion?._id),
  );
  const nextQuestion = questions[currentIndex + 1];

  if (!nextQuestion) {
    employeeFinished.current = true;
    setSession((prev) => ({ ...prev, status: "Finished" }));
    setCurrentQuestion(null);
    setTimer(0);
    return;
  }

  lastQuestionId.current = nextQuestion._id;
  questionStartTime.current = Date.now();

  setSession((prev) => ({
    ...prev,
    questionNumber: (prev?.questionNumber || currentIndex + 1) + 1,
    currentQuestion: nextQuestion._id,
  }));
  setCurrentQuestion(nextQuestion);
  setSelectedAnswer(null);
  setSubmitted(false);
  setTimer(Number(nextQuestion.timer || 30));
}

 async function handleSubmit() {
  if (submitted) return;

  if (!currentQuestion) {
    toast.error("Question not loaded");
    return;
  }

  if (selectedAnswer === null || selectedAnswer === undefined) {
    toast.error("Please select an answer");
    return;
  }

  try {
    const employee = getEmployee();

    if (!employee?._id) {
      toast.error("Employee not found. Please login again.");
      return;
    }

    // Calculate time taken in seconds
    const timeTaken = questionStartTime.current 
      ? Math.round((Date.now() - questionStartTime.current) / 1000)
      : 0;

    const payload = {
      employeeId: employee._id,
      questionId: currentQuestion._id,
      selectedAnswer: Number(selectedAnswer),
      timeTaken,
    };

    console.log("Submitting answer:", payload);

    const res = await submitAnswer(payload);

    setSubmitted(true);

    if (res.data.isCorrect) {
      const bonus = res.data.speedBonus ? ` + ${res.data.speedBonus} Speed Bonus` : "";
      toast.success(`✅ Correct! +${res.data.earnedPoints}${bonus} Points`);
    } else {
      toast.error("❌ Wrong Answer");
    }

    console.log(res.data);

    setTimeout(moveToNextQuestion, 1000);

  } catch (err) {
    console.log("Submit error:", err.response?.data || err.message);
    setSubmitted(false);

    const errorMsg = err.response?.data?.message || err.message || "Something went wrong";
    toast.error(errorMsg);
  }
}
  if (!session) return <h2 className="text-center mt-20">Loading...</h2>;

  const currentQuestionNumber =
    questions.findIndex(
      (question) => String(question._id) === String(currentQuestion?._id),
    ) + 1;
  const displayQuestionNumber =
    currentQuestionNumber > 0 ? currentQuestionNumber : session.questionNumber;

  if (session.status === "Waiting")
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-8xl mb-8">⏳</div>
          <h2 className="text-4xl font-bold text-white mb-8">Waiting for Quiz...</h2>
          <p className="text-xl text-slate-300">
            The quiz will start soon!
          </p>
        </div>
      </div>
    );

  if (session.status === "Finished")
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center">
        <div className="text-8xl mb-8">🎉</div>
        <h2 className="text-4xl font-bold text-white mb-8">Quiz Finished!</h2>
        <p className="text-xl text-slate-300 mb-10">
          Thank you for participating!</p>
        <button
          onClick={() => navigate("/employee/lobby")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-xl text-xl shadow-lg transition-all hover:scale-105"
        >
          Back to Lobby
        </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              Question {displayQuestionNumber}
            </h2>
            {employeeName && (
              <p className="mt-2 text-sm text-slate-500">
                Logged in as <span className="font-semibold text-slate-900">{employeeName}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-sm text-slate-500">
              {employeeName ? `Hello, ${employeeName}` : ""}
            </div>
            <div className="bg-red-600 text-white px-5 py-2 rounded-lg text-lg font-bold">
              ⏱ {timer}s
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-10">
          {currentQuestion?.question}
        </h1>

        <div className="grid md:grid-cols-2 gap-5">
          {currentQuestion?.options?.map((option, index) => (
            <button
              key={`${currentQuestion._id}-${index}`}
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
