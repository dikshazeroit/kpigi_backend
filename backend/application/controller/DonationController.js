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

import { v4 } from "uuid";
import DonationModel from "../model/DonationModel.js";
import PayoutModel from "../model/PayoutModel.js";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";
import FundModel from "../model/FundModel.js";
import UsersCredentialsModel from "../model/UserModel.js";
import UserDevice from "../model/UserDeviceModel.js";
import newModelObj from "../model/CommonModel.js";
import NotificationModel from "../model/NotificationModel.js";

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
    let donorUuid = null;

    try {
      donorUuid = await appHelper.getUUIDByToken(req);
    } catch (e) {
      donorUuid = null;
    }

    const { fund_uuid, amount, is_anonymous } = req.body;

    if (!fund_uuid || !amount) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "DON-E1001",
          message: "fund_uuid and amount are required.",
        },
        200
      );
    }

    const fund = await FundModel.findOne({ f_uuid: fund_uuid });

    if (!fund) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "DON-E1002",
          message: "Fund not found.",
        },
        200
      );
    }

    const requesterUuid = fund.f_fk_uc_uuid;
    const requester = await UsersCredentialsModel.findOne({ uc_uuid: requesterUuid });

    if (!requester || !requester.uc_payout_card_token) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "DON-E1003",
          message: "Requester payout card not found. Donation stopped.",
        },
        200
      );
    }

    const { fee, net } = calculateFee(Number(amount));

    const donationUuid = v4();
    const donationRecord = new DonationModel({
      d_uuid: donationUuid,
      d_fk_uc_uuid: donorUuid,
      d_fk_f_uuid: fund_uuid,
      d_amount: Number(amount),
      d_platform_fee: fee,
      d_amount_to_owner: net,
      d_is_anonymous: !!is_anonymous,
      d_status: "SUCCESS",
    });

    await donationRecord.save();

    const payoutUuid = v4();
    const payoutRecord = new PayoutModel({
      p_uuid: payoutUuid,
      p_fk_d_uuid: donationUuid,
      p_fk_uc_uuid: requesterUuid,
      p_amount: net,
      p_fee: fee,
      p_status: "SENT",
      p_meta: {},
    });

    await payoutRecord.save();

    // Send notification
    try {
      const deviceRecords = await UserDevice.find({
        ud_fk_uc_uuid: requesterUuid,
        ud_device_fcmToken: { $exists: true, $ne: "" },
      }).select("ud_device_fcmToken");

      const tokens = deviceRecords.map((d) => d.ud_device_fcmToken).filter(Boolean);

      const notiTitle = "New donation received!";
      const notiBody = `You received $${net} from a supporter.`;

      await NotificationModel.create({
        n_uuid: v4(),
        n_fk_uc_uuid: requesterUuid,
        n_title: notiTitle,
        n_body: notiBody,
        n_payload: {
          fund_uuid,
          donation_uuid: donationUuid,
          amount: net,
          type: "donation_received",
        },
      });

      if (tokens.length > 0) {
        await newModelObj.sendNotificationToUser({
          userId: requesterUuid,
          title: notiTitle,
          body: notiBody,
          data: {
            fund_uuid,
            donation_uuid: donationUuid,
            type: "donation_received",
          },
          tokens,
        });
      }
    } catch (sendErr) {
      console.error("⚠️ Donation Notification Error:", sendErr);
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "Donation successful. Amount sent to requester.",
      payload: { donation_uuid: donationUuid, payout_uuid: payoutUuid },
    });
  } catch (err) {
    console.error("❌ createDonation:", err);
    return commonHelper.errorHandler(
      res,
      { status: false, code: "DON-E9999", message: "Internal server error." },
      200
    );
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
