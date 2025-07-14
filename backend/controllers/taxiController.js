const Taxi = require("../models/Taxi");
const User = require("../models/User");

// ➕ Create Taxi
exports.createTaxi = async (req, res) => {
  try {
    const adminId = req.user._id;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create taxis" });
    }

    const superAdminId = admin.superAdmin;
    if (!superAdminId) {
      return res
        .status(400)
        .json({ message: "Admin is not linked to a super admin" });
    }

    const { model, plateNumber, fuelType, capacity, status, assignedDriver } =
      req.body;

    const taxi = await Taxi.create({
      model,
      plateNumber,
      fuelType,
      capacity,
      status,
      assignedDriver,
      admin: adminId,
      superAdmin: superAdminId,
    });

    res.status(201).json(taxi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📖 Get all Taxis (visible for superAdmin or admin)
exports.getTaxis = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let taxis;

    if (user.role === "superAdmin") {
      taxis = await Taxi.find({ superAdmin: user._id }).populate(
        "admin assignedDriver"
      );
    } else if (user.role === "admin") {
      taxis = await Taxi.find({ admin: user._id }).populate("assignedDriver");
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(taxis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📖 Get Taxi by ID
exports.getTaxiById = async (req, res) => {
  try {
    const taxi = await Taxi.findById(req.params.id).populate(
      "admin superAdmin assignedDriver"
    );
    if (taxi) res.json(taxi);
    else res.status(404).json({ message: "Taxi not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Taxi (admin only)
exports.updateTaxi = async (req, res) => {
  try {
    const adminId = req.user._id;

    const taxi = await Taxi.findOneAndUpdate(
      { _id: req.params.id, admin: adminId },
      req.body,
      { new: true }
    );

    if (!taxi) {
      return res
        .status(404)
        .json({ message: "Taxi not found or unauthorized" });
    }

    res.json(taxi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ Delete Taxi (admin only)
exports.deleteTaxi = async (req, res) => {
  try {
    const adminId = req.user._id;

    const deletedTaxi = await Taxi.findOneAndDelete({
      _id: req.params.id,
      admin: adminId,
    });

    if (!deletedTaxi) {
      return res
        .status(404)
        .json({ message: "Taxi not found or unauthorized" });
    }

    res.json({ message: "Taxi deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getTaxisByDriver = async (req, res) => {
  try {
    const taxis = await Taxi.find({ assignedDriver: req.params.driverId });
    res.json(taxis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
