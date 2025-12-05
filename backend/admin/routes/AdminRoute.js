import express from "express";
import { allowHeaders } from "../../middleware/Cors.js";
import { authenticate } from "../../middleware/JsonWebToken.js";
import { hasPermission } from "../../middleware/Authrise.js";
import { uploadImage } from "../../middleware/Uploads.js";

import { 
  CreateAdmin,  deleteAdmin,  forgetPassword, getAdminDetails, getAdminDetailsById, getAdminWithRole, 
  getAllAdmins, 
  loginAdmin, setNewPassword, updateAdmin, updateAdminById, verifyOtp 
} from "../controllers/AdminController.js";

import { getPrivacyPolicy, savePrivacyPolicy } from "../controllers/AboutController.js";

import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from "../controllers/RolesController.js";
import { getAllPermissions } from "../controllers/PermisionController.js";
import { getActiveUsersGrowth, getDashboardStats, getNewMatches, getRecentUserActivity, getUserReligionDistribution } from "../controllers/DashboardController.js";

const router = express.Router();

// 🌍 Global middleware
router.all("/{*any}", allowHeaders);

// 🔐 Middleware for private routes (auth check)
router.all("/private/{*any}", authenticate);

//****************************** 🔐 Auth Routes *******************************************//
// create admin (needs admin:create permission)
router.post("/private/create", hasPermission("admin:create"), uploadImage.single("image"), CreateAdmin );

router.post("/login", loginAdmin);
router.post("/forgot-password", forgetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/set-new-password", setNewPassword);
router.get("/private/getAdminRoles",  getAdminWithRole);

//****************************** 🔐 permission Routes *******************************************//
router.get("/private/getAllPermision", getAllPermissions)

//****************************** 🔐 Roles Routes *******************************************//
router.post("/private/createRole", hasPermission("role:create"), createRole);
router.get("/private/getAllRoles", hasPermission("role:view"), getAllRoles)
router.get("/private/getRolesBy/:id", hasPermission("role:view"), getRoleById)
router.put("/private/updateRole/:id", hasPermission("role:update"), updateRole)
router.delete("/private/deleteRole/:id", hasPermission("role:delete"), deleteRole)|

//****************************** 🔐 Profile Routes *******************************************//
router.get("/private/details", getAdminDetails);
router.get("/private/getAllAdmin",  hasPermission("admin:view"), getAllAdmins)
router.put("/private/updatedetails", uploadImage.single("image"), updateAdmin);
router.get("/private/adminDetail/:id", hasPermission("admin:view"), getAdminDetailsById);
router.put("/private/updateAdmindetail/:id", hasPermission("admin:edit"), uploadImage.single("image"), updateAdminById);
router.delete("/private/adminDelete/:id", hasPermission("admin:delete"), deleteAdmin)



export default router;