import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Reward & Recognition 2026",
    },

    subtitle: {
      type: String,
      default: "Celebrating Excellence Together",
    },

    eventDate: {
      type: Date,
    },

    venue: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
      default: "",
    },

    welcomeMessage: {
      type: String,
      default: "",
    },

    announcement: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Upcoming", "Live", "Completed"],
      default: "Upcoming",
    },

    currentActivity: {
      type: String,
      default: "",
    },

    hostMessage: {
      type: String,
      default: "",
    },

    quizEnabled: {
  type: Boolean,
  default: false,
},

pollEnabled: {
  type: Boolean,
  default: false,
},

tambolaEnabled: {
  type: Boolean,
  default: false,
},

memoryEnabled: {
  type: Boolean,
  default: false,
},

luckyDrawEnabled: {
  type: Boolean,
  default: false,
},

leaderboardEnabled: {
  type: Boolean,
  default: false,
},

awardEnabled: {
  type: Boolean,
  default: false,
},
  },

  {
    timestamps: true,
  },

);

export default mongoose.model("Event", eventSchema);