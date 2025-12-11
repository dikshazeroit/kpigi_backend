
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
 * 🧑‍💻 Author       : Sangeeta Kumari <sangeeta.zeroit@gmail.com>
 * 📅 Created On    : Dec 2025
 * 📝 Description   : File and image middleware
 * ================================================================================
 */
import multer from "multer";

// Filters
const imageFields = [
  "profileImage",
  "backgroundImage",
  "companyLogo",
  "profilePhotos"
];

const imageFilter = (req, file, cb) => {
  if (imageFields.includes(file.fieldname)) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }
  }
  cb(null, true);
};

const docFilter = (req, file, cb) => {
  const allowedDocs = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  if (file.fieldname === "certificateFile" && !allowedDocs.includes(file.mimetype)) {
    return cb(new Error("Only PDF or DOC/DOCX files are allowed."));
  }
  cb(null, true);
};

const videoFilter = (req, file, cb) => {
  if (file.fieldname === "shortVideo") {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files are allowed."));
    }
  }
  cb(null, true);
};

const audioFilter = (req, file, cb) => {
  if (file.fieldname === "voiceRecording") {
    if (!file.mimetype.startsWith("audio/")) {
      return cb(new Error("Only audio files are allowed."));
    }
  }
  cb(null, true);
};

// Combined filter
const combinedFilter = (req, file, cb) => {
  if (imageFields.includes(file.fieldname)) {
    return imageFilter(req, file, cb);
  }
  if (file.fieldname === "certificateFile") {
    return docFilter(req, file, cb);
  }
  if (file.fieldname === "shortVideo") {
    return videoFilter(req, file, cb);
  }
  if (file.fieldname === "voiceRecording") {
    return audioFilter(req, file, cb);
  }
  return cb(new Error("Unexpected field."));
};

// Memory storage
const storage = multer.memoryStorage();

// All allowed fields (merged)
const combinedUpload = multer({
  storage,
  fileFilter: combinedFilter,
}).fields([
  { name: "profileImage", maxCount: 1 },
  { name: "certificateFile", maxCount: 1 },
  { name: "backgroundImage", maxCount: 1 },
  { name: "companyLogo", maxCount: 1 },

  // Newly added for media upload
  { name: "media", maxCount: 5 },
  { name: "shortVideo", maxCount: 1 },
  { name: "voiceRecording", maxCount: 1 },
]);

export default combinedUpload;
