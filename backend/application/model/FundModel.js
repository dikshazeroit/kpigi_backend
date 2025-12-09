import mongoose from "mongoose";

const FundSchema = new mongoose.Schema(
  {
    f_uuid: { type: String, required: true },
    f_fk_uc_uuid: { type: String, required: true },

    f_title: String,
    f_purpose: String,
    f_category: String,
    f_amount: Number,
    f_deadline: Date,
    f_story: String,

    // Media fields
    f_media_one: String,
    f_media_two: String,
    f_media_three: String,
    f_media_four: String,
    f_media_five: String,

    
    f_status: { type: String, default: "ACTIVE" },     // ACTIVE / PAUSED
    f_pause_reason: { type: String, default: null },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const FundModel = mongoose.model("Fund", FundSchema);
export default FundModel;
