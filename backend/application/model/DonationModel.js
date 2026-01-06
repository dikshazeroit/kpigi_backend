
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
 * 📝 Description   : Donation model (authentication, profile, payout)
 * ✏️ Modified By   :
 * ================================================================================
 * MAIN MODULE HEADING: Zero IT Solutions - Donation Module
 */
import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema(
  {
    d_uuid: { type: String, required: true },
    d_fk_uc_uuid: { type: String, default: null },  // donor uuid
    d_fk_f_uuid: { type: String, required: true },  // fund uuid
    d_amount: { type: Number, required: true },     // donation amount
    d_platform_fee: { type: Number, default: 0 },
    d_amount_to_owner: { type: Number, default: 0 },
    d_is_anonymous: { type: Boolean, default: false },
    d_status: { type: String, default: "PENDING" },
    d_meta: { type: Object, default: {} },
  },
{
    versionKey: false,
    timestamps: true,
  } 
);

export default mongoose.model("Donation", DonationSchema);
