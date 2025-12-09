import { v4 } from "uuid";
import NotificationModel from "../model/NotificationModel.js";
import NotificationSettingsModel from "../model/NotificationSettingsModel.js";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";

let notificationObj = {};

// ----------------------------------------
// 👉 SEND NOTIFICATION
// ----------------------------------------
notificationObj.sendNotification = async function (req, res) {
  try {
    const { userUuid, title, body, payload } = req.body;

    if (!userUuid || !title || !body) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "NOTI-E1001",
          message: "Missing notification fields.",
        },
        200
      );
    }

    const uuid = v4();

    await NotificationModel.create({
      n_uuid: uuid,
      n_fk_uc_uuid: userUuid,
      n_title: title,
      n_body: body,
      n_payload: payload || {},
    });

    // Send FCM here (if needed)
    // await appHelper.sendNotification({ userUuid, title, body });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Notification sent.",
      payload: { n_uuid: uuid },
    });
  } catch (err) {
    console.error("❌ sendNotification Error:", err);
    return commonHelper.errorHandler(
      res,
      { status: false, code: "NOTI-E9999", message: "Internal error." },
      200
    );
  }
};

// ----------------------------------------
// 👉 GET USER NOTIFICATION LIST
// ----------------------------------------
notificationObj.getInbox = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const { page = 1, limit = 20 } = req.body;

    const list = await NotificationModel.find({ n_fk_uc_uuid: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return commonHelper.successHandler(res, {
      status: true,
      message: "Notification inbox loaded.",
      payload: list,
    });
  } catch (err) {
    console.error("❌ getInbox Error:", err);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "NOTI-L9999",
      message: "Internal server error.",
    });
  }
};

// ----------------------------------------
// 👉 MARK NOTIFICATION READ
// ----------------------------------------
notificationObj.markAsRead = async function (req, res) {
  try {
    const { n_uuid } = req.body;

    if (!n_uuid)
      return commonHelper.errorHandler(
        res,
        { status: false, code: "NOTI-R1001", message: "n_uuid required." },
        200
      );

    await NotificationModel.updateOne({ n_uuid }, { n_read: true });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Notification marked as read.",
    });
  } catch (err) {
    return commonHelper.errorHandler(res, {
      status: false,
      code: "NOTI-R9999",
      message: "Internal error.",
    });
  }
};

// ----------------------------------------
// 👉 UPDATE NOTIFICATION SETTINGS
// ----------------------------------------
notificationObj.updateSettings = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const prefs = req.body.prefs;

    if (!prefs) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "NOTI-S1001", message: "prefs required." },
        200
      );
    }

    await NotificationSettingsModel.findOneAndUpdate(
      { ns_fk_uc_uuid: userId },
      { ...prefs },
      { upsert: true }
    );

    return commonHelper.successHandler(res, {
      status: true,
      message: "Settings updated.",
    });
  } catch (err) {
    return commonHelper.errorHandler(res, {
      status: false,
      code: "NOTI-S9999",
      message: "Internal error.",
    });
  }
};

// ----------------------------------------
// 👉 GET SETTINGS
// ----------------------------------------
notificationObj.getSettings = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);

    const prefs = await NotificationSettingsModel.findOne({
      ns_fk_uc_uuid: userId,
    });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Settings loaded.",
      payload: prefs,
    });
  } catch (err) {
    return commonHelper.errorHandler(res, {
      status: false,
      code: "NOTI-G9999",
      message: "Internal error.",
    });
  }
};

export default notificationObj;
