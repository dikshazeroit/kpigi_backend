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
 * 📝 Description   : User authentication device management.
 * ✏️ Modified By   :
 * ================================================================================
 * MAIN MODULE HEADING: Zero IT Solutions - Auth / Device Module
 */

import UserDevice from './UserDeviceModel.js';

const authModel = {};

/**
 * Remove all devices of a specific user
 *
 * @param {string} userId
 * @returns {boolean} success status
 */
authModel.removeUserDevice = async function (userId) {
  if (!userId) {
    console.error("Invalid userId provided for device removal.");
    return false;
  }

  try {
    const result = await UserDevice.deleteMany({ ud_fk_uc_uuid: userId });
    console.log(`Removed ${result.deletedCount} devices for user: ${userId}`);
    return true;
  } catch (err) {
    console.error("Error removing user devices:", err);
    return false;
  }
};

/**
 * Add a new device for user after removing existing devices
 *
 * @param {object} data - device data
 * @returns {boolean} success status
 */
authModel.addDeviceIfNotExists = async function (data) {
  try {
    const removed = await authModel.removeUserDevice(data.ud_fk_uc_uuid);

    if (!removed) {
      console.warn("Failed to remove existing devices before insert.");
      return false;
    }

    const newDevice = new UserDevice(data);
    await newDevice.save();

    console.log("Device saved for user:", data.ud_fk_uc_uuid);
    return true;
  } catch (err) {
    console.error("Error saving user device:", err);
    return false;
  }
};

export default authModel;
