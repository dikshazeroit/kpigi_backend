/**
 * Copyright (C) Zero IT Solutions - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential. Dissemination of this information or reproduction 
 * of this material is strictly forbidden unless prior written permission is obtained
 * from Zero IT Solutions.

 * Written By  : Payal Sharma  <Payal.zeroit@gmail.com>, April 2025
 * Description :
 * Modified By :
 */

import admin from "firebase-admin";
import serviceAccount from "../../config/firebaseAdminSDK.json" with { type: "json" };
import UserDevice from "./UserDeviceModel.js"; 
import notificationModel from "./NotificationModel.js";

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const newModelObj = {};

/**
 * Function     : sendNotificationFCM
 */
newModelObj.sendNotificationFCM = async function (nMessageObj) {
  try {
    const response = await admin.messaging().send(nMessageObj);
    console.log("✅ Push notification sent:", response);
    return true;
  } catch (err) {
    console.error("❌ Failed to send push notification:", err);
    return false;
  }
};

/**
 * Function     : job post notification
 */
newModelObj.sendNotificationToAllUsers = async (title, body, data = {}) => {
  try {
    const devices = await UserDevice.find({}, 'ud_device_fcmToken ud_fk_uc_uuid');
    const tokens = [...new Set(devices.map(device => device.ud_device_fcmToken).filter(Boolean))];

    if (!tokens.length) {
      console.log("❌ No tokens found in database.");
      return false;
    }

    const safeTitle = typeof title === "string" ? title : "Notification";
    const safeBody = typeof body === "string" ? body : "You have a new notification";

    const message = {
      notification: {
        title: safeTitle,
        body: safeBody,
      },
      data,
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    //console.log(`✅ Notification sent: ${response.successCount} success, ${response.failureCount} failed`);

    for (const device of devices) {newModelObj.sendNotificationToAllUsers = async ({ title, body, data = {} }) => {
  try {
    const devices = await UserDevice.find({}, 'ud_device_fcmToken ud_fk_uc_uuid');
    const tokens = [...new Set(devices.map(device => device.ud_device_fcmToken).filter(Boolean))];

    if (!tokens.length) {
      console.log("❌ No tokens found in database.");
      return false;
    }

    // Ensure title and body are strings and not undefined/null
   const safeTitle = typeof title === "string" ? title : JSON.stringify(title ?? "Notification");
const safeBody = typeof body === "string" ? body : JSON.stringify(body ?? "You have a new notification");


    const message = {
      notification: {
        title: safeTitle,
        body: safeBody,
      },
      data,
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Notification sent: ${response.successCount} success, ${response.failureCount} failed`);

    // Log failed tokens
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        console.warn(`❌ Failed to send to token: ${tokens[idx]}\nError: ${resp.error.message}`);
      }
    });

    // Save notifications in DB
    for (const device of devices) {
      if (device.ud_device_fcmToken && device.ud_fk_uc_uuid) {
        const notificationData = {
          userId: device.ud_fk_uc_uuid,
          title: safeTitle,
          body: safeBody,
        };
        console.warn("notificationData------------", notificationData);
        await notificationModel.add(notificationData);
      } else {
        console.warn("⚠️ Missing required device fields", device);
      }
    }

    return true;
  } catch (err) {
    console.error("❌ Error sending notification:", err);
    return false;
  }
};
      if (device.ud_device_fcmToken && device.ud_fk_uc_uuid) {
        const notificationData = {
          userId: device.ud_fk_uc_uuid,
          title: safeTitle,
          body: safeBody,
        };
       // console.warn("notificationData------------", notificationData);
        await notificationModel.add(notificationData);
      }
    }

    return true;
  } catch (err) {
    console.error("❌ Error sending notification:", err);
    return false;
  }
};

/**
 * Function     :  single user only notification
 */
newModelObj.sendNotificationToUser = async ({ userId, title, body, data = {}, tokens = [] }) => {
  try {
    if (!userId) {
      console.warn("❌ No userId provided.");
      return false;
    }

    if (!tokens.length) {
      console.log(`❌ No tokens found for userId: ${userId}`);
      return false;
    }

    const safeTitle = typeof title === "string" ? title : JSON.stringify(title ?? "Notification");
    const safeBody = typeof body === "string" ? body : JSON.stringify(body ?? "You have a new notification");

    const message = {
      notification: { title: safeTitle, body: safeBody },
      data,
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Notification sent to user ${userId}: ${response.successCount} success, ${response.failureCount} failed`);

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        console.warn(`❌ Failed to send to token: ${tokens[idx]}\nError: ${resp.error.message}`);
      }
    });

    return true;
  } catch (err) {
    console.error(`❌ Error sending notification to user ${userId}:`, err);
    return false;
  }
};




export default newModelObj;
