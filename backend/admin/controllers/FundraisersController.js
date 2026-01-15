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
        f_approved_at: new Date(), // store UTC
      },
      { new: true }
    );

    if (!fundraiser) {
      return res.status(404).json({
        status: false,
        message: "Fundraiser not found",
      });
    }

    // 2️⃣ Fetch user email (UNCHANGED)
    let userEmail = null;

    if (fundraiser.f_fk_uc_uuid) {
      const user = await UsersCredentialsModel.findOne({
        uc_uuid: fundraiser.f_fk_uc_uuid,
      });

      if (user && user.uc_email) {
        userEmail = user.uc_email;
      }
    }

    // 3️⃣ Send approval email (TEXT UNCHANGED, DATE ONLY)
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

You can now start receiving donations.

Team KPIGI`
        );
      } catch (emailError) {
        console.error("❌ Failed to send approval email:", emailError);
      }
    }

    // 4️⃣ Push Notification (NO DATE)
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
          "Your fundraiser has been successfully created and is now visible to users after admin approval.";

        // Save notification
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

        // Send push
        await newModelObj.sendNotificationToUser({
          userId: userId,
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

    // 1️⃣ Update fundraiser
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

    // 2️⃣ Fetch user email (UNCHANGED)
    let userEmail = null;

    if (fundraiser.f_fk_uc_uuid) {
      const user = await UsersCredentialsModel.findOne({
        uc_uuid: fundraiser.f_fk_uc_uuid,
      });

      if (user && user.uc_email) {
        userEmail = user.uc_email;
      } else {
        console.warn(
          `User not found or email missing for uc_uuid: ${fundraiser.f_fk_uc_uuid}`
        );
      }
    }

    // 3️⃣ Send rejection email (UNCHANGED)
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

        console.log(`✅ Rejection email sent to ${userEmail}`);
      } catch (emailError) {
        console.error("❌ Failed to send rejection email:", emailError);
      }
    }

    // 4️⃣ PUSH NOTIFICATION (NEW — SAFE)
    try {
      const userId = fundraiser.f_fk_uc_uuid;

      const receiverDevices = await UserDevice.find({
        ud_fk_uc_uuid: userId,
        ud_device_fcmToken: { $exists: true, $ne: "" }
      }).select("ud_device_fcmToken");

      const tokens = receiverDevices
        .map(d => d.ud_device_fcmToken)
        .filter(Boolean);

      if (tokens.length > 0) {
        const title = "❌ Fundraiser Rejected";
        const body = `Your fundraiser "${fundraiser.f_title}" was rejected. Reason: ${reason || "Rejected by admin"}`;

        // Save notification (MODEL MATCHED)

        // Save notification
        await NotificationModel.create({
          n_uuid: uuidv4(),
          n_fk_uc_uuid: userId,
          n_title: title,
          n_body: body,
          n_payload: {
            type: "FUNDRAISER_REJECTED",
            fundId: fundraiser.f_uuid,
            reason: reason || "",
          },
          n_channel: "push",
        });

        // Send push
        await newModelObj.sendNotificationToUser({
          userId: userId,
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

    // 1️⃣ Update fundraiser status
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

    // 2️⃣ Fetch user email
    let userEmail = null;
    if (userId) {
      const user = await UsersCredentialsModel.findOne(
        { uc_uuid: userId },
        { uc_email: 1 }
      ).lean();

      if (user?.uc_email) userEmail = user.uc_email;
    }

    // 3️⃣ Send pause email
    if (userEmail) {
      try {
        await sendMail(
          userEmail,
          "Your fundraiser has been paused",
          `Hello ${fundraiser.f_name || "there"},

Your fundraiser "${fundraiser.f_title}" has been paused.

Reason: ${reason || "Paused by admin"}

Team KPIGI`
        );
      } catch (emailError) {
        console.error("❌ Failed to send pause email:", emailError);
      }
    }

    // 4️⃣ Push Notification (NO inner catch)
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
          const title = "Fundraiser Paused";
          const body = `Your fundraiser "${fundraiser.f_title}" has been paused.`;

          // Save notification
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

          // Send push (no try-catch here)
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

    //  Update fundraiser status
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

    const userId = fundraiser.f_fk_uc_uuid;

    //  Fetch user email
    let userEmail = null;
    if (userId) {
      const user = await UsersCredentialsModel.findOne(
        { uc_uuid: userId },
        { uc_email: 1 }
      ).lean();

      if (user?.uc_email) userEmail = user.uc_email;
    }

    //  Send close email
    if (userEmail) {
      try {
        await sendMail(
          userEmail,
          "Your fundraiser has been closed",
          `Hello ${fundraiser.f_name || "there"},

Your fundraiser "${fundraiser.f_title}" has been closed.

Reason: ${reason || "Closed by admin"}

Team KPIGI`
        );
      } catch (emailError) {
        console.error("❌ Failed to send close email:", emailError);
      }
    }

    //  Push Notification (NO inner catch)
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
          const title = "Fundraiser Paused";
          const body = `Your fundraiser "${fundraiser.f_title}" has been paused.`;

          // Save notification
          await NotificationModel.create({
            n_uuid: uuidv4(),
            n_fk_uc_uuid: userId,
            n_title: title,
            n_body: body,
            n_payload: {
              type: "FUNDRAISER_REJECTED",
              fundId: fundraiser.f_uuid,
              reason: reason || "Closed by admin",
            },
            n_channel: "push",
          });

          // Send push (no try-catch here)
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