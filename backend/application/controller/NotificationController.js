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
/**
 * UPDATE NOTIFICATION SETTINGS
 *
 * @param {object}
 * @param {object} 
 */

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


/**
 * GET SETTINGS user
 *
 * @param {object}
 * @param {object} 
 */
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

/**
 * Clear all notification
 *
 * @param {object}
 * @param {object} 
 */
notificationObj.clear = async (req, res) => {
  try {
    const userId = await appHelper.getUUIDByToken(req);

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "NOTIFY-E401", message: "Unauthorized access." },
        200
      );
    }

    // Delete all notifications for the user
    const result = await NotificationModel.deleteMany({
      n_fk_uc_uuid: userId,
    });

    return commonHelper.successHandler(res, {
      status: true,
      message: "All notifications cleared.",
      payload: { deleted: result.deletedCount },
    });
  } catch (err) {
    console.error("❌ clear Error:", err);
    return commonHelper.errorHandler(
      res,
      { status: false, code: "NOTIFY-E500", message: "Internal server error." },
      200
    );
  }
};

/**
 *Mark all as read notification
 *
 * @param {object}
 * @param {object} 
 */
notificationObj.markAllAsRead = async (req, res) => {
  try {
    const userId = await appHelper.getUUIDByToken(req);

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "NOTIFY-E401", message: "Unauthorized access." },
        200
      );
    }

    // Mark all notifications as read
    await NotificationModel.updateMany(
      { n_fk_uc_uuid: userId, n_read: false },
      { $set: { n_read: true } }
    );

    // Updated unread count
    const unreadCount = await NotificationModel.countDocuments({
      n_fk_uc_uuid: userId,
      n_read: false,
    });

    return commonHelper.successHandler(res, {
      status: true,
      message: "All notifications marked as read.",
      payload: { unreadCount },
    });
  } catch (err) {
    console.error("❌ markAllAsRead Error:", err);
    return commonHelper.errorHandler(
      res,
      { status: false, code: "NOTIFY-E500", message: "Internal server error." },
      200
    );
  }
};

/**
 * Single delete notification
 *
 * @param {object}
 * @param {object} 
 */
notificationObj.singleDelete = async (req, res) => {
  try {
    const userId = await appHelper.getUUIDByToken(req);

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "NOTIFY-E401", message: "Unauthorized access." },
        200
      );
    }

    const { notificationId } = req.body;

    if (!notificationId) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "NOTIFY-E400", message: "Notification ID is required." },
        200
      );
    }

    // Delete only if notification belongs to the user
    const result = await NotificationModel.deleteOne({
      n_uuid: notificationId,
      n_fk_uc_uuid: userId,
    });

    if (result.deletedCount === 0) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "NOTIFY-E404",
          message: "Notification not found or unauthorized.",
        },
        200
      );
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "Notification deleted successfully.",
      payload: { deleted: result.deletedCount },
    });
  } catch (err) {
    console.error("❌ singleDelete Error:", err);
    return commonHelper.errorHandler(
      res,
      { status: false, code: "NOTIFY-E500", message: "Internal server error." },
      200
    );
  }
};


export default notificationObj;
