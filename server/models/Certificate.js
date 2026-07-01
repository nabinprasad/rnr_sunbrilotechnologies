import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        employeeName: {
            type: String,
            required: true,
        },
        templateName: {
            type: String,
            required: true,
        },
        certificateUrl: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Certificate", certificateSchema);