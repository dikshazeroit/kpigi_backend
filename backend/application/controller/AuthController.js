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
import UserDevice from "../model/UserDeviceModel.js";
import constants from "../../config/Constants.js";
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
    const token = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
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
 * New user register
 *
 * @param {object} req - 
 * @param {object} res - 
 * @returns {void}
 * @developer Sangeeta
 */



authObj.registerWithEmail = async function (req, res) {
  try {
    const { email, country_code, phone, password, full_name } = req.body || {};

    // Validate required fields
    if (!email || !country_code || !phone || !password || !full_name) {
      return commonHelper.errorHandler(
        res,
        {
          code: "ZIS-E1002",
          message: "All fields (email, country_code, phone, password, full_name) are mandatory.",
          status: false,
        },
        200
      );
    }

    console.log("Received registration request:", req.body);

    const normalizedEmail = email.toLowerCase();
    const normalizedPhone = phone.trim();

    // Check existing email
    const existingVerifiedEmail = await userModel.findOne({
      uc_email: normalizedEmail,
      uc_active: "1",
    });

    if (existingVerifiedEmail) {
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

    // Check existing phone
    // const existingVerifiedPhone = await userModel.findOne({
    //   uc_phone: normalizedPhone,
    //   uc_active: "1",
    // });

    // if (existingVerifiedPhone) {
    //   return commonHelper.errorHandler(
    //     res,
    //     {
    //       code: "ZIS-E1001",
    //       message: "Phone number already registered.",
    //       status: false,
    //     },
    //     200
    //   );
    // }

    // ==========================
    // ✔ HASH THE PASSWORD
    // ==========================
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save temporary unverified user
    const tempUser = await userModel.create({
      uc_email: normalizedEmail,
      uc_phone: normalizedPhone,
      uc_country_code: country_code,
      uc_password: hashedPassword,   // <-- Hashed password stored
      uc_name: full_name,
      uc_active: "0",
    });

    // Send OTP
    const sendOtp = await authObj.sendEmailCode(normalizedEmail);
    console.log("OTP sent:", sendOtp);

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
 *Check email exists
 *
 * @param {object} req - 
 * @param {object} res - 
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
 *Verify  email otp
 *
 * @param {object} req - 
 * @param {object} res - 
 * @returns {void}
 * @developer Sangeeta
 */
authObj.verifyEmail = async function (req, res) {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return commonHelper.errorHandler(
        res,
        {
          code: "CCS-E2001",
          message: "All fields are required (email, OTP).",
          status: false,
        },
        200
      );
    }

    const lowerEmail = email.toLowerCase();
    let user = await userModel.findOne({ uc_email: lowerEmail });

    // User must exist
    if (!user) {
      return commonHelper.errorHandler(
        res,
        {
          code: "ZIS-E2004",
          message: "OTP expired or invalid request.",
          status: false,
        },
        200
      );
    }

    // OTP validation
    if (!user.uc_activation_token || user.uc_activation_token !== otp) {
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

    // Activate user
    user.uc_active = "1";
    user.uc_activation_token = ""; 
    await user.save();

    // SIMPLE SUCCESS RESPONSE
    return commonHelper.successHandler(res, {
      status: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("Error during email verification:", error);

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
 * Logs in a user using email and password.
 * Validates input fields, verifies credentials, checks active status,
 * and returns basic user info on successful authentication.
 * Sends error responses for invalid credentials, inactive accounts, or missing fields.
 *
 * @param {object} req - 
 * @param {object} res - 
 * @returns {void}
 * @developer Sangeeta
 */

authObj.loginWithEmail = async function (req, res) {
  try {
    const { email, password, deviceFcmToken, devicePlatform, deviceId } = req.body || {};

    // -------------------------------------
    // VALIDATION
    // -------------------------------------
    if (!email || !password) {
      return commonHelper.errorHandler(res, {
        code: "ZIS-L1001",
        message: "Email and password are required.",
        status: false,
      }, 200);
    }

    // Find user
    const user = await userModel.findOne({ uc_email: email.toLowerCase() });
    if (!user) {
      return commonHelper.errorHandler(res, {
        code: "ZIS-L1002",
        message: "Invalid email or password.",
        status: false,
      }, 200);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.uc_password);
    if (!isMatch) {
      return commonHelper.errorHandler(res, {
        code: "ZIS-L1003",
        message: "Invalid email or password.",
        status: false,
      }, 200);
    }

    // Check account status
    if (user.uc_active !== "1") {
      return commonHelper.errorHandler(res, {
        code: "ZIS-L1004",
        message: "Your account is not active. Please contact support.",
        status: false,
      }, 200);
    }

    // -------------------------------------
    // JWT TOKEN GENERATION
    // -------------------------------------
    const token = jwt.sign(
      { userId: user.uc_uuid },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // -------------------------------------
    // SAVE DEVICE INFO IF PROVIDED
    // -------------------------------------
    if (deviceFcmToken && devicePlatform && deviceId) {
      await authModel.addDeviceIfNotExists({
        ud_fk_uc_uuid: user.uc_uuid,
        uc_card_verified: user.uc_card_verified,
        ud_device_fcmToken: deviceFcmToken,
        ud_device_platform: devicePlatform,
        ud_device_id: deviceId,
      });
    }
    const updatedUser = await userModel.findOne({ uc_uuid: user.uc_uuid }).lean();

  
    return commonHelper.successHandler(res, {
      status: true,
      message: "Login successful.",
      payload: {
        token,
        uuid: updatedUser.uc_uuid,
        email: updatedUser.uc_email,
        uc_card_verified: updatedUser.uc_card_verified,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return commonHelper.errorHandler(res, {
      code: "ZIS-L9999",
      message: "Internal server error",
      status: false,
    }, 200);
  }
};





/**
 * Sends a forgot password OTP to the user's email if the account exists and is active.
 *
 * @param {object} req - 
 * @param {object} res -
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
    const otp = Math.floor(Math.random() * 9000) + 1000;

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
 * Resets the user's password using the provided email, new password, and OTP.
 * Validates the OTP before allowing the password reset.
 *
 * @param {object} req - 
 * @param {object} res - 
 * @returns {void}
 * @developer sangeeta
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
 * Resends OTP to the user's email for account verification.
 *
 * @param {object} req - 
 * @param {object} res - 
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

    const otp = Math.floor(Math.random() * 9000) + 1000; // 4-digit OTP

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


/**
 *  Verifies the OTP sent to the user's email during the password reset process.
 *
 * @param {object} req 
 * @param {object} res 
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

    // OTP matches – update user status
    user.uc_active = "1";
   // user.uc_activation_token = "";
    await user.save();

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
 * Used to Verify card payment
 *
 * @param {object} req 
 * @param {object} res 
 * @returns {void}
 * @developer Sangeeta 
 */

authObj.verifyCardPayment = async function (req, res) {
  try {
    const { email, paymentIntentId } = req.body || {};

    if (!email || !paymentIntentId) {
      console.log("❌ Missing required fields:", { email, paymentIntentId });
      return commonHelper.errorHandler(
        res,
        {
          code: "SUB-UPD-E400",
          message: "Email and paymentIntentId are required.",
          status: false,
        },
        200
      );
    }

    console.log("🔍 Verifying payment for:", email, paymentIntentId);

    // ✅ Retrieve payment info from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log("💳 Stripe Payment Status:", paymentIntent.status);

    // ✅ Check payment status
    if (paymentIntent.status === "succeeded") {
      // Update user verification status in MongoDB
      const updatedUser = await userModel.findOneAndUpdate(
        { uc_email: email.toLowerCase(), uc_deleted: "0" },
        { $set: { uc_card_verified: true } },
        { new: true }
      );

      if (!updatedUser) {
        return commonHelper.errorHandler(
          res,
          {
            code: "SUB-UPD-E404",
            message: "User not found or already deleted.",
            status: false,
          },
          200
        );
      }

      return commonHelper.successHandler(res, {
        status: true,
        message: "✅ Payment verified successfully with Stripe.",
        payload: updatedUser,
      });
    } else {
      return commonHelper.errorHandler(
        res,
        {
          code: "SUB-UPD-E402",
          message: `Payment not completed. Stripe status: ${paymentIntent.status}`,
          status: false,
        },
        200
      );
    }
  } catch (error) {
    console.error("🚨 Error verifying payment:", error);
    return commonHelper.errorHandler(
      res,
      {
        code: "SUB-UPD-E500",
        message: error.message || "Internal server error",
        status: false,
      },
      200
    );
  }
};


 /**
 * Used to sign in or register user with Google ID.
 *
 * @param {object} req 
 * @param {object} res 
 * @returns {void}
 * @developer Sangeeta 
 */
authObj.signinWithGoogleId = async function (req, res) {
  try {
    const { email, name, deviceFcmToken, devicePlatform, deviceId } = req.body;

    if (!email) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "CCS-E2001",
        message: "Email is required.",
      }, 200);
    }

    const normalizedEmail = email.toLowerCase();
    let user = await userModel.findOne({ uc_email: normalizedEmail });

    // If user exists
    if (user) {
      if (name && !user.uc_full_name) user.uc_full_name = name;
      user.uc_login_type = "google";
      await user.save();

      const token = jwt.sign({ userId: user.uc_uuid }, process.env.JWT_SECRET, { expiresIn: "7d" });

      // Save device info if provided
      if (deviceFcmToken && devicePlatform && deviceId) {
        await authModel.addDeviceIfNotExists({
          ud_fk_uc_uuid: user.uc_uuid,
          uc_card_verified: user.uc_card_verified,
          ud_device_fcmToken: deviceFcmToken,
          ud_device_platform: devicePlatform,
          ud_device_id: deviceId,
        });
      }

      // Fetch device info from DB (same as email login)
      const deviceInfo = await UserDevice.findOne({ ud_fk_uc_uuid: user.uc_uuid });

      // Fetch subscription
      const lastSubscription = await SubscriptionPaymentModel.findOne({
        sp_fk_uc_uuid: user.uc_uuid,
        sp_payment_status: "completed",
      }).sort({ createdAt: -1 }).lean();

      const updatedUser = await userModel.findOne({ uc_uuid: user.uc_uuid }).lean();

      return commonHelper.successHandler(res, {
        status: true,
        message: "Signed in successfully.",
        payload: {
          new_account: false,
          token,
          uuid: updatedUser.uc_uuid,
          email: updatedUser.uc_email,
          uc_card_verified: updatedUser.uc_card_verified,
          uc_login_type: updatedUser.uc_login_type,

          // ✅ Same as email login API
          devicePlatform: deviceInfo?.ud_device_platform || null,
          deviceFcmToken: deviceInfo?.ud_device_fcmToken || null,
          deviceId: deviceInfo?.ud_device_id || null,

        
         
        },
      });
    }

    // If new Google user
    const newUser = new userModel({
      uc_email: normalizedEmail,
      uc_full_name: name || "",
      uc_registeration_type: "GOOGLE",
      uc_login_type: "google",
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({ userId: savedUser.uc_uuid }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    if (deviceFcmToken && devicePlatform && deviceId) {
      await authModel.addDeviceIfNotExists({
        ud_fk_uc_uuid: savedUser.uc_uuid,
        uc_card_verified: savedUser.uc_card_verified,
        ud_device_fcmToken: deviceFcmToken,
        ud_device_platform: devicePlatform,
        ud_device_id: deviceId,
      });
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "Account created and signed in successfully.",
      payload: {
        new_account: true,
        token,
        uuid: savedUser.uc_uuid,
        email: savedUser.uc_email,
        uc_card_verified: savedUser.uc_card_verified,
        uc_login_type: savedUser.uc_login_type,

        devicePlatform: devicePlatform || null,
        deviceFcmToken: deviceFcmToken || null,
        deviceId: deviceId || null,

      },
    });
  } catch (error) {
    console.error("Error in signinWithGoogleId:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "ZIS-G9999",
      message: "Internal server error.",
    }, 200);
  }
};


/**
 * Used to sign in or register user with Apple ID.
 *
 * @param {object} req 
 * @param {object} res 
 * @returns {void}
 * @developer Sangeeta 
 */

authObj.signinWithAppleId = async function (req, res) {
  try {
    const { email, name, deviceFcmToken, devicePlatform, deviceId } = req.body;

    if (!email) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "CCS-E2001",
        message: "Email is required.",
      }, 200);
    }

    const normalizedEmail = email.toLowerCase();
    let user = await userModel.findOne({ uc_email: normalizedEmail });

    // ============================
    //   IF USER ALREADY EXISTS
    // ============================
    if (user) {
      if (name && !user.uc_full_name) user.uc_full_name = name;

      user.uc_login_type = "apple";
      await user.save();

      // Generate JWT
      const token = jwt.sign({ userId: user.uc_uuid }, process.env.JWT_SECRET, { expiresIn: "7d" });

      // Save device info only if all values exist
      if (deviceFcmToken && devicePlatform && deviceId) {
        await authModel.addDeviceIfNotExists({
          ud_fk_uc_uuid: user.uc_uuid,
          uc_card_verified: user.uc_card_verified,
          ud_device_fcmToken: deviceFcmToken,
          ud_device_platform: devicePlatform,
          ud_device_id: deviceId,
        });
      }

      // Fetch saved device info (same as Email login)
      const deviceInfo = await UserDevice.findOne({ ud_fk_uc_uuid: user.uc_uuid });


      const updatedUser = await userModel.findOne({ uc_uuid: user.uc_uuid }).lean();

      return commonHelper.successHandler(res, {
        status: true,
        message: "Signed in successfully.",
        payload: {
          new_account: false,
          token,
          uuid: updatedUser.uc_uuid,
          email: updatedUser.uc_email,
          uc_card_verified: updatedUser.uc_card_verified,
          uc_login_type: updatedUser.uc_login_type,

          // ✅ Return device info from DB (consistent with email & google)
          devicePlatform: deviceInfo?.ud_device_platform || null,
          deviceFcmToken: deviceInfo?.ud_device_fcmToken || null,
          deviceId: deviceInfo?.ud_device_id || null,

          
        },
      });
    }

    // ============================
    //   NEW APPLE USER
    // ============================
    const newUser = new userModel({
      uc_email: normalizedEmail,
      uc_full_name: name || "",
      uc_registeration_type: "APPLE",
      uc_login_type: "apple",
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({ userId: savedUser.uc_uuid }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Save device info for new user
    if (deviceFcmToken && devicePlatform && deviceId) {
      await authModel.addDeviceIfNotExists({
        ud_fk_uc_uuid: savedUser.uc_uuid,
        uc_card_verified: savedUser.uc_card_verified,
        ud_device_fcmToken: deviceFcmToken,
        ud_device_platform: devicePlatform,
        ud_device_id: deviceId,
      });
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "Account created and signed in successfully.",
      payload: {
        new_account: true,
        token,
        uuid: savedUser.uc_uuid,
        email: savedUser.uc_email,
        uc_card_verified: savedUser.uc_card_verified,
        uc_login_type: savedUser.uc_login_type,

        devicePlatform: devicePlatform || null,
        deviceFcmToken: deviceFcmToken || null,
        deviceId: deviceId || null,


       
      },
    });
  } catch (error) {
    console.error("Error in signinWithAppleId:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "ZIS-A9999",
      message: "Internal server error.",
    }, 200);
  }
};


export default authObj;
