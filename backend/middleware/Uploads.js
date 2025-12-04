/**
 * Copyright (C) Zero IT Solutions - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential. Dissemination of this information or reproduction 
 * of this material is strictly forbidden unless prior written permission is obtained
 * from Zero IT Solutions.
 * 
 
 * 
 * Written By  : Sangeeta <sangeeta.zeroit@gmail.com>, june 2025
 * Description :
 * Description :
 * Modified By :
 */

import multer from "multer";
import path from "path";

const storage = multer.memoryStorage(); // ⬅️ This is the key

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

export const uploadImage = multer({
  storage,
  fileFilter,
 limits: { fileSize: 10 * 1024 * 1024 }, // 10MB

});
