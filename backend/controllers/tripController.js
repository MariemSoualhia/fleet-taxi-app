const Trip = require("../models/Trip");
const Alert = require("../models/Alert");
const User = require("../models/User");
const Taxi = require("../models/Taxi");

// ➕ Create Trip
exports.createTrip = async (req, res) => {
  try {
    // Ajoute admin et superAdmin à la requête
    const user = req.user;

    // Exemple d'extraction - à ajuster selon ton modèle d'utilisateur
    let adminId = null;
    let superAdminId = null;

    if (user.role === "admin") {
      adminId = user._id;
      // supposons que chaque admin connaît son superAdmin
      superAdminId = user.superAdmin || null;
    } else if (user.role === "superAdmin") {
      superAdminId = user.id;
      // admin null ou défini autrement
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized role to create trip" });
    }

    const tripData = {
      ...req.body,
      admin: adminId,
      superAdmin: superAdminId,
    };

    const trip = await Trip.create(tripData);
    const taxiId = trip.taxiId;
    // Création automatique d'alertes
    if (trip.fuelUsed > 100) {
      await Alert.create({
        type: "fuelOverconsumption",
        relatedTripId: trip._id,
        message: `Taxi used too much fuel (${trip.fuelUsed}L).`,
        admin: adminId,
        superAdmin: superAdminId,
        taxiId,
      });
    }

    if (trip.deliveryStatus === "delayed") {
      await Alert.create({
        type: "excessiveDelay",
        relatedTripId: trip._id,
        message: "Delivery was delayed.",
        admin: adminId,
        superAdmin: superAdminId,
        taxiId,
      });
    }

    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📖 Get all Trips filtered by user role
exports.getTrips = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === "driver") {
      // Ici tu peux récupérer les taxis qui ont ce driver, et leurs trips,
      // ou filtrer par taxiId ayant assignedDriver === user.id
      // Mais comme tu n'as pas driverId dans Trip, c'est plus compliqué.
      // Donc tu peux récupérer les taxis du driver, puis leurs trips.

      // Exemple naïf : trouver taxis du driver
      const taxis = await Taxi.find({ assignedDriver: user.id }, "_id");
      const taxiIds = taxis.map((t) => t._id);
      query.taxiId = { $in: taxiIds };
    } else if (user.role === "admin") {
      // L'admin ne voit que ses trips
      query.admin = user.id;
    } else if (user.role === "superAdmin") {
      // accès total ou juste ses trips
      // query.superAdmin = user.id;
      query = {}; // accès total
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const trips = await Trip.find(query)
      .populate({
        path: "taxiId",
        populate: { path: "assignedDriver", select: "name", model: "User" },
      })
      .populate("admin superAdmin");

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📖 Get Trip by ID with role-based access
exports.getTripById = async (req, res) => {
  try {
    const user = req.user;
    const trip = await Trip.findById(req.params.id).populate("driverId taxiId");
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (
      user.role === "driver" &&
      trip.driverId._id.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (user.role === "admin") {
      const drivers = await User.find({ admin: user._id }, "_id");
      const driverIds = drivers.map((d) => d._id.toString());
      if (!driverIds.includes(trip.driverId._id.toString())) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // superAdmin accès total

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Trip
exports.updateTrip = async (req, res) => {
  try {
    // On peut aussi appliquer un contrôle ici selon rôle si besoin
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ Delete Trip
exports.deleteTrip = async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: "Trip deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Statistiques trips par jour
exports.getTripsPerDay = async (req, res) => {
  try {
    const trips = await Trip.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Estimation de trip
exports.estimateTrip = async (req, res) => {
  try {
    const { startLocation, endLocation, taxiId } = req.body;

    const similarTrips = await Trip.find({
      startLocation,
      endLocation,
      taxiId,
    });

    if (similarTrips.length === 0) {
      return res.status(404).json({ message: "No similar trip found." });
    }

    const avgDistance =
      similarTrips.reduce((acc, t) => acc + t.distanceDriven, 0) /
      similarTrips.length;

    const avgFuel =
      similarTrips.reduce((acc, t) => acc + t.fuelUsed, 0) /
      similarTrips.length;

    res.json({ estimatedDistance: avgDistance, estimatedFuel: avgFuel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// 📊 Statistiques globales des trajets selon le rôle
exports.getTripStatsOverview = async (req, res) => {
  try {
    const user = req.user;
    const match = {};

    // Filtre selon le rôle de l'utilisateur
    if (user.role === "driver") {
      const taxis = await Taxi.find({ assignedDriver: user._id }, "_id");
      const taxiIds = taxis.map((t) => t._id);
      match.taxiId = { $in: taxiIds };
    } else if (user.role === "admin") {
      match.admin = user._id;
    } else if (user.role === "superAdmin") {
      match.superAdmin = user._id;
    }

    // Agrégation pour calculer toutes les stats en une seule requête
    const stats = await Trip.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalDistance: { $sum: "$distanceDriven" },
          totalFuelUsed: { $sum: "$fuelUsed" },
          avgDistance: { $avg: "$distanceDriven" },
          avgFuelUsed: { $avg: "$fuelUsed" },
          ongoingTrips: {
            $sum: { $cond: [{ $eq: ["$tripStatus", "ongoing"] }, 1, 0] },
          },
          delayedTrips: {
            $sum: { $cond: [{ $eq: ["$deliveryStatus", "delayed"] }, 1, 0] },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.json({
        totalTrips: 0,
        totalDistance: 0,
        totalFuelUsed: 0,
        avgDistance: 0,
        avgFuelUsed: 0,
        ongoingTrips: 0,
        delayedTrips: 0,
      });
    }

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚗 Prochain trajet du driver

exports.getNextTripForDriver = async (req, res) => {
  const driverId = req.params.driverId; // ou req.user.id si authentifié

  try {
    // Trouver tous les taxis assignés à ce driver
    const taxis = await Taxi.find({ assignedDriver: driverId }).select("_id");

    if (!taxis.length) {
      return res
        .status(404)
        .json({ message: "No taxi assigned to this driver." });
    }

    const taxiIds = taxis.map((t) => t._id);

    // Chercher le prochain trajet lié à ces taxis
    const nextTrip = await Trip.findOne({
      taxiId: { $in: taxiIds },
      startTime: { $gte: new Date() },
      tripStatus: { $ne: "cancelled" },
    })
      .sort({ startTime: 1 })
      .populate("taxiId", "model plateNumber")
      .lean();

    if (!nextTrip) {
      return res.status(404).json({ message: "No upcoming trips found." });
    }

    res.json(nextTrip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
