import express from "express";
import { allowHeaders } from "../../middleware/Cors.js";
import { authenticate } from "../../middleware/JsonWebToken.js";
import { hasPermission } from "../../middleware/Authrise.js";
import { uploadImage } from "../../middleware/Uploads.js";
import {adminAuth} from "../../middleware/adminAuth.js";

import { 
  CreateAdmin,  deleteAdmin,  forgetPassword, getAdminDetails, getAdminDetailsById, getAdminWithRole, 
  getAllAdmins, 
  loginAdmin, setNewPassword, updateAdmin, updateAdminById, verifyOtp 
} from "../controllers/AdminController.js";
import { deleteUserById, getAllUsers,getUserById,updateUserById } from "../controllers/UserController.js";
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from "../controllers/RolesController.js";
import { getAllPermissions } from "../controllers/PermisionController.js";
import {
  getAllFundraisers,
  approveFundraiser,
  rejectFundraiser,
  pauseFundraiser,
  resumeFundraiser,
  editFundraiser,
  closeFundraisers,
} from "../controllers/FundraisersController.js";
import {getAllDonations,markDonationSafe,markDonationFraud} from "../controllers/DonationController.js";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../controllers/CategoryController.js";

import{getDashboardSummary,getDashboardStats,getRecentActivities} from "../controllers/DashboardController.js";
import {createFaq, getAllFaqs, getFaqById, updateFaq, deleteFaq, toggleFaqStatus} from "../controllers/FaqController.js";
import{savePrivacyPolicy,getPrivacyPolicys}from "../controllers/AboutController.js"
import { getAllwithdrawal,approveWithdrawal,rejectWithdrawal } from "../controllers/withdrawals.js";
import{getAllUsersWithKyc,approveKyc,rejectKYC} from "../controllers/kyc.js"

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

//****************************** 🔐 User Routes *******************************************//
router.get("/private/getAllUsers", adminAuth, getAllUsers);
router.get("/private/getUserBy/:id", hasPermission("user:view"), getUserById);
router.delete("/private/deleteUserById/:id", deleteUserById);
router.put("/private/updateUser/:id", updateUserById);

//****************************** 🔐 Fundraisers Routes *******************************************//
router.get("/private/fundraisers-list", adminAuth, getAllFundraisers);
router.post("/private/fundraiser-approve", adminAuth, approveFundraiser);
router.post("/private/fundraiser-reject", adminAuth, rejectFundraiser);
router.post("/private/fundraiser-pause", adminAuth, pauseFundraiser);
router.post("/private/fundraiser-resume", adminAuth, resumeFundraiser);
router.post("/private/fundraiser-edit", adminAuth, editFundraiser);
router.post("/private/closeFundraisers", adminAuth, closeFundraisers);

//****************************** 🔐 Donation Routes *******************************************//
router.get("/private/donations-list", adminAuth, getAllDonations);
router.post("/private/donation-mark-safe", adminAuth, markDonationSafe);
router.post("/private/donation-mark-fraud", adminAuth, markDonationFraud);

//****************************** 🔐 Category Routes *******************************************//

router.get("/private/categories-list", adminAuth, getAllCategories);
router.post("/private/category-create", adminAuth, createCategory);
router.post("/private/category-update", adminAuth, updateCategory);
router.delete("/private/category-delete/:id", adminAuth, deleteCategory);
router.post("/private/category-toggle-status", adminAuth, toggleCategoryStatus);

//****************************** 🔐 Dashboard Routes *******************************************//

router.get("/private/dashboard-summary", adminAuth, getDashboardSummary);
router.get("/private/dashboard-stats", adminAuth, getDashboardStats);
router.get("/private/dashboard-recent-activities", adminAuth, getRecentActivities);

//****************************** 🔐 FAQ Routes *******************************************//


router.get("/private/faqs-list", adminAuth, getAllFaqs);
router.get("/private/faq/:id", adminAuth, getFaqById);
router.post("/private/faq-create", adminAuth, createFaq);
router.post("/private/faq-update", adminAuth, updateFaq);
router.delete("/private/faq-delete/:id", adminAuth, deleteFaq);
router.post("/private/faq-toggle-status", adminAuth, toggleFaqStatus);


//****************************************Aboute Route******************************************** *//
router.post("/private/savePrivacyPolicy", savePrivacyPolicy);
router.get("/private/getPrivacyPolicys",getPrivacyPolicys)





router.get("/private/getAllwithdrawal", adminAuth, getAllwithdrawal);
router.post("/private/approveWithdrawal", adminAuth, approveWithdrawal);
router.post("/private/rejectWithdrawal", adminAuth, rejectWithdrawal);


//****************************************************************************************************** *//
router.get("/private/getAllUsersWithKyc", adminAuth, getAllUsersWithKyc);
router.post("/private/approveKyc", adminAuth, approveKyc);
router.post("/private/rejectKyc", adminAuth, rejectKYC);


export default router;