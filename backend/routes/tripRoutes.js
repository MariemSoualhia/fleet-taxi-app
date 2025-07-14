const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// Création de trajets accessible à admin et superAdmin (et tu peux ajuster les rôles)
router.post(
  "/",
  protect,
  authorizeRoles("superAdmin", "admin"),
  tripController.createTrip
);

// Lecture des trips selon le rôle (driver/admin/superAdmin)
router.get(
  "/",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),
  tripController.getTrips
);

// Lecture trip par ID avec contrôle d'accès
router.get(
  "/:id",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),
  tripController.getTripById
);

// Mise à jour trip - réservé admin et superAdmin
router.put(
  "/:id",
  protect,
  authorizeRoles("superAdmin", "admin", "driver"),
  tripController.updateTrip
);

// Suppression trip - réservé superAdmin
router.delete(
  "/:id",
  protect,
  authorizeRoles("superAdmin"),
  tripController.deleteTrip
);

// Statistiques - accès admin et superAdmin
router.get(
  "/stats/trips-per-day",
  protect,
  authorizeRoles("superAdmin", "admin"),
  tripController.getTripsPerDay
);

// Estimation - accès admin et superAdmin
router.post(
  "/estimate",
  protect,
  authorizeRoles("superAdmin", "admin"),
  tripController.estimateTrip
);

module.exports = router;
