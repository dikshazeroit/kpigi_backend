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
 * 📅 Created On   : Dec 2025
 * 📝 Description : Withdrawal request model
 * ================================================================================
 */

import mongoose from "mongoose";

const WithdrawalSchema = new mongoose.Schema(
  {
    // 🔑 Primary ID
    w_uuid: {
      type: String,
      required: true,
      unique: true,
    },

    // 👤 User (Fund Owner)
    w_fk_uc_uuid: {
      type: String,
      required: true,
      index: true,
    },

    // 💰 Withdrawal Amount
    w_amount: {
      type: Number,
      required: true,
      min: 1,
    },

    // 🏦 Bank Details
    w_account_holder_name: {
      type: String,
      required: true,
      trim: true,
    },

    w_account_number: {
      type: String,
      required: true,
      trim: true,
    },

    w_ifsc_code: {
      type: String,
      required: true,
      trim: true,
    },

    // 📌 Withdrawal Status
   w_status: {
  type: String,
  enum: ["PENDING", "PROCESSING", "COMPLETED", "REJECTED"],
  default: "PENDING",
},


    // 📝 Optional Admin Note
    w_admin_note: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
  }
);

const WithdrawalModel = mongoose.model("Withdrawal", WithdrawalSchema);
export default WithdrawalModel;
