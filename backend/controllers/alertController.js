const Alert = require("../models/Alert");
const Trip = require("../models/Trip");

exports.createAlert = async (req, res) => {
  try {
    const user = req.user; // utilisateur connecté
    const { relatedTripId, type, message } = req.body;

    if (!type || !message) {
      return res.status(400).json({ message: "Type et message sont requis" });
    }

    if (relatedTripId) {
      const tripExists = await Trip.findById(relatedTripId);
      if (!tripExists) {
        return res.status(400).json({ message: "Trip ID invalide" });
      }
    }

    // Construire l'alerte en injectant admin/superAdmin selon rôle
    const alertData = {
      type,
      message,
      relatedTripId: relatedTripId || null,
    };

    if (user.role === "admin") {
      alertData.admin = user.id;
    } else if (user.role === "superAdmin") {
      alertData.superAdmin = user.id;
    }
    // Si tu veux gérer le cas driver qui crée une alerte, à adapter selon ta logique

    const alert = await Alert.create(alertData);
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📖 Get all alerts
exports.getAlerts = async (req, res) => {
  try {
    const user = req.user;
    let filter = {};

    if (user.role === "superAdmin") {
      // Le superAdmin voit toutes ses alertes
      filter.superAdmin = user.id;
    } else if (user.role === "admin") {
      // L'admin voit uniquement ses propres alertes
      filter.admin = user.id;
    } else {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const alerts = await Alert.find(filter)
      .populate("admin", "name email")
      .populate("superAdmin", "name email")
      .populate("taxiId", "plateNumber model")
      .populate("relatedTripId", "startTime endTime deliveryStatus");

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Resolve an alert
exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );
    res.json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
