import mongoose from "mongoose";

const tambolaSessionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Waiting", "Live", "Finished"],
      default: "Waiting",
    },

    calledNumbers: {
      type: [Number],
      default: [],
    },

    currentNumber: {
      type: Number,
      default: null,
    },

    winners: {
      earlyFive: { type: String, default: null },
      topLine: { type: String, default: null },
      middleLine: { type: String, default: null },
      bottomLine: { type: String, default: null },
      fullHouse: { type: String, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model("TambolaSession", tambolaSessionSchema);
