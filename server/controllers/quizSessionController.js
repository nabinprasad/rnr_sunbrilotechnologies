import QuizSession from "../models/QuizSession.js";
import { getIO } from "../server.js";

export const getSession = async (req, res) => {
  try {
    let session = await QuizSession.findOne()
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    if (session && session.status === "Live" && session.timerStartedAt) {
      const elapsed = Math.floor((Date.now() - new Date(session.timerStartedAt).getTime()) / 1000);
      session.timer = Math.max(0, session.timerDuration - elapsed);
    }

    res.json({
      success: true,
      session: session || {
        status: "Not Started",
        timer: 0,
        currentQuestionIndex: 0,
        quizId: null,
        totalQuestions: 0,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateSession = async (req, res) => {
  try {
    let session = await QuizSession.findOne();

    const updateData = { ...req.body };
    if (updateData.status === "Live" && (!session || session.status !== "Live")) {
      updateData.timerStartedAt = new Date();
      updateData.timerDuration = updateData.timer || (session ? session.timer : 30);
    } else if (updateData.questionNumber !== undefined && session && updateData.questionNumber !== session.questionNumber) {
      updateData.timerStartedAt = new Date();
      updateData.timerDuration = updateData.timer || session.timer;
    }

    if (!session) {
      session = await QuizSession.create(updateData);
    } else {
      Object.assign(session, updateData);
      await session.save();
    }

    const sessionObj = session.toObject();
    
    // Calculate current timer for broadcast
    if (sessionObj.status === "Live" && sessionObj.timerStartedAt) {
      const elapsed = Math.floor((Date.now() - sessionObj.timerStartedAt.getTime()) / 1000);
      sessionObj.timer = Math.max(0, sessionObj.timerDuration - elapsed);
    }
    
    res.json({
      success: true,
      session: sessionObj,
    });
    // Broadcast updated session to all connected clients
    try {
      console.log("📡 Emitting quizSessionUpdated event:", sessionObj);
      getIO().emit("quizSessionUpdated", sessionObj);
    } catch (e) {
      console.log("Socket emit failed:", e.message);
    }
  } catch (error) {
    console.log(error); // <-- Make sure this exists
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


let timerInterval = null;

export const startQuizTimer = () => {
  // We no longer broadcast every second to 18,000+ users.
  // Instead, the client calculates the remaining time using:
  // remaining = Math.max(0, timerDuration - (Date.now() - timerStartedAt)/1000)
  // This reduces Socket.IO load by 99.9%.
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
};