
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
 * 📝 Description   : Notification Settings model 
 * ✏️ Modified By   :
 * ================================================================================
 * MAIN MODULE HEADING: Zero IT Solutions - Notification Settings Module
 */
import mongoose from "mongoose";

const NotificationSettingsSchema = new mongoose.Schema(
  {
    ns_fk_uc_uuid: { type: String, required: true },

    donation_received: { type: Boolean, default: true },
    goal_reached: { type: Boolean, default: true },
    deadline_reminder: { type: Boolean, default: true },

    newsletter: { type: Boolean, default: true },
  },
  {   versionKey: false,timestamps: true }
);

export default mongoose.model("NotificationSettings", NotificationSettingsSchema);
