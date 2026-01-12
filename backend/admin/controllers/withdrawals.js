import WithdrawalModel from "../../application/model/WithdrawalModel.js";
import UserModel from "../../application/model/UserModel.js";

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
  try {
    const withdrawal = await WithdrawalModel.findOne({ w_uuid });
    if (!withdrawal) {
      return res.status(404).json({ status: false, message: "Withdrawal not found" });
    }

    withdrawal.w_status = "COMPLETED";
    await withdrawal.save();

    res.status(200).json({
      status: true,
      message: "Withdrawal approved successfully",
      payload: withdrawal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Error approving withdrawal",
      error: error.message,
    });
  }
};


export const rejectWithdrawal = async (req, res) => {
  const { w_uuid, reason } = req.body;

  if (!w_uuid) {
    return res.status(400).json({
      status: false,
      message: "Withdrawal UUID is required",
    });
  }

  try {
    // Find the withdrawal request by UUID
    const withdrawal = await WithdrawalModel.findOne({ w_uuid });
    if (!withdrawal) {
      return res.status(404).json({
        status: false,
        message: "Withdrawal not found",
      });
    }

    //  Find the user by UUID (avoid ObjectId casting)
    const user = await UserModel.findOne({ uc_uuid: withdrawal.w_fk_uc_uuid });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    //  Refund the withdrawal amount to user balance
    user.uc_balance = (user.uc_balance || 0) + (withdrawal.w_amount || 0);
    await user.save();

    // Mark withdrawal as REJECTED and add admin note
    withdrawal.w_status = "REJECTED";
    withdrawal.w_admin_note = reason || "";
    await withdrawal.save();

    // Send success response
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




