// uploadDocMiddleware.js
import multer from "multer";

const storage = multer.memoryStorage();

// ✅ File filter for docs + audio + video
const docFileFilter = (req, file, cb) => {
  console.log("📄 Received file:", file.originalname, "MIME:", file.mimetype);

  // Allowed MIME types
  const allowedTypes = [
    // Docs
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Audio
    "audio/mpeg", // .mp3
    "audio/wav",  // .wav
    "audio/ogg",  // .ogg
    "audio/mp4",  // .m4a
    "audio/x-m4a",

    // Video
    "video/mp4",  // .mp4
    "video/quicktime", // .mov
    "video/x-msvideo", // .avi
    "video/x-matroska", // .mkv
    "video/webm" // .webm
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF/DOC/DOCX/Audio/Video files are allowed!"), false);
  }
};

// ✅ Configure multer
const uploadDoc = multer({
  storage,
  fileFilter: docFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit (adjust if needed)
  },
});

export default uploadDoc;
