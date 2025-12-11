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
 * 📝 Description   : Security & fund management (report suspicious fund, pause fund, fetch reports)
 * ✏️ Modified By   :
 * ================================================================================
 */

import { v4 } from "uuid";
import SecurityReportModel from "../model/SecurityReportModel.js";
import FundModel from "../model/FundModel.js";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";
import UserDevice from "../model/UserDeviceModel.js";
import NotificationModel from "../model/NotificationModel.js";
import newModelObj from "../model/CommonModel.js";

let securityObj = {};

/**
 * Report a suspicious fund.
 *
 * Creates a security report for a fundraiser and notifies the fund owner.
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
 */
securityObj.reportSuspicious = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const { fund_uuid, reason, details, evidence } = req.body;

    if (!fund_uuid || !reason) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "SEC-R1001", message: "fund_uuid & reason required." },
        200
      );
    }

    const fund = await FundModel.findOne({ f_uuid: fund_uuid });
    if (!fund) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "SEC-R1002", message: "Fund not found." },
        200
      );
    }

    const fundOwnerUuid = fund.f_fk_uc_uuid;
    const uuid = v4();

    await SecurityReportModel.create({
      sr_uuid: uuid,
      sr_fund_uuid: fund_uuid,
      sr_reason: reason,
      sr_details: details ?? "",
      sr_reporter_uuid: userId,
      sr_evidence: evidence || [],
    });

    try {
      const deviceRecords = await UserDevice.find({
        ud_fk_uc_uuid: fundOwnerUuid,
        ud_device_fcmToken: { $exists: true, $ne: "" },
      }).select("ud_device_fcmToken");

      const tokens = deviceRecords.map((d) => d.ud_device_fcmToken).filter(Boolean);

      const notiTitle = "Security Alert on Your Fund";
      const notiBody = `A suspicious activity report was filed for your fundraiser. Reason: ${reason}`;

      await NotificationModel.create({
        n_uuid: v4(),
        n_fk_uc_uuid: fundOwnerUuid,
        n_title: notiTitle,
        n_body: notiBody,
        n_payload: { fund_uuid, report_uuid: uuid, type: "security_reported" },
      });

      if (tokens.length > 0) {
        await newModelObj.sendNotificationToUser({
          userId: fundOwnerUuid,
          title: notiTitle,
          body: notiBody,
          data: { fund_uuid, report_uuid: uuid, type: "security_reported" },
          tokens,
        });
      }
    } catch (sendErr) {
      console.error("⚠️ Security Report Notification Error:", sendErr);
    }

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

/**
 * Pause a fund.
 *
 * Pauses the specified fund and notifies the fund owner.
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
 */
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

    const fund = await FundModel.findOne({ f_uuid: fund_uuid });
    if (!fund) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "SEC-P1002", message: "Fund not found." },
        200
      );
    }

    const fundOwnerUuid = fund.f_fk_uc_uuid;

    await FundModel.updateOne(
      { f_uuid: fund_uuid },
      { f_status: "PAUSED", f_pause_reason: reason }
    );

    try {
      const deviceRecords = await UserDevice.find({
        ud_fk_uc_uuid: fundOwnerUuid,
        ud_device_fcmToken: { $exists: true, $ne: "" },
      }).select("ud_device_fcmToken");

      const tokens = deviceRecords.map((d) => d.ud_device_fcmToken).filter(Boolean);

      const notiTitle = "Your Fund Has Been Paused";
      const notiBody = `Your fundraiser was paused due to: ${reason}`;

      await NotificationModel.create({
        n_uuid: v4(),
        n_fk_uc_uuid: fundOwnerUuid,
        n_title: notiTitle,
        n_body: notiBody,
        n_payload: { fund_uuid, reason, type: "fund_paused" },
      });

      if (tokens.length > 0) {
        await newModelObj.sendNotificationToUser({
          userId: fundOwnerUuid,
          title: notiTitle,
          body: notiBody,
          data: { fund_uuid, reason, type: "fund_paused" },
          tokens,
        });
      }
    } catch (sendErr) {
      console.error("⚠️ Fund Pause Notification Error:", sendErr);
    }

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

/**
 * Get all security reports (admin purpose).
 *
 * Retrieves a list of all reports sorted by creation date.
 *
 * @param {object} req
 * @param {object} res
 * @returns {void}
 * @developer Sangeeta
 */
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
