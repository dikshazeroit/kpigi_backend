/**
 * Socket service module
 * Handles WebSocket initialization and management
 */
import { init } from "../socket/Index.js";

export const initializeSocket = (server) => {
  try {
    init(server);
    console.log("✅ WebSocket initialized successfully");
  } catch (error) {
    console.error("❌ WebSocket initialization failed:", error);
    throw error;
  }
};
