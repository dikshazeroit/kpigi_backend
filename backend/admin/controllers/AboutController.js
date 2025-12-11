/**
 * ============================================================================
 *  Copyright (C) Zero IT Solutions - All Rights Reserved
 * ----------------------------------------------------------------------------
 *  Unauthorized copying of this file, via any medium is strictly prohibited.
 *  Proprietary and confidential. Dissemination or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained from
 *  Zero IT Solutions.
 * ============================================================================
 *
 *  @author     Sangeeta <sangeeta.zeroit@gmail.com>
 *  @date       dec 2025
 *  @version    1.0.0
 *  @module     About Controller
 *  @description Handles all app about API endpoints including creation,
 *               listing, updating, and deletion of app privacy policy and terms of conditions.
 *  @modified
 *
 */
import { successHandler } from "../../middleware/SuccessHandler.js";
import { getAppInfo, saveAppInfo } from "../../services/AboutServices.js";

/**
 *
 * This function is using to save privacy policy
 * @param     :
 * @returns   :
 * @developer :Sangeeta Kumar
 * @updatedBy :
 */

export const savePrivacyPolicy = async (req, res, next) => {
  try {
    const { data, email, contact_address, type } = req.body;


    // Improved validation
    if (!type) {
      return res.status(400).json({ status: false, message: "Type is required" });
    }

    if ((type === "0" || type === "1") && !data) {
      return res.status(400).json({ status: false, message: "Data is required for this type" });
    }

    if (type === "2" && (!email || !contact_address)) {
      return res.status(400).json({ 
        status: false, 
        message: "Email and contact address are required for contact info" 
      });
    }

    const InsertedData = {
      ai_privacy_policy: type === "0" ? data : "",
      ai_terms_conditions: type === "1" ? data : "",
      ai_contact_email: type === "2" ? email : "",
      ai_contact_address: type === "2" ? contact_address : "",
    };

    const admin = await saveAppInfo(InsertedData);

    return successHandler(res, {
      status: true,
      message: "Privacy policy saved successfully",
      payload: admin,
    });
  } catch (error) {
    console.error("SavePrivacyPolicy error:", error);
    next(error);
  }
};

/**
 *
 * This function is using to save privacy policy
 * @param     :
 * @returns   :
 * @developer :sangeeta
 * @updatedBy :
 */

export const getPrivacyPolicy = async (req, res, next) => {
  try {
    const appInfo = await getAppInfo();
    if (!appInfo) {
      return res.status(404).json({
        status: false,
        message: "App info not found",
        payload: {},
      });
    }
    return successHandler(res, {
      status: true,
      message: "About information fetched successfully",
      payload: {
        privacyPolicy: appInfo?.ai_privacy_policy || "",
        termsConditions: appInfo?.ai_terms_conditions || "",
        email: appInfo?.ai_contact_email || "",
        address: appInfo?.ai_contact_address || "",
        createdAt: appInfo?.created_at || "",
        updatedAt: appInfo?.ai_updated_at || "",
      },
    });
  } catch (error) {
    console.error("get data error:", error);
    next(error);
  }
};

