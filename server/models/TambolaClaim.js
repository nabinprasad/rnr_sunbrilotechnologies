import mongoose from "mongoose";

const tambolaClaimSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    employeeName: {
      type: String,
      required: true,
    },

    claimType: {
      type: String,
      enum: ["earlyFive", "middleLine", "fullHouse"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("TambolaClaim", tambolaClaimSchema);
