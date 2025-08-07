const User = require("../models/User");
const Taxi = require("../models/Taxi");
const Trip = require("../models/Trip");
const Report = require("../models/Report");
const Alert = require("../models/Alert");

exports.getOverview = async (req, res) => {
  try {
    const superAdminId = req.user._id;
    console.log(superAdminId);

    // ✅ Nombre total de conducteurs (users avec rôle "driver" liés à ce superAdmin via admin.superAdmin)
    const admins = await User.find({
      role: "admin",
      superAdmin: superAdminId,
    }).select("_id");

    const adminIds = admins.map((admin) => admin._id);

    // 2. Trouver tous les drivers liés à ces admins
    const drivers = await User.find({
      role: "driver",
      admin: { $in: adminIds },
      isApproved: true,
    }).select("isApproved");

    const totalDrivers = drivers.length;
    // ✅ Nombre total de taxis du super admin
    const totalTaxis = await Taxi.countDocuments({ superAdmin: superAdminId });

    // ✅ Taxis disponibles et en maintenance
    const availableTaxis = await Taxi.countDocuments({
      superAdmin: superAdminId,
      status: "available",
    });

    const inMaintenanceTaxis = await Taxi.countDocuments({
      superAdmin: superAdminId,
      status: "inMaintenance",
    });

    // ✅ Nombre total de trajets du super admin
    const totalTrips = await Trip.countDocuments({ superAdmin: superAdminId });

    // ✅ Trajets à l’heure et en retard
    const onTimeTrips = await Trip.countDocuments({
      superAdmin: superAdminId,
      deliveryStatus: "on-time",
    });

    const delayedTrips = await Trip.countDocuments({
      superAdmin: superAdminId,
      deliveryStatus: "delayed",
    });

    // ✅ Distance totale parcourue
    const totalDistanceDrivenData = await Trip.aggregate([
      { $match: { superAdmin: superAdminId } },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: "$distanceDriven" },
        },
      },
    ]);

    const totalDistanceDriven =
      totalDistanceDrivenData.length > 0
        ? totalDistanceDrivenData[0].totalDistance
        : 0;

    // ✅ Répartition des trajets par jour
    const tripsPerDay = await Trip.aggregate([
      { $match: { superAdmin: superAdminId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ✅ Rapports
    const totalReports = await Report.countDocuments({
      superAdmin: superAdminId,
    });

    const reportsByType = await Report.aggregate([
      { $match: { superAdmin: superAdminId } },
      {
        $group: {
          _id: "$reportType",
          count: { $sum: 1 },
        },
      },
    ]);

    // ✅ (optionnel) Alertes actives
    const activeAlerts = await Alert.countDocuments({
      superAdmin: superAdminId,
      status: "active",
    });

    res.json({
      totalDrivers,
      totalTaxis,
      availableTaxis,
      inMaintenanceTaxis,
      totalTrips,
      onTimeTrips,
      delayedTrips,
      totalDistanceDriven,
      tripsPerDay,
      totalReports,
      reportsByType,
      activeAlerts,
    });
  } catch (error) {
    console.error("Erreur dans getOverview:", error);
    res.status(500).json({ message: "Erreur lors du chargement des KPIs" });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const adminId = req.user._id;

    // 1. Récupérer les drivers
    const drivers = await User.find({
      role: "driver",
      admin: adminId,
    }).select("isApproved");

    const totalDrivers = drivers.length;
    const approvedDrivers = drivers.filter((d) => d.isApproved).length;

    // 2. Récupérer les alertes
    const alerts = await Alert.find({ admin: adminId }).select("status");

    const totalAlerts = alerts.length;
    const activeAlerts = alerts.filter((a) => a.status === "active").length;
    const resolvedAlerts = alerts.filter((a) => a.status === "resolved").length;

    // 3. Récupérer les trajets
    const trips = await Trip.find({ admin: adminId }).select(
      "tripStatus deliveryStatus"
    );

    const totalTrips = trips.length;
    const completedTrips = trips.filter(
      (t) => t.tripStatus === "completed"
    ).length;
    const ongoingTrips = trips.filter((t) => t.tripStatus === "ongoing").length;
    const cancelledTrips = trips.filter(
      (t) => t.tripStatus === "cancelled"
    ).length;
    const delayedTrips = trips.filter(
      (t) => t.deliveryStatus === "delayed"
    ).length;

    res.json({
      drivers: totalDrivers,
      approvedDrivers,
      alerts: {
        total: totalAlerts,
        active: activeAlerts,
        resolved: resolvedAlerts,
      },
      trips: {
        total: totalTrips,
        completed: completedTrips,
        ongoing: ongoingTrips,
        cancelled: cancelledTrips,
        delayed: delayedTrips,
      },
    });
  } catch (err) {
    console.error("Erreur dans admin stats:", err);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des statistiques." });
  }
};
