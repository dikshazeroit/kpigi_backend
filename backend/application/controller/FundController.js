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
import CategoryModel from "../model/CategoryModel.js";
import KycModel from "../model/KycModel.js";

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
 * 🧑‍💻 Author       : Sangeeta Kumari <sangeeta.zeroit@gmail.com>
 * 📅 Created On    : Dec 2025
 * 📝 Description   : Fund media document middleware + create fund request
 * ================================================================================
 */

import { v4 } from "uuid";
import FundModel from "../models/FundModel.js";
import CategoryModel from "../models/CategoryModel.js";
import UserDevice from "../models/UserDeviceModel.js";
import NotificationModel from "../models/NotificationModel.js";
import appHelper from "../helpers/appHelper.js";
import commonHelper from "../helpers/commonHelper.js";
import newModelObj from "../helpers/newModelObj.js"; // notifications sending

fundObj.createFundRequest = async function (req, res) {
  try {
    // 🔐 Auth check
    const userId = await appHelper.getUUIDByToken(req);
    if (!userId) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-E1001",
          message: "Unauthorized access.",
        },
        200
      );
    }

    // 📥 Request body
    const { title, purpose, category, amount, deadline, story } = req.body;

    if (!title || !purpose || !category || !amount || !deadline || !story) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-E1002",
          message: "Missing required fields.",
        },
        200
      );
    }

    // ✅ Validate category (UUID based)
    const categoryData = await CategoryModel.findOne({
      c_uuid: category,
      c_status: "ACTIVE",
      c_is_deleted: false,
    });

    if (!categoryData) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-E1003",
          message: "Invalid category selected.",
        },
        200
      );
    }

    // 📸 Upload media
    const uploadedImages = [];
    let uploadedVideo = null;

    if (req.files?.media?.length > 0) {
      for (const file of req.files.media) {
        const fileName = `fund-${Date.now()}-${file.originalname}`.replace(/ /g, "_");

        await commonHelper.uploadFile({
          fileName,
          chunks: [file.buffer],
          encoding: file.encoding,
          contentType: file.mimetype,
          uploadFolder: process.env.AWS_USER_FILE_FOLDER,
        });

        if (file.mimetype.startsWith("image/")) {
          if (uploadedImages.length < 5) uploadedImages.push(fileName);
        }

        if (file.mimetype.startsWith("video/")) {
          uploadedVideo = fileName; // only 1 video allowed
        }
      }
    }

    // fill empty image slots
    while (uploadedImages.length < 5) uploadedImages.push(null);

    // 🆕 Create fund
    const uuid = v4();
    const newFund = new FundModel({
      f_uuid: uuid,
      f_fk_uc_uuid: userId,
      f_title: title,
      f_purpose: purpose,
      f_category_id: category, // CATEGORY UUID STORED
      f_amount: Number(amount),
      f_deadline: new Date(deadline),
      f_story: story,
      f_media_one: uploadedImages[0],
      f_media_two: uploadedImages[1],
      f_media_three: uploadedImages[2],
      f_media_four: uploadedImages[3],
      f_media_five: uploadedImages[4],
      f_media_six: uploadedVideo, // VIDEO stored here
    });

    await newFund.save();

    // 🔔 Notification
    try {
      const deviceRecords = await UserDevice.find({
        ud_fk_uc_uuid: userId,
        ud_device_fcmToken: { $exists: true, $ne: "" },
      }).select("ud_device_fcmToken");

      const tokens = deviceRecords
        .map((d) => d.ud_device_fcmToken)
        .filter(Boolean);

      const notiTitle = "Fundraiser is Live 🎉";
      const notiBody = `Great news! Your fundraiser "${title}" is live. Share it with others and start receiving support.`;

      await NotificationModel.create({
        n_uuid: v4(),
        n_fk_uc_uuid: userId,
        n_title: notiTitle,
        n_body: notiBody,
        n_payload: {
          fund_uuid: uuid,
          type: "fund_created",
        },
      });

      if (tokens.length > 0) {
        await newModelObj.sendNotificationToUser({
          userId,
          title: notiTitle,
          body: notiBody,
          data: {
            fund_uuid: uuid,
            type: "fund_created",
          },
          tokens,
        });
      }
    } catch (sendErr) {
      console.error("⚠️ Notification send failed:", sendErr);
    }

    // ✅ SUCCESS RESPONSE
    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund request created successfully.",
      payload: {
        fund_uuid: uuid,
        title,
        category: categoryData.c_name,
        category_id: category,
        images: uploadedImages.filter(Boolean),
        video: uploadedVideo,
      },
    });
  } catch (error) {
    console.error("❌ createFundRequest Error:", error);
    return commonHelper.errorHandler(
      res,
      {
        status: false,
        code: "FUND-E9999",
        message: "Internal server error.",
      },
      200
    );
  }
};

// fundObj.createFundRequest = async function (req, res) {
//   try {
//     // 🔐 Auth check
//     const userId = await appHelper.getUUIDByToken(req);
//     if (!userId) {
//       return commonHelper.errorHandler(
//         res,
//         {
//           status: false,
//           code: "FUND-E1001",
//           message: "Unauthorized access.",
//         },
//         200
//       );
//     }

//     // 📥 Request body
//     const { title, purpose, category, amount, deadline, story } = req.body;

//     if (!title || !purpose || !category || !amount || !deadline || !story) {
//       return commonHelper.errorHandler(
//         res,
//         {
//           status: false,
//           code: "FUND-E1002",
//           message: "Missing required fields.",
//         },
//         200
//       );
//     }

//     // ✅ Validate category (UUID based)
//     const categoryData = await CategoryModel.findOne({
//       c_uuid: category,
//       c_status: "ACTIVE",
//       c_is_deleted: false,
//     });

//     if (!categoryData) {
//       return commonHelper.errorHandler(
//         res,
//         {
//           status: false,
//           code: "FUND-E1003",
//           message: "Invalid category selected.",
//         },
//         200
//       );
//     }

//     // 📸 Upload media (max 5)
//     const uploadedMedia = [];

//     if (req.files?.media?.length > 0) {
//       for (let i = 0; i < 5; i++) {
//         const file = req.files.media[i];
//         if (file) {
//           const fileName = `fund-${Date.now()}-${file.originalname}`.replace(
//             / /g,
//             "_"
//           );

//           await commonHelper.uploadFile({
//             fileName,
//             chunks: [file.buffer],
//             encoding: file.encoding,
//             contentType: file.mimetype,
//             uploadFolder: process.env.AWS_USER_FILE_FOLDER,
//           });

//           uploadedMedia.push(fileName);
//         } else {
//           uploadedMedia.push(null);
//         }
//       }
//     } else {
//       uploadedMedia.push(null, null, null, null, null);
//     }

//     // 🆕 Create fund
//     const uuid = v4();

//     const newFund = new FundModel({
//       f_uuid: uuid,
//       f_fk_uc_uuid: userId,
//       f_title: title,
//       f_purpose: purpose,
//       f_category_id: category, // ✅ CATEGORY UUID STORED
//       f_amount: Number(amount),
//       f_deadline: new Date(deadline),
//       f_story: story,
//       f_media_one: uploadedMedia[0],
//       f_media_two: uploadedMedia[1],
//       f_media_three: uploadedMedia[2],
//       f_media_four: uploadedMedia[3],
//       f_media_five: uploadedMedia[4],
//     });

//     await newFund.save();

//     // 🔔 Notification
//     try {
//       const deviceRecords = await UserDevice.find({
//         ud_fk_uc_uuid: userId,
//         ud_device_fcmToken: { $exists: true, $ne: "" },
//       }).select("ud_device_fcmToken");

//       const tokens = deviceRecords
//         .map((d) => d.ud_device_fcmToken)
//         .filter(Boolean);

//       const notiTitle = "Fundraiser is Live 🎉";
//       const notiBody = `Great news! Your fundraiser "${title}" is live. Share it with others and start receiving support.`;

//       await NotificationModel.create({
//         n_uuid: v4(),
//         n_fk_uc_uuid: userId,
//         n_title: notiTitle,
//         n_body: notiBody,
//         n_payload: {
//           fund_uuid: uuid,
//           type: "fund_created",
//         },
//       });

//       if (tokens.length > 0) {
//         await newModelObj.sendNotificationToUser({
//           userId,
//           title: notiTitle,
//           body: notiBody,
//           data: {
//             fund_uuid: uuid,
//             type: "fund_created",
//           },
//           tokens,
//         });
//       }
//     } catch (sendErr) {
//       console.error("⚠️ Notification send failed:", sendErr);
//     }

//     // ✅ SUCCESS RESPONSE (CATEGORY NAME RETURNED)
//     return commonHelper.successHandler(res, {
//       status: true,
//       message: "Fund request created successfully.",
//       payload: {
//         fund_uuid: uuid,
//         title,
//         category: categoryData.c_name, // ✅ CATEGORY NAME
//         category_id: category,          // (optional, good for frontend)
//         amount,
//         media: uploadedMedia,
//       },
//     });
//   } catch (error) {
//     console.error("❌ createFundRequest Error:", error);
//     return commonHelper.errorHandler(
//       res,
//       {
//         status: false,
//         code: "FUND-E9999",
//         message: "Internal server error.",
//       },
//       200
//     );
//   }
// };


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
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-L1001",
          message: "Unauthorized access.",
        },
        200
      );
    }

    const today = new Date();

    // 🔹 Get active funds
    const funds = await FundModel.find({
      f_deadline: { $gte: today },
      f_status: "ACTIVE",
    })
      .sort({ createdAt: -1 })
      .lean();

    // 🔹 Collect unique category IDs
    const categoryIds = [
      ...new Set(
        funds
          .map((f) => f.f_category_id)
          .filter((id) => id)
      ),
    ];

    // 🔹 Fetch categories
    const categories = await CategoryModel.find(
      {
        c_uuid: { $in: categoryIds },
        c_is_deleted: false,
      },
      {
        c_uuid: 1,
        c_name: 1,
        _id: 0,
      }
    ).lean();

    // 🔹 Create category map (JS way)
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.c_uuid] = cat.c_name;
    });

    // 🔹 Add donation + category name
    for (const fund of funds) {
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
            donors: { $addToSet: "$d_fk_uc_uuid" },
          },
        },
      ]);

      const raisedAmount =
        donationAgg.length > 0 ? donationAgg[0].totalRaised : 0;

      const donorCount =
        donationAgg.length > 0 ? donationAgg[0].donors.length : 0;

      const goalAmount = fund.f_amount || 0;

      fund.f_category_name = categoryMap[fund.f_category_id] || ""; // ✅ category name
      fund.raised_amount = raisedAmount;
      fund.goal_amount = goalAmount;
      fund.donor_count = donorCount;
      fund.progress_percent =
        goalAmount > 0 ? Math.round((raisedAmount / goalAmount) * 100) : 0;
      fund.progress_text = `$${raisedAmount} raised of $${goalAmount} goal`;
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "Active fund list fetched successfully.",
      payload: funds,
    });
  } catch (error) {
    console.error("❌ getFundList Error:", error);
    return commonHelper.errorHandler(
      res,
      {
        status: false,
        code: "FUND-L9999",
        message: "Internal server error.",
      },
      200
    );
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
        {
          status: false,
          code: "FUND-D1001",
          message: "Unauthorized access.",
        },
        200
      );
    }

    if (!f_uuid) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-D1000",
          message: "Fund UUID is required.",
        },
        200
      );
    }

    // 1️⃣ Fund fetch
    const fund = await FundModel.findOne({ f_uuid }).lean();
    if (!fund) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-D1002",
          message: "Fund not found.",
        },
        200
      );
    }

    // 2️⃣ Category fetch
    let categoryName = "";
    if (fund.f_category_id) {
      const category = await CategoryModel.findOne(
        { c_uuid: fund.f_category_id, c_is_deleted: false },
        { c_name: 1 }
      ).lean();

      categoryName = category ? category.c_name : "";
    }

    // 3️⃣ Creator fetch
    const creator = await UsersCredentialsModel.findOne(
      { uc_uuid: fund.f_fk_uc_uuid },
      {
        uc_full_name: 1,
        uc_email: 1,
        uc_phone: 1,
        uc_country_name: 1,
        uc_profile_photo: 1,
        uc_bio: 1,
        _id: 0,
      }
    ).lean();

    // 4️⃣ Creator KYC fetch (IMPORTANT)
    const creatorKyc = await KycModel.findOne(
      { k_fk_uc_uuid: fund.f_fk_uc_uuid },
      { status: 1, _id: 0 }
    ).lean();

    // 5️⃣ Merge response (FLAT)
    const responsePayload = {
      ...fund,

      // ✅ Category
      category_name: categoryName,
      category_id: fund.f_category_id,

      // ✅ Creator info
      creator_name: creator?.uc_full_name || "",
      creator_email: creator?.uc_email || "",
      creator_phone: creator?.uc_phone || "",
      creator_country_name: creator?.uc_country_name || "",
      creator_profile_photo: creator?.uc_profile_photo || "",
      creator_bio: creator?.uc_bio || "",

      // ✅ Creator KYC status
      creator_kyc_status: creatorKyc?.status || "NOT_STARTED",
    };

    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund details fetched.",
      payload: responsePayload,
    });

  } catch (error) {
    console.error("❌ getFundDetails Error:", error);

    return commonHelper.errorHandler(
      res,
      {
        status: false,
        code: "FUND-D9999",
        message: "Internal server error.",
      },
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
    // 🔐 Auth
    const userId = await appHelper.getUUIDByToken(req);
    const { f_uuid } = req.body;

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-U1001",
          message: "Unauthorized access.",
        },
        200
      );
    }

    if (!f_uuid) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-U1000",
          message: "Fund UUID is required.",
        },
        200
      );
    }

    // 🔍 Find fund
    const fund = await FundModel.findOne({
      f_uuid,
      f_fk_uc_uuid: userId,
    });

    if (!fund) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-U1002",
          message: "Fund not found.",
        },
        200
      );
    }

    const {
      title,
      purpose,
      category, // 👈 category UUID
      amount,
      deadline,
      story,
    } = req.body;

    // 🗂️ CATEGORY UPDATE + VALIDATION
    let categoryName = null;

    if (category !== undefined) {
      const categoryData = await CategoryModel.findOne({
        c_uuid: category,
        c_status: "ACTIVE",
        c_is_deleted: false,
      });

      if (!categoryData) {
        return commonHelper.errorHandler(
          res,
          {
            status: false,
            code: "FUND-U1003",
            message: "Invalid category selected.",
          },
          200
        );
      }

      fund.f_category_id = category; // ✅ store UUID
      categoryName = categoryData.c_name;
    }

    // ✏️ Other fields
    if (title !== undefined) fund.f_title = title;
    if (purpose !== undefined) fund.f_purpose = purpose;
    if (amount !== undefined) fund.f_amount = Number(amount);
    if (deadline !== undefined) fund.f_deadline = new Date(deadline);
    if (story !== undefined) fund.f_story = story;

    // 📸 Media update (1–5)
    if (req.files?.media?.length > 0) {
      for (let i = 0; i < 5; i++) {
        const file = req.files.media[i];
        if (file) {
          const fileName = `fund-${Date.now()}-${file.originalname}`.replace(
            / /g,
            "_"
          );

          await commonHelper.uploadFile({
            fileName,
            chunks: [file.buffer],
            encoding: file.encoding,
            contentType: file.mimetype,
            uploadFolder: process.env.AWS_USER_FILE_FOLDER,
          });

          fund[`f_media_${i + 1}`] = fileName;
        }
      }
    }

    await fund.save();

    // 🔁 Fetch category name if not updated
    if (!categoryName && fund.f_category_id) {
      const cat = await CategoryModel.findOne(
        { c_uuid: fund.f_category_id },
        { c_name: 1 }
      );
      categoryName = cat ? cat.c_name : "";
    }

    // ✅ SUCCESS RESPONSE
    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund updated successfully.",
      payload: {
        fund_uuid: fund.f_uuid,
        title: fund.f_title,
        purpose: fund.f_purpose,
        category: categoryName,          // ✅ category name
        category_id: fund.f_category_id, // ✅ category UUID
        amount: fund.f_amount,
        deadline: fund.f_deadline,
        story: fund.f_story,
        media: [
          fund.f_media_one,
          fund.f_media_two,
          fund.f_media_three,
          fund.f_media_four,
          fund.f_media_five,
        ],
      },
    });
  } catch (error) {
    console.error("❌ updateFund Error:", error);
    return commonHelper.errorHandler(
      res,
      {
        status: false,
        code: "FUND-U9999",
        message: "Internal server error.",
      },
      200
    );
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
      return commonHelper.errorHandler(
        res,
        { status: false, code: "FUND-X1001", message: "Unauthorized access." },
        200
      );
    }

    const deleted = await FundModel.findOneAndDelete({
      f_uuid,
      f_fk_uc_uuid: userId,
    });
    if (!deleted) {
      return commonHelper.errorHandler(
        res,
        { status: false, code: "FUND-X1002", message: "Fund not found." },
        200
      );
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund deleted successfully.",
      payload: { f_uuid },
    });
  } catch (error) {
    console.error("❌ deleteFund Error:", error);
    return commonHelper.errorHandler(
      res,
      { status: false, code: "FUND-X9999", message: "Internal server error." },
      200
    );
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


fundObj.getMyFundList = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-L1001",
          message: "Unauthorized access.",
        },
        200
      );
    }

    // 🔹 Fetch user's funds
    const funds = await FundModel.find({
      f_fk_uc_uuid: userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    // 🔹 Collect unique category IDs
    const categoryIds = [
      ...new Set(
        funds
          .map((f) => f.f_category_id)
          .filter((id) => id)
      ),
    ];

    // 🔹 Fetch category names
    const categories = await CategoryModel.find(
      {
        c_uuid: { $in: categoryIds },
        c_is_deleted: false,
      },
      {
        c_uuid: 1,
        c_name: 1,
        _id: 0,
      }
    ).lean();

    // 🔹 Create category map
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.c_uuid] = cat.c_name;
    });

    // 🔹 Add raised amount + donor count + category name
    for (const fund of funds) {
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
            donors: { $addToSet: "$d_fk_uc_uuid" },
          },
        },
      ]);

      const raisedAmount =
        donationAgg.length > 0 ? donationAgg[0].totalRaised : 0;

      const donorCount =
        donationAgg.length > 0 ? donationAgg[0].donors.length : 0;

      const goalAmount = fund.f_amount || 0;

      fund.f_category_name = categoryMap[fund.f_category_id] || ""; // ✅ category name
      fund.raised_amount = raisedAmount;
      fund.goal_amount = goalAmount;
      fund.donor_count = donorCount;
      fund.progress_percent =
        goalAmount > 0 ? Math.round((raisedAmount / goalAmount) * 100) : 0;
      fund.progress_text = `$${raisedAmount} raised of $${goalAmount} goal`;
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "My fund list fetched successfully.",
      payload: funds,
    });
  } catch (error) {
    console.error("❌ getMyFundList Error:", error);
    return commonHelper.errorHandler(
      res,
      {
        status: false,
        code: "FUND-L9999",
        message: "Internal server error.",
      },
      200
    );
  }
};

export default fundObj;
