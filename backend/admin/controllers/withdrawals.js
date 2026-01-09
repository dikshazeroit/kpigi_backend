import WithdrawalModel from "../../application/model/WithdrawalModel.js";
import UserModel from "../../application/model/UserModel.js"; 

export const getAllwithdrawal = async (req, res) => {
  try {
    const withdrawals = await WithdrawalModel.find().sort({ createdAt: -1 });

    if (!withdrawals || withdrawals.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No withdrawal requests found",
        payload: [],
      });
    }

    res.status(200).json({
      status: true,
      message: "Withdrawal requests fetched successfully",
      payload: withdrawals,
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({
      status: false,
      message: "Something went wrong while fetching withdrawals",
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




