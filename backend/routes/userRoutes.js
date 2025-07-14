const express = require("express");
const {
  getAdmins,
  getDriversByAdmin,
  getUsers,
  approveUser,
  updateCompanyDetails,
  getSuperAdminStats,
  deleteUser,
  changePassword,
  updateProfileImage,
  updateUser,
  forgotPassword,
  getAllUsers,
  getAdminsForSuperAdmin,
} = require("../controllers/userController");
const {
  getMyNotifications,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// ✅ Nouvelle route
router.get("/admins", protect, authorizeRoles("superAdmin"), getAdmins);
router.get(
  "/driversbyadmin",
  protect,
  authorizeRoles("admin"),
  getDriversByAdmin
);

router.get("/all", protect, authorizeRoles("superAdmin"), getAllUsers);

router.put("/:id/approve", protect, authorizeRoles("superAdmin"), approveUser);
router.get("/", protect, authorizeRoles("superAdmin"), getUsers);

router.get(
  "/notifications",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"), // ✅ Autorise tous
  getMyNotifications
);

router.put(
  "/notifications/mark-all-read",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"), // ✅ Autorise tous
  markAllNotificationsAsRead
);

router.put("/update-company/:id", updateCompanyDetails);
router.get(
  "/superadmin-stats",
  protect,
  authorizeRoles("superAdmin"),
  getSuperAdminStats
);
// ✅ Routes protégées (authentification requise)
router.put(
  "/:id",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),
  updateUser
); // 🔧 Modifier profil
router.delete(
  "/:id",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),
  deleteUser
); // ❌ Supprimer
router.put(
  "/:id/change-password",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),
  changePassword
); // 🔑 Changer mot de passe
router.put(
  "/:id/profile-image",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),
  upload.single("profileImage"),
  updateProfileImage
);
router.post("/forgot-password", forgotPassword);
router.get("/admins", protect, getAdminsForSuperAdmin);

module.exports = router;
