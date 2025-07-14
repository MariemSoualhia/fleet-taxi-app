const express = require("express");
const router = express.Router();
const taxiController = require("../controllers/taxiController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// Seuls les admins peuvent créer, modifier et supprimer les taxis
router.post("/", protect, authorizeRoles("admin"), taxiController.createTaxi);

router.get(
  "/",
  protect,
  authorizeRoles("admin", "superAdmin"),
  taxiController.getTaxis
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "superAdmin"),
  taxiController.getTaxiById
);

router.put("/:id", protect, authorizeRoles("admin"), taxiController.updateTaxi);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  taxiController.deleteTaxi
);
router.get(
  "/assigned-driver/:driverId",
  protect,
  taxiController.getTaxisByDriver
);

module.exports = router;
