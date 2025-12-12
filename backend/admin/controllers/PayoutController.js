import Payout from "../../application/model/PayoutModel.js";
import UsersCredentialsModel from '../../application/model/UserModel.js';

export const getAllPayouts = async (req, res) => {
  try {
    let { page = 1, limit = 20, user_uuid = "", status = "", search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};
    if (user_uuid) query.p_fk_uc_uuid = user_uuid;
    if (status) query.p_status = status;

    // Fetch payouts with pagination
    let payouts = await Payout.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get all unique user UUIDs from payouts
    const userUuids = payouts.map((p) => p.p_fk_uc_uuid);

    // Fetch users for these UUIDs
    const users = await UsersCredentialsModel.find({ uc_uuid: { $in: userUuids } })
      .select("uc_uuid uc_full_name")
      .lean();

    // Map UUID to full name
    const userMap = {};
    users.forEach((u) => {
      userMap[u.uc_uuid] = u.uc_full_name;
    });

    // Attach userName to payouts
    payouts = payouts.map((p) => ({
      ...p,
      userName: userMap[p.p_fk_uc_uuid] || null,
    }));

    // Filter by search term if provided
    if (search) {
      const lowerSearch = search.toLowerCase();
      payouts = payouts.filter(
        (p) => p.userName && p.userName.toLowerCase().includes(lowerSearch)
      );
    }

    const total = await Payout.countDocuments(query); // for pagination

    return res.json({
      status: true,
      message: "Payouts fetched",
      payload: payouts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};


export const approvePayout = async (req, res) => {
  try {
    const { p_uuid } = req.body;

    const payout = await Payout.findOneAndUpdate(
      { p_uuid },
      { p_status: "SENT" }
    );

    if (!payout)
      return res.status(404).json({ status: false, message: "Payout not found" });

    return res.json({
      status: true,
      message: "Payout approved",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
export const rejectPayout = async (req, res) => {
  try {
    const { p_uuid, reason } = req.body;

    const payout = await Payout.findOneAndUpdate(
      { p_uuid },
      { p_status: "FAILED", "p_meta.reason": reason }
    );

    if (!payout)
      return res.status(404).json({ status: false, message: "Payout not found" });

    return res.json({
      status: true,
      message: "Payout rejected",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
export const updatePayoutStatus = async (req, res) => {
  try {
    const { p_uuid, status } = req.body;

    const payout = await Payout.findOneAndUpdate(
      { p_uuid },
      { p_status: status }
    );

    if (!payout)
      return res.status(404).json({ status: false, message: "Payout not found" });

    return res.json({
      status: true,
      message: "Payout status updated",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
