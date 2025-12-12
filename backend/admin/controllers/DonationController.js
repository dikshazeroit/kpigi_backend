import Donation from "../../application/model/DonationModel.js";
import FundModel from "../../application/model/FundModel.js";
import UserModel from "../../application/model/UserModel.js";

export const getAllDonations = async (req, res) => {
  try {
    console.log("\n================= 🟦 DONATION API HIT =================");
    console.log("Incoming Query Params:", req.query);

    let {
      page = 1,
      limit = 20,
      user_uuid = "",
      fund_uuid = "",
      min_amount = 0,
      max_amount = 9999999,
      status = "",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

   

    console.log("Parsed Values:", {
      page,
      limit,
      user_uuid,
      fund_uuid,
      min_amount,
      max_amount,
      status
    });

  min_amount = min_amount === "" ? 0 : Number(min_amount);
max_amount = max_amount === "" ? 999999999 : Number(max_amount);

const query = {
  d_amount: { $gte: min_amount, $lte: max_amount }
};

    if (user_uuid) query.d_fk_uc_uuid = user_uuid;
    if (fund_uuid) query.d_fk_f_uuid = fund_uuid;
    if (status) query.d_status = status;

    console.log("Final MongoDB Query:", query);

    const total = await Donation.countDocuments(query);
    console.log("Total Donations Found:", total);

    let data = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    console.log("Donations Fetched:", data.length);

    // JOIN USER + FUND DETAILS
    for (let i = 0; i < data.length; i++) {
      const user = await UserModel.findOne(
        { uc_uuid: data[i].d_fk_uc_uuid },
        { uc_full_name: 1, uc_email: 1 }
      );

      const fund = await FundModel.findOne(
        { f_uuid: data[i].d_fk_f_uuid },
        { f_title: 1 }
      );

      data[i].donor = user || null;
      data[i].fundraiser = fund || null;
    }

    console.log("Final Data After Join:", data);

    console.log("================= 🟩 RESPONSE SENT =================\n");

    return res.json({
      status: true,
      message: "Donations fetched",
      payload: data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });

  } catch (err) {
    console.log("❌ ERROR IN DONATION API:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};


export const markDonationSafe = async (req, res) => {
  try {
    const { d_uuid } = req.body;

    const donation = await Donation.findOneAndUpdate(
      { d_uuid },
      { $set: { d_status: "SUCCESS" } },   // FIXED
      { new: true }                        // IMPORTANT
    );

    if (!donation)
      return res.status(404).json({ status: false, message: "Donation not found" });

    return res.json({
      status: true,
      message: "Donation marked as safe",
      updated: donation
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

export const markDonationFraud = async (req, res) => {
  try {
    const { d_uuid, reason } = req.body;

    const donation = await Donation.findOneAndUpdate(
      { d_uuid },
      { 
        $set: { 
          d_status: "FAILED",
          "d_meta.fraud_reason": reason    // FIXED
        }
      },
      { new: true }                        // IMPORTANT
    );

    if (!donation)
      return res.status(404).json({ status: false, message: "Donation not found" });

    return res.json({
      status: true,
      message: "Donation marked as fraud",
      updated: donation
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

