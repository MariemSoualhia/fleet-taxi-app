// controllers/leaveController.js
const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");

// ✅ Un driver demande un congé
exports.createLeaveRequest = async (req, res) => {
  try {
    const user = req.user;
    const { startDate, endDate, reason } = req.body;

    let superAdminId;

    if (user.role === "driver") {
      if (!user.admin) {
        return res.status(400).json({
          message: "Le conducteur doit être rattaché à un administrateur.",
        });
      }

      const admin = await User.findById(user.admin);
      if (!admin || !admin.superAdmin) {
        return res
          .status(400)
          .json({ message: "Administrateur ou SuperAdmin introuvable." });
      }

      superAdminId = admin.superAdmin;
    } else if (user.role === "admin") {
      if (!user.superAdmin) {
        return res.status(400).json({
          message: "L'administrateur doit être rattaché à un SuperAdmin.",
        });
      }

      superAdminId = user.superAdmin;
    } else {
      return res.status(403).json({
        message:
          "Seuls les conducteurs et les administrateurs peuvent faire une demande de congé.",
      });
    }

    const leave = await LeaveRequest.create({
      requester: user._id,
      superAdmin: superAdminId,
      startDate,
      endDate,
      reason,
    });

    await sendNotification(
      superAdminId,
      `📅 Nouvelle demande de congé de "${user.name}" du ${startDate} au ${endDate}.`
    );

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ SuperAdmin récupère toutes les demandes de congés
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "superAdmin") {
      return res.status(403).json({ message: "Accès réservé au SuperAdmin." });
    }

    const requests = await LeaveRequest.find({ superAdmin: user.id })
      .populate("requester", "name email phone role")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ SuperAdmin approuve une demande
exports.approveLeaveRequest = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user.role !== "superAdmin") {
      return res.status(403).json({ message: "Accès non autorisé." });
    }

    const leave = await LeaveRequest.findById(id);
    if (!leave || String(leave.superAdmin) !== user.id) {
      return res
        .status(404)
        .json({ message: "Demande introuvable ou non autorisée." });
    }

    leave.status = "approved";
    await leave.save();
    await sendNotification(
      leave.driver,
      `✅ Your leave request from ${leave.startDate} to ${leave.endDate} has been approved.`
    );

    res.json({ message: "Demande approuvée avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ SuperAdmin rejette une demande
exports.rejectLeaveRequest = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user.role !== "superAdmin") {
      return res.status(403).json({ message: "Accès non autorisé." });
    }

    const leave = await LeaveRequest.findById(id);
    if (!leave || String(leave.superAdmin) !== user.id) {
      return res
        .status(404)
        .json({ message: "Demande introuvable ou non autorisée." });
    }

    leave.status = "rejected";
    await leave.save();
    await sendNotification(
      leave.driver,
      `❌ Your leave request from ${leave.startDate} to ${leave.endDate} has been rejected.`
    );

    res.json({ message: "Demande rejetée avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Un driver peut consulter ses propres demandes
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const user = req.user;

    const leaves = await LeaveRequest.find({ requester: user._id }).sort({
      createdAt: -1,
    });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
