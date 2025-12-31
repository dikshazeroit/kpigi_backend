import FaqModel from "../../admin/models/Faq.js";

/**
 * =============================
 * Create FAQ
 * =============================
 */
export const createFaq = async (req, res) => {
  try {
    const { f_question, f_answer } = req.body;

    if (!f_question || !f_answer) {
      return res.status(200).json({
        status: false,
        message: "Question and Answer are required",
      });
    }

    const faq = await FaqModel.create({
      f_question,
      f_answer,
    });

    return res.status(200).json({
      status: true,
      message: "FAQ created successfully",
      data: faq,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * =============================
 * Get All FAQs (Admin)
 * =============================
 */
export const getAllFaqs = async (req, res) => {
  try {
    const faqs = await FaqModel.find({ f_deleted: "0" })
      .sort({ f_created_at: -1 });

    return res.status(200).json({
      status: true,
      data: faqs,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * =============================
 * Get FAQ By ID
 * =============================
 */
export const getFaqById = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FaqModel.findOne({
      f_uuid: id,
      f_deleted: "0",
    });

    if (!faq) {
      return res.status(200).json({
        status: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: faq,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * =============================
 * Update FAQ
 * =============================
 */
export const updateFaq = async (req, res) => {
  try {
    const { f_uuid, f_question, f_answer } = req.body;

    const faq = await FaqModel.findOneAndUpdate(
      { f_uuid, f_deleted: "0" },
      { f_question, f_answer },
      { new: true }
    );

    if (!faq) {
      return res.status(200).json({
        status: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "FAQ updated successfully",
      data: faq,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * =============================
 * Delete FAQ (Soft Delete)
 * =============================
 */
export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FaqModel.findOneAndUpdate(
      { f_uuid: id },
      { f_deleted: "1" },
      { new: true }
    );

    if (!faq) {
      return res.status(200).json({
        status: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

/**
 * =============================
 * Toggle FAQ Active / Inactive
 * =============================
 */
export const toggleFaqStatus = async (req, res) => {
  try {
    const { f_uuid, f_active } = req.body;

    const faq = await FaqModel.findOneAndUpdate(
      { f_uuid },
      { f_active },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "FAQ status updated",
      data: faq,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

