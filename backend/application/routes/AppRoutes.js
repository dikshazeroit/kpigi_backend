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
 * 🧑‍💻 Author       : Diksha Jaswal <dikshaj.zeroit@gmail.com>
 * 📅 Created On    : May 2025
 * 📝 Description   : Route configuration for authentication and user modules.
 * ✏️ Last Modified : [To be updated when modified]
 * ================================================================================
 */
import express from "express";
import authObj from "../controller/AuthController.js";
import userObj from "../controller/UserController.js";
import fundObj from "../controller/FundController.js";
import donationObj from "../controller/DonationController.js";
import payoutObj from "../controller/PayoutController.js";
import { allowHeaders } from "../../middleware/Cors.js";
import { authenticate } from "../../middleware/JsonWebToken.js";
import combinedUpload from "../../middleware/CombinedUploadMiddleware.js";
import fundUpload from "../../middleware/FundUpload.js";

const router = express.Router();

// Global middleware (headers) - applies to all routes in this router
router.all("/{*any}", allowHeaders);

// Middleware for private routes
router.all("/private/{*any}", authenticate);

//****************************** 🔐 Authentication Routes *******************************************//

router.post("/auth/register", authObj.registerWithEmail);
router.post("/auth/check-email", authObj.checkEmailExists);
router.post("/auth/verify-email", authObj.verifyEmail);
router.post("/auth/login", authObj.loginWithEmail);
router.post("/auth/forgot-password", authObj.userForgotPasswordEmail);
router.post("/auth/resend-otp", authObj.resendOtp);
router.post("/auth/reset-password", authObj.resetPasswordEmail);
router.post("/auth/verify-forgot-email", authObj.verifyForgotEmail);    
router.post("/auth/verify-card", authObj.verifyCardPayment);

router.post("/auth/google-signin", authObj.signinWithGoogleId);
router.post("/auth/apple-signin", authObj.signinWithAppleId);


//****************************** 🔐 Private Routes *******************************************//

router.post("/private/update-user-profile", userObj.updateUserProfile);
router.post("/private/upload-photo", combinedUpload, userObj.uploadProfilePhoto);
router.post("/private/settings", userObj.updateSettings);
router.post("/private/change-password", userObj.changePassword);
router.post("/private/get-user-profile", userObj.getUserProfile);
router.post("/private/update-user-location", userObj.updateUserLocation);
router.post("/private/delete-account", userObj.deleteAccount);
router.post("/private/update-payout-card", userObj.updatePayoutCard);

//****************************** 🔐 Found Routes *******************************************//
router.post("/private/create-fund",fundUpload,fundObj.createFundRequest);
router.post("/private/fund-list", fundObj.getFundList);
router.post("/private/fund-details", fundObj.getFundDetails);
router.post("/private/update-fund", fundUpload,fundObj.updateFund);
router.post("/private/delete-fund", fundObj.deleteFund);

//****************************** 💰 Donation Routes *******************************************//
router.post("/private/donation-start", donationObj.createDonation);
router.post("/private/donation-list", donationObj.getMyDonations);
router.post("/private/donation-fund-donors", donationObj.getFundDonors);
//****************************** 💰 Payout Routes *******************************************//
router.post("/private/payout-process", payoutObj.processPayout);
router.post("/private/payout-history", payoutObj.getPayoutHistory);


export default router;
