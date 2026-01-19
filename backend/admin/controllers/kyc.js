import User from "../../application/model/UserModel.js";
import Kyc from "../../application/model/KycModel.js";
import { sendMail } from "../../middleware/MailSenderReport.js";
import NotificationModel from "../../application/model/NotificationModel.js";
import UserDevice from "../../application/model/UserDeviceModel.js";
import UsersCredentialsModel from "../../application/model/UserModel.js";



export const getAllUsersWithKyc = async (req, res) => {
    try {
        // get all users
        const users = await User.find({})
            .select(
                "uc_uuid uc_full_name uc_email uc_role uc_login_type uc_registeration_type uc_card_verified uc_profile_photo"
            )
            .lean();

        if (!users.length) {
            return res.status(200).json({
                success: true,
                data: [],
            });
        }

        // get all kyc
        const kycs = await Kyc.find({})
            .select(
                "kyc_uuid k_fk_uc_uuid fullName dateOfBirth address idType idImageName status createdAt"
            )
            .lean();

        //  map kyc by user uuid
        const kycMap = {};
        kycs.forEach((k) => {
            kycMap[k.k_fk_uc_uuid] = k;
        });

        // merge user + kyc
        const response = users.map((u) => ({
            ...u,
            kyc: kycMap[u.uc_uuid] || null,
        }));

        return res.status(200).json({
            success: true,
            count: response.length,
            data: response,
        });
    } catch (error) {
        console.error("getAllUsersWithKyc error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};





export const approveKyc = async (req, res) => {
    try {
        const { kyc_uuid } = req.body;

        if (!kyc_uuid) {
            return res.status(400).json({
                status: false,
                message: "kyc_uuid is required",
            });
        }

        console.log("Received kyc_uuid:", kyc_uuid);

        //  Update KYC status
        const kyc = await Kyc.findOneAndUpdate(
            { kyc_uuid: kyc_uuid.trim() },
            { status: "APPROVED", approvedAt: new Date() },
            { new: true }
        );

        if (!kyc) {
            return res.status(404).json({
                status: false,
                message: "KYC not found",
            });
        }

        // Fetch user email
        let userEmail = null;
        const userId = kyc.k_fk_uc_uuid;
        if (userId) {
            const user = await UsersCredentialsModel.findOne({ uc_uuid: userId });
            if (user?.uc_email) userEmail = user.uc_email;
        }

        // Send email
        if (userEmail) {
            try {
                const approvalDate = new Date(kyc.approvedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                });

                await sendMail(
                    userEmail,
                    "Your KYC has been approved",
                    `Hello ${kyc.fullName || "there"},

Great news! Your KYC has been approved.

Approval Date: ${approvalDate}

You can now continue using all features.

Team KPIGI`
                );
            } catch (emailError) {
                console.error("Failed to send KYC approval email:", emailError);
            }
        }

        // Push Notification
        if (userId) {
            try {
                const receiverDevices = await UserDevice.find({
                    ud_fk_uc_uuid: userId,
                    ud_device_fcmToken: { $exists: true, $ne: "" },
                }).select("ud_device_fcmToken");

                const tokens = receiverDevices.map(d => d.ud_device_fcmToken).filter(Boolean);

                if (tokens.length > 0) {
                    const title = "KYC Approved";
                    const body = "Your KYC has been approved successfully.";

                    await NotificationModel.create({
                        n_uuid: uuidv4(),
                        n_fk_uc_uuid: userId,
                        n_title: title,
                        n_body: body,
                        n_payload: { type: "KYC_APPROVED", kycId: kyc.kyc_uuid },
                        n_channel: "push",
                    });

                    await newModelObj.sendNotificationToUser({ userId, title, body, tokens, data: { type: "KYC_APPROVED", kycId: kyc.kyc_uuid } });
                }
            } catch (pushErr) {
                console.error("Push notification error:", pushErr);
            }
        }

        return res.json({ status: true, message: "KYC approved successfully", data: kyc });

    } catch (err) {
        console.error("Approve KYC error:", err);
        return res.status(500).json({ status: false, message: err.message });
    }
};
   
export const rejectKYC = async (req, res) => {
    try {
        let { kyc_uuid, reason } = req.body;

        // Validate kyc_uuid
        if (!kyc_uuid || typeof kyc_uuid !== "string") {
            return res.status(400).json({
                status: false,
                message: "Invalid kyc_uuid",
            });
        }

        kyc_uuid = kyc_uuid.trim();

        const finalReason =
            reason?.trim() ||
            "Support feature is currently unavailable due to review requirements.";

        // Update KYC status to REJECTED
        const kyc = await Kyc.findOneAndUpdate(
            { kyc_uuid },
            {
                status: "REJECTED",
                rejectedAt: new Date(),
                rejectionReason: finalReason,
            },
            { new: true }
        );

        if (!kyc) {
            return res.status(404).json({
                status: false,
                message: "KYC record not found",
            });
        }

        const userId = kyc.k_fk_uc_uuid;
        if (!userId) {
            return res.status(404).json({
                status: false,
                message: "User associated with KYC not found",
            });
        }

        // Fetch user email
        const user = await UsersCredentialsModel.findOne({ uc_uuid: userId });
        const userEmail = user?.uc_email || null;

        // Send rejection email
        if (userEmail) {
            try {
                await sendMail(
                    userEmail,
                    "Your KYC has been rejected",
                    `Hello ${kyc.fullName || "there"},\n\nYour KYC has been rejected.\n\nReason: ${finalReason}\n\nYou can resubmit your KYC once the issue is resolved.\n\nTeam KPIGI`
                );
            } catch (emailError) {
                console.error("Failed to send KYC rejection email:", emailError);
            }
        }

        // Push Notification
        try {
            const devices = await UserDevice.find({
                ud_fk_uc_uuid: userId,
                ud_device_fcmToken: { $exists: true, $ne: "" },
            }).select("ud_device_fcmToken");

            const tokens = devices.map(d => d.ud_device_fcmToken).filter(Boolean);

            if (tokens.length > 0) {
                const title = "KYC Rejected";
                const body = "Your KYC has been rejected. Please check and resubmit.";

                // Save notification in DB
                await NotificationModel.create({
                    n_uuid: uuidv4(),
                    n_fk_uc_uuid: userId,
                    n_title: title,
                    n_body: body,
                    n_payload: {
                        type: "KYC_REJECTED",
                        kycId: kyc.kyc_uuid,
                        reason: finalReason,
                    },
                    n_channel: "push",
                });

                // Send push via FCM
                await newModelObj.sendNotificationToUser({
                    userId,
                    title,
                    body,
                    tokens,
                    data: {
                        type: "KYC_REJECTED",
                        kycId: kyc.kyc_uuid,
                        reason: finalReason,
                    },
                });
            }
        } catch (pushErr) {
            console.error("Push notification error (reject):", pushErr);
        }

        // Return success
        return res.json({
            status: true,
            message: "KYC rejected successfully",
            data: kyc,
        });
    } catch (err) {
        console.error("Reject KYC error:", err);
        return res.status(500).json({
            status: false,
            message: err.message || "Internal server error",
        });
    }
};