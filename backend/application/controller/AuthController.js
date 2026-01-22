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
 * 🧑‍💻 Written By  : Sangeeta Kumari <sangeeta.zeroit@gmail.com>
 * 📅 Created On    : DEc 2025
 * 📝 Description   : Authentication and profile management.
 * ✏️ Modified By   :
 * ================================================================================
 */
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import userModel from "../model/UserModel.js"; // adjust the path as needed
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import commonHelper from "../../utils/Helper.js";
import * as helper from "../helpers/Index.js";
import { v4 as uuidv4 } from "uuid";
import authModel from '../model/AuthModel.js';
import UserDevice from "../model/UserDeviceModel.js"
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const JWT_SECRET = process.env.JWT_SECRET; // from .env
let authObj = {};


/**
 * Sends activation email with a 4-digit token and updates user activation token in DB.
 * @param {string} email - Recipient email address
 * @param {string} userId - User UUID
 * @returns {Promise<boolean>} - true if email sent and DB updated, false otherwise
 */


authObj.sendEmailCode = async function (email) {
  try {
    const token = Math.floor(Math.random() * 900000) + 100000;  // 6-digit OTP
    const lowerEmail = email.toLowerCase();

    let user = await userModel.findOne({ uc_email: lowerEmail });

    // If user doesn't exist, create shell user to store OTP
    if (!user) {
      user = await new userModel({
        uc_uuid: uuidv4(),
        uc_email: lowerEmail,
        uc_registeration_type: "APP",
        uc_active: "0",
        uc_deleted: "0",
        uc_activation_token: token,
      }).save();
    } else {
      await userModel.updateOne(
        { uc_email: lowerEmail },
        { $set: { uc_activation_token: token } }
      );
    }

    // Send Email
    const emailData = {
      to: email,
      from: "Kpigi App <no-reply@Kpigi.com>",
      subject: "Verification Code - Kpigi",
      body: `Welcome to Kpigi! Your OTP is <b>${token}</b>. It expires in 10 minutes.`,
    };

    const mailSent = await helper.generalMail(emailData);

    if (!mailSent) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in sendEmailCode:", error);
    return false;
  }
};

/**
 * Register a new user using email and phone number.
 *
 * Validates input, checks for existing users, hashes password,
 * and stores new user record in the database.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */


authObj.registerWithEmail = async function (req, res) {
  try {
    const { email, country_code, phone, password, full_name } = req.body || {};

    // Validate required fields
    if (!email  || !password || !full_name) {
      return commonHelper.errorHandler(
        res,
        {
          code: "ZIS-E1002",
          message: "All fields (email, password, full name) are mandatory.",
          status: false,
        },
        200
      );
    }

    const normalizedEmail = email.toLowerCase();
    // const normalizedPhone = phone.trim();

    // 🔎 CHECK EMAIL (verified + not verified)
    const existingUser = await userModel.findOne({
      uc_email: normalizedEmail,
    });

    if (existingUser) {
      // ✔ Already verified
      if (existingUser.uc_active === "1") {
        return commonHelper.errorHandler(
          res,
          {
            code: "ZIS-E1000",
            message: "Email already registered.",
            status: false,
          },
          200
        );
      }

      // ⏳ Registered but NOT verified
      if (existingUser.uc_active === "0") {
        return commonHelper.errorHandler(
          res,
          {
            code: "ZIS-E1003",
            message: "Email is registered but not verified. Please verify your account.",
            status: false,
          },
          200
        );
      }
    }

    // ==========================
    // ✔ HASH THE PASSWORD
    // ==========================
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🆕 Create unverified user
    const tempUser = await userModel.create({
      uc_email: normalizedEmail,
      uc_phone: phone,
      uc_country_code: country_code,
      uc_password: hashedPassword,
      uc_full_name: full_name,
      uc_active: "0",
    });

    // 📩 Send OTP
    await authObj.sendEmailCode(normalizedEmail);

    return commonHelper.successHandler(res, {
      status: true,
      message: "OTP sent successfully. Please verify your account.",
      user_id: tempUser._id,
    });

  } catch (error) {
    console.error("Registration error:", error);

    return commonHelper.errorHandler(
      res,
      {
        code: "ZIS-10003",
        message: "Internal server error.",
        status: false,
      },
      200
    );
  }
};


/**
 * Check whether an email is already registered in the system.
 *
 * Accepts an email from the request body, validates it, 
 * and returns whether the email exists in the database.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */

authObj.checkEmailExists = async function (req, res) {
  try {
    const { email } = req.body || {};

    if (!email) {
      console.log("Missing email in check request");
      return commonHelper.errorHandler(
        res,
        {
          code: "ZIS-E1002",
          message: "Email is required.",
          status: false,
        },
        200
      );
    }

    console.log("Checking if email exists:", email);

    // Check if user already exists and is active
    const existingUser = await userModel.findOne({
      uc_email: email.toLowerCase(),
      uc_active: "1",
    });

    if (existingUser) {
      return commonHelper.errorHandler(
        res,
        {
          code: "ZIS-E1000",
          message: "Email already exists",
          status: false,
        },
        200
      );
    }

    // If not found, return success true (means it’s free to use)
    return commonHelper.successHandler(res, {
      status: true,
    });
  } catch (error) {
    console.error("Error checking email:", error);
    return commonHelper.errorHandler(
      res,
      {
        code: "ZIS-10003",
        message: "Internal server error",
        status: false,
      },
      200
    );
  }
};

/**
 * Verify email OTP during user authentication or registration.
 *
 * Accepts email and OTP from the request body, validates OTP,
 * and confirms whether the email has been successfully verified.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */

authObj.verifyEmail = async function (req, res) {
  try {
    const { email, otp } = req.body;

    // ---------------- VALIDATION ----------------
    if (!email || !otp) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "VERIFY-001",
        message: "Email and OTP are required",
      }, 200);
    }

    const lowerEmail = email.toLowerCase();
    let user = await userModel.findOne({ uc_email: lowerEmail });

    // ---------------- USER CHECK ----------------
    if (!user) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "VERIFY-002",
        message: "OTP expired or invalid request",
      }, 200);
    }

    // ---------------- OTP CHECK ----------------
    if (!user.uc_activation_token || user.uc_activation_token !== otp) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "VERIFY-003",
        message: "Invalid OTP",
      }, 200);
    }

    // ---------------- ACTIVATE USER ----------------
    user.uc_active = "1";
    user.uc_activation_token = "";
    await user.save();

    // ---------------- TOKEN ----------------
    const token = jwt.sign(
      { userId: user.uc_uuid },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // =================================================
    // ✅ SAME RESPONSE, ONLY PAYLOAD CHANGED
    // =================================================
    return commonHelper.successHandler(res, {
      status: true,
      code: "EMAIL_VERIFIED",
      message: "Email verified successfully",
      payload: {
        token: token,
        user_uuid: user.uc_uuid,
        email: user.uc_email,
      },
    });

  } catch (error) {
    console.error("Error during email verification:", error);

    return commonHelper.errorHandler(res, {
      status: false,
      code: "VERIFY-500",
      message: "Internal server error",
    }, 200);
  }
};



/**
 * Log in a user using email and password.
 *
 * Validates input fields, checks if the user exists, verifies the password,
 * ensures the account is active, and updates device information.
 * Returns authenticated user data and access token on success.
 * Sends appropriate error responses for invalid credentials, inactive accounts,
 * or missing required fields.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
authObj.loginWithEmail = async function (req, res) {
  try {
    const { email, password } = req.body;

    // ---------------- VALIDATION ----------------
    if (!email || !password) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Email and password are required",
      }, 200);
    }

    // ---------------- FIND USER ----------------
    const user = await userModel.findOne({
      uc_email: email.toLowerCase(),
      uc_deleted: "0",
    });

    if (!user) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Invalid email or password",
      }, 200);
    }

    // ---------------- PASSWORD CHECK ----------------
    const isMatch = await bcrypt.compare(password, user.uc_password);
    if (!isMatch) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Invalid email or password",
      }, 200);
    }

    // ---------------- ACTIVE CHECK ----------------
    if (user.uc_active !== "1") {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Your account is not active",
      }, 200);
    }

    // =================================================
    // 🔐 2FA ENABLED → SEND EMAIL OTP
    // =================================================
    if (user.uc_is_2fa_enabled === true) {

      const otpSent = await authObj.sendEmailCode(user.uc_email);

      if (!otpSent) {
        return commonHelper.errorHandler(res, {
          status: false,
          message: "Failed to send OTP. Please try again.",
        }, 200);
      }

      // ⬅️ FRONTEND SIGNAL
      return commonHelper.successHandler(res, {
        status: false,
        code: "2FA_REQUIRED",
        message: "Verification code sent to your email",
        payload: {
          user_uuid: user.uc_uuid,
          next_screen: "OTP_VERIFICATION",
        },
      });
    }

    // =================================================
    // ✅ NORMAL LOGIN (2FA OFF)
    // =================================================
    const token = jwt.sign(
      { userId: user.uc_uuid },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return commonHelper.successHandler(res, {
      status: true,
      code: "LOGIN_SUCCESS",
      message: "Login successful",
      payload: {
        token,
        user_uuid: user.uc_uuid,
        email: user.uc_email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      message: "Internal server error",
    }, 200);
  }
};



// authObj.loginWithEmail = async function (req, res) {
//   try {
//     const { email, password, deviceFcmToken, devicePlatform, deviceId } = req.body || {};

//     // -------------------------------------
//     // VALIDATION
//     // -------------------------------------
//     if (!email || !password) {
//       return commonHelper.errorHandler(res, {
//         code: "ZIS-L1001",
//         message: "Email and password are required.",
//         status: false,
//       }, 200);
//     }

//     // Find user
//     const user = await userModel.findOne({ uc_email: email.toLowerCase() });
//     if (!user) {
//       return commonHelper.errorHandler(res, {
//         code: "ZIS-L1002",
//         message: "Invalid email or password.",
//         status: false,
//       }, 200);
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.uc_password);
//     if (!isMatch) {
//       return commonHelper.errorHandler(res, {
//         code: "ZIS-L1003",
//         message: "Invalid email or password.",
//         status: false,
//       }, 200);
//     }

//     // Check account status
//     if (user.uc_active !== "1") {
//       return commonHelper.errorHandler(res, {
//         code: "ZIS-L1004",
//         message: "Your account is not active. Please contact support.",
//         status: false,
//       }, 200);
//     }

//     // -------------------------------------
//     // JWT TOKEN GENERATION
//     // -------------------------------------
//     const token = jwt.sign(
//       { userId: user.uc_uuid },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // -------------------------------------
//     // SAVE DEVICE INFO IF PROVIDED
//     // -------------------------------------
//     if (deviceFcmToken && devicePlatform && deviceId) {
//       await authModel.addDeviceIfNotExists({
//         ud_fk_uc_uuid: user.uc_uuid,
//         uc_card_verified: user.uc_card_verified,
//         ud_device_fcmToken: deviceFcmToken,
//         ud_device_platform: devicePlatform,
//         ud_device_id: deviceId,
//       });
//     }
//     const updatedUser = await userModel.findOne({ uc_uuid: user.uc_uuid }).lean();

  
//     return commonHelper.successHandler(res, {
//       status: true,
//       message: "Login successful.",
//       payload: {
//         token,
//         uuid: updatedUser.uc_uuid,
//         email: updatedUser.uc_email,
//         uc_card_verified: updatedUser.uc_card_verified,
//       },
//     });

//   } catch (error) {
//     console.error("Login error:", error);
//     return commonHelper.errorHandler(res, {
//       code: "ZIS-L9999",
//       message: "Internal server error",
//       status: false,
//     }, 200);
//   }
// };


authObj.verifyLoginOtp = async function (req, res) {
  try {
    const { email, otp } = req.body;

    // ---------------- VALIDATION ----------------
    if (!email || !otp) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Email and OTP are required",
      }, 200);
    }

    // ---------------- FIND USER ----------------
    const user = await userModel.findOne({
      uc_email: email.toLowerCase(),
      uc_deleted: "0",
    });

    if (!user) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Invalid email or OTP",
      }, 200);
    }

    // ---------------- ACTIVE CHECK ----------------
    if (user.uc_active !== "1") {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Your account is not active",
      }, 200);
    }

    // ---------------- 2FA CHECK ----------------
    if (user.uc_is_2fa_enabled !== true) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "2FA is not enabled for this account",
      }, 200);
    }

    // ---------------- OTP CHECK ----------------
    if (
      !user.uc_activation_token ||
      user.uc_activation_token !== otp
    ) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Invalid OTP",
      }, 200);
    }

    // ---------------- CLEAR OTP ----------------
    user.uc_activation_token = "";
    await user.save();

    // ---------------- GENERATE JWT ----------------
    const token = jwt.sign(
      { userId: user.uc_uuid },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ---------------- SUCCESS RESPONSE ----------------
    return commonHelper.successHandler(res, {
      status: true,
      code: "LOGIN_SUCCESS",
      message: "Login successful",
      payload: {
        token,
        user_uuid: user.uc_uuid,
        email: user.uc_email,
      },
    });

  } catch (error) {
    console.error("Verify Login OTP Error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      message: "Internal server error",
    }, 200);
  }
};

/**
 * Send OTP to user email for resetting the password.
 *
 * Checks if the email exists and the account is active.
 * Generates a new OTP, stores it, and sends it to the user's email
 * for password recovery.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */


authObj.userForgotPasswordEmail = async function (req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return commonHelper.errorHandler(
        res,
        {
          code: "CCS-E2001",
          message: "All fields are required.",
          status: false,
        },
        200
      );
    }

    const user = await userModel.findOne({ uc_email: email.toLowerCase() });

    if (!user) {
      return commonHelper.errorHandler(
        res,
        {
          code: "CCS-E1013",
          message: "Account does not exist.",
          status: false,
        },
        200
      );
    }

    if (user.uc_active !== "1") {
      return commonHelper.errorHandler(
        res,
        {
          code: "CCS-E1002",
          message: "Account exists but is not verified.",
          status: false,
        },
        200
      );
    }

    // Generate 4-digit OTP
    const otp = Math.floor(Math.random() * 900000) + 100000; // 6-digit OTP


    // Update OTP in user record
    user.uc_activation_token = otp.toString();
    await user.save();

    // Send email
    const emailDetails = {
      to: email,
      from: "Kpigi App",
      subject: "Forgot Password",
      body: `Welcome to Kpigi App. Your OTP is ${otp}.`,
    };

    helper.generalMail(emailDetails);

    return commonHelper.successHandler(res, {
      message: "Forgot password OTP has been sent to your email.",
      status: true,
    });

  } catch (error) {
    console.error("Error in userForgotPasswordEmail:", error);
    return commonHelper.errorHandler(
      res,
      {
        code: "CCS-E5000",
        message: "Something went wrong. Please try again.",
        status: false,
      },
      200
    );
  }
};

/**
 * Reset user password using email, OTP, and a new password.
 *
 * Validates the provided OTP, ensures the user exists and is eligible
 * for password reset, then updates the user's password securely.
 * Sends error responses for invalid OTP, expired OTP, or missing fields.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */


authObj.resetPasswordEmail = async function (req, res) {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return commonHelper.errorHandler(
        res,
        {
          code: "CCS-E2001",
          message: "All fields are required.",
          status: false,
        },
        200
      );
    }

    const user = await userModel.findOne({ uc_email: email.toLowerCase() });

    if (!user) {
      return commonHelper.errorHandler(
        res,
        {
          code: "CCS-E1013",
          message: "Account does not exist.",
          status: false,
        },
        200
      );
    }

    if (user.uc_activation_token !== otp) {
      return commonHelper.errorHandler(
        res,
        {
          code: "ZIS-E2004",
          message: "Invalid OTP.",
          status: false,
        },
        200
      );
    }

    // OTP matched – reset the password
    const hashedPassword = bcrypt.hashSync(password, 10);
    user.uc_password = hashedPassword;
    user.uc_activation_token = ""; // clear OTP after use
    await user.save();

    return commonHelper.successHandler(res, {
      message: "Password has been reset successfully.",
      status: true,
    });
  } catch (error) {
    console.error("Error in resetPasswordEmail:", error);
    return commonHelper.errorHandler(
      res,
      {
        code: "CCS-E5000",
        message: "Something went wrong. Please try again.",
        status: false,
      },
      200
    );
  }
};

/**
 * Resend verification OTP to the user's email.
 *
 * Validates the email, checks if the account exists, generates a new OTP,
 * updates the record, and sends the OTP again for account verification.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */

authObj.resendOtp = async function (req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return commonHelper.errorHandler(
        res,
        {
          code: "CCS-E2001",
          message: "All fields are required.",
          status: false,
        },
        200
      );
    }

    const user = await userModel.findOne({ uc_email: email.toLowerCase() });

    if (!user) {
      return commonHelper.errorHandler(
        res,
        {
          code: "CCS-E1013",
          message: "Account does not exist.",
          status: false,
        },
        200
      );
    }

    const otp = Math.floor(Math.random() * 900000) + 100000; // 6-digit OTP

    

    user.uc_activation_token = otp.toString();
    await user.save();

    const emailOptions = {
      to: email,
      from: "Kpigi App",
      subject: "Resend OTP",
      body: `Your OTP is ${otp}.`,
    };

    helper.generalMail(emailOptions);

    return commonHelper.successHandler(res, {
      message: "OTP has been sent to your email.",
      status: true,
    });
  } catch (error) {
    console.error("Error in resendOtp:", error);
    return commonHelper.errorHandler(
      res,
      {
        code: "CCS-E5000",
        message: "Something went wrong. Please try again.",
        status: false,
      },
      200
    );
  }
};
authObj.verifyForgotPasswordOtp = async function (req, res) {
  try {
    const { email, otp } = req.body;

    // 1️⃣ Validation
    if (!email || !otp) {
      return commonHelper.errorHandler(
        res,
        {
          code: "CCS-E2001",
          message: "Email and OTP are required.",
          status: false,
        },
        200
      );
    }

    // 2️⃣ Find user
    const user = await userModel.findOne({
      uc_email: email.toLowerCase(),
    });

    if (!user) {
      return commonHelper.errorHandler(
        res,
        {
          code: "ZIS-E2005",
          message: "User not found.",
          status: false,
        },
        200
      );
    }

    // 3️⃣ OTP check (uc_activation_token)
    if (user.uc_activation_token !== otp) {
      return commonHelper.errorHandler(
        res,
        {
          code: "ZIS-E2004",
          message: "Invalid OTP.",
          status: false,
        },
        200
      );
    }

    // ✅ ONLY OTP VERIFIED (no activation, no password reset here)
    return commonHelper.successHandler(res, {
      message: "Forgot password OTP verified successfully.",
      status: true,
    });

  } catch (err) {
    console.error("Error in verifyForgotPasswordOtp:", err);
    return commonHelper.errorHandler(
      res,
      {
        code: "CCS-E5000",
        message: "Something went wrong. Please try again.",
        status: false,
      },
      200
    );
  }
};



/**
 * Verify the OTP sent to the user's email for password reset.
 *
 * Validates the provided email and OTP, checks OTP correctness and expiry,
 * and confirms whether the user is allowed to proceed with password reset.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */

authObj.verifyForgotEmail = async function (req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return commonHelper.errorHandler(
        res,
        {
          code: "CCS-E2001",
          message: "All fields are required.",
          status: false,
        },
        200
      );
    }

    const user = await userModel.findOne({ uc_email: email.toLowerCase() });

    if (!user) {
      return commonHelper.errorHandler(
        res,
        {
          code: "ZIS-E2005",
          message: "User not found.",
          status: false,
        },
        200
      );
    }

    if (user.uc_activation_token !== otp) {
      return commonHelper.errorHandler(
        res,
        {
          code: "ZIS-E2004",
          message: "OTP did not match.",
          status: false,
        },
        200
      );
    }


    return commonHelper.successHandler(res, {
      message: "OTP verified successfully.",
      status: true,
    });
  } catch (err) {
    console.error("Error in verifyForgotEmail:", err);
    return commonHelper.errorHandler(
      res,
      {
        code: "CCS-E5000",
        message: "Something went wrong. Please try again.",
        status: false,
      },
      200
    );
  }
};

/**
 * Sign in or register a user using Google ID authentication.
 *
 * Verifies the Google user details, checks if the user already exists,
 * creates a new account if necessary, updates device information,
 * and returns an authentication token with user details.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */


authObj.signinWithGoogleId = async function (req, res) {
  try {
    const { email, name } = req.body;

    if (!email) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "CCS-E2001",
          message: "Email is required.",
          payload: {},
        },
        200
      );
    }

    const user = await userModel.findOne({ uc_email: email.toLowerCase() });

    if (user) {
      // ✅ Existing user: update name, activate account, and set login type
      let needSave = false;

      if (name && user.uc_full_name !== name) {
        user.uc_full_name = name;
        needSave = true;
      }

      if (user.uc_active !== "1") {
        user.uc_active = "1"; // activate account
        needSave = true;
      }

      if (user.uc_login_type !== "google") {
        user.uc_login_type = "google";
        needSave = true;
      }

      if (needSave) {
        await user.save();
      }

      const payload = {
        iat: Date.now(),
        userId: user.uc_uuid,
      };

      const token = jwt.sign(payload, JWT_SECRET);

      return commonHelper.successHandler(res, {
        message: "Signed in successfully.",
        payload: {
          new_account: false,
          token: token,
          userId: user.uc_uuid,
          userType: user.uc_role,
          uc_card_verified: user.uc_card_verified,
        },
      });
    } else {
      // ✅ New user: create account and set active
      const newUser = new userModel({
        uc_email: email.toLowerCase(),
        uc_full_name: name || "",
        uc_registeration_type: "GOOGLE",
        uc_login_type: "google",
        uc_active: "1", // string active
      });

      const savedUser = await newUser.save();

      const payload = {
        iat: Date.now(),
        userId: savedUser.uc_uuid,
      };

      const token = jwt.sign(payload, JWT_SECRET);

      return commonHelper.successHandler(res, {
        message: "Account created and signed in successfully.",
        payload: {
          new_account: true,
          token: token,
          userId: savedUser.uc_uuid,
          userType: savedUser.uc_role,
          uc_card_verified: savedUser.uc_card_verified,
        },
      });
    }
  } catch (error) {
    console.error("Error in signinWithGoogleId:", error);
    return commonHelper.errorHandler(
      res,
      {
        status: false,
        code: "RE-10002",
        message: "Something went wrong.",
      },
      500
    );
  }
};



/**
 * Sign in or register a user using Apple ID authentication.
 *
 * Verifies the Apple user details, checks if the user already exists,
 * creates a new account if necessary, updates device information,
 * and returns an authentication token along with user details.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */


authObj.signinWithAppleId = async function (req, res) {
  try {
    const { email, name } = req.body;

    if (!email) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "CCS-E2001",
          message: "Email is required.",
          payload: {},
        },
        200
      );
    }

    const user = await userModel.findOne({ uc_email: email.toLowerCase() });

    // If user exists, update name, activate account, and set login type
    if (user) {
      let needSave = false;

      if (name && user.uc_full_name !== name) {
        user.uc_full_name = name;
        needSave = true;
      }

      // ✅ Activate account if inactive
      if (user.uc_active !== "1") {
        user.uc_active = "1";
        needSave = true;
      }

      // ✅ Ensure login type is 'apple'
      if (user.uc_login_type !== "apple") {
        user.uc_login_type = "apple";
        needSave = true;
      }

      if (needSave) {
        await user.save();
      }

      const payload = {
        iat: Date.now(),
        userId: user.uc_uuid,
      };

      const token = jwt.sign(payload, JWT_SECRET);

      return commonHelper.successHandler(res, {
        message: "Signed in successfully.",
        payload: {
          new_account: false,
          token: token,
          userId: user.uc_uuid,
          userType: user.uc_user_type,
          uc_card_verified: user.uc_card_verified,
        },
      });

    } else {
      // Register new Apple user
      const newUser = new userModel({
        uc_email: email.toLowerCase(),
        uc_full_name: name || "",
        uc_registeration_type: "APPLE",
        uc_login_type: "apple",
        uc_active: "1", // ✅ STRING active
      });

      const savedUser = await newUser.save();

      const payload = {
        iat: Date.now(),
        userId: savedUser.uc_uuid,
      };

      const token = jwt.sign(payload, JWT_SECRET);

      return commonHelper.successHandler(res, {
        message: "Account created and signed in successfully.",
        payload: {
          new_account: true,
          token: token,
          userId: savedUser.uc_uuid,
          userType: savedUser.uc_user_type,
          uc_card_verified: savedUser.uc_card_verified,
        },
      });
    }

  } catch (error) {
    console.error("Error in signinWithAppleId:", error);
    return commonHelper.errorHandler(
      res,
      {
        status: false,
        code: "RE-10002",
        message: "Something went wrong.",
      },
      500
    );
  }
};


export default authObj;
