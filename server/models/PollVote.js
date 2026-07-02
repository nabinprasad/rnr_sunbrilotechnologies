import mongoose from "mongoose";

const pollVoteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    selectedOptions: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent an employee from voting on the same poll twice
pollVoteSchema.index({ pollId: 1, employeeId: 1 }, { unique: true });

export default mongoose.model("PollVote", pollVoteSchema);
