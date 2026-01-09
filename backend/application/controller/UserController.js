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
 * 📝 Description   : user authentication and profile management.
 * ✏️ Modified By   :
 * ================================================================================
 * MAIN MODULE HEADING: Zero IT Solutions - User Module
 */
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { v4 } from "uuid";
import bcrypt from "bcryptjs";
import userModel from "../model/UserModel.js";
import categoryModel from "../model/CategoryModel.js";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";
import WithdrawalModel from "../model/WithdrawalModel.js";

let userObj = {};
/**
 *  Fetch current logged-in user's profile
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
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
 *  Update the user's current latitude and longitude
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
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
 * Update current user's profile information
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
 */

userObj.updateUserProfile = async function (req, res) {
  try {
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
 * Upload or update the user's profile photo
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
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

    await commonHelper.uploadFile({
      fileName,
      chunks: [file.buffer],
      encoding: file.encoding,
      contentType: file.mimetype,
      uploadFolder: process.env.AWS_USER_FILE_FOLDER,
    });

    const user = await userModel.findOne({ uc_uuid: userId });
    if (!user) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "UPS-E1003",
        message: "User not found.",
      }, 200);
    }

    user.uc_profile_photo = fileName;
    await user.save();

    return commonHelper.successHandler(res, {
      status: true,
      message: "Profile photo updated successfully.",
      payload: { profilePhoto: fileName },
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
 * Upload or update the user's profile photo Combined api
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
 */

userObj.editUpdateUserProfile = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
console.log(userId,"ooooooooooooooooooooooooooooooooo")
    if (!userId) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "UP-E1001",
        message: "Unauthorized access.",
      }, 200);
    }

    const {
      fullName,
      countryName,
      countryCode,
      phone,
      shortBio,
    } = req.body;

    const user = await userModel.findOne({ uc_uuid: userId });

    if (!user) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "UP-E1002",
        message: "User not found.",
      }, 200);
    }

    /* =====================
       🖼️ Profile Image
    ===================== */
    if (req.files?.profileImage?.[0]) {
      const file = req.files.profileImage[0];
      const ext = path.extname(file.originalname).toLowerCase();
      const fileName = `profile-${Date.now()}${ext}`.replace(/ /g, "_");

      await commonHelper.uploadFile({
        fileName,
        chunks: [file.buffer],
        encoding: file.encoding,
        contentType: file.mimetype,
        uploadFolder: process.env.AWS_USER_FILE_FOLDER,
      });

      user.uc_profile_photo = fileName;
    }

    /* =====================
       ✏️ Screen Fields
    ===================== */
    if (fullName) user.uc_full_name = fullName;
    if (countryName) user.uc_country_name = countryName;
    if (countryCode) user.uc_country_code = countryCode;
    if (phone) user.uc_phone = phone;
    if (shortBio) user.uc_bio = shortBio;

    await user.save();

    return commonHelper.successHandler(res, {
      status: true,
      message: "Profile updated successfully.",
      payload: {
        fullName: user.uc_full_name,
        countryName: user.uc_country_name,
        countryCode: user.uc_country_code,
        phone: user.uc_phone,
        shortBio: user.uc_bio,
        profilePhoto: user.uc_profile_photo,
      },
    });

  } catch (error) {
    console.error("❌ updateUserProfile Error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "UP-E9999",
      message: "Internal server error",
    }, 200);
  }
};


/**
 * Update user settings like full name, bio, notifications
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
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
 *  Update user's password
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
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
 *  Permanently delete user's account
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
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

/**
 *  FUNCTION: updatePayoutCard
 *  DESCRIPTION: Update user's payout card information
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
 */
userObj.updatePayoutCard = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    console.log(userId, "User ID from token");

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "CARD-E1001",
          message: "Unauthorized access.",
        },
        200
      );
    }

    const {
      card_token,
      card_last4,
      card_brand,
      card_exp_month,
      card_exp_year,
    } = req.body;

    if (!card_token || !card_last4 || !card_brand) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "CARD-E1002",
          message: "Missing required card details.",
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
          code: "CARD-E1003",
          message: "User not found.",
        },
        200
      );
    }

    user.uc_payout_card_token = card_token;
    user.uc_card_last4 = card_last4;
    user.uc_card_brand = card_brand;
    user.uc_card_exp_month = card_exp_month !== undefined ? card_exp_month : null;
    user.uc_card_exp_year = card_exp_year !== undefined ? card_exp_year : null;

    await user.save();

    const maskedToken = "**** **** **** " + card_last4;

    return commonHelper.successHandler(res, {
      status: true,
      message: "Payout card updated successfully.",
      payload: {
        card_last4,
        card_brand,
        card_exp_month: user.uc_card_exp_month,
        card_exp_year: user.uc_card_exp_year,
        card_token: maskedToken,
      },
    });
  } catch (error) {
    console.error("❌ updatePayoutCard Error:", error);
    return commonHelper.errorHandler(
      res,
      {
        status: false,
        code: "CARD-E9999",
        message: "Internal server error",
      },
      200
    );
  }
};

/**
 *  FUNCTION: checkBankDetails
 *  DESCRIPTION: To check the card details added or not 
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
 */
userObj.checkBankDetails = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);

    if (!userId) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "CBD-E1001",
        message: "Unauthorized access.",
      }, 200);
    }

    const user = await userModel.findOne({
      uc_uuid: userId,
      uc_deleted: "0",
    });

    if (!user) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "CBD-E1002",
        message: "User not found.",
      }, 200);
    }

    /* =========================
       🏦 Bank / Card Check
    ========================= */
    const hasBankDetails =
      user.uc_payout_card_token &&
      user.uc_card_last4 &&
      user.uc_card_brand &&
      user.uc_card_exp_month &&
      user.uc_card_exp_year;

    return commonHelper.successHandler(res, {
      status: true,
      message: hasBankDetails
        ? "Bank details available."
        : "Bank details not added.",
      payload: {
        isBankAdded: !!hasBankDetails,
        cardVerified: user.uc_card_verified,
        cardBrand: user.uc_card_brand || "",
        cardLast4: user.uc_card_last4 || "",
        cardExpMonth: user.uc_card_exp_month,
        cardExpYear: user.uc_card_exp_year,
      },
    });

  } catch (error) {
    console.error("❌ checkBankDetails Error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "CBD-E9999",
      message: "Internal server error.",
    }, 200);
  }
};



userObj.categoryList = async function (req, res) {
  try {
    const categories = await categoryModel.find({
      c_is_deleted: false,
      c_status: "ACTIVE",
    });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Category list fetched successfully.",
      payload: categories,
    });

  } catch (error) {
    console.error("❌ categoryList Error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "CAT-L9999",
      message: "Internal server error.",
    }, 200);
  }
};

userObj.createWithdrawalRequest = async function (req, res) {
  try {
    const userUuid = await appHelper.getUUIDByToken(req);
    if (!userUuid) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Unauthorized",
      }, 200);
    }

    let { amount, accountHolderName, accountNumber, ifscCode } = req.body;
    const withdrawAmount = Number(amount);

    // ✅ Validation
    if (
      !withdrawAmount ||
      withdrawAmount <= 0 ||
      !accountHolderName ||
      !accountNumber ||
      !ifscCode
    ) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "All fields are required",
      }, 200);
    }

    // ✅ User check
    const user = await userModel.findOne({ uc_uuid: userUuid });
    if (!user) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "User not found",
      }, 200);
    }

    // ✅ Balance check
    if (user.uc_balance < withdrawAmount) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Insufficient wallet balance",
      }, 200);
    }

    // 🚫 Prevent multiple pending withdrawals
    const pendingRequest = await WithdrawalModel.findOne({
      w_fk_uc_uuid: userUuid,
      w_status: "PENDING",
    });

    if (pendingRequest) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "You already have a pending withdrawal request",
      }, 200);
    }

    // 1️⃣ Deduct balance
    user.uc_balance = Number(user.uc_balance) - withdrawAmount;
    await user.save();

    // 2️⃣ Create withdrawal request
    await WithdrawalModel.create({
      w_uuid: uuidv4(),
      w_fk_uc_uuid: userUuid,
      w_amount: withdrawAmount,
      w_account_holder_name: accountHolderName,
      w_account_number: accountNumber,
      w_ifsc_code: ifscCode,
      w_status: "PENDING",
    });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Withdrawal request submitted successfully",
    });

  } catch (error) {
    console.error("❌ Withdrawal Error:", error);

    return commonHelper.errorHandler(res, {
      status: false,
      message: "Withdrawal failed",
    }, 200);
  }
};



userObj.getWithdrawalHistory = async function (req, res) {
  try {
    const userUuid = await appHelper.getUUIDByToken(req);
    if (!userUuid) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Unauthorized",
      }, 200);
    }

    const history = await WithdrawalModel.find({
      w_fk_uc_uuid: userUuid,
    }).sort({ createdAt: -1 });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Withdrawal history fetched",
      payload: history.map((w) => ({
        amount: w.w_amount,
        status: w.w_status,
        requestDate: w.createdAt, // ✅ camelCase
      })),
    });

  } catch (error) {
    return commonHelper.errorHandler(res, {
      status: false,
      message: "Failed to fetch withdrawal history",
    }, 200);
  }
};
userObj.getUserBalance = async function (req, res) {
  try {
    const userUuid = await appHelper.getUUIDByToken(req);
    if (!userUuid) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Unauthorized",
      }, 200);
    }

    const user = await userModel.findOne(
      { uc_uuid: userUuid },
      { uc_balance: 1 }
    ).lean();

    if (!user) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "User not found",
      }, 200);
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "User balance fetched successfully",
      payload: {
        balance: user.uc_balance || 0,
      },
    });

  } catch (error) {
    console.error("❌ getUserBalance Error:", error);

    return commonHelper.errorHandler(res, {
      status: false,
      message: "Failed to fetch balance",
    }, 200);
  }
};


export default userObj;
