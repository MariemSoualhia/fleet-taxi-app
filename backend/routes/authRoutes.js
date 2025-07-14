const express = require("express");
const router = express.Router();
const {
  login,
  registerAdmin,
  registerDriver,
  registerUser,
  registerSuperAdmin,
  registerDriverBySuperAdmin,
} = require("../controllers/authController");

const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

router.post("/login", login);
router.post(
  "/register-admin",
  protect,
  authorizeRoles("superAdmin"),
  registerAdmin
);
router.post(
  "/register-driver",
  protect,
  authorizeRoles("admin"),
  registerDriver
);
router.post("/register", registerUser);
router.post("/register-superadmin", registerSuperAdmin);
router.post(
  "/register-driver-by-superadmin",
  protect,
  authorizeRoles("superAdmin"),
  registerDriverBySuperAdmin
);

module.exports = router;
