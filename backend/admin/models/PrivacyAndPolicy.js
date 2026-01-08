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
 *  @date       Nov 2025
 *  @version    1.0.0
 *  @module     Privacy and policy Model
 *  @description Defines the Mongoose schema for Privacy and policy, including validation rules
 *               and default settings for user account fields.
 *  @modified
 *
 */

import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const privacyPolicySchema = new Schema(
  {
    p_uuid: {
      type: String,
      default: () => uuidv4(),
    },
    p_privacy_policy: {
      type: String,
      trim: true,
    },
    p_deleted: {
      type: String,
      default: "0",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const PrivacyPolicyModel = mongoose.model("privacy_polices", privacyPolicySchema);
export default PrivacyPolicyModel;