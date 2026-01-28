import User from "../../application/model/UserModel.js";
import Fund from "../../application/model/FundModel.js";
import Donation from "../../application/model/DonationModel.js";

/**
 * Dashboard Summary
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalUsers,
      totalFunds,
      activeFunds,
      pendingPayouts,
    ] = await Promise.all([
      User.countDocuments(),
      Fund.countDocuments(),
      Fund.countDocuments({ f_status: "ACTIVE" }),
      Payout.countDocuments({ p_status: "PENDING" }),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalFunds,
        activeFunds,
        pendingPayouts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Stats (Today / Weekly / Monthly)
 */
export const getDashboardStats = async (req, res) => {
  try {
    const donations = await Donation.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          total: { $sum: "$d_amount" },
        },
      },
    ]);

    return res.json({
      success: true,
      data: donations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Recent Activities
 */
export const getRecentActivities = async (req, res) => {
  try {
    const activities = await Fund.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("f_title f_status createdAt");

    return res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
