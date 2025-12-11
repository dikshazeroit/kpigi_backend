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
 * 📝 Description   : Users Credentials model (authentication, profile, payout)
 * ✏️ Modified By   :
 * ================================================================================
 * MAIN MODULE HEADING: Zero IT Solutions - Users Credentials Module
 */

import mongoose, { Schema } from "mongoose";
import { v4 } from "uuid";

const usersCredentialsSchema = new Schema(
  {
    uc_uuid: {
      type: String,
      default: () => v4(),
    },

    // User Role: Requester / Donor
    uc_role: {
      type: String,
      enum: ["REQUESTER", "DONOR"],
      default: "DONOR",
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

    uc_card_verified: { 
      type: Boolean, 
      default: false 
    },

    // Stripe fields
    stripe_payment_method_id: { type: String, default: "" },
    stripe_customer_id: { type: String, default: "" },

    // Stripe card info object
    uc_card_info: {
      brand: { type: String, default: "" },
      last4: { type: String, default: "" },
      exp_month: { type: Number, default: null },
      exp_year: { type: Number, default: null },
    },

    // NEW payout card fields
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
    timestamps: { 
      createdAt: "uc_created_at", 
      updatedAt: "Uc_updated_at" 
    },
  }
);

// Middleware to update uc_updated timestamp
usersCredentialsSchema.pre("save", function (next) {
  this.uc_updated = new Date();
  next();
});

const UsersCredentialsModel = mongoose.model(
  "users_credentials",
  usersCredentialsSchema
);

export default UsersCredentialsModel;
