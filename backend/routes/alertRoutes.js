const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const alertController = require("../controllers/alertController");

router.post(
  "/",
  protect,
  authorizeRoles("admin", "superAdmin"),
  alertController.createAlert
);
router.get(
  "/",
  protect,
  authorizeRoles("admin", "superAdmin"),
  alertController.getAlerts
);
router.put(
  "/:id/resolve",
  protect,
  authorizeRoles("admin", "superAdmin"),
  alertController.resolveAlert
);

module.exports = router;
