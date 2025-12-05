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
 *  @author     Vishal Kumar <vishal.zeroitsolutions@gmail.com>
 *  @date       Aug 2025
 *  @version    1.0.0
 *  @module     About Services
 *  @description Contains all database service functions for the Admin About module such as
 *               creating, finding, updating, and deleting admin records.
 *  @modified
 *
 */

import AppInfoModel from "../admin/models/About.js";

export const saveAppInfo = async (data) => {
  try {
    const savedData = await AppInfoModel.findOneAndUpdate(
      {}, 
      { ...data, ai_deleted: 0 },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return savedData;
  } catch (error) {
    throw error;
  }
};


export const getAppInfo = async () => {
  try {
    const data = await AppInfoModel.findOne({ ai_deleted: "0" });
    console.log("Fetched app info:", data);
    return data;
  } catch (error) {
    throw error;
  }
};
