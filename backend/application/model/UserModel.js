import mongoose, { Schema } from "mongoose";
import { v4 } from "uuid";

const usersCredentialsSchema = new Schema(
  {
    uc_uuid: {
      type: String,
      default: () => v4(),
    },
    uc_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    uc_country_code: {
      type: String,
      trim: true,
      default: "",
    },
    uc_phone: {
      type: Number,
      required: false,
    },
    uc_password: {
      type: String,
      required: false,
    },
    uc_full_name: {
      type: String,
      required: false,
    },
     uc_bio: {
      type: String,
      required: false,
       default: "",
    },
    uc_notifications_enabled: {
      type: Boolean,
      required: false,
       default: false,
    },
    
    uc_registeration_type: {
      type: String,
      required: true,
      enum: ["WEB", "APP", "APPLE", "GOOGLE"],
      default: "APP",
    },
    uc_login_type: {
      type: String,
      required: true,
      enum: ["apple", "google", "phone"],
      default: "google",
    },
    uc_profile_photo: {
      type: String,
      default: "",
    },
    uc_card_verified: { type: Boolean, default: false },

    stripe_payment_method_id: { type: String },
    stripe_customer_id: { type: String },

    uc_card_info: {
      brand: String,
      last4: String,
      exp_month: Number,
      exp_year: Number,
    },

    // ✅ New payout card fields
    uc_payout_card_token: { type: String, default: "" },
    uc_card_last4: { type: String, default: "" },
    uc_card_brand: { type: String, default: "" },
    uc_card_exp_month: { type: Number, default: null },
    uc_card_exp_year: { type: Number, default: null },

    uc_lat: {
      type: Number,
      default: null,
    },
    uc_long: {
      type: Number,
      default: null,
    },
    uc_address: {
      type: String,
      default: null,
    },
    uc_active: {
      type: String,
      default: "0",
    },
    uc_deleted: {
      type: String,
      default: "0",
    },
    uc_activation_token: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "uc_created_at", updatedAt: "Uc_updated_at" },
  }
);

// Middleware to update uc_updated on every save
usersCredentialsSchema.pre("save", function (next) {
  this.uc_updated = new Date();
  next();
});

const UsersCredentialsModel = mongoose.model(
  "users_credentials",
  usersCredentialsSchema
);

export default UsersCredentialsModel;
