import mongoose from "mongoose";

const SecurityReportSchema = new mongoose.Schema(
  {
    sr_uuid: { type: String, required: true },
    sr_fund_uuid: { type: String, required: true },
    sr_reason: { type: String, required: true },
    sr_details: { type: String, default: "" },
    sr_reporter_uuid: { type: String, default: null },
    sr_evidence: { type: Array, default: [] },
    sr_status: {
      type: String,
      enum: ["PENDING", "REVIEWED"],
      default: "PENDING",
    },
  },
  {   versionKey: false,timestamps: true }
);

export default mongoose.model("SecurityReport", SecurityReportSchema);
