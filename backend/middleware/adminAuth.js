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
 * 📝 Description   : Admin JWT authentication middleware
 * ================================================================================
 */
import jwt from "jsonwebtoken";
import AdminModel from "../admin/models/Admin.js";

export const adminAuth = async (req, res, next) => {
  try {
    const tokenHeader = req.headers["authorization"];

    if (!tokenHeader) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized. Token missing.",
      });
    }

    const token = tokenHeader.replace("Bearer ", "").trim();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Correct field from your token:
    const admin = await AdminModel.findOne({ au_uuid: decoded.id });

    if (!admin) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized. Admin not found.",
      });
    }

    req.admin = admin; // attach admin object
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized. Invalid or expired token.",
    });
  }
};
