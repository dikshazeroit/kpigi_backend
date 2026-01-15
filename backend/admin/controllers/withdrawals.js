import WithdrawalModel from "../../application/model/WithdrawalModel.js";
import UserModel from "../../application/model/UserModel.js";
import { sendMail } from "../../middleware/MailSenderReport.js";
import UserDevice from "../../application/model/UserDeviceModel.js";
import newModelObj from "../../application/model/CommonModel.js";
import { v4 as uuidv4 } from "uuid";
import NotificationModel from "../../application/model/NotificationModel.js";

export const getAllwithdrawal = async (req, res) => {
  try {
    const withdrawals = await WithdrawalModel.find()
      .sort({ createdAt: -1 })
      .lean();

    const payload = [];

    for (const w of withdrawals) {
      let user = null;

      try {
        user = await UserModel.findOne(
          { uc_uuid: w.w_fk_uc_uuid },
          "uc_email uc_full_name uc_phone uc_country_code uc_role"
        ).lean();
      } catch (err) {

      }

      payload.push({
        ...w,
        user: user || null,
      });
    }

    res.status(200).json({
      status: true,
      message: "Withdrawal requests fetched successfully",
      payload,
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const approveWithdrawal = async (req, res) => {
  const { w_uuid } = req.body;

  if (!w_uuid) {
    return res.status(400).json({ status: false, message: "Withdrawal UUID is required" });
  }

  try {
    // Find the withdrawal
    const withdrawal = await WithdrawalModel.findOne({ w_uuid });
    if (!withdrawal) {
      return res.status(404).json({ status: false, message: "Withdrawal not found" });
    }

    // Find the user
    const user = await UserModel.findOne({ uc_uuid: withdrawal.w_fk_uc_uuid });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Update withdrawal status
    withdrawal.w_status = "COMPLETED";
    await withdrawal.save();

    // ===== SEND APPROVAL EMAIL (UNCHANGED) =====
    if (user.uc_email) {
      const subject = "Withdrawal Request Approved";
      const text = `Hello ${user.uc_full_name || ""},

Your withdrawal request of ₹${withdrawal.w_amount} has been approved and completed successfully.

Thank you!`;

      try {
        await sendMail(user.uc_email, subject, text);
      } catch (emailError) {
        console.error("Error sending approval email:", emailError);
      }
    }

    // ===== PUSH NOTIFICATION (NEW) =====
    try {
      const userId = user.uc_uuid;

      const receiverDevices = await UserDevice.find({
        ud_fk_uc_uuid: userId,
        ud_device_fcmToken: { $exists: true, $ne: "" }
      }).select("ud_device_fcmToken");

      const tokens = receiverDevices.map(d => d.ud_device_fcmToken).filter(Boolean);

      if (tokens.length > 0) {
        const title = "💰 Withdrawal Approved";
        const body = `Your withdrawal of ₹${withdrawal.w_amount} has been approved successfully.`;

       // ✅ Save notification (MODEL MATCHED)
        await NotificationModel.create({
          n_uuid: uuidv4(),
          n_fk_uc_uuid: user.uc_uuid,
          n_title: title,
          n_body: body,
          n_payload: {
            type: "WITHDRAWAL_APPROVED",
            withdrawalId: withdrawal.w_uuid,
            amount: withdrawal.w_amount
          },
          n_channel: "push"
        });

        // ✅ Send push
        await newModelObj.sendNotificationToUser({
          userId: user.uc_uuid,
          title,
          body,
          tokens,
          data: {
            type: "WITHDRAWAL_APPROVED",
            withdrawalId: String(withdrawal.w_uuid)
          }
        });
      }
    } catch (pushErr) {
      console.error("⚠️ Push notification error (approve withdrawal):", pushErr);
    }

    return res.status(200).json({
      status: true,
      message: "Withdrawal approved successfully",
      payload: withdrawal,
    });

  } catch (error) {
    console.error("Error approving withdrawal:", error);
    return res.status(500).json({
      status: false,
      message: "Error approving withdrawal",
      error: error.message,
    });
  }
};


export const rejectWithdrawal = async (req, res) => {
  const { w_uuid, reason } = req.body;

  if (!w_uuid) {
    return res.status(400).json({ status: false, message: "Withdrawal UUID is required" });
  }

  try {
    const withdrawal = await WithdrawalModel.findOne({ w_uuid });
    if (!withdrawal) {
      return res.status(404).json({ status: false, message: "Withdrawal not found" });
    }

    const user = await UserModel.findOne({ uc_uuid: withdrawal.w_fk_uc_uuid });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Refund amount
    user.uc_balance = (user.uc_balance || 0) + (withdrawal.w_amount || 0);
    await user.save();

    // Update withdrawal status
    withdrawal.w_status = "REJECTED";
    withdrawal.w_admin_note = reason || "";
    await withdrawal.save();

    // ===== SEND REJECTION EMAIL (UNCHANGED) =====
    if (user.uc_email) {
      const subject = "Withdrawal Request Rejected";
      const text = `Hello ${user.uc_full_name || ""},

Your withdrawal request of ₹${withdrawal.w_amount} has been rejected.
Reason: ${reason || "No reason provided"}

The amount has been refunded to your account balance.`;

      try {
        await sendMail(user.uc_email, subject, text);
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError);
      }
    }

    // ===== PUSH NOTIFICATION (NEW) =====
    try {
      const userId = user.uc_uuid;

      const receiverDevices = await UserDevice.find({
        ud_fk_uc_uuid: userId,
        ud_device_fcmToken: { $exists: true, $ne: "" }
      }).select("ud_device_fcmToken");

      const tokens = receiverDevices.map(d => d.ud_device_fcmToken).filter(Boolean);

      if (tokens.length > 0) {
        const title = "❌ Withdrawal Rejected";
        const body = `Your withdrawal of ₹${withdrawal.w_amount} was rejected. Amount refunded to wallet.`;

         // ✅ Save notification
        await NotificationModel.create({
          n_uuid: uuidv4(),
          n_fk_uc_uuid: user.uc_uuid,
          n_title: title,
          n_body: body,
          n_payload: {
            type: "WITHDRAWAL_REJECTED",
            withdrawalId: withdrawal.w_uuid,
            amount: withdrawal.w_amount,
            reason: reason || ""
          },
          n_channel: "push"
        });

        // ✅ Send push
        await newModelObj.sendNotificationToUser({
          userId: user.uc_uuid,
          title,
          body,
          tokens,
          data: {
            type: "WITHDRAWAL_REJECTED",
            withdrawalId: String(withdrawal.w_uuid)
          }
        });
      }
    } catch (pushErr) {
      console.error("⚠️ Push notification error (reject withdrawal):", pushErr);
    }

    return res.status(200).json({
      status: true,
      message: "Withdrawal rejected and amount refunded successfully",
      payload: withdrawal,
    });

  } catch (error) {
    console.error("Error rejecting withdrawal:", error);
    return res.status(500).json({
      status: false,
      message: "Error rejecting withdrawal",
      error: error.message,
    });
  }
};




