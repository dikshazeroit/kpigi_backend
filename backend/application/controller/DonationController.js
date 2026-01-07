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

    /* 👤 Get User name + email from DB */
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

    /* 💰 Fee Calculation */
    const amountInCents = Math.round(Number(amount) * 100);
    const platformFee = Math.round(amountInCents * 0.028);
    const netAmount = amountInCents - platformFee;

    /* 💳 Correct PaymentIntent creation (NO payment_method_data here!) */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      description: `Donation to fund ${fund.f_name || fund_uuid}`,
      payment_method_types: ["card"], // ONLY specify card type
      metadata: {
        fund_uuid,
        donor_uuid: donorUuid,
      },
    });

    /* 🧾 Save Donation */
    const donationUuid = uuidv4();
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
donationObj.getMyDonations = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);

    const list = await DonationModel.find({ d_fk_uc_uuid: userId }).sort({ createdAt: -1 });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Donation list fetched.",
      payload: list,
    });
  } catch (e) {
    return commonHelper.errorHandler(
      res,
      { status: false, code: "DON-L9999", message: "Internal error." },
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
    const { fund_uuid } = req.body;

    const donations = await DonationModel.find({ d_fk_f_uuid: fund_uuid, d_status: "SUCCESS" });

    const list = donations.map(item => ({
      donation_uuid: item.d_uuid,
      amount: item.d_amount,
      is_anonymous: item.d_is_anonymous,
      donor_uuid: item.d_is_anonymous ? null : item.d_fk_uc_uuid,
      createdAt: item.createdAt
    }));

    return commonHelper.successHandler(res, {
      status: true,
      message: "Donors fetched.",
      payload: list,
    });
  } catch (err) {
    return commonHelper.errorHandler(
      res,
      { status: false, code: "DON-F9999", message: "Internal error." },
      200
    );
  }
};

export default donationObj;
