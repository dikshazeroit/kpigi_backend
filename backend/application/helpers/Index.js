/**
 * ================================================================================
 * ⛔ COPYRIGHT NOTICE
 * --------------------------------------------------------------------------------
 * © Zero IT Solutions – All Rights Reserved
 *
 * ⚠️ Unauthorized copying, distribution, or reproduction of this file,
 *    via any medium, is strictly prohibited.
 *
 * 🔒 This file contains proprietary and confidential information.
 *    Dissemination or use of this material is forbidden unless prior written
 *    permission is obtained from Zero IT Solutions.
 * --------------------------------------------------------------------------------
 * 🧑‍💻 Written By  : Sangeeta  <sangeeta.zeroit@gmail.com>
 * 📅 Created On   : Dec 2025
 * 📝 Description  : Email helper to send mails using Gmail SMTP.
 * ✏️ Modified By  :
 * ================================================================================
 */

import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import userModel from '../model/UserModel.js'; 
// Exported helper object
const helper = {};

/**
 * Sends an email using Gmail SMTP.
 * @param {Object} emailData - Email details
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.from - Sender email/name
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.body - Email body (HTML)
 * @returns {Promise<boolean>} - Resolves true if email sent, else false
 */
export async function generalMail(emailData) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD,
      },
    });

    const mailOptions = {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.body,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Extracts and validates the user ID (UUID) from the JWT token in the request.
 *
 * @param {object} req - The HTTP request object containing headers, query, or body with the token.
 * @param {string} [uuid=""] - Optional flag to customize behavior (currently unused).
 * @returns {Promise<string>} - Resolves with the user ID if token is valid and user exists; otherwise, returns an empty string.
 */
helper.getUUIDByToken = async function (req, uuid = '') {
  let token = '';

  if (req?.headers?.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query?.token) {
    token = req.query.token;
  } else if (req.body?.token) {
    token = req.body.token;
  } else if (req.headers?.['x-access-token']) {
    token = req.headers['x-access-token'];
  }

  if (!token || token === 'undefined') return '';

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.userId) {
      const user = await userModel.findOne({
        uc_uuid: decoded.userId,
        uc_deleted: '0',
        uc_active: '1',
      });

      if (user?.uc_uuid) {
        return decoded.userId;
      }
    }
  } catch (err) {
    console.error('JWT verification failed:', err.message);
  }

  return '';
};



export default helper;
