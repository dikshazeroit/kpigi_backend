/**
 * ============================================================================
 *  Copyright (C) Zero IT Solutions - All Rights Reserved
 * ----------------------------------------------------------------------------
 *  Unauthorized copying of this file, via any medium is strictly prohibited.
 *  Proprietary and confidential. Dissemination or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained from
 *  Zero IT Solutions.
 * ============================================================================
 *
 *  @author     Sangeeta <sangeeta.zeroit@gmail.com>
 *  @date       Dec 2025
 *  @version    1.0.0
 *  @module     Admin Model
 *  @description Defines the Mongoose schema for Admin, including validation rules
 *               and default settings for user account fields.
 *  @modified
 *
 */

import mongoose, { Schema } from "mongoose";
import { v4 as uuid } from "uuid";

const adminSchema = new Schema(
  {
    au_uuid: { type: String, default: () => uuid() },
    au_name: { type: String, required: true, trim: true },
    au_surname: { type: String, required: true, trim: true },
    au_email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    au_password: { type: String, required: true },
    au_active: { type: String, default: "1" },
    au_activation_token: { type: Number },
    au_deleted: { type: String, default: "0" },
    au_phone: {
      type: Number,
      required: true,
      unique: true,
      validate: {
        validator: (value) => /^[0-9]{10}$/.test(value),
        message: (props) => `${props.value} is not a valid 10-digit phone number!`,
      },
    },
    au_address: { type: String },
    au_image: { type: String },
    au_otp: { type: String },
    au_otp_expiry: { type: Date },
    au_reset_verified: { type: Boolean, default: false },

  
    au_type: {
      type: String,
    },

  
    au_role: { type: String, ref: "roles" },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "created_at", updatedAt: "au_updated_at" },
  }
);

const AdminModel = mongoose.model("admin", adminSchema);
export default AdminModel;
