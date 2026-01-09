import apiClient from './ApiClient.js';


// ============================================
// ADMIN PROFILE APIS
// ============================================

export const getAdminProfile = async () => {
  try {
    const response = await apiClient.get('private/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error;
  }
};

export const updateAdminProfile = async (formData) => {
  try {
    const response = await apiClient.put('private/updatedetails', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating admin profile:', error);
    throw error;
  }
};


// ============================================
// ADMIN FUNDRAISER MANAGEMENT APIS
// ============================================

// Fetch all fundraisers
export const getAllFundraisers = async (page = 1, limit = 10, search = "", status = "") => {
  try {
    const response = await apiClient.get("private/fundraisers-list", {
      params: { page, limit, search, status }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching fundraisers:", error);
    throw error;
  }
};

// Approve
export const approveFundraiserAPI = async (fund_uuid) => {
  try {
    const response = await apiClient.post("private/fundraiser-approve", { fund_uuid });
    return response.data;
  } catch (error) {
    console.error("Error approving fundraiser:", error);
    throw error;
  }
};

// Reject
export const rejectFundraiserAPI = async (fund_uuid, reason) => {
  try {
    const response = await apiClient.post("private/fundraiser-reject", { fund_uuid, reason });
    return response.data;
  } catch (error) {
    console.error("Error rejecting fundraiser:", error);
    throw error;
  }
};

// Pause
export const pauseFundraiserAPI = async (fund_uuid, reason) => {
  try {
    const response = await apiClient.post("private/fundraiser-pause", { fund_uuid, reason });
    return response.data;
  } catch (error) {
    console.error("Error pausing fundraiser:", error);
    throw error;
  }
};

// Resume
export const resumeFundraiserAPI = async (fund_uuid) => {
  try {
    const response = await apiClient.post("private/fundraiser-resume", { fund_uuid });
    return response.data;
  } catch (error) {
    console.error("Error resuming fundraiser:", error);
    throw error;
  }
};

// Edit
export const editFundraiserAPI = async (payload) => {
  try {
    const response = await apiClient.post("private/fundraiser-edit", payload);
    return response.data;
  } catch (error) {
    console.error("Error updating fundraiser:", error);
    throw error;
  }
};


// ========================================================================
// 💰 DONATION ADMIN PANEL APIS (NEWLY ADDED)
// ========================================================================

// Get donations list
export const getAllDonations = async (params = {}) => {
  try {
    const response = await apiClient.get("private/donations-list", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching donations:", error);
    throw error;
  }
};

// Mark Safe
export const markDonationSafe = async ({ d_uuid }) => {
  try {
    const response = await apiClient.post("private/donation-mark-safe", { d_uuid });
    return response.data;
  } catch (error) {
    console.error("Error marking donation safe:", error);
    throw error;
  }
};

// Mark Fraud
export const markDonationFraud = async ({ d_uuid, reason }) => {
  try {
    const response = await apiClient.post("private/donation-mark-fraud", { d_uuid, reason });
    return response.data;
  } catch (error) {
    console.error("Error marking donation fraud:", error);
    throw error;
  }
};

// ============================================
// 💸 ADMIN PAYOUTS MANAGEMENT APIS
// ============================================

// Get all payouts
export const getAllPayouts = async (page = 1, limit = 10, user_uuid = "", status = "") => {
  try {
    const params = { page, limit };
    if (user_uuid) params.user_uuid = user_uuid;
    if (status) params.status = status;

    const response = await apiClient.get("private/payouts-list", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching payouts:", error);
    throw error;
  }
};

// Approve payout
export const approvePayout = async ({ p_uuid }) => {
  try {
    const response = await apiClient.post("private/payout-approve", { p_uuid });
    return response.data;
  } catch (error) {
    console.error("Error approving payout:", error);
    throw error;
  }
};

// Reject payout
export const rejectPayout = async ({ p_uuid, reason }) => {
  try {
    const response = await apiClient.post("private/payout-reject", { p_uuid, reason });
    return response.data;
  } catch (error) {
    console.error("Error rejecting payout:", error);
    throw error;
  }
};

// Update payout status
export const updatePayoutStatus = async ({ p_uuid, status }) => {
  try {
    const response = await apiClient.post("private/payout-update-status", { p_uuid, status });
    return response.data;
  } catch (error) {
    console.error("Error updating payout status:", error);
    throw error;
  }
};



// ============================================
// 📂 ADMIN CATEGORY MANAGEMENT APIS
// ============================================

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await apiClient.get("private/categories-list");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Create category
export const createCategory = async (payload) => {
  try {
    const response = await apiClient.post("private/category-create", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Update category
export const updateCategory = async (payload) => {
  try {
    const response = await apiClient.post("private/category-update", payload);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (c_uuid) => {
  try {
    const response = await apiClient.delete(
      `private/category-delete/${c_uuid}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Toggle status
export const toggleCategoryStatus = async (payload) => {
  try {
    const response = await apiClient.post(
      "private/category-toggle-status",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating category status:", error);
    throw error;
  }
};
// ================= DASHBOARD APIS =================

// Summary
export const getDashboardSummary = async () => {
  const res = await apiClient.get("private/dashboard-summary");
  return res.data;
};

// Stats
export const getDashboardStats = async () => {
  const res = await apiClient.get("private/dashboard-stats");
  return res.data;
};

// Recent activities
export const getRecentActivities = async () => {
  const res = await apiClient.get("private/dashboard-recent-activities");
  return res.data;
};

// ================= FAQ APIs =================

// Get all FAQs
export const getAllFaqs = async () => {
  try {
    const response = await apiClient.get("private/faqs-list");
    return response.data;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    throw error;
  }
};

// Create FAQ
export const createFaq = async (payload) => {
  try {
    const response = await apiClient.post("private/faq-create", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating FAQ:", error);
    throw error;
  }
};

// Update FAQ
export const updateFaq = async (payload) => {
  try {
    const response = await apiClient.post("private/faq-update", payload);
    return response.data;
  } catch (error) {
    console.error("Error updating FAQ:", error);
    throw error;
  }
};

// Delete FAQ
export const deleteFaq = async (f_uuid) => {
  try {
    const response = await apiClient.delete(
      `private/faq-delete/${f_uuid}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    throw error;
  }
};

// Toggle FAQ status
export const toggleFaqStatus = async (payload) => {
  try {
    const response = await apiClient.post(
      "private/faq-toggle-status",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating FAQ status:", error);
    throw error;
  }
};





export const getPrivacyPolicy = async () => {
  try {
    const response = await apiClient.get(`private/getabout`);
    return response.data;
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    throw error;
  }
};


export const savePrivacyPolicy = async (payload) => {
  try {
    const response = await apiClient.post(`private/about`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving privacy policy:", error);
    throw error;
  }
};




export const createQuestionAPI = async (payload) => {
  try {
    const response = await apiClient.post('private/createQuestion', payload);
    return response.data;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};


export const createOptionAPI = async (questionId, payload) => {
  try {
    const response = await apiClient.post(`private/createOption/${questionId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating option:", error);
    throw error;
  }
};


export const getQuestionsWithOptionsAPI = async (page = 1, limit = 3) => {
  try {
    const response = await apiClient.get(`private/getallquestionswithoptions?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching questions with options:", error);
    throw error;
  }
};

export const getQuestionWithOptionsByIdAPI = async (id) => {
  try {
    const response = await apiClient.get(`private/getquestionandoptions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching question with options by ID:", error);
    throw error;
  }
};


export const deleteQuestionOrOptionAPI = async (id) => {
  try {
    const response = await apiClient.delete(`private/deleteOptionAndQuestion/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting question/option:", error);
    throw error;
  }
};


export const updateQuestionOrOptionAPI = async (id, payload) => {
  try {
    const response = await apiClient.put(`private/updateOptionAndQuestion/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating question/option:", error);
    throw error;
  }
};

export const getAllUsers = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await apiClient.get(`private/getAllUsers?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};


export const getUserById = async (id) => {
  try {
    const response = await apiClient.get(`private/getUserBy/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};


export const deleteUserById = async (id) => {
  try {
    const response = await apiClient.delete(`private/deleteUser/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};


export const toggleUserStatus = async (id) => {
  try {
    const response = await apiClient.put(`private/toggleStatus/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw error;
  }
};

export const toggleCardVerification = async (id) => {
  try {
    const response = await apiClient.put(`private/verifiedCard/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw error;
  }
};



export const getAllPermissions = async () => {
  try {
    const response = await apiClient.get("private/getAllPermision");
    return response.data;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
};


export const createRole = async (data) => {
  try {
    const response = await apiClient.post("private/createRole", data);
    return response.data;
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};


export const getAllRoles = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await apiClient.get(`private/getAllRoles?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};


export const getRoleById = async (id) => {
  try {
    const response = await apiClient.get(`private/getRolesBy/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching role by id:", error);
    throw error;
  }
};

export const updateRole = async (id, data) => {
  try {
    const response = await apiClient.put(`private/updateRole/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
};


export const deleteRole = async (id) => {
  try {
    const response = await apiClient.delete(`private/deleteRole/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};



export const getAllAdmins = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await apiClient.get(
      `private/getAllAdmin?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};


export const deleteAdmin = async (id) => {
  try {
    const response = await apiClient.delete(`private/adminDelete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
};


export const createAdmin = async (adminData) => {
  try {
    const response = await apiClient.post("private/create", adminData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};

export const updateAdmin = async (id, adminData) => {
  try {
    const response = await apiClient.put(`private/updateAdmindetail/${id}`, adminData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  }
};


export const getAdminById = async (id) => {
  try {
    const response = await apiClient.get(`private/adminDetail/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin:", error);
    throw error;
  }
};

export const getAdminWithRoleAPI = async () => {
  try {
    const response = await apiClient.get(`private/getAdminRoles`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin with role:", error);
    throw error;
  }
};

export const getDatePlanWithDetailAPI = async ({ page = 1, limit = 10, search = "" }) => {
  try {
    const response = await apiClient.get(`private/getAllDatePlan`, {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching date plans with details:", error);
    throw error;
  }
};

export const getSwipesAPI = async ({ id, page = 1, limit = 10, direction, search = "" }) => {
  try {

    const params = { page, limit, direction, search };


    const response = await apiClient.get(`private/getUsersSwipes/${id}`, {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching swipes:", error);
    throw error;
  }
};

export const handleUserReport = async (id) => {
  try {
    const response = await apiClient.post(`private/reportAction/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error handling report:", error);
    throw error;
  }
};

export const getAllReports = async ({ page = 1, limit = 10, search = "" }) => {
  try {
    const params = { page, limit, search };
    const response = await apiClient.get("private/getAllReports", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};


export const deleteReport = async (id) => {
  try {
    const response = await apiClient.delete(`private/deleteReport/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};

export const rejectReport = async (id) => {
  try {
    const response = await apiClient.patch(`private/rejectedReport/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error rejecting report:", error);
    throw error;
  }
};

export const getReportById = async (id) => {
  try {
    const response = await apiClient.get(`private/getReportBy/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report by ID:", error);
    throw error;
  }
};

export const getCallSchedulesAPI = async ({ id, page = 1, limit = 10, search = "" }) => {
  try {
    const params = { page, limit, search };

    const response = await apiClient.get(`private/getCallSchedules/${id}`, {
      params,
    });
    console.log(response, "response in api");

    return response.data;


  } catch (error) {
    console.error("Error fetching call schedules:", error);
    throw error;
  }
};


export const createExploreAPI = async (formData) => {
  try {
    const response = await apiClient.post(
      "private/createExplore",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating explore:", error);
    throw error;
  }
};

export const getExploresAPI = async ({ page = 1, pageSize = 10, search = "" }) => {
  try {
    const params = { page, pageSize, search };
    const response = await apiClient.get("private/getExplores", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching explores:", error);
    throw error;
  }
};

export const getExploreByIdAPI = async (uuid) => {
  try {
    const response = await apiClient.get(`private/getExplores/${uuid}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching explore by id:", error);
    throw error;
  }
};

export const updateExploreAPI = async (uuid, formData) => {
  try {
    const response = await apiClient.put(
      `private/updateExplore/${uuid}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating explore:", error);
    throw error;
  }
};

export const deleteExploreAPI = async (uuid) => {
  try {
    const response = await apiClient.delete(`private/deleteExplore/${uuid}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting explore:", error);
    throw error;
  }
};




// 📈 Active Users Growth (monthly/weekly)
export const getActiveUsersGrowth = async (period = "monthly") => {
  try {
    const response = await apiClient.get("/private/dashboard/activeUsersGrowth", {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching active users growth:", error);
    throw error;
  }
};

// 💕 New Matches by Month
export const getNewMatches = async () => {
  try {
    const response = await apiClient.get("/private/dashboard/newMatches");
    return response.data;
  } catch (error) {
    console.error("Error fetching new matches:", error);
    throw error;
  }
};

// ⚡ Recent User Activity (latest 5 users)
export const getRecentUserActivity = async () => {
  try {
    const response = await apiClient.get("/private/dashboard/recentUserActivity");
    return response.data;
  } catch (error) {
    console.error("Error fetching recent user activity:", error);
    throw error;
  }
};

export const getUserReligionDistribution = async () => {
  try {
    const response = await apiClient.get("/private/dashboard/userReligionDistribution");
    return response.data;
  } catch (error) {
    console.error("Error fetching religion distribution:", error);
    throw error;
  }
};

export const saveAppContent = async (payload) => {
  try {
    const response = await apiClient.post(`private/savePrivacyPolicy`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving privacy policy:", error);
    throw error;
  }
};


export const getPrivacyPolicys = async () => {
  try {
    const response = await apiClient.get("/private/getPrivacyPolicys");
    return response.data;

  } catch (error) {
    console.error("Error fetching new matches:", error);
    throw error;
  }
};