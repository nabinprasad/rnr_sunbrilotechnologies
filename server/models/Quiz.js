import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v.length === 4,
        message: "Exactly 4 options are required",
      },
    },

    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },

    points: {
      type: Number,
      default: 10,
    },

    timer: {
      type: Number,
      default: 30,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Quiz", quizSchema);