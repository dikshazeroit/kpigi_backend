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

export const errorHandler = (err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: false,
    code: statusCode,
    message: err.message || 'Internal Server Error',
    payload: [],
  });
};
