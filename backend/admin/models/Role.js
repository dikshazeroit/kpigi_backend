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
 *  @module     Roles Model
 *  @description Defines the Mongoose schema for Roles, including validation rules
 *               and default settings for user account fields.
 *  @modified
 *
 */

import mongoose, {Schema} from "mongoose";
import { v4 as uuid } from "uuid";

const roleSchema = new Schema({
  r_uuid: { type: String, default: () => uuid() },
  r_name: { type: String, required: true, unique: true }, 
  r_permissions: [{ type: String, ref: "permission" }], 
}, { versionKey: false, timestamps: true });

const RoleModel = mongoose.model("role", roleSchema);
export default RoleModel;
