const cron = require("node-cron");
const Taxi = require("../models/Taxi");
const Trip = require("../models/Trip");
const Alert = require("../models/Alert");

// 💡 La logique : un Taxi qui n'a pas de trip récent -> besoin de maintenance
const checkMaintenance = async () => {
  try {
    console.log("🛠️ Checking for maintenance-needed taxis...");

    const taxis = await Taxi.find();

    const now = new Date();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    for (const taxi of taxis) {
      // Chercher le trip le plus récent de ce taxi
      const lastTrip = await Trip.findOne({ taxiId: taxi._id }).sort({
        endTime: -1,
      });

      let needsMaintenance = false;

      if (!lastTrip) {
        // Jamais utilisé ➔ peut-être à vérifier manuellement
        needsMaintenance = true;
      } else {
        const lastTripEndTime = new Date(lastTrip.endTime);
        if (now - lastTripEndTime > THIRTY_DAYS_MS) {
          needsMaintenance = true;
        }
      }

      if (needsMaintenance) {
        // Vérifie s'il n'y a pas déjà une alerte existante ACTIVE pour ce taxi
        const existingAlert = await Alert.findOne({
          type: "maintenanceNeeded",
          relatedTripId: null, // maintenance liée au taxi directement
          message: { $regex: taxi.plateNumber },
          status: "active",
        });

        if (!existingAlert) {
          await Alert.create({
            type: "maintenanceNeeded",
            message: `Taxi ${taxi.plateNumber} requires maintenance (no trip for 30+ days).`,
            status: "active",
            admin: taxi.admin,
            superAdmin: taxi.superAdmin,
            taxiId: taxi._id,
          });

          console.log(
            `🛠️ Created maintenance alert for taxi ${taxi.plateNumber}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error during maintenance check:", error.message);
  }
};

// Planifie la tâche : Tous les jours à minuit
const scheduleMaintenanceCheck = () => {
  cron.schedule("0 0 * * *", () => {
    console.log("⏰ Running scheduled maintenance check...");
    checkMaintenance();
  });
};

module.exports = { scheduleMaintenanceCheck };
