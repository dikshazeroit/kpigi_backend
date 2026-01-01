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
 * 📝 Description   : Fund model
 * ✏️ Modified By   :
 * ================================================================================
 * MAIN MODULE HEADING: Zero IT Solutions - Fund Module
 */

import mongoose from "mongoose";

const FundSchema = new mongoose.Schema(
  {
    // 🔑 Primary Keys
    f_uuid: { type: String, required: true },
    f_fk_uc_uuid: { type: String, required: true },

    // 📝 Fund Basic Info
    f_title: { type: String, trim: true },
    f_purpose: { type: String, trim: true },

    // 🔗 Category handling
    f_category_uuid: {
      type: String,
      required: false, // references categories.category_uuid
    },

    // 🟡 Used only when category = "Other"
    f_other_category_name: {
      type: String,
      default: "",
      trim: true,
    },

    f_amount: { type: Number },
    f_deadline: { type: Date },
    f_story: { type: String },

    // 📷 Media fields
    f_media_one: { type: String },
    f_media_two: { type: String },
    f_media_three: { type: String },
    f_media_four: { type: String },
    f_media_five: { type: String },

    // ⚙️ Status
    f_status: {
      type: String,
      enum: ["ACTIVE", "PAUSED", "PENDING", "REJECTED", "COMPLETED"],
      default: "PENDING",
    },

    f_pause_reason: { type: String, default: null },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const FundModel = mongoose.model("Fund", FundSchema);
export default FundModel;
