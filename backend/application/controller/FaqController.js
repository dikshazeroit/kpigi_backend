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
 * 📝 Description   : FAQ management module with list and detail retrieval operations.
 * ✏️ Modified By   :
 * ================================================================================
 */
import { v4 as uuidv4 } from "uuid";
import commonHelper from "../../utils/Helper.js";
import appHelper from "../helpers/Index.js";
import FaqModel from "../../admin/models/Faq.js";
import AppInfoModel from "../model/AppInfoModel.js";

let faqObj = {};

/**
 * ------------------------------------------------------------------------------
 * 📌 Get FAQ List
 * ------------------------------------------------------------------------------
 * @description  Fetch all active and non-deleted FAQs
 * @method       POST
 *
 * @returns {Object} response
 * @returns {Boolean} response.status   Success status
 * @returns {String} response.message  Response message
 * @returns {Array}  response.payload  List of FAQs
 * ------------------------------------------------------------------------------
 */
faqObj.getFaqList = async function (req, res) {
  try {
    const faqs = await FaqModel.find(
      {
        f_active: "1",
        f_deleted: "0"
      },
      {
        _id: 0,
        f_uuid: 1,
        f_question: 1
      }
    )
      .sort({ f_created_at: -1 })
      .lean();

    return commonHelper.successHandler(res, {
      status: true,
      message: "FAQ list fetched",
      payload: faqs
    });

  } catch (error) {
    console.error("❌ getFaqList Error:", error);
    return commonHelper.errorHandler(
      res,
      { status: false, message: "Internal server error" },
      200
    );
  }
};



/**
 * ------------------------------------------------------------------------------
 * 📌 Get FAQ Details
 * ------------------------------------------------------------------------------
 * @description  Fetch FAQ details by FAQ UUID
 * @method       POST
 *
 * @param {String} req.body.f_uuid  FAQ unique identifier
 *
 * @returns {Object} response
 * @returns {Boolean} response.status   Success status
 * @returns {String} response.message  Response message
 * @returns {Object} response.payload  FAQ details
 * ------------------------------------------------------------------------------
 */
faqObj.getFaqDetails = async function (req, res) {
  try {
    const { fId } = req.body;

    if (!fId) {
      return commonHelper.errorHandler(
        res,
        { status: false, message: "faq id is required" },
        200
      );
    }

    const faq = await FaqModel.findOne(
      {
        f_uuid:fId,
        f_active: "1",
        f_deleted: "0"
      },
      {
        _id: 0,
        f_uuid: 1,
        f_question: 1,
        f_answer: 1
      }
    ).lean();

    if (!faq) {
      return commonHelper.errorHandler(
        res,
        { status: false, message: "FAQ not found" },
        200
      );
    }

    return commonHelper.successHandler(res, {
      status: true,
      message: "FAQ details fetched",
      payload: faq
    });

  } catch (error) {
    console.error("❌ getFaqDetails Error:", error);
    return commonHelper.errorHandler(
      res,
      { status: false, message: "Internal server error" },
      200
    );
  }
};
/**
 * ================================================================================
 * 📌 API: Get Privacy Policies
 * 🔒 Authentication : Required (User must be logged in)
 * Developed by: Sangeeta
 * ================================================================================
 */

// Privacy Policy API
faqObj.getPrivacyPolicies = async function (req, res) {
  try {
    const appInfo = await AppInfoModel.findOne({}).sort({ created_at: -1 });

    if (!appInfo) {
      return commonHelper.errorHandler(res, {
        code: "PP-404",
        message: "Privacy policy not found",
      });
    }

    return commonHelper.successHandler(res, {
      message: "Privacy policy fetched successfully",
      payload: {
        _id: appInfo._id,
        ai_deleted: appInfo.ai_deleted,
        ai_privacy_policy: appInfo.ai_privacy_policy,
        ai_updated_at: appInfo.ai_updated_at,
        ai_uuid: appInfo.ai_uuid,
        created_at: appInfo.created_at,
        ai_contact_address: appInfo.ai_contact_address,
        ai_contact_email: appInfo.ai_contact_email,
      },
    });
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    return commonHelper.errorHandler(res, {
      code: "PP-999",
      message: "Internal Server Error",
    });
  }
};

// Terms & Conditions API
faqObj.getTermsConditions = async function (req, res) {
  try {
    const appInfo = await AppInfoModel.findOne({}).sort({ created_at: -1 });

    if (!appInfo) {
      return commonHelper.errorHandler(res, {
        code: "TC-404",
        message: "Terms & Conditions not found",
      });
    }

    return commonHelper.successHandler(res, {
      message: "Terms & Conditions fetched successfully",
      payload: {
        _id: appInfo._id,
        ai_deleted: appInfo.ai_deleted,
        ai_terms_conditions: appInfo.ai_terms_conditions,
        ai_updated_at: appInfo.ai_updated_at,
        ai_uuid: appInfo.ai_uuid,
        created_at: appInfo.created_at,
        ai_contact_address: appInfo.ai_contact_address,
        ai_contact_email: appInfo.ai_contact_email,
      },
    });
  } catch (error) {
    console.error("Error fetching terms & conditions:", error);
    return commonHelper.errorHandler(res, {
      code: "TC-999",
      message: "Internal Server Error",
    });
  }
};


export default faqObj;