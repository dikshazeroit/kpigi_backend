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
import { 
  createSubscription, deleteSubscriptionController, 
  getAllSubscriptions, getSubscriptionByIdController, 
  updateSubscriptionController 
} from "../controllers/SubscriptionController.js";

import { createQuestion } from "../controllers/QestionsController.js";
import { 
  createOption, deleteQuestionOrOption, getQuestionsWithOptions, 
  getQuestionWithOptionsById, updateQuestionOrOption 
} from "../controllers/OptionsController.js";

import { deleteUserById, getAllUsers, getCallSchedules, getSwipes, getUserById, toggleCardVerification, toggleUserStatus } from "../controllers/UserController.js";
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from "../controllers/RolesController.js";
import { getAllPermissions } from "../controllers/PermisionController.js";
import { getDatePlanWithDetail } from "../controllers/DatePlanController.js";
import { deleteReport, getAllReports, getReportById, handleUserReport, rejectReport } from "../controllers/ReportController.js";
import { createExplore, deleteExplore, getExploreById, getExplores, updateExplore } from "../controllers/ExploreController.js";
import { getActiveUsersGrowth, getDashboardStats, getNewMatches, getRecentUserActivity, getUserReligionDistribution } from "../controllers/DashboardController.js";
import { createFaq, deleteFaq, getAllFaqs, getFaqById, toggleFaqStatus, updateFaq } from "../controllers/FaqController.js";

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

//****************************** 🔐 About Routes *******************************************//
router.post("/private/about", hasPermission("about:update"), savePrivacyPolicy);
router.get("/private/getabout", hasPermission("about:view"), getPrivacyPolicy);

//****************************** 🔐 Subscription Routes *******************************************//
router.post("/private/subscription", hasPermission("subscription:create"), createSubscription);
router.get("/private/getallsubscription", hasPermission("subscription:view"), getAllSubscriptions);
router.get("/private/getsubscription/:id", hasPermission("subscription:view"), getSubscriptionByIdController);
router.put("/private/updatesubscription/:id", hasPermission("subscription:edit"), updateSubscriptionController);
router.delete("/private/deletesubscription/:id", hasPermission("subscription:delete"), deleteSubscriptionController);

//****************************** 🔐 Question & Option Routes *******************************************//
router.post("/private/createQuestion", hasPermission("question:create"), createQuestion);
router.post("/private/createOption/:id", hasPermission("question:create"), createOption);
router.get("/private/getallquestionswithoptions", hasPermission("question:view"), getQuestionsWithOptions);
router.get("/private/getquestionandoptions/:id", hasPermission("question:view"), getQuestionWithOptionsById);
router.delete("/private/deleteOptionAndQuestion/:id", hasPermission("question:delete"), deleteQuestionOrOption);
router.put("/private/updateOptionAndQuestion/:id", hasPermission("question:edit"), updateQuestionOrOption);

//****************************** 🔐 Users Routes *******************************************//
router.get("/private/getAllUsers", hasPermission("user:view"), getAllUsers);
router.get("/private/getUserBy/:id", hasPermission("user:view"), getUserById);
router.delete("/private/deleteUser/:id", hasPermission("user:delete"), deleteUserById);
router.put("/private/toggleStatus/:id", hasPermission("user:edit"), toggleUserStatus);
router.get("/private/getUsersSwipes/:id" , hasPermission("user:viewSwipes"), getSwipes );
router.put("/private/verifiedCard/:id", hasPermission("user:edit"), toggleCardVerification);
router.get("/private/getCallSchedules/:id", hasPermission("user:viewSchedules"), getCallSchedules);

//****************************** 🔐 DatePlan Routes *******************************************//
router.get("/private/getAllDatePlan", hasPermission("datePlan:view"), getDatePlanWithDetail)


//****************************** 🔐 Report Routes *******************************************//
router.post("/private/reportAction/:id",hasPermission("report:action"), handleUserReport);
router.get("/private/getAllReports",hasPermission("report:view"), getAllReports);
router.delete("/private/deleteReport/:id",hasPermission("report:delete"), deleteReport);
router.patch("/private/rejectedReport/:id",hasPermission("report:rejected"),rejectReport );
router.get("/private/getReportBy/:id",hasPermission("report:viewDetail"), getReportById);

//****************************** 🔐 Explore Routes *******************************************//
router.post("/private/createExplore", uploadImage.single("image"),hasPermission("explore:create"), createExplore);
router.get("/private/getExplores", hasPermission("explore:view"), getExplores)
router.get("/private/getExplores/:uuid", hasPermission("explore:viewDetail"), getExploreById)
router.put("/private/updateExplore/:uuid", uploadImage.single("image"),hasPermission("explore:edit"), updateExplore)
router.delete("/private/deleteExplore/:uuid", hasPermission("explore:delete"), deleteExplore)

//********************************* Dashboard Routes *******************************************//
router.get("/private/dashboardStats", getDashboardStats);
router.get("/private/dashboard/activeUsersGrowth", getActiveUsersGrowth);
router.get("/private/dashboard/newMatches", getNewMatches);
router.get("/private/dashboard/recentUserActivity", getRecentUserActivity);
router.get("/private/dashboard/userReligionDistribution", getUserReligionDistribution);

//********************************** Faq Routes ************************************************/
router.post("/private/faqCreate", createFaq);
router.get("/private/getAllFaqs", getAllFaqs);
router.get("/private/getFaqById/:id", getFaqById);
router.put("/private/updateFaq/:id", updateFaq); 
router.delete("/private/deleteFaq/:id", deleteFaq);
router.put("/private/faqtogglestatus/:id", toggleFaqStatus);

export default router;