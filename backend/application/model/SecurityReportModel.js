/**
 * ================================================================================
 * ⛔ COPYRIGHT NOTICE
 * --------------------------------------------------------------------------------
 * © Zero IT Solutions – All Rights Reserved
 *
 * ⚠️ Unauthorized copying, distribution, or reproduction of this file,
 *     via any medium, is strictly prohibited.
 *
 * 🔒 This file contains proprietary and confidential information. Dissemination
 *     or use of this material is forbidden unless prior written permission is
 *     obtained from Zero IT Solutions.
 * --------------------------------------------------------------------------------
 * 🧑‍💻 Written By  : Sangeeta <sangeeta.zeroit@gmail.com>
 * 📅 Created On    : Dec 2025
 * 📝 Description   : Security Report model 
 * ✏️ Modified By   :
 * ================================================================================
 * MAIN MODULE HEADING: Zero IT Solutions - Security Report Module
 */
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
