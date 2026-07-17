import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    mobile: {
      type: String,
      default: "",
    },

    photo: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    points: {
      type: Number,
      default: 0,
    },

     approvalStatus: {
  type: String,
  enum: ["Pending", "Approved", "Rejected"],
  default: "Pending",
},

    rkOrg: {
      type: String,
      default: "",
    },

    project: {
      type: String,
      default: "",
    },
   
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Employee", employeeSchema);