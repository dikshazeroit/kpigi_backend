import { v4 } from "uuid";
import SecurityReportModel from "../model/SecurityReportModel.js";
import FundModel from "../model/FundModel.js";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";

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

    const uuid = v4();

    await SecurityReportModel.create({
      sr_uuid: uuid,
      sr_fund_uuid: fund_uuid,
      sr_reason: reason,
      sr_details: details ?? "",
      sr_reporter_uuid: userId,
      sr_evidence: evidence || [],
    });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Report submitted.",
      payload: { sr_uuid: uuid },
    });
  } catch (err) {
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

    await FundModel.updateOne(
      { f_uuid: fund_uuid },
      { f_status: "PAUSED", f_pause_reason: reason }
    );

    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund paused successfully.",
    });
  } catch (err) {
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
