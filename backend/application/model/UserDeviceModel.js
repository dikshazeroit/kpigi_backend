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
 * 📝 Description   : Users Devices model (Device token , id ,fcm token saved)
 * ✏️ Modified By   :
 * ================================================================================
 * MAIN MODULE HEADING: Zero IT Solutions - Users Devices Module
 */
import mongoose from 'mongoose';

const userDeviceSchema = new mongoose.Schema({
  ud_fk_uc_uuid: { type: String, required: true },
  ud_device_fcmToken: { type: String, required: true },
  ud_device_platform: { type: String, required: true },
  ud_device_id:{type: String, required: true },
}, { timestamps: true },{
    versionKey: false, // Disables __v
  });

const UserDevice = mongoose.model("UserDevice", userDeviceSchema, "users_devices");
export default UserDevice; 
