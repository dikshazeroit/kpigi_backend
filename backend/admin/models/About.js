import mongoose, { Schema } from "mongoose";
import { v4 as uuid } from "uuid";

const appInfoSchema = new Schema(
  {
    ai_uuid: {
      type: String,
      default: () => uuid(),
    },
    ai_privacy_policy: {
      type: String,
      trim: true,
    },
    ai_terms_conditions: {
      type: String,
      trim: true,
    },
    ai_contact_email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    ai_contact_address: {
      type: String,
      trim: true,
    },
    ai_deleted: {
      type: String,
      default: "0",
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "created_at", updatedAt: "ai_updated_at" },
  }
);

// Remove empty fields before saving (insert)
appInfoSchema.pre("save", function (next) {
  Object.keys(this._doc).forEach((key) => {
    if (
      this[key] === "" ||
      this[key] === null ||
      this[key] === undefined
    ) {
      delete this[key];
    }
  });
  next();
});

// Remove empty fields before update operations
appInfoSchema.pre(["updateOne", "findOneAndUpdate", "updateMany"], function (next) {
  let update = this.getUpdate();

  if (!update) return next();

  // Handle $set if present
  if (update.$set) {
    Object.keys(update.$set).forEach((key) => {
      if (
        update.$set[key] === "" ||
        update.$set[key] === null ||
        update.$set[key] === undefined
      ) {
        delete update.$set[key];
      }
    });

    // If $set becomes empty object, delete it
    if (Object.keys(update.$set).length === 0) {
      delete update.$set;
    }
  }

  // Also check top-level keys outside $set (rare but possible)
  Object.keys(update).forEach((key) => {
    if (key === "$set") return; // already handled above
    if (
      update[key] === "" ||
      update[key] === null ||
      update[key] === undefined
    ) {
      delete update[key];
    }
  });

  next();
});

const AppInfoModel = mongoose.model("app_info", appInfoSchema);
export default AppInfoModel;
