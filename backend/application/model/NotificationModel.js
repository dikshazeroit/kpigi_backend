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
