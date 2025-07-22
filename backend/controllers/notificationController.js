const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const User = require("../models/User");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    // Étape 1 : récupérer l'utilisateur
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Étape 2 : mise à jour des notifications non lues de cet utilisateur
    const result = await Notification.updateMany(
      { user: user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      message: "Notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  markAllNotificationsAsRead,
  getMyNotifications,
};
