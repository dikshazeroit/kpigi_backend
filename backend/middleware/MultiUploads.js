/**
 * Copyright (C) Zero IT Solutions - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential. Dissemination of this information or reproduction 
 * of this material is strictly forbidden unless prior written permission is obtained
 * from Zero IT Solutions.
 * 
 * Written By  : Sangeeta <sangeeta.zeroit@gmail.com>, Dec 2025
 * Description : Multer middleware for in-memory file upload (AWS S3 ready)
 * Modified By :
 */

import multer from "multer";

// In-memory storage (required for AWS S3 uploads)
const storage = multer.memoryStorage();

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg/png/jpg)"), false);
  }
};

// Multer middleware to handle multiple specific file fields
export const uploadMultipleUserFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
}).fields([
  { name: "profileImage", maxCount: 1 },
  { name: "companyLogo", maxCount: 1 },
  { name: "certificate", maxCount: 1 },
]);
