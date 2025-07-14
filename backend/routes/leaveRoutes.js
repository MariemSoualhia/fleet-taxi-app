// routes/leaveRoutes.js
const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// Routes protégées
router.post(
  "/request",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),
  leaveController.createLeaveRequest
);
router.get(
  "/me",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),
  leaveController.getMyLeaveRequests
);
router.get(
  "/",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),
  leaveController.getAllLeaveRequests
);
router.put(
  "/:id",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),

  leaveController.approveLeaveRequest
);
router.put(
  "/:id/reject",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),
  leaveController.rejectLeaveRequest
);

module.exports = router;
