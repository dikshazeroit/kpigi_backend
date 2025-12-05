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
 *  @date       June 2025
 *  @version    1.0.0
 *  @module     Admin Services
 *  @description Contains all database service functions for the Admin module such as
 *               creating, finding, updating, and deleting admin records.
 *  @modified   
 *
 */

import adminModel from "../admin/models/Admin.js";

export const createAdmin = async (data) => {
  try {
    const newAdmin = new adminModel(data);
    const savedAdmin = await newAdmin.save();
    return savedAdmin;
  } catch (error) {
    throw error;
  }
};

export const findAdminByEmail = async (email) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const admin = await adminModel.findOne({
      au_email: normalizedEmail,
      // Remove this if not needed: au_deleted: "0"
    });
    return admin;
  } catch (error) {
    console.error("Error in findAdminByEmail:", error.message);
    throw error;
  }
};
export const findAdminById = async (id) => {
  try {
    const admin = await adminModel.findOne({ au_uuid: id, au_deleted: "0" });
    return admin;
  } catch (error) {
    throw error;
  }
};


export const updateAdminByEmail = async (email, updateData) => {
  try {
    const updated = await adminModel.findOneAndUpdate(
      { au_email: email, au_deleted: "0" },
      { $set: updateData },
      { new: true }
    );
    return updated;
  } catch (error) {
    throw error;
  }
};

export const saveAdmin = async (admin) => {
  try {
    return await admin.save();
  } catch (error) {
    throw error;
  }
};
