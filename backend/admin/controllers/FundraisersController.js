// controllers/admin/adminFundraiser.controller.js

import FundModel from "../../application/model/FundModel.js";
import SecurityReportModel from "../../application/model/SecurityReportModel.js";
import UsersCredentialsModel from "../../application/model/UserModel.js";
import UserDevice from "../../application/model/UserDeviceModel.js";
import { sendMail } from "../../middleware/MailSenderReport.js";
import newModelObj from "../../application/model/CommonModel.js";
import { v4 as uuidv4 } from "uuid";
import NotificationModel from "../../application/model/NotificationModel.js";

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

    if (!fund_uuid) {
      return res.status(400).json({
        status: false,
        message: "fund_uuid is required",
      });
    }

    // 1️⃣ Update fundraiser status
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

    // 2️⃣ Fetch user email
    let userEmail = null;
    if (fundraiser.f_fk_uc_uuid) {
      const user = await UsersCredentialsModel.findOne({
        uc_uuid: fundraiser.f_fk_uc_uuid,
      });
      if (user?.uc_email) userEmail = user.uc_email;
    }

    // 3️⃣ Send approval email (TEXT FIXED)
    if (userEmail) {
      try {
        const approvalDate = new Date(
          fundraiser.f_approved_at
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        });

        await sendMail(
          userEmail,
          "Your fundraiser has been approved",
          `Hello ${fundraiser.f_name || "there"},

Great news! Your fundraiser "${fundraiser.f_title}" has been approved and is now ACTIVE.

Approval Date: ${approvalDate}

You can now start receiving support from users.

Team KPIGI`
        );
      } catch (emailError) {
        console.error("❌ Failed to send approval email:", emailError);
      }
    }

    // 4️⃣ Push Notification (TEXT FIXED)
    try {
      const userId = fundraiser.f_fk_uc_uuid;

      const receiverDevices = await UserDevice.find({
        ud_fk_uc_uuid: userId,
        ud_device_fcmToken: { $exists: true, $ne: "" },
      }).select("ud_device_fcmToken");

      const tokens = receiverDevices
        .map(d => d.ud_device_fcmToken)
        .filter(Boolean);

      if (tokens.length > 0) {
        const title = "🎉 Fundraiser Approved";
        const body =
          "Your fundraiser is now active and visible to users. You can start receiving support.";

        await NotificationModel.create({
          n_uuid: uuidv4(),
          n_fk_uc_uuid: userId,
          n_title: title,
          n_body: body,
          n_payload: {
            type: "FUNDRAISER_APPROVED",
            fundId: fundraiser.f_uuid,
          },
          n_channel: "push",
        });

        await newModelObj.sendNotificationToUser({
          userId,
          title,
          body,
          tokens,
          data: {
            type: "FUNDRAISER_APPROVED",
            fundId: String(fundraiser.f_uuid),
          },
        });
      }
    } catch (pushErr) {
      console.error("⚠️ Push notification error:", pushErr);
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






export const rejectFundraiser = async (req, res) => {
  try {
    const { fund_uuid, reason } = req.body;

    if (!fund_uuid) {
      return res.status(400).json({
        status: false,
        message: "fund_uuid is required",
      });
    }

    const finalReason =
      reason ||
      "Support feature is currently unavailable due to review requirements.";

    // 1️⃣ Update fundraiser
    const fundraiser = await FundModel.findOneAndUpdate(
      { f_uuid: fund_uuid },
      {
        f_status: "REJECTED",
        f_pause_reason: finalReason,
      },
      { new: true }
    );

    if (!fundraiser) {
      return res.status(404).json({
        status: false,
        message: "Fundraiser not found",
      });
    }

    // 2️⃣ Fetch user email
    let userEmail = null;
    if (fundraiser.f_fk_uc_uuid) {
      const user = await UsersCredentialsModel.findOne({
        uc_uuid: fundraiser.f_fk_uc_uuid,
      });
      if (user?.uc_email) userEmail = user.uc_email;
    }

    // 3️⃣ Send rejection email (TEXT FIXED)
    if (userEmail) {
      try {
        await sendMail(
          userEmail,
          "Your fundraiser is temporarily unavailable",
          `Hello ${fundraiser.f_name || "there"},

Thank you for creating a fundraiser on KPIGI.

Your fundraiser "${fundraiser.f_title}" is temporarily unavailable because the support feature is currently under review requirements.

This is not a permanent rejection. You will be able to resubmit your fundraiser once the support functionality is enabled.

Team KPIGI`
        );
      } catch (emailError) {
        console.error("❌ Failed to send rejection email:", emailError);
      }
    }

    // 4️⃣ Push Notification (TEXT FIXED)
    try {
      const userId = fundraiser.f_fk_uc_uuid;

      const devices = await UserDevice.find({
        ud_fk_uc_uuid: userId,
        ud_device_fcmToken: { $exists: true, $ne: "" },
      }).select("ud_device_fcmToken");

      const tokens = devices.map(d => d.ud_device_fcmToken).filter(Boolean);

      if (tokens.length > 0) {
        const title = "Fundraiser Temporarily Unavailable";
        const body =
          "Your fundraiser is temporarily unavailable due to review requirements. You can resubmit once the support feature is enabled.";

        await NotificationModel.create({
          n_uuid: uuidv4(),
          n_fk_uc_uuid: userId,
          n_title: title,
          n_body: body,
          n_payload: {
            type: "FUNDRAISER_REJECTED",
            fundId: fundraiser.f_uuid,
            reason: finalReason,
          },
          n_channel: "push",
        });

        await newModelObj.sendNotificationToUser({
          userId,
          title,
          body,
          tokens,
          data: {
            type: "FUNDRAISER_REJECTED",
            fundId: String(fundraiser.f_uuid),
          },
        });
      }
    } catch (pushErr) {
      console.error("⚠️ Push notification error (reject):", pushErr);
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








// PAUSE FUNDRAISER
export const pauseFundraiser = async (req, res) => {
  try {
    const { fund_uuid, reason } = req.body;

    if (!fund_uuid) {
      return res.status(400).json({
        status: false,
        message: "fund_uuid is required",
      });
    }

    const fundraiser = await FundModel.findOneAndUpdate(
      { f_uuid: fund_uuid },
      {
        f_status: "PAUSED",
        f_pause_reason: reason || "Paused by admin",
      },
      { new: true }
    );

    if (!fundraiser) {
      return res.status(404).json({
        status: false,
        message: "Fundraiser not found",
      });
    }

    const userId = fundraiser.f_fk_uc_uuid;

    // Email
    let userEmail = null;
    if (userId) {
      const user = await UsersCredentialsModel.findOne(
        { uc_uuid: userId },
        { uc_email: 1 }
      ).lean();
      if (user?.uc_email) userEmail = user.uc_email;
    }

    if (userEmail) {
      try {
        await sendMail(
          userEmail,
          "Your fundraiser has been paused",
          `Hello ${fundraiser.f_name || "there"},

Your fundraiser "${fundraiser.f_title}" has been temporarily paused.

Reason: ${reason || "Paused by admin"}

Once the support feature is fully enabled, you will be able to continue.

Team KPIGI`
        );
      } catch (emailError) {
        console.error("❌ Failed to send pause email:", emailError);
      }
    }

    // Push
    try {
      const devices = await UserDevice.find({
        ud_fk_uc_uuid: userId,
        ud_device_fcmToken: { $exists: true, $ne: "" },
      }).select("ud_device_fcmToken");

      const tokens = devices.map(d => d.ud_device_fcmToken).filter(Boolean);

      if (tokens.length > 0) {
        const title = "Fundraiser Paused";
        const body =
          "Your fundraiser has been temporarily paused and is not visible to users.";

        await NotificationModel.create({
          n_uuid: uuidv4(),
          n_fk_uc_uuid: userId,
          n_title: title,
          n_body: body,
          n_payload: {
            type: "FUNDRAISER_PAUSED",
            fundId: fundraiser.f_uuid,
            reason: reason || "Paused by admin",
          },
          n_channel: "push",
        });

        await newModelObj.sendNotificationToUser({
          userId,
          title,
          body,
          tokens,
          data: {
            type: "FUNDRAISER_PAUSED",
            fundId: String(fundraiser.f_uuid),
          },
        });
      }
    } catch (pushErr) {
      console.error("⚠️ Push notification error (pause):", pushErr);
    }

    return res.json({
      status: true,
      message: "Fundraiser paused successfully",
    });
  } catch (err) {
    console.error("Pause fundraiser error:", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
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







export const closeFundraisers = async (req, res) => {
  try {
    const { fund_uuid, reason } = req.body;

    if (!fund_uuid) {
      return res.status(400).json({
        status: false,
        message: "fund_uuid is required",
      });
    }

    const finalReason =
      reason ||
      "Support feature is currently unavailable due to review requirements.";

    // 1️⃣ Update fundraiser status
    const fundraiser = await FundModel.findOneAndUpdate(
      { f_uuid: fund_uuid },
      {
        f_status: "REJECTED",
        f_pause_reason: finalReason,
      },
      { new: true }
    );

    if (!fundraiser) {
      return res.status(404).json({
        status: false,
        message: "Fundraiser not found",
      });
    }

    const userId = fundraiser.f_fk_uc_uuid;

    // 2️⃣ Fetch user email
    let userEmail = null;
    if (userId) {
      const user = await UsersCredentialsModel.findOne(
        { uc_uuid: userId },
        { uc_email: 1 }
      ).lean();

      if (user?.uc_email) userEmail = user.uc_email;
    }

    // 3️⃣ Send close email (TEXT FIXED)
    if (userEmail) {
      try {
        await sendMail(
          userEmail,
          "Your fundraiser is temporarily unavailable",
          `Hello ${fundraiser.f_name || "there"},

Thank you for creating a fundraiser on KPIGI.

Your fundraiser "${fundraiser.f_title}" is temporarily unavailable because the support feature is currently under review requirements.

This is not a permanent closure. You will be able to resubmit your fundraiser once the support functionality is enabled.

Thank you for your patience and understanding.

Team KPIGI`
        );
      } catch (emailError) {
        console.error("❌ Failed to send close email:", emailError);
      }
    }

    // 4️⃣ Push Notification (TEXT FIXED)
    try {
      if (userId) {
        const devices = await UserDevice.find({
          ud_fk_uc_uuid: userId,
          ud_device_fcmToken: { $exists: true, $ne: "" },
        }).select("ud_device_fcmToken");

        const tokens = devices
          .map(d => d.ud_device_fcmToken)
          .filter(Boolean);

        if (tokens.length > 0) {
          const title = "Fundraiser Temporarily Unavailable";
          const body =
            "Your fundraiser is temporarily unavailable due to review requirements. You can resubmit once the support feature is enabled.";

          // Save notification
          await NotificationModel.create({
            n_uuid: uuidv4(),
            n_fk_uc_uuid: userId,
            n_title: title,
            n_body: body,
            n_payload: {
              type: "FUNDRAISER_CLOSED",
              fundId: fundraiser.f_uuid,
              reason: finalReason,
            },
            n_channel: "push",
          });

          // Send push
          await newModelObj.sendNotificationToUser({
            userId,
            title,
            body,
            tokens,
            data: {
              type: "FUNDRAISER_CLOSED",
              fundId: String(fundraiser.f_uuid),
            },
          });
        }
      }
    } catch (pushErr) {
      console.error("⚠️ Push notification error (close):", pushErr);
    }

    return res.json({
      status: true,
      message: "Fundraiser closed successfully",
    });

  } catch (err) {
    console.error("Close fundraiser error:", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
