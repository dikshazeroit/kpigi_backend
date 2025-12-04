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
 *  @date       June 2025
 *  @version    1.0.0
 *  @module     permission Model
 *  @description Defines the Mongoose schema for Permision, including validation rules
 *               and default settings for user account fields.
 *  @modified
 *
 */
import mongoose, { Schema } from "mongoose";
import { v4 as uuid } from "uuid";

const permissionSchema = new Schema({
  p_uuid: { type: String, default: () => uuid() },
  p_name: { type: String, required: true },
  p_key: { type: String, required: true, unique: true }, 
}, { versionKey: false, timestamps: true });

const PermissionModel = mongoose.model("permission", permissionSchema);

export default PermissionModel; 