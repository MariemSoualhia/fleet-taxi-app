const express = require("express");
const router = express.Router();
const {
  login,
  registerAdmin,
  registerDriver,
  registerUser,
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

module.exports = router;
