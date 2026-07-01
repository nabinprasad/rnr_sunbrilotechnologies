import mongoose from "mongoose";

const quizAnswerSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    selectedAnswer: {
      type: Number,
      required: true,
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },

    points: {
      type: Number,
      default: 0,
    },

    timeTaken: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate answers
quizAnswerSchema.index(
  { employee: 1, question: 1 },
  { unique: true }
);

export default mongoose.model("QuizAnswer", quizAnswerSchema);