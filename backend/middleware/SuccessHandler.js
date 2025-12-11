/**
 * Copyright (C) Zero IT Solutions - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential. Dissemination of this information or reproduction 
 * of this material is strictly forbidden unless prior written permission is obtained
 * from Zero IT Solutions.
 * 
 
 * 
 * Written By  : Sangeeta <sangeeta.zeroit@gmail.com>, Dec 2025
 * Description :
 * Description :
 * Modified By :
 */

  export const successHandler = (
    res,
    { status = true, code = "200", message = "Success", payload = {},  } = {}
  ) => {
    return res.status(200).json({
      status,
      code,  
      message,
      payload,
    });
  };

