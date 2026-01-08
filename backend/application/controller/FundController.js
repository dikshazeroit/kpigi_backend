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
 * 🧑‍💻 Written By  : Sangeeta  <sangeeta.zeroit@gmail.com>
 * 📅 Created On    : Dec 2025
 * 📝 Description   : Fund management module with create, update, delete, and retrieval operations.
 * ✏️ Modified By   :
 * ================================================================================
 */

import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { v4 } from "uuid";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";
import FundModel from "../model/FundModel.js";
import UsersCredentialsModel from "../model/UserModel.js";
import UserDevice from "../model/UserDeviceModel.js";
import NotificationModel from "../model/NotificationModel.js";
import newModelObj from "../model/CommonModel.js";
import DonationModel from "../model/DonationModel.js";

let fundObj = {};

/**
 * Create a new fund request.
 *
 * Validates required fields, handles media uploads, saves the fund to the database,
 * and sends a notification to the user upon successful creation.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
fundObj.createFundRequest = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    if (!userId) {
      return commonHelper.errorHandler(res, { status: false, code: "FUND-E1001", message: "Unauthorized access." }, 200);
    }

    const { title, purpose, category, amount, deadline, story } = req.body;

    if (!title || !purpose || !category || !amount || !deadline || !story) {
      return commonHelper.errorHandler(res, { status: false, code: "FUND-E1002", message: "Missing required fields." }, 200);
    }

    const uploadedMedia = [];
    if (req.files?.media?.length > 0) {
      for (let i = 0; i < 5; i++) {
        const file = req.files.media[i];
        if (file) {
          const fileName = `fund-${Date.now()}-${file.originalname}`.replace(/ /g, "_");
          await commonHelper.uploadFile({
            fileName,
            chunks: [file.buffer],
            encoding: file.encoding,
            contentType: file.mimetype,
            uploadFolder: process.env.AWS_USER_FILE_FOLDER,
          });
          uploadedMedia.push(fileName);
        } else {
          uploadedMedia.push(null);
        }
      }
    } else {
      uploadedMedia.push(null, null, null, null, null);
    }

    const uuid = v4();
    const newFund = new FundModel({
      f_uuid: uuid,
      f_fk_uc_uuid: userId,
      f_title: title,
      f_purpose: purpose,
      f_category_name: category,
      f_amount: Number(amount),
      f_deadline: new Date(deadline),
      f_story: story,
      f_media_one: uploadedMedia[0],
      f_media_two: uploadedMedia[1],
      f_media_three: uploadedMedia[2],
      f_media_four: uploadedMedia[3],
      f_media_five: uploadedMedia[4],
    });

    await newFund.save();

    // Send notification
    try {
      const deviceRecords = await UserDevice.find({ ud_fk_uc_uuid: userId, ud_device_fcmToken: { $exists: true, $ne: "" } }).select("ud_device_fcmToken");
      const tokens = deviceRecords.map(d => d.ud_device_fcmToken).filter(Boolean);

      const notiTitle = "Your fundraiser is live!";
      const notiBody = `Your fundraiser "${title}" has been successfully created. Start sharing to receive donations.`;

      await NotificationModel.create({
        n_uuid: v4(),
        n_fk_uc_uuid: userId,
        n_title: notiTitle,
        n_body: notiBody,
        n_payload: { fund_uuid: uuid, type: "fund_created" },
      });

      if (tokens.length > 0) {
        await newModelObj.sendNotificationToUser({ userId, title: notiTitle, body: notiBody, data: { fund_uuid: uuid, type: "fund_created" }, tokens });
      }
    } catch (sendErr) {
      console.error("⚠️ Notification send failed:", sendErr);
    }

    return commonHelper.successHandler(res, { status: true, message: "Fund request created successfully.", payload: { fund_uuid: uuid, title, category, amount, media: uploadedMedia } });
  } catch (error) {
    console.error("❌ createFundRequest Error:", error);
    return commonHelper.errorHandler(res, { status: false, code: "FUND-E9999", message: "Internal server error." }, 200);
  }
};

/**
 * Get list of funds for the current user.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */

fundObj.getFundList = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    if (!userId) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "FUND-L1001",
        message: "Unauthorized access.",
      }, 200);
    }

    const today = new Date();

    // 🔹 Get active funds
    const funds = await FundModel.find({
      f_deadline: { $gte: today },
    })
      .sort({ createdAt: -1 })
      .lean(); 

    // 🔹 Add raised amount info
    for (let fund of funds) {
      const donationAgg = await DonationModel.aggregate([
        {
          $match: {
            d_fk_f_uuid: fund.f_uuid,
            d_status: "SUCCESS",
          },
        },
        {
          $group: {
            _id: null,
            totalRaised: { $sum: "$d_amount" },
          },
        },
      ]);

      const raisedAmount =
        donationAgg.length > 0 ? donationAgg[0].totalRaised : 0;

      const goalAmount = fund.f_amount || 0;

      fund.raised_amount = raisedAmount;
      fund.goal_amount = goalAmount;
      fund.progress_percent =
        goalAmount > 0
          ? Math.round((raisedAmount / goalAmount) * 100)
          : 0;

      fund.progress_text = `$${raisedAmount} raised of $${goalAmount} goal`;
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "Active fund list fetched successfully.",
      payload: funds,
    });

  } catch (error) {
    console.error("❌ getFundList Error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "FUND-L9999",
      message: "Internal server error.",
    }, 200);
  }
};



/**
 * Get details of a specific fund.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
fundObj.getFundDetails = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const { f_uuid } = req.body;

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "FUND-D1001", message: "Unauthorized access." },
        200
      );
    }

    // 1️⃣ Fund fetch
    const fund = await FundModel.findOne({ f_uuid }).lean();
    if (!fund) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "FUND-D1002", message: "Fund not found." },
        200
      );
    }

    // 2️⃣ Creator fetch
    const creator = await UsersCredentialsModel.findOne(
      { uc_uuid: fund.f_fk_uc_uuid },
      {
        uc_full_name: 1,
        uc_email: 1,
        uc_phone: 1,
        uc_country_name: 1,
        uc_profile_photo: 1,
        uc_bio: 1,
        _id: 0
      }
    ).lean();

    // 3️⃣ Merge (FLAT)
    const responsePayload = {
      ...fund,
      creator_name: creator?.uc_full_name || "",
      creator_email: creator?.uc_email || "",
      creator_phone: creator?.uc_phone || "",
      creator_country_name: creator?.uc_country_name || "",
      creator_profile_photo: creator?.uc_profile_photo || "",
      creator_bio: creator?.uc_bio || ""
    };

    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund details fetched.",
      payload: responsePayload
    });

  } catch (error) {
    console.error("❌ getFundDetails Error:", error);
    return commonHelper.errorHandler(
      res,
      { status: false, code: "FUND-D9999", message: "Internal server error." },
      200
    );
  }
};


/**
 * Update a specific fund.
 *
 * Updates only provided fields and handles media uploads.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
fundObj.updateFund = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const { f_uuid } = req.body;

    if (!userId) {
      return commonHelper.errorHandler(res, { status: false, code: "FUND-U1001", message: "Unauthorized access." }, 200);
    }

    const fund = await FundModel.findOne({ f_uuid, f_fk_uc_uuid: userId });
    if (!fund) {
      return commonHelper.errorHandler(res, { status: false, code: "FUND-U1002", message: "Fund not found." }, 200);
    }

    const updatableFields = ["title", "purpose", "category", "amount", "deadline", "story"];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === "deadline") fund.f_deadline = new Date(req.body[field]);
        else if (field === "amount") fund.f_amount = Number(req.body[field]);
        else fund[`f_${field}`] = req.body[field];
      }
    });

    if (req.files?.media?.length > 0) {
      for (let i = 0; i < 5; i++) {
        const file = req.files.media[i];
        if (file) {
          const fileName = `fund-${Date.now()}-${file.originalname}`.replace(/ /g, "_");
          await commonHelper.uploadFile({ fileName, chunks: [file.buffer], encoding: file.encoding, contentType: file.mimetype, uploadFolder: process.env.AWS_USER_FILE_FOLDER });
          fund[`f_media_${i + 1}`] = fileName;
        }
      }
    }

    await fund.save();
    return commonHelper.successHandler(res, { status: true, message: "Fund updated successfully.", payload: fund });
  } catch (error) {
    console.error("❌ updateFund Error:", error);
    return commonHelper.errorHandler(res, { status: false, code: "FUND-U9999", message: "Internal server error." }, 200);
  }
};

/**
 * Delete a specific fund.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 * @developer Sangeeta
 */
fundObj.deleteFund = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const { f_uuid } = req.body;

    if (!userId) {
      return commonHelper.errorHandler(res, { status: false, code: "FUND-X1001", message: "Unauthorized access." }, 200);
    }

    const deleted = await FundModel.findOneAndDelete({ f_uuid, f_fk_uc_uuid: userId });
    if (!deleted) {
      return commonHelper.errorHandler(res, { status: false, code: "FUND-X1002", message: "Fund not found." }, 200);
    }

    return commonHelper.successHandler(res, { status: true, message: "Fund deleted successfully.", payload: { f_uuid } });
  } catch (error) {
    console.error("❌ deleteFund Error:", error);
    return commonHelper.errorHandler(res, { status: false, code: "FUND-X9999", message: "Internal server error." }, 200);
  }
};

export default fundObj;
