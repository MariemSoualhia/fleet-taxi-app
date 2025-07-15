const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const reportController = require("../controllers/reportController");

// ✅ Création d'un rapport (superAdmin ou admin)
router.post(
  "/",
  protect,
  authorizeRoles("superAdmin", "admin"),
  reportController.createReport
);

// ✅ Récupération des rapports (filtrés selon le rôle)
router.get(
  "/",
  protect,
  authorizeRoles("superAdmin", "admin"),
  reportController.getReports
);

module.exports = router;
