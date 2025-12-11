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
 * 📝 Description   : Payout management (process payout & fetch payout history)
 * ✏️ Modified By   :
 * ================================================================================
 */

import { v4 } from "uuid";
import PayoutModel from "../model/PayoutModel.js";
import DonationModel from "../model/DonationModel.js";
import UserModel from "../model/UserModel.js";
import appHelper from "../helpers/Index.js";
import commonHelper from "../../utils/Helper.js";
import UsersCredentialsModel from "../model/UserModel.js";
import UserDevice from "../model/UserDeviceModel.js";
import NotificationModel from "../model/NotificationModel.js";
import newModelObj from "../model/CommonModel.js";

let payoutObj = {};

/**
 * Process a payout to a user for a donation.
 *
 * Validates user authorization, donation existence, payout card availability,
 * and sends notification to the user upon successful payout.
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
 */
payoutObj.processPayout = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const { donation_uuid } = req.body;

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "PAYOUT-E1001", message: "Unauthorized access." },
        200
      );
    }

    if (!donation_uuid) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "PAYOUT-E1002", message: "donation_uuid is required." },
        200
      );
    }

    // Find donation
    const donation = await DonationModel.findOne({ d_uuid: donation_uuid });

    if (!donation) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "PAYOUT-E1003", message: "Donation not found." },
        200
      );
    }

    // Only fund owner can receive payout
    if (donation.d_fk_uc_uuid !== userId) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "PAYOUT-E1004",
          message: "You are not allowed to receive payout for this donation.",
        },
        200
      );
    }

    // Find user payout card token
    const user = await UsersCredentialsModel.findOne({ uc_uuid: userId });

    if (!user || !user.uc_payout_card_token) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "PAYOUT-E1005", message: "Missing payout debit card token." },
        200
      );
    }

    // Payout simulation
    const payoutUuid = v4();

    const payoutRecord = new PayoutModel({
      p_uuid: payoutUuid,
      p_fk_d_uuid: donation_uuid,
      p_fk_uc_uuid: userId,
      p_amount: donation.d_amount_to_owner,
      p_fee: donation.d_platform_fee,
      p_status: "SENT",
      p_meta: {
        card_token: user.uc_payout_card_token,
        note: "Auto payout to requester",
      },
    });

    await payoutRecord.save();

    // ---------------------------------------
    // 6️⃣ SEND NOTIFICATION (UPDATED)
    // ---------------------------------------
    try {
      const deviceRecords = await UserDevice.find({
        ud_fk_uc_uuid: userId,
        ud_device_fcmToken: { $exists: true, $ne: "" },
      }).select("ud_device_fcmToken");

      const tokens = deviceRecords.map((d) => d.ud_device_fcmToken).filter(Boolean);

      const amount = donation.d_amount_to_owner;
      const notiTitle = "Payout Sent!";
      const notiBody = `₹${amount} successfully transferred to your linked debit card.`;

      await NotificationModel.create({
        n_uuid: v4(),
        n_fk_uc_uuid: userId,
        n_title: notiTitle,
        n_body: notiBody,
        n_payload: {
          payout_uuid: payoutUuid,
          donation_uuid,
          amount,
          type: "payout_sent",
        },
      });

      if (tokens.length > 0) {
        await newModelObj.sendNotificationToUser({
          userId,
          title: notiTitle,
          body: notiBody,
          data: {
            payout_uuid: payoutUuid,
            donation_uuid,
            type: "payout_sent",
          },
          tokens,
        });
      }
    } catch (sendErr) {
      console.error("⚠️ Payout Notification Error:", sendErr);
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "Payout processed successfully.",
      payload: {
        payout_uuid: payoutUuid,
        amount: donation.d_amount_to_owner,
      },
    });

  } catch (err) {
    console.error("❌ processPayout Error:", err);

    return commonHelper.errorHandler(
      res,
      { status: false, code: "PAYOUT-E9999", message: "Internal server error." },
      200
    );
  }
};

/**
 * Get payout history for the logged-in user.
 *
 * Fetches all payouts related to the user, sorted by creation date.
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
 */
payoutObj.getPayoutHistory = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "PAYOUT-H1001", message: "Unauthorized access." },
        200
      );
    }

    const list = await PayoutModel.find({ p_fk_uc_uuid: userId }).sort({
      createdAt: -1,
    });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Payout history fetched.",
      payload: list,
    });
  } catch (err) {
    return commonHelper.errorHandler(
      res,
      { status: false, code: "PAYOUT-H9999", message: "Internal server error." },
      200
    );
  }
};

export default payoutObj;
