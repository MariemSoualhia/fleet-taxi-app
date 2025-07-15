const express = require("express");
const { getOverview } = require("../controllers/kpiController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/overview", protect, authorizeRoles("superAdmin"), getOverview);

module.exports = router;
