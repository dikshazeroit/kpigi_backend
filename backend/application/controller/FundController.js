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
 * 📝 Description   : Fund management
 * ✏️ Modified By   :
 * ================================================================================
 */
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { v4 } from "uuid";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";
import constants from "../../config/Constants.js";
import FundModel from "../model/FundModel.js";

let fundObj = {};


/**
 * Create fund 
 *
 * @param {object}
 * @param {object} 
 */

fundObj.createFundRequest = async function (req, res) {
  try {
    // 1️⃣ Get user ID
    const userId = await appHelper.getUUIDByToken(req);
    if (!userId) {
      return commonHelper.errorHandler(res, { status: false, code: "FUND-E1001", message: "Unauthorized access." }, 200);
    }

    const { title, purpose, category, amount, deadline, story } = req.body;

    // 2️⃣ Validate required fields
    if (!title || !purpose || !category || !amount || !deadline || !story) {
      return commonHelper.errorHandler(res, { status: false, code: "FUND-E1002", message: "Missing required fields." }, 200);
    }

    // 3️⃣ Handle media files (up to 5)
    const uploadedMedia = [];
    if (req.files?.media?.length > 0) {
      for (let i = 0; i < 5; i++) {
        const file = req.files.media[i];
        if (file) {
          const ext = path.extname(file.originalname).toLowerCase();
          const fileName = `fund-${Date.now()}-${file.originalname}`.replace(/ /g, "_");

          // Upload to S3
          await commonHelper.uploadFile({
            fileName,
            chunks: [file.buffer],
            encoding: file.encoding,
            contentType: file.mimetype,
            uploadFolder: constants.AWS_USER_FILE_FOLDER,
          });

          uploadedMedia.push(fileName);
        } else {
          uploadedMedia.push(null); // fill missing media as null
        }
      }
    } else {
      // if no media uploaded
      uploadedMedia.push(null, null, null, null, null);
    }

    // 4️⃣ Save to DB
    const uuid = v4();
    const newFund = new FundModel({
      f_uuid: uuid,
      f_fk_uc_uuid: userId,
      f_title: title,
      f_purpose: purpose,
      f_category: category,
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

    // 5️⃣ Success response
    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund request created successfully.",
      payload: {
        fund_uuid: uuid,
        title,
        category,
        amount,
        media: uploadedMedia,
      },
    });

  } catch (error) {
    console.error("❌ createFundRequest Error:", error);
    return commonHelper.errorHandler(res, { status: false, code: "FUND-E9999", message: "Internal server error." }, 200);
  }
};




/**
 * Get fund list 
 *
 * @param {object}
 * @param {object} 
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

    const funds = await FundModel.find({ f_fk_uc_uuid: userId }).sort({ createdAt: -1 });

    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund list fetched successfully.",
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
 * Get fund details 
 *
 * @param {object}
 * @param {object} 
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

    const fund = await FundModel.findOne({
      f_uuid: f_uuid,
      f_fk_uc_uuid: userId,
    });

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

    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund details fetched.",
      payload: fund,
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
 * Update fund 
 *
 * @param {object}
 * @param {object} 
 */


fundObj.updateFund = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const { f_uuid } = req.body;

    if (!userId) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "FUND-U1001",
        message: "Unauthorized access.",
      }, 200);
    }

    const fund = await FundModel.findOne({
      f_uuid: f_uuid,
      f_fk_uc_uuid: userId,
    });

    if (!fund) {
      return commonHelper.errorHandler(res, {
        status: false,
        code: "FUND-U1002",
        message: "Fund not found.",
      }, 200);
    }

    // 1️⃣ Update only fields provided in req.body
    const updatableFields = ["title", "purpose", "category", "amount", "deadline", "story"];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "deadline") {
          fund.f_deadline = new Date(req.body[field]);
        } else if (field === "amount") {
          fund.f_amount = Number(req.body[field]);
        } else {
          fund[`f_${field}`] = req.body[field];
        }
      }
    });

    // 2️⃣ Handle media uploads (up to 5 slots)
    if (req.files?.media?.length > 0) {
      for (let i = 0; i < 5; i++) {
        const file = req.files.media[i];
        if (file) {
          const ext = path.extname(file.originalname).toLowerCase();
          const fileName = `fund-${Date.now()}-${file.originalname}`.replace(/ /g, "_");

          // Upload to S3
          await commonHelper.uploadFile({
            fileName,
            chunks: [file.buffer],
            encoding: file.encoding,
            contentType: file.mimetype,
            uploadFolder: constants.AWS_FUND_FILE_FOLDER,
          });

          // Update the corresponding slot
          fund[`f_media_${i + 1}`] = fileName;
        }
      }
    }

    await fund.save();

    return commonHelper.successHandler(res, {
      status: true,
      message: "Fund updated successfully.",
      payload: fund,
    });

  } catch (error) {
    console.error("❌ updateFund Error:", error);
    return commonHelper.errorHandler(res, {
      status: false,
      code: "FUND-U9999",
      message: "Internal server error.",
    }, 200);
  }
};

/**
 * Delete fund 
 *
 * @param {object}
 * @param {object} 
 */

fundObj.deleteFund = async function (req, res) {
  try {
    const userId = await appHelper.getUUIDByToken(req);
    const { f_uuid } = req.body;

    if (!userId) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-X1001",
          message: "Unauthorized access.",
        },
        200
      );
    }

    const deleted = await FundModel.findOneAndDelete({
      f_uuid: f_uuid,
      f_fk_uc_uuid: userId,
    });

    if (!deleted) {
      return commonHelper.errorHandler(
        res,
        {
          status: false,
          code: "FUND-X1002",
          message: "Fund not found.",
        },
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
      {
        status: false,
        code: "FUND-X9999",
        message: "Internal server error.",
      },
      200
    );
  }
};


export default fundObj;