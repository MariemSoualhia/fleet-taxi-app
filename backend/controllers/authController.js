const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// 🔐 Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isApproved && user.role !== "superAdmin") {
        return res
          .status(403)
          .json({ message: "Your account is not yet approved." });
      }

      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
        },
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧑‍💼 SuperAdmin crée un admin
exports.registerAdmin = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Admin exists" });

    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: "admin",
      isApproved: true,
    });

    res.status(201).json({
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token: generateToken(admin),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚗 Admin crée un driver
exports.registerDriver = async (req, res) => {
  const { name, email, password, phone, driverDetails } = req.body;
  const adminId = req.user._id;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Driver exists" });

    const driver = await User.create({
      name,
      email,
      password,
      phone,
      role: "driver",
      admin: adminId,
      isApproved: false,
      driverDetails,
    });

    res.status(201).json({
      user: {
        _id: driver._id,
        name: driver.name,
        email: driver.email,
        role: driver.role,
        driverDetails: driver.driverDetails,
      },
      token: generateToken(driver),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
