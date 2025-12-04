import mongoose from "mongoose";
import connectdb from "../../config/mongo_database.js";
import PermissionModel from "../models/permission.js";
import RoleModel from "../models/role.js";
import AdminModel from "../models/admin.js";
import bcrypt from "bcryptjs";

const seedPermissionsAndSuperAdmin = async () => {
  try {
    await connectdb();
    console.log("🌐 Database connected...");

    // 1️⃣ Seed Permissions
    const permissions = [
      { p_name: "View Admin", p_key: "admin:view" },
      { p_name: "Create Admin", p_key: "admin:create" },
      { p_name: "Edit Admin", p_key: "admin:edit" },
      { p_name: "Delete Admin", p_key: "admin:delete" },
      { p_name: "View User", p_key: "user:view" },
      { p_name: "View User Detail", p_key: "user:viewDetails" },
      { p_name: "View User Swipes", p_key: "user:viewSwipes" },
      { p_name: "View User Call Schedule", p_key: "user:viewSchedules" },
      { p_name: "Edit User", p_key: "user:edit" },
      { p_name: "Delete User", p_key: "user:delete" },
      { p_name: "View Subscription", p_key: "subscription:view" },
      { p_name: "Create Subscription", p_key: "subscription:create" },
      { p_name: "Edit Subscription", p_key: "subscription:edit" },
      { p_name: "Delete Subscription", p_key: "subscription:delete" },
      { p_name: "View Question & Options", p_key: "question:view" },
      { p_name: "Create Question & Options", p_key: "question:create" },
      { p_name: "Edit Question & Options", p_key: "question:edit" },
      { p_name: "Delete Question & Options", p_key: "question:delete" },
      { p_name: "View About", p_key: "about:view" },
      { p_name: "Update About", p_key: "about:update" },
      { p_name: "Create Role", p_key: "role:create" },
      { p_name: "View Role", p_key: "role:view" },
      { p_name: "Update Role", p_key: "role:update" },
      { p_name: "Delete Role", p_key: "role:delete" },
      { p_name: "View Role Permissions", p_key: "role:ViewPermissions" },
      { p_name: "View Date Plan", p_key: "datePlan:view" },
      {
        p_name: "View Date Users Details",
        p_key: "datePlam:viewDateUsersDetails",
      },
      { p_name: "Action Report", p_key: "report:action" },
      { p_name: "View Report", p_key: "report:view" },
      { p_name: "Delete Report", p_key: "report:delete" },
      { p_name: "Rejected Report", p_key: "report:rejected" },
      { p_name: "View Detail Report", p_key: "report:viewDetail" },
      { p_name: "View Explore", p_key: "explore:view" },
       { p_name: "View Explore", p_key: "explore:viewDetail" },
      { p_name: "Create Explore", p_key: "explore:create" },
      { p_name: "Edit Explore", p_key: "explore:edit" },
      { p_name: "Delete Explore", p_key: "explore:delete" },
    ];

    // ✅ Insert or skip existing
    for (const perm of permissions) {
      await PermissionModel.updateOne(
        { p_key: perm.p_key },
        { $setOnInsert: perm },
        { upsert: true }
      );
    }

    // 🔎 Fetch all permissions
    const allPermissions = await PermissionModel.find({});
    console.log("Total Permissions:", allPermissions.length);

    // 2️⃣ Ensure Super Admin Role
    const roleName = "Super Admin"; // keep it consistent
    let superAdminRole = await RoleModel.findOne({ r_name: roleName });

    if (!superAdminRole) {
      superAdminRole = await RoleModel.create({
        r_name: roleName,
        r_permissions: allPermissions.map((p) => p.p_uuid),
      });
      console.log("✅ Super Admin role created with all permissions!");
    } else {
      // update without duplicates
      const newPerms = allPermissions.map((p) => p.p_uuid);
      await RoleModel.updateOne(
        { r_name: roleName },
        { $addToSet: { r_permissions: { $each: newPerms } } }
      );
      console.log("✅ Super Admin role updated with new permissions!");
    }

    // 3️⃣ Create Super Admin User (only once)
    const existingAdmins = await AdminModel.countDocuments();
    if (existingAdmins === 0) {
      const hashedPassword = await bcrypt.hash("12345678", 10);

      const adminData = {
        au_name: "Super",
        au_surname: "Admin",
        au_email: "vishal@mailinator.com",
        au_phone: "9999999999",
        au_password: hashedPassword,
        au_address: "Head Office",
        au_image: null,
        au_type: "superadmin",
        au_role: superAdminRole.r_uuid,
      };

      await AdminModel.create(adminData);
      console.log("✅ Super Admin user created successfully!");
    } else {
      console.log("⚠️ Admin already exists. Skipping super admin creation.");
    }

    console.log("🎉 Seeder complete!");
  } catch (error) {
    console.error("❌ Error in seeder:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedPermissionsAndSuperAdmin();

// how to run this file : node backend/admin/script/seedUserPermissions.js
