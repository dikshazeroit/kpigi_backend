import RoleModel from "../admin/models/Role.js";
import PermissionModel from "../admin/models/Permission.js";

export const hasPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: false,
          code: "CCS-E1002",
          message: "Unauthorized. User not found.",
          payload: {},
        });
      }

      let userPermissions = req.user.permissions || [];

      // If JWT doesn’t have permissions, fetch from role
      if (!userPermissions.length && req.user.role) {
        const role = await RoleModel.findOne({ r_uuid: req.user.role });
        if (role && role.r_permissions.length) {
          const perms = await PermissionModel.find({ p_uuid: { $in: role.r_permissions } });
          userPermissions = perms.map(p => p.p_key); // ✅ get keys
        }
      }

      console.log("User Permissions:", userPermissions);

      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          status: false,
          code: "CCS-E1003",
          message: "Forbidden. You don’t have permission.",
          payload: {},
        });
      }

      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        code: "CCS-E1004",
        message: "Internal server error.",
        payload: {},
      });
    }
  };
};
