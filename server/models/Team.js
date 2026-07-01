import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
    },

    teamCode: {
      type: String,
      required: true,
      unique: true,
    },

    color: {
      type: String,
      default: "#2563eb",
    },

    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    totalPoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Team", teamSchema);