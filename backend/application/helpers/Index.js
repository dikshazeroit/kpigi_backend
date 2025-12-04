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
 * 🧑‍💻 Written By  : Diksha Jaswal <dikshaj.zeroit@gmail.com>
 * 📅 Created On   : June 2025
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

helper.calculateAge = async function (req,dob) {  
  if (!dob) return null;
  const birthDate = new Date(dob);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Haversine formula to calculate distance between two coordinates
helper.getDistanceFromLatLonInKm = async function (lat1, lon1, lat2, lon2) {
  // Use Haversine formula
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Check if two users are blocked from each other
 *
 * @param {String} senderUUID - sender user
 * @param {String} receiverUUID - receiver user
 * @returns {Boolean} true if blocked else false
 */
helper.isBlocked = async (senderUUID, receiverUUID) => {
  try {
    // Check both directions:
    // A blocked B OR B blocked A
    const blockExists = await BlockUser.findOne({
      bu_deleted: "0",
      $or: [
        { bu_user_uuid: senderUUID, bu_blocked_uuid: receiverUUID },
        { bu_user_uuid: receiverUUID, bu_blocked_uuid: senderUUID }
      ]
    });

    return !!blockExists; // returns true or false
  } catch (error) {
    console.error("❌ Block Check Error:", error);
    return false; // fail-safe: don't block if DB fails, optional change to true if needed
  }
};

export default helper;
