/**
 * ================================================================================
 * ⛔ COPYRIGHT NOTICE
 * --------------------------------------------------------------------------------
 * © Zero IT Solutions – All Rights Reserved
 *
 * ⚠️ Unauthorized copying, distribution, or reproduction of this file,
 *     via any medium, is strictly prohibited.
 *
 * 🔒 This file contains proprietary and confidential information. Dissemination
 *     or use of this material is forbidden unless prior written permission is
 *     obtained from Zero IT Solutions.
 * --------------------------------------------------------------------------------
 * 🧑‍💻 Written By   : Diksha <dikshaj.zeroit@gmail.com>
 * 📅 Created On    : May 2025
 * 📝 Description   : Provides AWS and application constants for use across modules.
 * ✏️ Modified By   :
 * ================================================================================
 */

import dotenv from "dotenv";
import AWS from "aws-sdk";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

dotenv.config();

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const JWT_SECRET = process.env.JWT_SECRET;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// AWS S3
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const helper = {};

/**
 * Sends a standardized JSON success response to the client.
 *
 * @param {object} res - Express response object.
 * @param {object} options - Response options.
 * @param {boolean} [options.status=true] - Indicates the success status (default: true).
 * @param {string} [options.code=""] - Optional response code for tracking or debugging.
 * @param {string} [options.message="Success"] - Message describing the success response.
 * @param {object} [options.payload={}] - The data payload to include in the response.
 * @returns {object} - JSON response sent to the client.
 *
 * @developer Diksha Jaswal <dikshaj.zeroit@gmail.com>
 * @created May 2025
 * @modified
 */
helper.successHandler = (
  res,
  { status = true, code = "", message = "Success", payload = {} }
) => res.json({ status, code, message, payload });

/**
 * Sends a standardized JSON error response to the client.
 *
 * @param {object} res - Express response object.
 * @param {object} options - Error response options.
 * @param {boolean} [options.status=false] - Indicates the error status (default: false).
 * @param {string} [options.code=""] - Optional error code for tracking/debugging.
 * @param {string} [options.message="Error"] - Description of the error.
 * @param {Array|object} [options.payload=[]] - Additional error data or context.
 * @param {number} [statusCode=500] - HTTP status code to be sent (default: 500).
 * @returns {object} - JSON error response sent to the client.
 *
 * @developer Diksha Jaswal <dikshaj.zeroit@gmail.com>
 * @created May 2025
 * @modified
 */
helper.errorHandler = (
  res,
  { status = false, code = "", message = "Error", payload = [] },
  statusCode = 500
) => res.status(statusCode).json({ status, code, message, payload });

/**
 * Extracts user information (UID or email) from a JWT token in the request.
 *
 * @param {object} req - Express request object. Token is expected in headers, body, or query.
 * @param {string} [returnType="ID"] - Type of data to return:
 *                                     "E" returns the user's email,
 *                                     "T" returns the user ID directly from token,
 *                                     "ID" (default) verifies the user in DB before returning ID.
 * @returns {Promise<string|boolean>} - Returns user ID, email, or false if verification fails.
 *
 * @developer Diksha Jaswal <dikshaj.zeroit@gmail.com>
 * @created May 2025
 * @modified
 */
helper.getUidByToken = async (req, returnType = "ID") => {
  const auth = req.headers.authorization || req.body.token || req.query.token;
  const token = auth?.split?.(" ")[1] || auth;
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) return false;
    if (returnType === "E") return decoded.email;
    if (returnType === "T") return decoded.userId;

    const user = await mongoHelper.getData(
      { uc_uuid: decoded.userId, uc_deleted: "0", uc_active: "1" },
      "users_credentials"
    );
    return user?.length ? decoded.userId : false;
  } catch (e) {
    console.error("Token verification failed:", e.message);
    return false;
  }
};
/**
 * Formats a given date string or Date object into a human-readable string.
 *
 * @param {string|Date} date - The date to format.
 * @param {string} [type=""] - Format type:
 *                             "date" returns formatted date as "DD Mon, YYYY",
 *                             "time" returns formatted time as "hh:mm AM/PM",
 *                             "" (default) returns full formatted date and time as "Mon DD, YYYY, hh:mm AM/PM".
 * @returns {string} - Formatted date string or original input if invalid.
 *
 * @developer Diksha Jaswal <dikshaj.zeroit@gmail.com>
 * @created May 2025
 * @modified
 */
helper.dateFormat = (date, type = "") => {
  const d = new Date(date);
  if (isNaN(d)) return date;
  const [month, dt, year, hours, minutes] = [
    monthNames[d.getMonth()],
    String(d.getDate()).padStart(2, "0"),
    d.getFullYear(),
    d.getHours(),
    d.getMinutes(),
  ];
  const strTime = `${((hours + 11) % 12) + 1}:${String(minutes).padStart(
    2,
    "0"
  )} ${hours >= 12 ? "PM" : "AM"}`;
  if (type === "date") return `${dt} ${month}, ${year}`;
  if (type === "time") return strTime;
  return `${month} ${dt}, ${year}, ${strTime}`;
};

/**
 * Returns the current UTC time in various formats based on the provided type.
 *
 * @param {string} [type=""] - Optional format type:
 *                             "date" returns the date in "YYYY-MM-DD" format,
 *                             "time" returns the time in "HH:mm:ss" format,
 *                             any other value returns a full JavaScript Date object.
 * @returns {Promise<string|Date>} - The current UTC time in the requested format.
 *
 * @developer Diksha Jaswal <dikshaj.zeroit@gmail.com>
 * @created May 2025
 * @modified
 */
helper.getUtcTime = async (type = "") => {
  const now = new Date(new Date().toUTCString());
  if (type === "date") return now.toISOString().slice(0, 10);
  if (type === "time") return now.toTimeString().slice(0, 8);
  return now;
};
/**
 * Sends an email using Gmail via the Nodemailer library.
 *
 * @param {object} options - Email configuration object.
 * @param {string} options.from - The sender's email address.
 * @param {string|string[]} options.to - Recipient email address(es).
 * @param {string} options.subject - Subject line of the email.
 * @param {string} [options.text] - Plain text content of the email.
 * @param {string} [options.html] - HTML content of the email (optional).
 * @returns {Promise<object>} - Returns the result of the email sending operation.
 *
 * @developer Diksha Jaswal <dikshaj.zeroit@gmail.com>
 * @created May 2025
 * @modified
 */
helper.sendMail = async ({ from, to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter.sendMail({ from, to, subject, text, html });
};
/**
 * Uploads a file to AWS S3 using the provided chunks and metadata.
 *
 * @param {object} options - File upload configuration.
 * @param {string} options.fileName - The name of the file to be uploaded.
 * @param {Buffer[]} options.chunks - Array of file buffer chunks to be concatenated and uploaded.
 * @param {string} options.contentType - MIME type of the file (e.g., "image/png", "application/pdf").
 * @param {string} [options.uploadFolder=""] - Optional folder path within the S3 bucket.
 * @returns {Promise<object|boolean>} - Returns the S3 upload response object on success, or false on failure.
 *
 * @developer Diksha Jaswal <dikshaj.zeroit@gmail.com>
 * @created May 2025
 * @modified
 */
helper.uploadFile = async ({
  fileName,
  chunks,
  contentType,
  uploadFolder = "",
}) => {
  if (!fileName || !chunks) return false;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uploadFolder}${fileName}`,
    Body: Buffer.concat(chunks),
    ACL: "public-read",
    ContentType: contentType,
  };
  try {
    return await S3.upload(params).promise();
  } catch (e) {
    console.error("S3 upload error:", e);
    return false;
  }
};
/**
 * Deletes a file from an AWS S3 bucket.
 *
 * @param {object} options - File deletion configuration.
 * @param {string} options.fileName - Name of the file to delete from S3.
 * @param {string} [options.folderName=""] - Optional folder path in the bucket where the file is located.
 * @returns {Promise<boolean>} - Returns true if deletion is successful, otherwise false.
 *
 * @developer Diksha Jaswal <dikshaj.zeroit@gmail.com>
 * @created May 2025
 * @modified
 */
helper.deleteAWSFile = async ({ fileName, folderName = "" }) => {
  if (!fileName) return false;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folderName}${fileName}`,
  };
  try {
    await S3.deleteObject(params).promise();
    return true;
  } catch (e) {
    console.error("S3 delete error:", e);
    return false;
  }
};

export default helper;
