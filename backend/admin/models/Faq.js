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
 *  @author    Sangeeta <sangeeta.zeroit@gmail.com>
 *  @date       dec 2025
 *  @version    1.0.0
 *  @module     Faq Model
 *  @description Defines the Mongoose schema for Permision, including validation rules
 *               and default settings for user account fields.
 *  @modified
 *
 */


import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const faqSchema = new Schema(
  {
    f_uuid: {
      type: String,
      default: () => uuidv4(),
    },
    f_question: {
      type: String,
      required: true,
      trim: true,
    },
    f_answer: {
      type: String,
      required: true,
    },
    f_active: {
      type: String,
      default: "1",
    },
    f_deleted: {
      type: String,
      default: "0",
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "f_created_at", updatedAt: "f_updated_at" },
  }
);

const FaqModel = mongoose.model("faqs", faqSchema);
export default FaqModel;

