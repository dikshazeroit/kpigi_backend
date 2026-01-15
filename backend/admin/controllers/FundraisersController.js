// controllers/admin/adminFundraiser.controller.js

import FundModel from "../../application/model/FundModel.js";
import SecurityReportModel from "../../application/model/SecurityReportModel.js";
import UsersCredentialsModel from "../../application/model/UserModel.js";
import { sendMail } from "../../middleware/MailSenderReport.js";
import UserModel from "../../application/model/UserModel.js";

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

    // Fetch full user details instead of just name
    const users = await UsersCredentialsModel.find(
      { uc_uuid: { $in: userIds } }
    ).lean();

    const userMap = {};
    users.forEach((u) => {
      userMap[u.uc_uuid] = u; // store full user object
    });

    // ADD FLAGGED COUNTS + USER DETAILS
    for (let i = 0; i < data.length; i++) {
      // Add full user details
      data[i].user = userMap[data[i].f_fk_uc_uuid] || null;

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


// APPROVE
export const approveFundraiser = async (req, res) => {
  try {
    const { fund_uuid } = req.body;

    if (!fund_uuid) {
      return res.status(400).json({
        status: false,
        message: "fund_uuid is required",
      });
    }

    //  Update fundraiser status
    const fundraiser = await FundModel.findOneAndUpdate(
      { f_uuid: fund_uuid },
      {
        f_status: "ACTIVE",
        f_approved_at: new Date(),
      },
      { new: true }
    );

    if (!fundraiser) {
      return res.status(404).json({
        status: false,
        message: "Fundraiser not found",
      });
    }

    //  Fetch user email
    let userEmail = null;

    if (fundraiser.f_fk_uc_uuid) {
      const user = await UserModel.findOne({
        uc_uuid: fundraiser.f_fk_uc_uuid,
      });

      if (user && user.uc_email) {
        userEmail = user.uc_email;
      } else {
        console.warn(
          `User not found or email missing for uc_uuid: ${fundraiser.f_fk_uc_uuid}`
        );
      }
    } else {
      console.warn(`Fundraiser ${fundraiser.f_uuid} has no linked user`);
    }

    //  Send approval email
    if (userEmail) {
      try {
        const approvalTime = new Date().toLocaleString();

        await sendMail(
          userEmail,
          "Your fundraiser has been approved ",
          `Hello ${fundraiser.f_name || "there"},

Great news! Your fundraiser "${fundraiser.f_title}" has been approved and is now ACTIVE.

Approval Date & Time: ${approvalTime}

You can now start receiving donations.

Team KPIGI`
        );

        console.log(` Approval email sent to ${userEmail}`);
      } catch (emailError) {
        console.error(" Failed to send approval email:", emailError);
      }
    } else {

    }

    return res.json({
      status: true,
      message: "Fundraiser approved successfully",
    });

  } catch (err) {
    console.error("Approve fundraiser error:", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};







// REJECT
export const rejectFundraiser = async (req, res) => {
  try {
    const { fund_uuid, reason } = req.body;

    if (!fund_uuid) {
      return res.status(400).json({
        status: false,
        message: "fund_uuid is required",
      });
    }

    //  Find & update fundraiser
    const fundraiser = await FundModel.findOneAndUpdate(
      { f_uuid: fund_uuid },
      {
        f_status: "REJECTED",
        f_pause_reason: reason || "Rejected by admin",
      },
      { new: true }
    );

    if (!fundraiser) {
      return res.status(404).json({
        status: false,
        message: "Fundraiser not found",
      });
    }

    //  Fetch user email
    let userEmail = null;

    if (fundraiser.f_fk_uc_uuid) {
      const user = await UserModel.findOne({
        uc_uuid: fundraiser.f_fk_uc_uuid,
      });

      if (user && user.uc_email) {
        userEmail = user.uc_email;
      } else {
        console.warn(
          `User not found or email missing for uc_uuid: ${fundraiser.f_fk_uc_uuid}`
        );
      }
    } else {
      console.warn(`Fundraiser ${fundraiser.f_uuid} has no linked user`);
    }


    if (userEmail) {
      try {
        await sendMail(
          userEmail,
          "Your fundraiser has been rejected",
          `Hello ${fundraiser.f_name || "there"},

Your fundraiser "${fundraiser.f_title}" has been rejected.

Reason: ${reason || "Rejected by admin"}

Team KPIGI`
        );


      } catch (emailError) {
        console.error(" Failed to send rejection email:", emailError);
      }
    } else {

    }

    return res.json({
      status: true,
      message: "Fundraiser rejected successfully",
    });

  } catch (err) {
    console.error("Reject fundraiser error:", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
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
