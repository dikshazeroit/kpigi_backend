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
 * 📝 Description   : Single-file Express server entry with MongoDB, CORS, 
 *                    Socket.IO, routes, and middleware setup.
 * ================================================================================
 */

import express from "express";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import connectDB from "./backend/config/MongoDatabase.js";
import { allowHeaders } from "./backend/middleware/Cors.js";
import { errorHandler } from "./backend/middleware/ErrorHandler.js";
import appRoutes from "./backend/application/routes/AppRoutes.js";
import adminRoute from "./backend/admin/routes/AdminRoute.js";
const app = express();
const PORT = process.env.PORT || 3002;
const server = http.createServer(app);


app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(allowHeaders);


// ✅ static folder (if needed)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/", appRoutes);
app.use("/admin", adminRoute);

// ✅ Error handler
app.use(errorHandler);


(async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 kpigi Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server initialization failed:", error);
    process.exit(1);
  }
})();
