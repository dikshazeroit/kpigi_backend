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
 *  @author     Sangeeta <sangeeta.zeroit@gmail.com>
 *  @date       Dec 2025
 *  @version    1.0.0
 *  @module     Subscription Services
 *  @description Contains all database service functions for Subscription Plans including
 *               CRUD operations and filtering by user types (EMPLOYER, PROVIDER).
 *  @modified   
 *
 */

import SubscriptionModel from "../admin/models/Subscription.js";



export const createSubscriptionPlan = async (data) => {
  try {
    const newPlan = new SubscriptionModel(data);
    return await newPlan.save();
  } catch (error) {
    throw error;
  }
};

export const getAllSubscriptionPlans = async (filter) => {
  try {
    const query = filter && Object.keys(filter).length > 0 ? filter : {};
    return await SubscriptionModel.find(query)
      .sort({ sp_price: 1 })
      .lean(); // Convert to plain JS object (no circular refs)
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionPlanById = async (id) => {
  try {
    return await SubscriptionModel.findById(id);
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionPlanByName = async (name) => {
  try {
    return await SubscriptionModel.findOne({s_name: name});
  } catch (error) {
    throw error;
  }
};
export const updateSubscriptionPlan = async (id, data) => {
  try {

    const updateData = {
      s_name: data.name,
      s_description: data.description,
      s_tags: Array.isArray(data.tag) ? data.tag : [data.tag], 
      s_pricing: {
        monthly: data.prices?.monthly || "",
        "3-Month": data.prices?.threeMonth || "",
        "6-month": data.prices?.sixMonth || ""
      },
      sp_updated: new Date()
    };

    return await SubscriptionModel.findByIdAndUpdate(id, updateData, { new: true });
  } catch (error) {
    throw error;
  }
};
;


export const deleteSubscriptionPlan = async (id) => {
  try {
    return await SubscriptionModel.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};
