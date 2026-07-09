import QuizSession from "../models/QuizSession.js";
import { io } from "../server.js";

export const getSession = async (req, res) => {
  try {
    let session = await QuizSession.findOne();

    if (!session) {
      session = await QuizSession.create({});
    }

    res.json({
      success: true,
      session,
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

    if (!session) {
      session = await QuizSession.create(req.body);
    } else {
      Object.assign(session, req.body);
      await session.save();
    }

    const sessionObj = session.toObject();
    
    res.json({
      success: true,
      session: sessionObj,
    });
    // Broadcast updated session to all connected clients
    try {
      console.log("📡 Emitting quizSessionUpdated event:", sessionObj);
      io.emit("quizSessionUpdated", sessionObj);
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
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(async () => {
    try {
      const session = await QuizSession.findOne();

      if (!session) return;

      if (session.status !== "Live") return;

      if (session.timer > 0) {
        session.timer -= 1;
        await session.save();
        const sessionObj = session.toObject();
        // Broadcast timer tick so clients stay in sync
        try {
          console.log("📡 Emitting quizSessionUpdated (timer tick):", sessionObj);
          io.emit("quizSessionUpdated", sessionObj);
        } catch (e) {
          console.log("Socket emit failed:", e.message);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }, 1000);
};