// GET /api/users/admins
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");

const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error getting admins:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getDriversByAdmin = async (req, res) => {
  try {
    const adminId = req.user._id;
    const drivers = await User.find({ role: "driver", admin: adminId }).select(
      "-password"
    );
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 📖 Get all Users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isApproved = true;
    await user.save();
    await sendNotification({
      userId: user._id,
      message: "Your account has been approved by the super admin!",
    });
    res.json({ message: "User approved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  getDriversByAdmin,
  getAdmins,
  getUsers,
  approveUser,
};
