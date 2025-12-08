// utils/FundUpload.js
import multer from "multer";

const storage = multer.memoryStorage();

// Only accept 'media' field
const fundUpload = multer({ storage }).fields([{ name: "media", maxCount: 5 }]);

export default fundUpload;
