// controllers/admin/adminFundraiser.controller.js

import FundModel from "../../application/model/FundModel.js";
import SecurityReportModel from "../../application/model/SecurityReportModel.js";
import UsersCredentialsModel from "../../application/model/UserModel.js";
import { sendMail } from "../../middleware/MailSenderReport.js";

export const getAllFundraisers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", status = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    if (search) {
      query.f_title = { $regex: search, $options: "i" };
    }

    if (status && status !== "FLAGGED") {
      query.f_status = status;
    }

    const total = await FundModel.countDocuments(query);

    let data = await FundModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // ---------------------------------------
    // FETCH ALL USERS IN ONE SINGLE QUERY
    // ---------------------------------------
    const userIds = data.map((f) => f.f_fk_uc_uuid);

    const users = await UsersCredentialsModel.find(
      { uc_uuid: { $in: userIds } },
      { uc_uuid: 1, uc_full_name: 1 }
    ).lean();

    const userMap = {};
    users.forEach((u) => {
      userMap[u.uc_uuid] = u.uc_full_name;
    });

    // ADD FLAGGED COUNTS + USER NAME
    for (let i = 0; i < data.length; i++) {
      // Add user name
      data[i].userName = userMap[data[i].f_fk_uc_uuid] || "Unknown User";

      // Add flagged count
      const flaggedCount = await SecurityReportModel.countDocuments({
        sr_fund_uuid: data[i].f_uuid,
        sr_status: "PENDING",
      });

      data[i].flagged = flaggedCount > 0;
      data[i].fraudReports = flaggedCount;
    }

    if (status === "FLAGGED") {
      data = data.filter((f) => f.flagged === true);
    }

    return res.json({
      status: true,
      message: "Fundraisers fetched",
      payload: data,
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


export const approveFundraiser = async (req, res) => {
  try {
    const { fund_uuid } = req.body;
    if (!fund_uuid)
      return res.status(400).json({ status: false, message: "fund_uuid is required" });

    
    const fundraiser = await FundModel.findOneAndUpdate(
      { f_uuid: fund_uuid },
      { 
        f_status: "ACTIVE",
        f_approved_at: new Date() 
      },
      { new: true }
    );

    if (!fundraiser)
      return res.status(404).json({ status: false, message: "Fundraiser not found" });

    // Send approval email
    if (fundraiser.f_email) {
      const approvalTime = new Date().toLocaleString(); 
      
      await sendMail({
        to: fundraiser.f_email,
        subject: "Your fundraiser is approved",
        text: `Hello ${fundraiser.f_name || "there"},\n\nYour fundraiser "${fundraiser.f_title}" has been approved and is now ACTIVE.\n\nApproval Date & Time: ${approvalTime}\n\nTeam`,
      });
    }

    return res.json({ status: true, message: "Fundraiser approved successfully" });
  } catch (err) {
    console.error("Approve fundraiser error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};


// REJECT
export const rejectFundraiser = async (req, res) => {
  try {
    const { fund_uuid, reason } = req.body;
    if (!fund_uuid)
      return res.status(400).json({ status: false, message: "fund_uuid is required" });

    const fundraiser = await FundModel.findOneAndUpdate(
      { f_uuid: fund_uuid },
      {
        f_status: "REJECTED",
        f_pause_reason: reason || "Rejected by admin",
      },
      { new: true }
    );

    if (!fundraiser)
      return res.status(404).json({ status: false, message: "Fundraiser not found" });

    // ================= SEND REJECTION EMAIL =================
    if (fundraiser.f_email) {
      try {
        console.log(
          `Sending rejection email to ${fundraiser.f_email} for fundraiser "${fundraiser.f_title}" with reason: ${reason}`
        );

        await sendMail({
          to: fundraiser.f_email,
          subject: "Your fundraiser has been rejected",
          text: `Hello ${fundraiser.f_name || "there"},\n\nYour fundraiser "${fundraiser.f_title
            }" has been rejected.\nReason: ${reason || "Rejected by admin"}\n\nTeam`,
        });

        console.log("Rejection email sent successfully");
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }
    } else {
      console.warn("No email found for this fundraiser, skipping email");
    }

    return res.json({ status: true, message: "Fundraiser rejected successfully" });
  } catch (err) {
    console.error("Reject fundraiser error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};




// PAUSE
export const pauseFundraiser = async (req, res) => {
  try {
    const { fund_uuid, reason } = req.body;

    await FundModel.findOneAndUpdate(
      { f_uuid: fund_uuid },
      { f_status: "PAUSED", f_pause_reason: reason || "Paused by admin" }
    );

    return res.json({ status: true, message: "Fundraiser paused" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};



// RESUME
export const resumeFundraiser = async (req, res) => {
  try {
    const { fund_uuid } = req.body;

    await FundModel.findOneAndUpdate(
      { f_uuid: fund_uuid },
      { f_status: "ACTIVE", f_pause_reason: null }
    );

    return res.json({ status: true, message: "Fundraiser resumed" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};



// EDIT
export const editFundraiser = async (req, res) => {
  try {
    const { fund_uuid, title, amount, deadline } = req.body;

    await FundModel.findOneAndUpdate(
      { f_uuid: fund_uuid },
      {
        f_title: title,
        f_amount: amount,
        f_deadline: deadline,
      }
    );

    return res.json({ status: true, message: "Fundraiser updated" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
