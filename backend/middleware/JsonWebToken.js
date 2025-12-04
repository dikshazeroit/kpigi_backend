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

import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1] ||
    req.query.token ||
    req.body.token ||
    req.headers["x-access-token"];

  if (!token) {
    return res.status(401).json({
      status: false,
      code: "CCS-E1000",
      message: "Access denied. No token provided.",
      payload: {},
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: false,
      code: "CCS-E1001",
      message: "Invalid or expired token.",
      payload: {},
    });
  }
};
