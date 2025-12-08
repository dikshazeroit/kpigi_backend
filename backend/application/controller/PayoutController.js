import { v4 } from "uuid";
import PayoutModel from "../model/PayoutModel.js";
import DonationModel from "../model/DonationModel.js";
import UserModel from "../model/UserModel.js";
import appHelper from "../helpers/Index.js";
import commonHelper from "../../utils/Helper.js";

let payoutObj = {};

// ----- SEND PAYOUT TO USER -----
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
    const user = await UserModel.findOne({ uc_uuid: userId });

    if (!user || !user.uc_payout_card_token) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "PAYOUT-E1005", message: "Missing payout debit card token." },
        200
      );
    }

    // No real payment → simulation
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

    // Send notification
    if (appHelper.sendNotification) {
      await appHelper.sendNotification({
        userUuid: userId,
        title: "Payout sent",
        body: `₹${donation.d_amount_to_owner} payout successfully sent to your debit card.`,
      });
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

// ----- PAYOUT HISTORY -----
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
