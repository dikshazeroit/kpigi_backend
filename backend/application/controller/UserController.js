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
 * 🧑‍💻 Written By  : Payal Sharma <payal@zeroitsolutions.com>
 * 📅 Created On    : June 2025
 * 📝 Description   : Admin authentication and profile management.
 * ✏️ Modified By   :
 * ================================================================================
 */
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { v4 } from "uuid";
import userModel from "../model/UserModel.js";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";
import constants from "../../config/Constants.js";

let userObj = {};
/**
 * Get current user profile
 *
 * @param {object} req - 
 * @param {object} res - 
 */

userObj.getUserProfile = async function (req, res) {
  try {

     
    const userId = await appHelper.getUUIDByToken(req);

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        {
          code: "USER-E401",
          message: "Unauthorized access.",
          status: false,
        },
        200
      );
    }

   
    const user = await userModel.findOne({ uc_uuid: userId, uc_deleted: "0" }).lean();

    if (!user) {
      return commonHelper.errorHandler(
        res,
        {
          code: "USER-E404",
          message: "User not found.",
          status: false,
        },
        200
      );
    }
    
    return commonHelper.successHandler(
      res,
      {
        code: "USER-S200",
        message: "User profile fetched successfully.",
        status: true,
        payload: user,
      },
      200
    );
  } catch (err) {
    console.error("❌ Error in getUserProfile:", err);
    return commonHelper.errorHandler(
      res,
      {
        code: "USER-E500",
        message: "Internal server error.",
        status: false,
      },
      200
    );
  }
};

/**
 * Update user location 
 *
 * @param {object} req - 
 * @param {object} res - 
 */
userObj.updateUserLocation = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    console.log(userId, "userId---------");

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "AUS-E1000",
          message: "Unauthorized Error.",
        },
        200
      );
    }

    const user = await userModel.findOne({ uc_uuid: userId });

    if (!user) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "AUS-E1003",
          message: "User not found.",
        },
        200
      );
    }

    const { uc_lat, uc_long } = req.body;

    if (typeof uc_lat !== "number" || typeof uc_long !== "number") {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "AUS-E1004",
          message: "Latitude and Longitude must be valid numbers.",
        },
        200
      );
    }

    user.uc_lat = uc_lat;
    user.uc_long = uc_long;

    await user.save();

    return commonHelper.successHandler(res, {
      message: "User location updated successfully.",
      status: true,
    });
  } catch (err) {
    console.error("Error in updateUserLocation:", err);
    return commonHelper.errorHandler(
      res,
      {
        status: false,
        code: "AUS-E9999",
        message: "Internal server error.",
      },
      200
    );
  }
};







/**
 * Update current user profile
 *
 * @param {object} req -
 * @param {object} res - 
 */

userObj.updateUserProfile = async function (req, res) {
  try {
    // Extract user ID from token
    const userId = await appHelper.getUUIDByToken(req);
    if (!userId) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "AUS-E1002",
        message: "Unauthorized access.",
      }, 200);
    }

    const {
      uc_phone,
      uc_country_code,
      uc_address,
      uc_lat,
      uc_long,
      uc_full_name
    } = req.body;

    const user = await userModel.findOne({ uc_uuid: userId });

    if (!user) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "AUS-E1003",
        message: "User not found.",
      }, 200);
    }

    // Update allowed fields only
    if (uc_phone) user.uc_phone = uc_phone;
    if (uc_country_code) user.uc_country_code = uc_country_code;
    if (uc_address) user.uc_address = uc_address;
    if (uc_lat) user.uc_lat = uc_lat;
    if (uc_long) user.uc_long = uc_long;
    if (uc_full_name) user.uc_full_name = uc_full_name;

    await user.save();

    return commonHelper.successHandler(res, {
      status: true,
      message: "Profile updated successfully.",
      payload: user,
    });

  } catch (err) {
    console.error("❌ updateUserProfile Error:", err);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "AUS-E9999",
      message: "Internal server error",
    }, 200);
  }
};

/**
 * upload current user photo
 *
 * @param {object} req -
 * @param {object} res - 
 */
userObj.uploadProfilePhoto = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);

    if (!userId) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "UPS-E1001",
        message: "Unauthorized access.",
      }, 200);
    }

    // Ensure file is uploaded
    if (!req.files?.profileImage?.[0]) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "UPS-E1002",
        message: "No file uploaded.",
      }, 200);
    }

    const file = req.files.profileImage[0];
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `profile-${Date.now()}${ext}`.replace(/ /g, "_");

    // Upload to AWS
    await commonHelper.uploadFile({
      fileName,
      chunks: [file.buffer],
      encoding: file.encoding,
      contentType: file.mimetype,
      uploadFolder: conObj.AWS_USER_FILE_FOLDER,
    });

    // Find user
    const user = await userModel.findOne({ uc_uuid: userId });
    if (!user) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "UPS-E1003",
        message: "User not found.",
      }, 200);
    }

    // Save uploaded image name
    user.uc_profile_photo = fileName;
    await user.save();

    return commonHelper.successHandler(res, {
      status: true,
      message: "Profile photo updated successfully.",
      payload: {
        profilePhoto: fileName,
      },
    });

  } catch (error) {
    console.error("❌ uploadProfilePhoto Error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "UPS-E9999",
      message: "Internal server error",
    }, 200);
  }
};


/**
 * Update user settings
 *
 * @param {object} req -
 * @param {object} res - 
 */
userObj.updateSettings = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);

    if (!userId) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "SET-E1001",
        message: "Unauthorized access.",
      }, 200);
    }

    const { uc_full_name, uc_bio, uc_notifications_enabled } = req.body;

    const user = await userModel.findOne({ uc_uuid: userId });
    if (!user) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "SET-E1002",
        message: "User not found",
      }, 200);
    }

    if (uc_full_name) user.uc_full_name = uc_full_name;
    if (uc_bio) user.uc_bio = uc_bio;
    if (uc_notifications_enabled !== undefined)
      user.uc_notifications_enabled = uc_notifications_enabled;

    await user.save();

    return commonHelper.successHandler(res, {
      status: true,
      message: "Settings updated.",
      payload: user,
    });

  } catch (error) {
    console.error("❌ updateSettings Error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "SET-E9999",
      message: "Internal server error",
    }, 200);
  }
};
/**
 * User changed password 
 *
 * @param {object} req -
 * @param {object} res - 
 */
userObj.changePassword = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);

    if (!userId) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "PWD-E1001",
        message: "Unauthorized access.",
      }, 200);
    }

    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "PWD-E1002",
        message: "Old and new password are required.",
      }, 200);
    }

    const user = await userModel.findOne({ uc_uuid: userId });

    const isMatch = await bcrypt.compare(old_password, user.uc_password);
    if (!isMatch) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "PWD-E1003",
        message: "Old password is incorrect.",
      }, 200);
    }

    user.uc_password = await bcrypt.hash(new_password, 10);
    await user.save();

    return commonHelper.successHandler(res, {
      status: true,
      message: "Password updated successfully.",
    });

  } catch (error) {
    console.error("❌ changePassword Error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "PWD-E9999",
      message: "Internal server error.",
    }, 200);
  }
};


/**
 * Delete Account user permanently
 *
 * @param {object}
 * @param {object} 
 */

userObj.deleteAccount = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    console.log(userId, "-------------------userId");

    if (!userId) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "AUS-E1002",
        message: "Unauthorized access.",
      }, 200);
    }

         // Delete the user itself
    await userModel.deleteOne({ uc_uuid: userId });

    return commonHelper.successHandler(res, {
      message: "Account deleted successfully.",
      status: true,
    }, 200);

  } catch (err) {
    console.error("❌ Error in deleteAccount:", err);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "AUS-E9999",
      message: "Internal server error.",
    }, 200);
  }
};

export default userObj;
