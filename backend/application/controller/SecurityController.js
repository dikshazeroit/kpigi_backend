import { v4 } from "uuid";
import SecurityReportModel from "../model/SecurityReportModel.js";
import FundModel from "../model/FundModel.js";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";
import UserDevice from "../model/UserDeviceModel.js";
import NotificationModel from "../model/NotificationModel.js";
import newModelObj from "../model/CommonModel.js";

let securityObj = {};

// ---------------------------------------------------------
// 👉 REPORT SUSPICIOUS FUND
// ---------------------------------------------------------
securityObj.reportSuspicious = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const { fund_uuid, reason, details, evidence } = req.body;

    if (!fund_uuid || !reason) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "SEC-R1001",
          message: "fund_uuid & reason required.",
        },
        200
      );
    }

    // 1️⃣ Check if fund exists
    const fund = await FundModel.findOne({ f_uuid: fund_uuid });
    if (!fund) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "SEC-R1002",
          message: "Fund not found.",
        },
        200
      );
    }

    const fundOwnerUuid = fund.f_fk_uc_uuid;

    // 2️⃣ Create Security Report
    const uuid = v4();

    await SecurityReportModel.create({
      sr_uuid: uuid,
      sr_fund_uuid: fund_uuid,
      sr_reason: reason,
      sr_details: details ?? "",
      sr_reporter_uuid: userId,
      sr_evidence: evidence || [],
    });

    // -------------------------------------------
    // 6️⃣ SEND NOTIFICATION TO FUND OWNER (NEW)
    // -------------------------------------------

    try {
      // Fetch FCM tokens of the fund owner
      const deviceRecords = await UserDevice.find({
        ud_fk_uc_uuid: fundOwnerUuid,
        ud_device_fcmToken: { $exists: true, $ne: "" },
      }).select("ud_device_fcmToken");

      const tokens = deviceRecords
        .map((d) => d.ud_device_fcmToken)
        .filter(Boolean);

      const notiTitle = "Security Alert on Your Fund";
      const notiBody = `A suspicious activity report was filed for your fundraiser. Reason: ${reason}`;

      // Save notification to DB
      await NotificationModel.create({
        n_uuid: v4(),
        n_fk_uc_uuid: fundOwnerUuid,
        n_title: notiTitle,
        n_body: notiBody,
        n_payload: {
          fund_uuid,
          report_uuid: uuid,
          type: "security_reported",
        },
      });

      // Send Push Notification
      if (tokens.length > 0) {
        await newModelObj.sendNotificationToUser({
          userId: fundOwnerUuid,
          title: notiTitle,
          body: notiBody,
          data: {
            fund_uuid,
            report_uuid: uuid,
            type: "security_reported",
          },
          tokens,
        });
      }
    } catch (sendErr) {
      console.error("⚠️ Security Report Notification Error:", sendErr);
    }

    // -------------------------------------------

    return commonHelper.successHandler(res, {
      status: true,
      message: "Report submitted.",
      payload: { sr_uuid: uuid },
    });

  } catch (err) {
    console.error("❌ reportSuspicious Error:", err);

    return commonHelper.errorHandler(res, {
      status: false,
      code: "SEC-R9999",
      message: "Internal server error.",
    });
  }
};


// ---------------------------------------------------------
// 👉 PAUSE FUND
// ---------------------------------------------------------
securityObj.pauseFund = async function (req, res) {
  try {
    const { fund_uuid, reason } = req.body;

    if (!fund_uuid || !reason) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "SEC-P1001", message: "Required fields missing." },
        200
      );
    }

    // 1️⃣ Find fund
    const fund = await FundModel.findOne({ f_uuid: fund_uuid });
    if (!fund) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "SEC-P1002", message: "Fund not found." },
        200
      );
    }

    const fundOwnerUuid = fund.f_fk_uc_uuid;

    // 2️⃣ Pause the fund
    await FundModel.updateOne(
      { f_uuid: fund_uuid },
      { f_status: "PAUSED", f_pause_reason: reason }
    );

    // ------------------------------------------
    // 6️⃣ SEND NOTIFICATION TO FUND OWNER (NEW)
    // ------------------------------------------
    try {
      // Fetch device tokens of fund owner
      const deviceRecords = await UserDevice.find({
        ud_fk_uc_uuid: fundOwnerUuid,
        ud_device_fcmToken: { $exists: true, $ne: "" },
      }).select("ud_device_fcmToken");

      const tokens = deviceRecords
        .map((d) => d.ud_device_fcmToken)
        .filter(Boolean);

      const notiTitle = "Your Fund Has Been Paused";
      const notiBody = `Your fundraiser was paused due to: ${reason}`;

      // Save the notification in DB
      await NotificationModel.create({
        n_uuid: v4(),
        n_fk_uc_uuid: fundOwnerUuid,
        n_title: notiTitle,
        n_body: notiBody,
        n_payload: {
          fund_uuid,
          reason,
          type: "fund_paused",
        },
      });

      // Send Push Notification
      if (tokens.length > 0) {
        await newModelObj.sendNotificationToUser({
          userId: fundOwnerUuid,
          title: notiTitle,
          body: notiBody,
          data: {
            fund_uuid,
            reason,
            type: "fund_paused",
          },
          tokens,
        });
      }
    } catch (sendErr) {
      console.error("⚠️ Fund Pause Notification Error:", sendErr);
    }

    // ------------------------------------------

    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund paused successfully.",
    });
  } catch (err) {
    console.error("❌ pauseFund Error:", err);

    return commonHelper.errorHandler(res, {
      status: false,
      code: "SEC-P9999",
      message: "Internal error.",
    });
  }
};


// ---------------------------------------------------------
// 👉 GET ALL REPORTS (Admin Purpose)
// ---------------------------------------------------------
securityObj.getReports = async function (req, res) {
  try {
    const list = await SecurityReportModel.find().sort({ createdAt: -1 });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Reports list loaded.",
      payload: list,
    });
  } catch (err) {
    return commonHelper.errorHandler(res, {
      status: false,
      code: "SEC-G9999",
      message: "Internal error.",
    });
  }
};

export default securityObj;
