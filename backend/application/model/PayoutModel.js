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
 * 📝 Description   : Payout model 
 * ✏️ Modified By   :
 * ================================================================================
 * MAIN MODULE HEADING: Zero IT Solutions - Payout Module
 */
import mongoose from "mongoose";

const PayoutSchema = new mongoose.Schema(
  {
    p_uuid: { type: String, required: true },
    p_fk_d_uuid: { type: String, required: true },
    p_fk_uc_uuid: { type: String, required: true },
    p_amount: { type: Number, required: true },
    p_fee: { type: Number, default: 0 },
    p_status: { type: String, enum: ["SENT", "FAILED"], default: "SENT" },
    p_meta: { type: Object, default: {} },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default mongoose.model("Payout", PayoutSchema);
