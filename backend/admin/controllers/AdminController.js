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
 *  @author     Sangeeta <vishalverma@zeroitsolutions.com>
 *  @date       June 2025
 *  @version    1.0.0
 *  @module     Admin Controller
 *  @description Handles all Admin-related API endpoints including creation,
 *               listing, updating, and deletion of Admin users.
 *  @modified
 *
 */
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { successHandler } from "../../middleware/SuccessHandler.js";
import { createAdmin } from "../../services/AdminServices.js";
import { findAdminByEmail } from "../../services/AdminServices.js";
import { sendOTP } from "../../middleware/NodeEmailer.js";
import { findAdminById } from "../../services/AdminServices.js";
import { saveAdmin } from "../../services/AdminServices.js";
import AdminModel from "../models/Admin.js";
import helper from "../../utils/Helper.js";
import getConstant from "../../config/Constants.js";
import RoleModel from "../models/Role.js";
import PermissionModel from "../models/Permission.js";


/**
 *
 * This function is using to create Admin
 * @param     :
 * @returns   :
 * @developer :vishalverma
 * @updatedBy :
 */


export const CreateAdmin = async (req, res, next) => {
  try {
    const { name, surname, email, phone, password, type, address, role } = req.body;

    if (!name || !surname || !email || !phone || !password || !address || !role) {
      return res.status(400).json({ status: false, message: "Invalid payload" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ status: false, message: "Invalid email format" });
    }

    const existingAdmin = await findAdminByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({ status: false, message: "Email already exists" });
    }

    const roleDoc = await RoleModel.findOne({ r_name: role }).select("r_uuid");
    if (!roleDoc) {
      return res.status(400).json({ status: false, message: "Role not found" });
    }

    let imageName = null;
    if (req.file && req.file.buffer) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const newName = `${Date.now()}${ext}`.replace(/ /g, "_");

      const uploadResult = await helper.uploadFile({
        fileName: newName,
        chunks: [req.file.buffer],
        contentType: req.file.mimetype,
        uploadFolder: process.env.AWS_USER_FILE_FOLDER,
      });

      if (uploadResult && uploadResult.Location) {
        imageName = newName;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminData = {
      au_name: name,
      au_surname: surname,
      au_email: email,
      au_phone: phone,
      au_password: hashedPassword,
      au_address: address,
      au_image: imageName || null,
      au_type: type,
      au_role: roleDoc.r_uuid, // 👈 store role UUID here
    };

    const admin = await createAdmin(adminData);

    return successHandler(res, {
      status: true,
      message: "Admin created successfully",
      payload: admin,
    });
  } catch (error) {
    console.error("CreateAdmin error:", error);
    next(error);
  }
};



/**
 *
 * This function is using to login Admin
 * @param     :
 * @returns   :
 * @developer :Sangeeta
 * @updatedBy :
 */



export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) 
      return res.status(400).json({ status: false, message: "Email and password required" });

    const admin = await AdminModel.findOne({ au_email: email.trim().toLowerCase() });
    if (!admin) return res.status(401).json({ status: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.au_password);
    if (!isMatch) return res.status(401).json({ status: false, message: "Invalid credentials" });

    // Fetch role with permissions
    const role = await RoleModel.findOne({ r_uuid: admin.au_role });
    let permissionKeys = [];
    let permissionName = [];
    if (role && role.r_permissions.length) {
      const perms = await PermissionModel.find({ p_uuid: { $in: role.r_permissions } });
      permissionKeys = perms.map(p => p.p_key);
      permissionName = perms.map(p => p.p_name) // ✅ p_key instead of UUID
    }
    // Create JWT with keys
    const token = jwt.sign(
      {
        id: admin.au_uuid,
        email: admin.au_email,
        role: admin.au_role,
        permissionsKey: permissionKeys,
        permissionName:permissionName
          // store keys for middleware
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    admin.access_token = token;
    await admin.save();

    return res.json({
      status: true,
      message: "Login successful",
      payload: {
        token,
        name: `${admin.au_name} ${admin.au_surname}`,
        email: admin.au_email,
        image: admin.au_image || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 *
 * This function is using to Admin forget password
 * @param     :
 * @returns   :
 * @developer :Sangeeta
 * @updatedBy :
 */

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .status(400)
        .json({ status: false, message: "Valid email is required" });
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.au_otp = otp;
    admin.au_otp_expiry = Date.now() + 5 * 60 * 1000;
    await saveAdmin(admin);

    await sendOTP(email, otp);

    return successHandler(res, {
      message: "OTP sent to email",
      payload: { otp },
    });
  } catch (error) {
    next(error);
  }
};

/**
 *
 * This function is using to Admin verfiy OTP
 * @param     :
 * @returns   :
 * @developer :Sangeeta
 * @updatedBy :
 */

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const admin = await findAdminByEmail(email);
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    if (admin.au_otp !== otp || Date.now() > admin.au_otp_expiry) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid or expired OTP" });
    }

    admin.au_otp = null;
    admin.au_otp_expiry = null;
    admin.au_reset_verified = true;

    await saveAdmin(admin);

    return successHandler(res, {
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 *
 * This function is using to set Admin new password
 * @param     :
 * @returns   :
 * @developer :Sangeeta
 * @updatedBy :
 */

export const setNewPassword = async (req, res, next) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ status: false, message: "Passwords do not match" });
    }

    const admin = await findAdminByEmail(email);
    if (!admin || !admin.au_reset_verified) {
      return res
        .status(403)
        .json({ status: false, message: "OTP verification required" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.au_password = hashedPassword;
    admin.au_reset_verified = false;

    await saveAdmin(admin);

    return successHandler(res, {
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 *
 * This function is using to get Admin detail
 * @param     :
 * @returns   :
 * @developer :Sangeeta
 * @updatedBy :
 */

  export const getAdminDetails = async (req, res, next) => {
    try {
      const { id } = req.user;

      const admin = await findAdminById(id);
      if (!admin) {
        return res
          .status(404)
          .json({ status: false, message: "Admin not found" });
      }

      return successHandler(res, {
        message: "Admin details fetched successfully",
        payload: {
          name: `${admin.au_name} ${admin.au_surname}`,
          firstName: admin.au_name,
          lastName:admin.au_surname,
          email: admin.au_email,
          phone: admin.au_phone,
          image: admin.au_image || null,
          address: admin.au_address,
        },
      });
    } catch (error) {
      next(error);
    }
  };

/**
 *
 * This function is using to update Admin
 * @param     :
 * @returns   :
 * @developer :Sangeeta
 * @updatedBy :
 */

export const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { name, surname, phone, address, password } = req.body;

    const admin = await findAdminById(id);
    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found",
      });
    }

    if (name) admin.au_name = name;
    if (surname) admin.au_surname = surname;
    if (phone) admin.au_phone = phone;
    if (address) admin.au_address = address;

    // ⭐ IMAGE UPLOAD
    if (req.file && req.file.buffer) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const imageName = `${Date.now()}${ext}`.replace(/ /g, "_");

      const uploadResult = await helper.uploadFile({
        fileName: imageName,
        chunks: [req.file.buffer],
        contentType: req.file.mimetype,
        uploadFolder: process.env.AWS_USER_FILE_FOLDER,
      });

      if (uploadResult?.Location) {
        admin.au_image = imageName;
      }
    }

    // ⭐ PASSWORD UPDATE
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          status: false,
          message: "Password must be at least 6 characters long",
        });
      }
      admin.au_password = await bcrypt.hash(password, 10);
    }

    await admin.save();

    const constants = await getConstant();

    return successHandler(res, {
      message: "Admin updated successfully",
      payload: {
        name: `${admin.au_name} ${admin.au_surname}`,
        email: admin.au_email,
        phone: admin.au_phone,
        image: admin.au_image,
        address: admin.au_address,
      },
    });
  } catch (error) {
    next(error);
  }
};




export const getAdminWithRole = async (req, res, next) => {
  try {
    const { id } = req.user;
 

    const admin = await AdminModel.findOne({au_uuid:id}).lean();
    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    const role = await RoleModel.findOne({ r_uuid: admin.au_role }).lean();

    if (role) {
      const permissions = await PermissionModel.find({
        p_uuid: { $in: role.r_permissions }
      }).lean();

      admin.roleDetails = {
        ...role,
        permissions
      };
    }
    return res.json({ msg: "Admin fetched successfully", admin });
  } catch (err) {
    console.error(err);
    next(err)
  }
};


export const getAllAdmins = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    // Search on full name (au_name + " " + au_surname)
    if (search) {
      query.$expr = {
        $regexMatch: {
          input: { $concat: ['$au_name', ' ', '$au_surname'] },
          regex: search,
          options: 'i', // case-insensitive
        }
      };
    }

    const total = await AdminModel.countDocuments(query);

    const admins = await AdminModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ au_name: 1 });

    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;

    const nextPage = page * limit < total ? `${baseUrl}?page=${page + 1}&limit=${limit}&search=${search}` : null;
    const prevPage = page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}&search=${search}` : null;

    return res.status(200).json({
      status: true,
      message: "Admins fetched successfully",
      payload: admins,
      pagination: {
        total,
        page,
        limit,
        next: nextPage,
        previous: prevPage,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (err) {
    next(err);
  }
};




export const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedAdmin = await AdminModel.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).json({ status: false, msg: "Admin not found" });
    }

    return successHandler (res, {
      status: true,
      msg: "Admin deleted successfully",
      deletedAdmin,
    });
  } catch (err) {
    next(err);
  }
};


  export const getAdminDetailsById = async (req, res, next) => {
    try {
      const { id } = req.params;
      

      const admin = await AdminModel.findById(id);
      if (!admin) {
        return res
          .status(404)
          .json({ status: false, message: "Admin not found" });
      }

      return successHandler(res, {
        message: "Admin details fetched successfully",
        payload: admin,
      });
    } catch (error) {
      next(error);
    }
  };

export const updateAdminById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id,"-----------")
    const { name, surname, phone, address, password, role, type } = req.body;

    const admin = await AdminModel.findByIdAndUpdate(id);
    if (!admin) {
      return res.status(404).json({ status: false, message: "Admin not found" });
    }


    if (name) admin.au_name = name;
    if (surname) admin.au_surname = surname;
    if (phone) admin.au_phone = phone;
    if (address) admin.au_address = address;
    if (type) admin.au_type = type;

    if (role) {
         const roleDoc = await RoleModel.findOne({ r_name: role }).select("r_uuid");
    if (!roleDoc) {
      return res.status(400).json({ status: false, message: "Role not found" });
    }
      admin.au_role = roleDoc.r_uuid;
    }

    // Handle image upload
    if (req.file && req.file.buffer) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const imageName = `${Date.now()}${ext}`.replace(/ /g, "_");

      const uploadResult = await helper.uploadFile({
        fileName: imageName,
        chunks: [req.file.buffer],
        contentType: req.file.mimetype,
        uploadFolder: process.env.AWS_USER_FILE_FOLDER,
      });

      if (uploadResult && uploadResult.Location) {
        admin.au_image = imageName;
      }
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          status: false,
          message: "Password must be at least 6 characters long",
        });
      }
      admin.au_password = await bcrypt.hash(password, 10);
    }

    await admin.save();

    const constants = await getConstant();
    const imageUrl = admin.au_image
      ? `${constants.AWS_FILE_URL}${constants.UPLOAD_PROFILE_PATH}${admin.au_image}`
      : null;

    return successHandler(res, {
      status: true,
      message: "Admin updated successfully",
      payload: {
        name: `${admin.au_name} ${admin.au_surname}`,
        email: admin.au_email,
        phone: admin.au_phone,
        image: imageUrl,
        address: admin.au_address,
        role: role || admin.au_role,
        type: admin.au_type,
      },
    });
  } catch (error) {
    console.error("updateAdminById error:", error);
    next(error);
  }
};
