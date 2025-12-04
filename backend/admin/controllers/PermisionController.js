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
 *  @author     Vishal verma <vishalverma@zeroitsolutions.com>
 *  @date       June 2025
 *  @version    1.0.0
 *  @module     Permission Controller
 *  @description Handles all permission-based-access API endpoints including creation,
 *               listing, updating, and deletion of Admin users.
 *  @modified
 *
 */

import { successHandler } from "../../middleware/SuccessHandler.js";
import PermissionModel from "../models/Permission.js";

export const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await PermissionModel.find(); 
    return successHandler(res, {
      status: true,
      message: "Permissions fetched successfully",
      payload: permissions,
    });
  } catch (error) {
   next(error)   
  }
};