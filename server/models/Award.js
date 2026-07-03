import mongoose from "mongoose";

const awardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Collaboration", "Execution", "People", "Other"],
      default: "Other",
    },
    lever: {
      type: String,
      required: true,
      default: "Business lever",
    },
    icon: {
      type: String,
      default: "🏆",
    },
    winners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    nominees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Award", awardSchema);
