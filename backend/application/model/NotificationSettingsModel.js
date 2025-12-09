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
