// model/user_device_model.js
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
