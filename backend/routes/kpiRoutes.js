const express = require("express");
const { getOverview, getAdminStats } = require("../controllers/kpiController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/overview", protect, authorizeRoles("superAdmin"), getOverview);
router.get("/admin-stats", protect, authorizeRoles("admin"), getAdminStats);

module.exports = router;
