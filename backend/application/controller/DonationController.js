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
 * 🧑‍💻 Author       : Sangeeta Kumari <sangeeta.zeroit@gmail.com>
 * 📅 Created On    : Dec 2025
 * 📝 Description   : Donation module with create, list, and donor management.
 * ================================================================================
 */

import { v4 as uuidv4 } from "uuid";
import DonationModel from "../model/DonationModel.js";
import PayoutModel from "../model/PayoutModel.js";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";
import FundModel from "../model/FundModel.js";
import UsersCredentialsModel from "../model/UserModel.js";
import UserDevice from "../model/UserDeviceModel.js";
import newModelObj from "../model/CommonModel.js";
import NotificationModel from "../model/NotificationModel.js";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let donationObj = {};

/**
 * Calculate platform fee (2.8%) and net donation amount.
 *
 * @param {number} amount - Donation amount
 * @returns {object} - { fee, net }
 */
function calculateFee(amount) {
  const fee = Number(((amount * 2.8) / 100).toFixed(2));
  const net = Number((amount - fee).toFixed(2));
  return { fee, net };
}

/**
 * Create a new donation for a specific fund.
 *
 * Handles anonymous donations, validates fund and requester payout,
 * calculates fees, creates donation and payout records, and sends notifications.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 */
donationObj.createDonation = async function (req, res) {
  try {
    /* 🔐 Get Donor UUID from Token */
    const donorUuid = await appHelper.getUUIDByToken(req);
    if (!donorUuid) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "DON-E1000",
        message: "Unauthorized",
      }, 200);
    }

    /* 👤 Get User */
    const user = await UsersCredentialsModel.findOne({ uc_uuid: donorUuid });
    if (!user || !user.uc_full_name || !user.uc_email) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "DON-E1003",
        message: "User name or email not found",
      }, 200);
    }

    const { fund_uuid, amount, is_anonymous } = req.body;
    if (!fund_uuid || !amount || Number(amount) <= 0) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "DON-E1001",
        message: "fund_uuid and valid amount are required",
      }, 200);
    }

    /* 📦 Fetch Fund */
    const fund = await FundModel.findOne({ f_uuid: fund_uuid });
    if (!fund) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "DON-E1002",
        message: "Fund not found",
      }, 200);
    }

    /* 💰 Amount calc */
    const amountInCents = Math.round(Number(amount) * 100);
    const platformFee = Math.round(amountInCents * 0.028);
    const netAmount = amountInCents - platformFee;

    /* 🧍‍♂️ 1️⃣ CREATE STRIPE CUSTOMER (MANDATORY – INDIA) */
    const customer = await stripe.customers.create({
      name: user.uc_full_name,
      email: user.uc_email,
      address: {
        line1: "221B Baker Street",
        line2: "Near Metro Station",
        city: "Mumbai",
        state: "MH",
        postal_code: "400001",
        country: "IN", // ⚠️ MUST BE IN
      },
    });

    /* 🧾 Donation UUID */
    const donationUuid = uuidv4();

    /* 💳 2️⃣ PAYMENT INTENT WITH CUSTOMER + SHIPPING */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      description: "Donation for charitable initiative",
      shipping: {
        name: user.uc_full_name,
        address: {
          line1: "221B Baker Street",
          city: "Mumbai",
          state: "MH",
          postal_code: "400001",
          country: "IN",
        },
      },
      metadata: {
        donation_uuid: donationUuid,
        fund_uuid,
        donor_uuid: donorUuid,
        export_reason: "charitable donation",
      },
    });

    /* 🧾 Save Donation */
    await DonationModel.create({
      d_uuid: donationUuid,
      d_fk_uc_uuid: donorUuid,
      d_fk_f_uuid: fund_uuid,
      d_amount: Number(amount),
      d_platform_fee: platformFee / 100,
      d_amount_to_owner: netAmount / 100,
      d_is_anonymous: !!is_anonymous,
      d_payment_intent_id: paymentIntent.id,
      d_status: "PENDING",
      d_meta: {
        address_mode: "STATIC_API",
        currency: "USD",
        stripe_customer_id: customer.id,
      },
    });

    /* 📤 Response */
    return commonHelper.successHandler(res, {
      status: true,
      message: "Donation initiated",
      payload: {
        client_secret: paymentIntent.client_secret,
        donation_uuid: donationUuid,
      },
    });

  } catch (error) {
    console.error("❌ createDonation error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "DON-E9999",
      message: error.message || "Donation failed",
    }, 200);
  }
};





/**
 * Fetch donations made by the current user.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 */
donationObj.getDonationsHistory = async function (req, res) {
  try {
    const userUuid = await appHelper.getUUIDByToken(req);
    if (!userUuid) {
      return commonHelper.errorHandler(
        res,
        { status: false, message: "Unauthorized" },
        200
      );
    }

    // 1️⃣ Get user donations
    const donations = await DonationModel.find({
      d_fk_uc_uuid: userUuid,
      d_status: "SUCCESS"
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!donations.length) {
      return commonHelper.successHandler(res, {
        status: true,
        message: "Donation history fetched",
        payload: []
      });
    }

    // 2️⃣ Collect fund UUIDs
    const fundUuids = donations.map(d => d.d_fk_f_uuid);

    // 3️⃣ Fetch funds
    const funds = await FundModel.find(
      { f_uuid: { $in: fundUuids } },
      { f_uuid: 1, f_title: 1, f_fk_uc_uuid: 1 }
    ).lean();

    const fundMap = {};
    funds.forEach(f => {
      fundMap[f.f_uuid] = f;
    });

    // 4️⃣ Collect recipient UUIDs
    const recipientUuids = funds.map(f => f.f_fk_uc_uuid);

    const recipients = await UsersCredentialsModel.find(
      { uc_uuid: { $in: recipientUuids } },
      { uc_uuid: 1, uc_full_name: 1 }
    ).lean();

    const recipientMap = {};
    recipients.forEach(u => {
      recipientMap[u.uc_uuid] = u.uc_full_name;
    });

    // 5️⃣ FINAL UI RESPONSE (FLAT)
    const history = donations.map(d => {
      const fund = fundMap[d.d_fk_f_uuid] || {};

      return {
        donationUuid: d.d_uuid,
        fundRequestId: d.d_fk_f_uuid,   // ✅ ADDED
        amount: d.d_amount,
        status: "Donated",
        fundTitle: fund.f_title || "",
        toUserName: recipientMap[fund.f_fk_uc_uuid] || "",
        donatedAt: d.createdAt
      };
    });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Donation history fetched",
      payload: history
    });

  } catch (error) {
    console.error("❌ getDonationsHistory Error:", error);
    return commonHelper.errorHandler(
      res,
      { status: false, message: "Internal server error" },
      200
    );
  }
};




/**
 * Fetch all donors for a specific fund.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 */
donationObj.getFundDonors = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const { fund_uuid } = req.body;

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        { status: false, message: "Unauthorized" },
        200
      );
    }

    if (!fund_uuid) {
      return commonHelper.errorHandler(
        res,
        { status: false, message: "fund_uuid is required" },
        200
      );
    }

    // 1️⃣ Fund details
    const fund = await FundModel.findOne({ f_uuid: fund_uuid });
    if (!fund) {
      return commonHelper.errorHandler(
        res,
        { status: false, message: "Fund not found" },
        200
      );
    }

    // 2️⃣ Donations of this fund
    const donations = await DonationModel.find({
      d_fk_f_uuid: fund_uuid,
      d_status: "SUCCESS",
    }).sort({ createdAt: -1 });

    // 3️⃣ Build response
    const donationList = await Promise.all(
      donations.map(async (d) => {
        let donor = null;

        if (!d.d_is_anonymous && d.d_fk_uc_uuid) {
          const user = await UsersCredentialsModel.findOne({
            uc_uuid: d.d_fk_uc_uuid,
          });

          donor = user
            ? {
                user_uuid: user.uc_uuid,
                name: user.uc_full_name,
                email: user.uc_email,
                profile_photo: user.uc_profile_photo,
              }
            : null;
        }

        return {
          donation_uuid: d.d_uuid,
          donated_amount: d.d_amount,
          transaction_reference: d.d_payment_intent_id,
          transaction_date: d.createdAt,
          donor: d.d_is_anonymous ? "Anonymous" : donor,
        };
      })
    );

    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund donation list fetched",
      payload: {
        fund: {
          f_uuid: fund.f_uuid,
          title: fund.f_title,
          purpose: fund.f_purpose,
          category: fund.f_category_name,
          target_amount: fund.f_amount,
          status: fund.f_status,
        },
        donations: donationList,
      },
    });
  } catch (error) {
    console.error("❌ getFundDonors Error:", error);
    return commonHelper.errorHandler(
      res,
      { status: false, message: "Internal server error" },
      200
    );
  }
};


donationObj.getReceivedDonations = async function (req, res) {
  try {
    // 1️⃣ Fund owner UUID from token
    const ownerUuid = await appHelper.getUUIDByToken(req);
    console.log(ownerUuid,"ooooooooooooooooooooooooooooo")

    if (!ownerUuid) {
      return commonHelper.errorHandler(
        res,
        { status: false, message: "Unauthorized" },
        200
      );
    }

    // 2️⃣ Owner ke saare funds
    const funds = await FundModel.find({ f_fk_uc_uuid: ownerUuid });

    if (!funds.length) {
      return commonHelper.successHandler(res, {
        status: true,
        message: "No donations received yet",
        payload: [],
      });
    }

    const fundUuids = funds.map((f) => f.f_uuid);

    // 3️⃣ Un funds par aayi saari donations
    const donations = await DonationModel.find({
      d_fk_f_uuid: { $in: fundUuids },
      d_status: "SUCCESS",
    }).sort({ createdAt: -1 });

    // 4️⃣ Response build
    const response = await Promise.all(
      donations.map(async (d) => {
        const fund = funds.find((f) => f.f_uuid === d.d_fk_f_uuid);

        let donor = null;
        if (!d.d_is_anonymous && d.d_fk_uc_uuid) {
          const user = await UsersCredentialsModel.findOne({
            uc_uuid: d.d_fk_uc_uuid,
          });

          donor = user
            ? {
                user_uuid: user.uc_uuid,
                name: user.uc_full_name,
                email: user.uc_email,
                profile_photo: user.uc_profile_photo,
              }
            : null;
        }

        return {
          donation_uuid: d.d_uuid,
          donated_amount: d.d_amount,
          transaction_reference: d.d_payment_intent_id,
          transaction_status: d.d_status,
          transaction_date: d.createdAt,
          fund: fund
            ? {
                f_uuid: fund.f_uuid,
                title: fund.f_title,
                category: fund.f_category_name,
              }
            : null,
          donor: d.d_is_anonymous ? "Anonymous" : donor,
        };
      })
    );

    return commonHelper.successHandler(res, {
      status: true,
      message: "Received donations fetched",
      payload: response,
    });
  } catch (error) {
    console.error("❌ getReceivedDonations Error:", error);
    return commonHelper.errorHandler(
      res,
      { status: false, message: "Internal server error" },
      200
    );
  }
};

donationObj.addDonationMessage = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    if (!userId) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Unauthorized"
      }, 200);
    }

   
    const { donationUuid, message } = req.body;

    if (!donationUuid) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "donationUuid is required"
      }, 200);
    }

    const donation = await DonationModel.findOne({
      d_uuid: donationUuid,        
      d_fk_uc_uuid: userId,
      d_status: "SUCCESS"
    });

    if (!donation) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Donation not found or not completed"
      }, 200);
    }

    donation.d_message = message?.trim() || "";
    await donation.save();

    return commonHelper.successHandler(res, {
      status: true,
      message: "Message added successfully"
    });

  } catch (error) {
    console.error("❌ addDonationMessage error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      message: "Something went wrong"
    }, 200);
  }
};

donationObj.getMyDonationsDashboard = async function (req, res) {
  try {
    // 🔐 Auth
    const userUuid = await appHelper.getUUIDByToken(req);
    if (!userUuid) {
      return commonHelper.errorHandler(res, {
        status: false,
        message: "Unauthorized access"
      }, 200);
    }

    // 1️⃣ Get funds created by user (with title)
    const funds = await FundModel.find(
      { f_fk_uc_uuid: userUuid },
      { f_uuid: 1, f_title: 1 }
    ).lean();

    const fundUuids = funds.map(f => f.f_uuid);

    // Fund map (uuid → fund)
    const fundMap = {};
    funds.forEach(f => {
      fundMap[f.f_uuid] = f;
    });

    if (!fundUuids.length) {
      return commonHelper.successHandler(res, {
        status: true,
        message: "No donations found",
        payload: {
          summary: {
            total_amount: 0,
            total_donors: 0,
            donor_avatars: []
          },
          recent_transactions: []
        }
      });
    }

    // 2️⃣ Get donations on these funds
    const donations = await DonationModel.find({
      d_fk_f_uuid: { $in: fundUuids },
      d_status: "SUCCESS"
    })
      .sort({ createdAt: -1 })
      .lean();

    // 3️⃣ Unique donor UUIDs
    const donorUuids = [...new Set(donations.map(d => d.d_fk_uc_uuid))];

    // 4️⃣ Fetch donor users
    const donors = await UsersCredentialsModel.find(
      { uc_uuid: { $in: donorUuids } },
      { uc_uuid: 1, uc_full_name: 1, uc_profile_photo: 1 }
    ).lean();

    // 5️⃣ Donor map
    const donorMap = {};
    donors.forEach(u => {
      donorMap[u.uc_uuid] = u;
    });

    // 6️⃣ Summary
    const totalAmount = donations.reduce(
      (sum, d) => sum + (d.d_amount || 0),
      0
    );

    const donorAvatars = donors
      .filter(d => d.uc_profile_photo)
      .slice(0, 5)
      .map(d => d.uc_profile_photo);

    // 7️⃣ Recent transactions (WITH FUND INFO ✅)
    const recentTransactions = donations.slice(0, 10).map(d => {
      const donor = donorMap[d.d_fk_uc_uuid];
      const fund = fundMap[d.d_fk_f_uuid];

      return {
        donation_uuid: d.d_uuid,

        // 👤 Donor
        donor_name: donor?.uc_full_name || "Anonymous",
        donor_profile: donor?.uc_profile_photo || "",

        // 💰 Donation
        amount: d.d_amount,
        message: d.d_message || "",
        transaction_date: d.createdAt,

        // 🎯 Fund / Request info
        fund_uuid: fund?.f_uuid || "",
        fund_title: fund?.f_title || "Unknown Fund"
      };
    });

    // 8️⃣ Response
    return commonHelper.successHandler(res, {
      status: true,
      message: "My donations dashboard fetched",
      payload: {
        summary: {
          total_amount: totalAmount,
          total_donors: donorUuids.length,
          donor_avatars: donorAvatars
        },
        recent_transactions: recentTransactions
      }
    });

  } catch (error) {
    console.error("❌ getMyDonationsDashboard Error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      message: "Internal server error"
    }, 200);
  }
};



export default donationObj;
