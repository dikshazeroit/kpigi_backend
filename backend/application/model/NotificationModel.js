
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
 * 📝 Description   : Notification model 
 * ✏️ Modified By   :
 * ================================================================================
 * MAIN MODULE HEADING: Zero IT Solutions - Notification Module
 */
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    n_uuid: { type: String, required: true },

    n_fk_uc_uuid: { type: String, required: true }, // receiver
    n_title: { type: String, required: true },
    n_body: { type: String, required: true },
    n_payload: { type: Object, default: {} },
    n_read: { type: Boolean, default: false },

    n_channel: { type: String, default: "push" }, // push/email/sms
  },
  {   versionKey: false,timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
