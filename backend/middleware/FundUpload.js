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
 * 📝 Description   : Fund media document middleware
 * ================================================================================
 */

import multer from "multer";

const storage = multer.memoryStorage();

// Allowed file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",

    // Videos
    "video/mp4",
    "video/mpeg",
    "video/quicktime", // .mov
    "video/x-msvideo", // .avi

    // Audio
    "audio/mpeg",   // mp3
    "audio/wav",
    "audio/ogg",
    "audio/mp4",    // m4a
    "audio/x-m4a"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image, video, and audio files are allowed"),
      false
    );
  }
};

// Multer config
const fundUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
  },
}).fields([
  { name: "images", maxCount: 5 },   // 🖼 max 5 images only
  { name: "videos", maxCount: 5 },   // 🎥 videos allowed
  { name: "audios", maxCount: 5 },   // 🎵 audios allowed
]);

export default fundUpload;
