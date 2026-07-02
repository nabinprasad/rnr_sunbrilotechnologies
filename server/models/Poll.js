import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [pollOptionSchema],
      validate: {
        validator: (v) => v.length >= 2 && v.length <= 6,
        message: "Poll must have between 2 and 6 options",
      },
    },

    status: {
      type: String,
      enum: ["Draft", "Active", "Closed"],
      default: "Draft",
    },

    allowMultiple: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Poll", pollSchema);
