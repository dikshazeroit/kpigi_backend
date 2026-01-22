import multer from "multer";

const storage = multer.memoryStorage();

// Counters per request
const requestCounter = new WeakMap();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",

    // Video
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only images and one video allowed"), false);
  }

  // init counters
  if (!requestCounter.has(req)) {
    requestCounter.set(req, { images: 0, videos: 0 });
  }

  const counter = requestCounter.get(req);

  // image limit
  if (file.mimetype.startsWith("image/")) {
    if (counter.images >= 5) {
      return cb(new Error("Maximum 5 images allowed"), false);
    }
    counter.images++;
  }

  // video limit
  if (file.mimetype.startsWith("video/")) {
    if (counter.videos >= 1) {
      return cb(new Error("Only 1 video allowed"), false);
    }
    counter.videos++;
  }

  cb(null, true);
};

const fundUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
}).array("media", 6); // 5 images + 1 video max

export default fundUpload;
