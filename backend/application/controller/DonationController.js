
import { v4 } from "uuid";
import DonationModel from "../model/DonationModel.js";
import PayoutModel from "../model/PayoutModel.js";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";
import constants from "../../config/Constants.js";
import FundModel from "../model/FundModel.js";

let donationObj = {};

// 2.8% fee calculator
function calculateFee(amount) {
  const fee = Number(((amount * 2.8) / 100).toFixed(2));
  const net = Number((amount - fee).toFixed(2));
  return { fee, net };
}

donationObj.createDonation = async function (req, res) {
  try {
    // donor might be null (guest)
    let donorUuid = null;

    try {
      donorUuid = await appHelper.getUUIDByToken(req);
    } catch (e) {
      donorUuid = null;
    }

    const { fund_uuid, amount, is_anonymous } = req.body;

    if (!fund_uuid || !amount) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "DON-E1001",
        message: "fund_uuid and amount are required.",
      }, 200);
    }

    // find fund
    const fund = await FundModel.findOne({ f_uuid: fund_uuid });

    if (!fund) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "DON-E1002",
        message: "Fund not found.",
      }, 200);
    }

    const requesterUuid = fund.f_fk_uc_uuid;

    // find requester payout card token
    let userModel = (await import("../model/UserModel.js")).default;
    const requester = await userModel.findOne({ uc_uuid: requesterUuid });

    if (!requester || !requester.uc_payout_card_token) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "DON-E1003",
        message: "Requester payout card not found. Donation stopped.",
      }, 200);
    }

    const { fee, net } = calculateFee(Number(amount));

    // create donation record
    const donationUuid = v4();
    const donationRecord = new DonationModel({
      d_uuid: donationUuid,
      d_fk_uc_uuid: donorUuid,
      d_fk_f_uuid: fund_uuid,
      d_amount: Number(amount),
      d_platform_fee: fee,
      d_amount_to_owner: net,
      d_is_anonymous: !!is_anonymous,
      d_status: "SUCCESS"
    });

    await donationRecord.save();

    // create payout
    const payoutUuid = v4();
    const payoutRecord = new PayoutModel({
      p_uuid: payoutUuid,
      p_fk_d_uuid: donationUuid,
      p_fk_uc_uuid: requesterUuid,
      p_amount: net,
      p_fee: fee,
      p_status: "SENT",
      p_meta: {}
    });

    await payoutRecord.save();

    // Send notifications
    if (appHelper.sendNotification) {
      await appHelper.sendNotification({
        userUuid: requesterUuid,
        title: "New donation received",
        body: `You received ${net} from a supporter`,
      });
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "Donation successful. Amount sent to requester.",
      payload: {
        donation_uuid: donationUuid,
        payout_uuid: payoutUuid,
      },
    });

  } catch (err) {
    console.error("❌ createDonation:", err);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "DON-E9999",
      message: "Internal server error.",
    }, 200);
  }
};

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
    return commonHelper.errorHandler(res, {
      status: false,
      code: "DON-L9999",
      message: "Internal error.",
    }, 200);
  }
};

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
    return commonHelper.errorHandler(res, {
      status: false,
      code: "DON-F9999",
      message: "Internal error.",
    }, 200);
  }
};

export default donationObj;
