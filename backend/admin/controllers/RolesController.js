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
 *  @module     Roles Controller
 *  @description Handles all Roles-based-access API endpoints including creation,
 *               listing, updating, and deletion of Admin users.
 *  @modified
 *
 */

import RoleModel from "../models/Role.js";
import PermissionModel from "../models/Permission.js"


export const createRole = async (req, res, next) => {
  try {
    const { name, permissions } = req.body;

    // Find permissions from UUIDs
    const permissionDocs = await PermissionModel.find({
      p_uuid: { $in: permissions }
    }).select("p_uuid");

    if (permissionDocs.length !== permissions.length) {
      return res.status(400).json({ msg: "Some permissions not found" });
    }

    const role = new RoleModel({
      r_name: name,
      r_permissions: permissionDocs.map(p => p.p_uuid), // store only UUIDs
    });

    await role.save();

    res.status(201).json({ msg: "Role created successfully", role });
  } catch (err) {
    next(err)
  }
};

export const getAllRoles = async (req, res, next) => {
  try {
    // query params le rahe hain
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // filter: agar search ho toh r_name ke basis par
    const filter = search
      ? { r_name: { $regex: search, $options: "i" } }
      : {};

    const total = await RoleModel.countDocuments(filter);

    const roles = await RoleModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

   
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;

  
    const nextPage =
      page * limit < total
        ? `${baseUrl}?page=${page + 1}&limit=${limit}&search=${search}`
        : null;

    const prevPage =
      page > 1
        ? `${baseUrl}?page=${page - 1}&limit=${limit}&search=${search}`
        : null;

    res.status(200).json({
      status: true,
      msg: "Roles fetched successfully",
      payload: roles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        nextPage,
        prevPage,
      },
    });
  } catch (err) {
    next(err);
  }
};


export const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await RoleModel.findById(id).lean();

    if (!role) {
      return res.status(404).json({ msg: "Role not found" });
    }

    // Agar role ke paas permissions hain to unki details nikal lo
    if (role.r_permissions && role.r_permissions.length > 0) {
      const permissions = await PermissionModel.find({
        p_uuid: { $in: role.r_permissions }
      }).select("p_name p_key p_uuid -_id").lean();

      // UUIDs ki jagah full permission objects dikhane ke liye replace kar do
      role.r_permissions = permissions;
    }

    res.status(200).json({
      msg: "Role fetched successfully",
      role,
    });
  } catch (err) {
    next(err);
  }
};




export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    const permissionDocs = await PermissionModel.find({
      p_uuid: { $in: permissions },
    }).select("p_uuid");

    if (permissionDocs.length !== permissions.length) {
      return res.status(400).json({ msg: "Some permissions not found" });
    }

    const updatedRole = await RoleModel.findByIdAndUpdate(
      id,
      {
        r_name: name,
        r_permissions: permissionDocs.map((p) => p.p_uuid),
      },
      { new: true }
    ).lean();

    if (!updatedRole) {
      return res.status(404).json({ msg: "Role not found" });
    }

    res.status(200).json({
      msg: "Role updated successfully",
      role: updatedRole,
    });
  } catch (err) {
    next(err);
  }
};


export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedRole = await RoleModel.findByIdAndDelete(id).lean();

    if (!deletedRole) {
      return res.status(404).json({ msg: "Role not found" });
    }

    res.status(200).json({ msg: "Role deleted successfully" });
  } catch (err) {
    next(err);
  }
};