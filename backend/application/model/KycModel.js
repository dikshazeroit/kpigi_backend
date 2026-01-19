import mongoose from "mongoose";
import { randomUUID } from "crypto";

const kycSchema = new mongoose.Schema({
  // 🔑 Unique KYC UUID
  kyc_uuid: {
    type: String,
    unique: true,
    index: true,
    default: () => randomUUID()
  },

  // 🔗 User UUID (foreign key)
  k_fk_uc_uuid: {
    type: String,
    required: true,
    index: true
  },

  fullName: {
    type: String,
    required: true
  },

  dateOfBirth: {
    type: Date,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  idType: {
    type: String,
    enum: ["AADHAAR", "PASSPORT", "NATIONAL_ID"],
    required: true
  },

  idImageName: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["NOT_STARTED", "PENDING", "VERIFIED", "REJECTED"],
    default: "PENDING"
  },

  rejectionReason: {
    type: String
  }

}, { timestamps: true });

const KycModel = mongoose.model("Kyc", kycSchema);

export default KycModel;
