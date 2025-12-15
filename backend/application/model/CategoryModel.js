/**
 * ================================================================================
 * ⛔ COPYRIGHT NOTICE
 * --------------------------------------------------------------------------------
 * © Zero IT Solutions – All Rights Reserved
 * --------------------------------------------------------------------------------
 * 🧑‍💻 Written By  : Sangeeta <sangeeta.zeroit@gmail.com>
 * 📅 Created On    : Dec 2025
 * 📝 Description   : Category model
 * ================================================================================
 */

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const CategorySchema = new mongoose.Schema(
  {
    c_uuid: {
      type: String,
      required: true,
      default: () => uuidv4(),
      unique: true,
    },

    c_name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    c_description: {
      type: String,
      default: "",
      trim: true,
    },

    c_status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    c_is_default: {
      type: Boolean,
      default: false, // true for "Other"
    },

    c_is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const CategoryModel = mongoose.model("Category", CategorySchema);
export default CategoryModel;
