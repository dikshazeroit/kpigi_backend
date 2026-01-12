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
 *  @date       Aug 2025
 *  @version    1.0.0
 *  @module     About Controller
 *  @description Handles users API endpoints including creation,
 *               listing, status and deletion of app users.
 *  @modified
 *
 */


import { successHandler } from "../../middleware/SuccessHandler.js";
import userModel from "../../application/model/UserModel.js";

export const getAllUsers = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = search
      ? { uc_full_name: { $regex: search, $options: "i" } }
      : {};

    const total = await userModel.countDocuments(query);

    const users = await userModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      status: true,
      message: "All users fetched successfully",
      payload: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        pageSize: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};




export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);

    if (!user) {
    return res.status(404).json({message:"user not found"})
    }

    return successHandler(res, {
      status: true,
      message: "User fetched successfully",
      payload: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await userModel.findByIdAndDelete(id);

    return successHandler(res, {
      status: true,
      message: "User deleted successfully",
      payload: { id },
    });
  } catch (error) {
    next(error);
  }
};


export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.uc_active = user.uc_active === "1" ? "0" : "1";
    await user.save();

    return successHandler(res, {
      status: true,
      message: "User status updated successfully",
      payload: { id: user._id, uc_active: user.uc_active },
    });
  } catch (error) {
    next(error);
  }
};



export const toggleCardVerification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.uc_card_verified = !user.uc_card_verified;
    await user.save();

    return successHandler(res, {
      status: true,
      message: "User card verification status updated successfully",
      payload: { id: user._id, uc_card_verified: user.uc_card_verified },
    });
  } catch (error) {
    next(error);
  }
};



export const getSwipes = async (req, res) => {
  try {
    const { id } = req.params; // swiper user UUID
    const { page = 1, limit = 10, direction, search } = req.query; // ✅ added search

    const query = { swiper_uuid: id };
    if (direction) query.direction = direction;

    const skip = (page - 1) * limit;

    // base swipes query
    const baseSwipes = await swipeModel.find(query).lean();

    if (!baseSwipes.length) {
      return res.status(200).json({
        status: true,
        message: "No swipes found",
        payload: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          nextPage: null,
          prevPage: null,
        },
      });
    }

    // unique swiped userIds
    const userIds = [...new Set(baseSwipes.map((s) => s.swiped_uuid))];

    // build user filter
    const userFilter = { uc_uuid: { $in: userIds } };
    if (search) {
      userFilter.uc_full_name = { $regex: search, $options: "i" }; // ✅ case-insensitive search
    }

    // fetch matching users
    const users = await userModel.find(
      userFilter,
      { uc_full_name: 1, uc_email: 1, uc_gender: 1, uc_active: 1, uc_uuid: 1 }
    ).lean();

    // if search applied and no users match
    if (!users.length) {
      return res.status(200).json({
        status: true,
        message: "No swipes found",
        payload: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          nextPage: null,
          prevPage: null,
        },
      });
    }

    // filter swipes to only those matching searched users
    const filteredSwipes = baseSwipes.filter((s) =>
      users.some((u) => u.uc_uuid === s.swiped_uuid)
    );

    // total count after filter
    const total = filteredSwipes.length;

    // pagination after filter
    const paginatedSwipes = filteredSwipes
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    // map swipes with user details
    const swipedUsers = paginatedSwipes.map((swipe) => {
      const user = users.find((u) => u.uc_uuid === swipe.swiped_uuid);
      return {
        swipe_uuid: swipe.swipe_uuid,
        direction: swipe.direction,
        createdAt: swipe.createdAt,
        swipedUser: user || null,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Swipes fetched successfully",
      payload: swipedUsers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        nextPage:
          total > page * limit
            ? `${req.baseUrl}${req.path}?page=${parseInt(page) + 1}&limit=${limit}&search=${search || ""}`
            : null,
        prevPage:
          page > 1
            ? `${req.baseUrl}${req.path}?page=${parseInt(page) - 1}&limit=${limit}&search=${search || ""}`
            : null,
      },
    });

  } catch (err) {
    console.error("Error fetching swipes:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      payload: null,
    });
  }
};

export const getCallSchedules = async (req, res) => {
  try {
    const { id } = req.params; 
    const { page = 1, limit = 10, search } = req.query;

    const skip = (page - 1) * limit;

    const now = new Date();
    const baseQuery = {
      caller_id: id,
      scheduled_date: { $gte: now },
    };
    

    const baseSchedules = await callScheduleModel.find(baseQuery).lean();

    if (!baseSchedules.length) {
      return res.status(200).json({
        status: true,
        message: "No call schedules found",
        payload: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          nextPage: null,
          prevPage: null,
        },
      });
    }

    const receiverIds = [...new Set(baseSchedules.map((c) => c.receiver_id))];

    const userFilter = { uc_uuid: { $in: receiverIds } };
    if (search) {
      userFilter.uc_full_name = { $regex: search, $options: "i" };
    }

    const users = await userModel.find(
      userFilter,
      { uc_full_name: 1, uc_email: 1, uc_gender: 1, uc_active: 1, uc_uuid: 1 }
    ).lean();

    if (!users.length) {
      return res.status(200).json({
        status: true,
        message: "No call schedules found",
        payload: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          nextPage: null,
          prevPage: null,
        },
      });
    }

    const filteredSchedules = baseSchedules.filter((c) =>
      users.some((u) => u.uc_uuid === c.receiver_id)
    );

    const total = filteredSchedules.length;

    const paginatedSchedules = filteredSchedules
      .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
      .slice(skip, skip + parseInt(limit));

    const schedulesWithUser = paginatedSchedules.map((call) => {
      const receiver = users.find((u) => u.uc_uuid === call.receiver_id);
      return {
        call_uuid: call.call_uuid,
        status: call.status,
        scheduled_date: call.scheduled_date,
        createdAt: call.createdAt,
        receiver: receiver || null,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Call schedules fetched successfully",
      payload: schedulesWithUser,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        nextPage:
          total > page * limit
            ? `${req.baseUrl}${req.path}?page=${parseInt(page) + 1}&limit=${limit}&search=${search || ""}`
            : null,
        prevPage:
          page > 1
            ? `${req.baseUrl}${req.path}?page=${parseInt(page) - 1}&limit=${limit}&search=${search || ""}`
            : null,
      },
    });

  } catch (err) {
    console.error("Error fetching call schedules:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      payload: null,
    });
  }
};



export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;


    if (!id) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
      });
    }

  
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No update data provided",
      });
    }

    
    const allowedUpdates = [
      "uc_full_name",
      "uc_email",
      "uc_role",
      "uc_phone",
      "uc_country_code",
      "uc_bio",
      "uc_notifications_enabled",
    ];

    const invalidFields = Object.keys(updates).filter(
      (key) => !allowedUpdates.includes(key)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid fields in update",
        invalidFields,
      });
    }

  
    if (updates.uc_role && !["REQUESTER", "DONOR"].includes(updates.uc_role)) {
      return res.status(400).json({
        status: false,
        message: "Invalid role value. Must be REQUESTER or DONOR",
      });
    }

    
    if (updates.uc_email) {
      const existingUser = await userModel.findOne({ uc_email: updates.uc_email });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({
          status: false,
          message: "Email already exists for another user",
        });
      }
    }

    
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

  
    res.status(200).json({
      status: true,
      message: "User updated successfully",
      payload: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      status: false,
      message: "Something went wrong while updating the user",
      error: error.message,
    });
  }
};