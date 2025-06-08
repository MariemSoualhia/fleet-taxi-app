const express = require("express");
const {
  getAdmins,
  getDriversByAdmin,
  getUsers,
  approveUser,
} = require("../controllers/userController");
const {
  getMyNotifications,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Nouvelle route
router.get("/admins", protect, authorizeRoles("superAdmin"), getAdmins);
router.get(
  "/driversbyadmin",
  protect,
  authorizeRoles("admin"),
  getDriversByAdmin
);
router.put("/:id/approve", protect, authorizeRoles("superAdmin"), approveUser);
router.get("/", protect, authorizeRoles("superAdmin"), getUsers);

router.get(
  "/notifications",
  protect,
  authorizeRoles("superAdmin"),
  getMyNotifications
);
router.put(
  "/notifications/mark-all-read",
  protect,
  authorizeRoles("superAdmin"),
  markAllNotificationsAsRead
);

module.exports = router;
