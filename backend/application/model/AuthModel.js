import UserDevice from './UserDeviceModel.js'; // adjust path if needed

const authModel = {};

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
