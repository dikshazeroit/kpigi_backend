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
    d_status: { type: String, enum: ["SUCCESS", "FAILED"], default: "SUCCESS" },
    d_meta: { type: Object, default: {} },
  },
{
    versionKey: false,
    timestamps: true,
  } 
);

export default mongoose.model("Donation", DonationSchema);
