import { useEffect, useState, useRef, useCallback } from "react";
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

  const questionsRef = useRef([]);
  const sessionRef = useRef(null);
  const lastQuestionId = useRef(null);
  const lastSessionQuestionId = useRef(null);
  const lastSessionStatus = useRef(null);
  const employeeFinished = useRef(false);
  const questionStartTime = useRef(null);
  const timerStartedAtRef = useRef(null);
  const countdownRef = useRef(null);
  const sessionLoadedRef = useRef(false);
  const questionsLoadedRef = useRef(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const findQuestionById = useCallback((questionId) => {
    if (!questionId) return null;
    return questionsRef.current.find(
      (q) => String(q._id) === String(questionId),
    );
  }, []);

  const resetForNewQuestion = useCallback((question, sessionTimerStartedAt) => {
    lastQuestionId.current = String(question._id);
    questionStartTime.current = Date.now();
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setSubmitted(false);
    submittedRef.current = false;

    // Sync timer to server start time
    if (sessionTimerStartedAt) {
      timerStartedAtRef.current = new Date(sessionTimerStartedAt).getTime();
    } else {
      timerStartedAtRef.current = Date.now();
    }
    const duration = Number(question.timer || 30);
    const elapsed = Math.floor((Date.now() - timerStartedAtRef.current) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    setTimer(remaining);

    stopCountdown();
    countdownRef.current = setInterval(() => {
      if (!timerStartedAtRef.current) return;
      const d = Number(currentQuestion?.timer || sessionRef.current?.timerDuration || sessionRef.current?.timer || 30);
      const e = Math.floor((Date.now() - timerStartedAtRef.current) / 1000);
      const r = Math.max(0, d - e);
      setTimer(r);
      if (r <= 0) {
        stopCountdown();
      }
    }, 250);
  }, [stopCountdown, currentQuestion]);

  const applySessionToState = useCallback((sess) => {
    if (!sess) return;
    if (employeeFinished.current && sess.status === "Live") return;

    if (sess.status === "Waiting") {
      employeeFinished.current = false;
    }

    sessionRef.current = sess;
    setSession(sess);

    const currentId =
      sess.currentQuestion?._id || sess.currentQuestion;

    // Handle question change
    if (currentId && String(currentId) !== String(lastSessionQuestionId.current)) {
      lastSessionQuestionId.current = String(currentId);
      lastSessionStatus.current = sess.status;

      if (questionsLoadedRef.current) {
        const currentQ = findQuestionById(currentId);
        if (currentQ) {
          console.log("🔔 Employee LiveQuiz: NEW QUESTION received via socket:", currentQ._id);
          resetForNewQuestion(currentQ, sess.timerStartedAt);
        } else {
          setCurrentQuestion(null);
        }
      }
    } else {
      lastSessionStatus.current = sess.status;
    }
  }, [findQuestionById, resetForNewQuestion]);

  const syncQuestionIfReady = useCallback(() => {
    if (!sessionLoadedRef.current || !questionsLoadedRef.current || !sessionRef.current) return;

    const currentId =
      sessionRef.current.currentQuestion?._id ||
      sessionRef.current.currentQuestion;
    const sessionStatus = sessionRef.current?.status;

    if (
      String(currentId) === String(lastSessionQuestionId.current) &&
      sessionStatus === lastSessionStatus.current
    ) {
      return;
    }

    lastSessionQuestionId.current = currentId ? String(currentId) : currentId;
    lastSessionStatus.current = sessionStatus;

    if (currentId) {
      const current = findQuestionById(currentId);
      if (current && String(current._id) !== String(lastQuestionId.current)) {
        resetForNewQuestion(current, sessionRef.current.timerStartedAt);
      } else if (!current) {
        setCurrentQuestion(null);
      }
    } else {
      setCurrentQuestion(null);
    }
  }, [findQuestionById, resetForNewQuestion]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const quizRes = await getQuiz();
        if (!mounted) return;
        const allQuestions = quizRes.data.questions;
        questionsRef.current = allQuestions;
        questionsLoadedRef.current = true;

        const sessionRes = await getQuizSession();
        if (!mounted) return;
        const quizSession = sessionRes.data.session;

        if (employeeFinished.current && quizSession?.status === "Live") return;

        if (quizSession?.status === "Waiting") {
          employeeFinished.current = false;
        }

        sessionLoadedRef.current = true;
        sessionRef.current = quizSession;
        setSession(quizSession);
        lastSessionStatus.current = quizSession?.status;
        if (quizSession?.currentQuestion) {
          lastSessionQuestionId.current = String(
            quizSession.currentQuestion?._id || quizSession.currentQuestion,
          );
        }

        syncQuestionIfReady();
      } catch (err) {
        console.log(err);
      }
    })();

    const handleSession = (updatedSession) => {
      applySessionToState(updatedSession);
      syncQuestionIfReady();
    };

    socket.on("quizSessionUpdated", handleSession);

    // Fallback polling for session every 5 seconds in case socket drops
    const fallbackInterval = setInterval(async () => {
      try {
        const sessionRes = await getQuizSession();
        if (mounted) {
          applySessionToState(sessionRes.data.session);
          syncQuestionIfReady();
        }
      } catch (_) {
        // ignore
      }
    }, 5000);

    return () => {
      mounted = false;
      socket.off("quizSessionUpdated", handleSession);
      clearInterval(fallbackInterval);
      stopCountdown();
    };
  }, [applySessionToState, syncQuestionIfReady, stopCountdown]);

  // Handle time's up / auto-submit
  useEffect(() => {
    if (submittedRef.current || timer !== 0 || !currentQuestion) return;
    if (!questionStartTime.current) return;

    if (selectedAnswer === null || selectedAnswer === undefined) {
      setTimeout(() => {
        setSubmitted(true);
        submittedRef.current = true;
      }, 0);
      toast.error("Time is up! You did not select an answer.");
      return;
    }

    handleSubmit();
  }, [timer, currentQuestion?._id, selectedAnswer]);

  async function handleSubmit() {
    if (submittedRef.current) return;

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
      submittedRef.current = true;
      stopCountdown();

      if (res.data.isCorrect) {
        const bonus = res.data.speedBonus ? ` + ${res.data.speedBonus} Speed Bonus` : "";
        toast.success(`✅ Correct! +${res.data.earnedPoints}${bonus} Points`);
      } else {
        toast.error("❌ Wrong Answer");
      }

      console.log(res.data);
    } catch (err) {
      console.log("Submit error:", err.response?.data || err.message);
      setSubmitted(false);
      submittedRef.current = false;

      const errorMsg = err.response?.data?.message || err.message || "Something went wrong";
      toast.error(errorMsg);
    }
  }

  if (!session) return <h2 className="text-center mt-20">Loading...</h2>;

  const currentQuestionNumber = currentQuestion
    ? questionsRef.current.findIndex(
        (question) => String(question._id) === String(currentQuestion._id),
      ) + 1
    : 0;
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
            Thank you for participating!
          </p>
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
            <div className={`px-5 py-2 rounded-lg text-lg font-bold ${
              timer <= 5 ? "bg-red-600 text-white animate-pulse" : "bg-red-600 text-white"
            }`}>
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
                if (!submittedRef.current) {
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
