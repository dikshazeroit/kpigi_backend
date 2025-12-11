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
 * 📝 Description   : Notification management module (send, fetch, mark read, delete, settings)
 * ✏️ Modified By   :
 * ================================================================================
 */

import { v4 } from "uuid";
import NotificationModel from "../model/NotificationModel.js";
import NotificationSettingsModel from "../model/NotificationSettingsModel.js";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";

let notificationObj = {};

/**
 * Send a notification to a user.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
notificationObj.sendNotification = async function (req, res) {
  try {
    const { userUuid, title, body, payload } = req.body;

    if (!userUuid || !title || !body) {
      return commonHelper.errorHandler(res, { status: false, code: "NOTI-E1001", message: "Missing notification fields." }, 200);
    }

    const uuid = v4();

    await NotificationModel.create({
      n_uuid: uuid,
      n_fk_uc_uuid: userUuid,
      n_title: title,
      n_body: body,
      n_payload: payload || {},
    });

    // Optional: send push notification via FCM
    // await appHelper.sendNotification({ userUuid, title, body });

    return commonHelper.successHandler(res, { status: true, message: "Notification sent.", payload: { n_uuid: uuid } });
  } catch (err) {
    console.error("❌ sendNotification Error:", err);
    return commonHelper.errorHandler(res, { status: false, code: "NOTI-E9999", message: "Internal error." }, 200);
  }
};

/**
 * Get paginated notification list (inbox) for a user.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
notificationObj.getInbox = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const { page = 1, limit = 20 } = req.body;

    const list = await NotificationModel.find({ n_fk_uc_uuid: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return commonHelper.successHandler(res, { status: true, message: "Notification inbox loaded.", payload: list });
  } catch (err) {
    console.error("❌ getInbox Error:", err);
    return commonHelper.errorHandler(res, { status: false, code: "NOTI-L9999", message: "Internal server error." });
  }
};

/**
 * Mark a single notification as read.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
notificationObj.markAsRead = async function (req, res) {
  try {
    const { n_uuid } = req.body;
    if (!n_uuid) return commonHelper.errorHandler(res, { status: false, code: "NOTI-R1001", message: "n_uuid required." }, 200);

    await NotificationModel.updateOne({ n_uuid }, { n_read: true });
    return commonHelper.successHandler(res, { status: true, message: "Notification marked as read." });
  } catch (err) {
    console.error("❌ markAsRead Error:", err);
    return commonHelper.errorHandler(res, { status: false, code: "NOTI-R9999", message: "Internal error." });
  }
};

/**
 * Update user notification settings.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
notificationObj.updateSettings = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const prefs = req.body.prefs;

    if (!prefs) return commonHelper.errorHandler(res, { status: false, code: "NOTI-S1001", message: "prefs required." }, 200);

    await NotificationSettingsModel.findOneAndUpdate({ ns_fk_uc_uuid: userId }, { ...prefs }, { upsert: true });
    return commonHelper.successHandler(res, { status: true, message: "Settings updated." });
  } catch (err) {
    console.error("❌ updateSettings Error:", err);
    return commonHelper.errorHandler(res, { status: false, code: "NOTI-S9999", message: "Internal error." });
  }
};

/**
 * Get user notification settings.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
notificationObj.getSettings = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const prefs = await NotificationSettingsModel.findOne({ ns_fk_uc_uuid: userId });

    return commonHelper.successHandler(res, { status: true, message: "Settings loaded.", payload: prefs });
  } catch (err) {
    console.error("❌ getSettings Error:", err);
    return commonHelper.errorHandler(res, { status: false, code: "NOTI-G9999", message: "Internal error." });
  }
};

/**
 * Clear all notifications for a user.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
notificationObj.clear = async (req, res) => {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    if (!userId) return commonHelper.errorHandler(res, { status: false, code: "NOTIFY-E401", message: "Unauthorized access." }, 200);

    const result = await NotificationModel.deleteMany({ n_fk_uc_uuid: userId });
    return commonHelper.successHandler(res, { status: true, message: "All notifications cleared.", payload: { deleted: result.deletedCount } });
  } catch (err) {
    console.error("❌ clear Error:", err);
    return commonHelper.errorHandler(res, { status: false, code: "NOTIFY-E500", message: "Internal server error." }, 200);
  }
};

/**
 * Mark all notifications as read for a user.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
notificationObj.markAllAsRead = async (req, res) => {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    if (!userId) return commonHelper.errorHandler(res, { status: false, code: "NOTIFY-E401", message: "Unauthorized access." }, 200);

    await NotificationModel.updateMany({ n_fk_uc_uuid: userId, n_read: false }, { $set: { n_read: true } });
    const unreadCount = await NotificationModel.countDocuments({ n_fk_uc_uuid: userId, n_read: false });

    return commonHelper.successHandler(res, { status: true, message: "All notifications marked as read.", payload: { unreadCount } });
  } catch (err) {
    console.error("❌ markAllAsRead Error:", err);
    return commonHelper.errorHandler(res, { status: false, code: "NOTIFY-E500", message: "Internal server error." }, 200);
  }
};

/**
 * Delete a single notification.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
notificationObj.singleDelete = async (req, res) => {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    if (!userId) return commonHelper.errorHandler(res, { status: false, code: "NOTIFY-E401", message: "Unauthorized access." }, 200);

    const { notificationId } = req.body;
    if (!notificationId) return commonHelper.errorHandler(res, { status: false, code: "NOTIFY-E400", message: "Notification ID is required." }, 200);

    const result = await NotificationModel.deleteOne({ n_uuid: notificationId, n_fk_uc_uuid: userId });
    if (result.deletedCount === 0) return commonHelper.errorHandler(res, { status: false, code: "NOTIFY-E404", message: "Notification not found or unauthorized." }, 200);

    return commonHelper.successHandler(res, { status: true, message: "Notification deleted successfully.", payload: { deleted: result.deletedCount } });
  } catch (err) {
    console.error("❌ singleDelete Error:", err);
    return commonHelper.errorHandler(res, { status: false, code: "NOTIFY-E500", message: "Internal server error." }, 200);
  }
};

export default notificationObj;
