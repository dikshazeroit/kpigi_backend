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
