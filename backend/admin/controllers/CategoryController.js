/**
 * ============================================================================
 *  Copyright (C) Zero IT Solutions - All Rights Reserved
 * ----------------------------------------------------------------------------
 *  Unauthorized copying of this file, via any medium is strictly prohibited.
 *  Proprietary and confidential. Dissemination or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained from
 *  Zero IT Solutions.
 * ============================================================================
 *
 *  @author     Sangeeta Kumari <sangeeta.zeroit@gmail.com>
 *  @date       Dec 2025
 *  @version    1.0.0
 *  @module     Category Controller
 *  @description Handles all Admin-related API endpoints including creation,
 *               listing, updating, and deletion of Category.
 *  @modified
 *
 */


import CategoryModel from "../../application/model/CategoryModel.js";
import FundraiserModel from "../../application/model/FundModel.js";

/**
 * Get all categories
 */
export const getAllCategories = async (req, res) => {
  try {
    const list = await CategoryModel.find({ c_is_deleted: false }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create category
 */
export const createCategory = async (req, res) => {
  try {
    const { c_name, c_description } = req.body;

    if (!c_name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const exists = await CategoryModel.findOne({
      c_name: c_name.trim(),
      c_is_deleted: false,
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await CategoryModel.create({
      c_name,
      c_description,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update category
 */
export const updateCategory = async (req, res) => {
  try {
    const { c_uuid, c_name, c_description, c_status } = req.body;

    const category = await CategoryModel.findOne({
      c_uuid,
      c_is_deleted: false,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (c_name) category.c_name = c_name;
    if (c_description) category.c_description = c_description;
    if (c_status) category.c_status = c_status;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete category (soft delete)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    
    const category = await CategoryModel.findOne({
      c_uuid: id,
      c_is_deleted: false,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found or already deleted",
      });
    }

  
    if (category.c_is_default) {
      return res.status(400).json({
        success: false,
        message: "Default category cannot be deleted",
      });
    }

    
    const fundraisers = await FundraiserModel.find({
      f_category_id: category.c_uuid,
      f_status: { $in: ["ACTIVE", "PENDING"] },
    });

    if (fundraisers.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. There are ${fundraisers.length} fund requests in 'ACTIVE' or 'PENDING' status.`,
      });
    }

  
    console.log("Category before saving:", category);

    category.c_is_deleted = true;
    const savedCategory = await category.save();
    console.log("Category after saving:", savedCategory);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




/**
 * Enable / Disable category
 */
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { c_uuid, c_status } = req.body;

    const category = await CategoryModel.findOne({
      c_uuid,
      c_is_deleted: false,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.c_status = c_status;
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category status updated",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
