import mongoose from "mongoose";

const quizSessionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Waiting", "Live", "Finished"],
      default: "Waiting",
    },

    currentQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },

    questionNumber: {
      type: Number,
      default: 0,
    },

    timer: {
      type: Number,
      default: 30,
    },
  },
  { timestamps: true }
);

export default mongoose.model("QuizSession", quizSessionSchema);