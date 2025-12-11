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
 *  @date       Dec 2025
 *  @version    1.0.0
 *  @module     User Services
 *  @description Contains all database service functions for the User module including
 *               creating, finding, updating, and deleting PROVIDER and EMPLOYER records.
 *  @modified   
 *
 *
*/
import UsersModel from '../application/model/UserModel.js';

/** Create new user */
export const createUser = async (userData) => {
  const user = new UsersModel(userData);
  return await user.save();
};

/** Find user by email or phone */
export const findUserByEmailOrPhone = async (email, phone) => {
  return await UsersModel.findOne({
    $or: [{ uc_email: email }, { uc_phone: phone }],
  });
};

/** Get all users */
export const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    UsersModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    UsersModel.countDocuments(),
  ]);

  return {
    data: users,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
};

/** Get single user by ID */
export const getUserById = async (id) => {
  return await UsersModel.findById(id);
};

export const updateUserById = async (id, updateData) => {
  return await UsersModel.findByIdAndUpdate(id, updateData, { new: true });
};


/** Delete user by ID (Hard delete) */
export const deleteUserById = async (id) => {
  return await UsersModel.findByIdAndDelete(id);
};
