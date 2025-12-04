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
 * 🧑‍💻 Written By   : Vishal Verma <vishalverma@zeroitsolutions.com>
 * 📅 Created On    : Aug 2025
 * 📝 Description   : Provides AWS and application constants for use across modules.
 * ✏️ Modified By   :
 * ================================================================================
 */
// config/constants.js

const getConstant = async () => {
  return {
    UPLOAD_PROFILE_PATH: "users-profile-images/",
    REFER_AMT: 30,
    UPLOAD_PATH: "images/",
    PROFILE_MEDIA_FOLDER: "profile-images/",
    CHAT_MEDIA_FOLDER: "chat-media/",
    AWS_FILE_URL: "https://animaa-1.s3.eu-north-1.amazonaws.com/",
    AWS_FILE_UPLOAD_URL: "https://animaa-1.s3.eu-north-1.amazonaws.com/",
    AWS_USER_FILE_FOLDER: "user-media/",
    AWS_THUMBNAIL_FOLDER: "thumbnail/",
  };
};

export default getConstant;
