import mongoose from "mongoose";

const tambolaTicketSchema = new mongoose.Schema(
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

    grid: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("TambolaTicket", tambolaTicketSchema);
