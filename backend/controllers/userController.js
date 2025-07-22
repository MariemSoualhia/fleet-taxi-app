// GET /api/users/admins
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");
const sendEmail = require("../utils/sendEmail");
const generatePassword = require("generate-password");
const nodemailer = require("nodemailer");

const getAdmins = async (req, res) => {
  try {
    console.log(req.user);
    const admins = await User.find({
      role: "admin",
      superAdmin: req.user._id,
    }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error getting admins:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const superAdminId = req.user._id; // Auth middleware doit injecter le user

    // Récupérer les Admins liés à ce SuperAdmin
    const admins = await User.find({
      role: "admin",
      superAdmin: superAdminId,
    }).select("-password");

    // Récupérer les Drivers de ces Admins
    const adminIds = admins.map((admin) => admin._id);

    const drivers = await User.find({
      role: "driver",
      admin: { $in: adminIds },
    }).select("-password");

    // Fusionner les deux listes
    const allUsers = [...admins, ...drivers];

    res.status(200).json(allUsers);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs du superAdmin :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
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
    const superAdminId = req.user._id;
    console.log(superAdminId);
    // 1. Trouver les admins liés à ce superAdmin
    const admins = await User.find({
      superAdmin: superAdminId,
      role: "admin",
    }).select("_id");

    const adminIds = admins.map((admin) => admin._id);
    console.log(adminIds);
    // 2. Trouver les drivers liés à ces admins, non approuvés
    const drivers = await User.find({
      admin: { $in: adminIds }, // ou un champ admin qui pointe vers l'id admin
      role: "driver",
      isApproved: false,
    });

    res.json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const approveUser = async (req, res) => {
  try {
    // 1. Récupérer le driver à approuver
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isApproved = true;
    await user.save();

    // 2. Vérifier s’il est bien lié à un admin
    if (!user.admin) {
      return res
        .status(400)
        .json({ message: "Driver has no associated admin" });
    }

    // 3. Récupérer l'admin
    const admin = await User.findById(user.admin).select("name superAdmin");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 4. Récupérer le superAdmin
    const superAdmin = await User.findById(admin.superAdmin).select("name");
    if (!superAdmin) {
      return res.status(404).json({ message: "SuperAdmin not found" });
    }

    // 5. Envoyer la notification à l'admin
    await sendNotification(
      admin._id,
      `Driver "${user.name}" has been approved by super admin "${superAdmin.name}".`
    );
    // 6. Send approval email to the driver
    const subject = "✅ Your FleetPulse Driver Account Has Been Approved";

    const message = `
Hi ${user.name},

Good news! Your driver account has just been approved by the FleetPulse super admin.

🚗 You can now log in and access your dashboard.

If you have any questions, please contact your admin.

Welcome aboard,  
FleetPulse Team
    `;

    await sendEmail(user.email, subject, message);

    res.json({ message: "User approved successfully" });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/update-company/:id
const generateToken = require("../utils/generateToken"); // adapte le chemin

const updateCompanyDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const { companyDetails } = req.body;

    // Trouver l'utilisateur et vérifier son rôle
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "superAdmin")
      return res
        .status(403)
        .json({ message: "Access denied. Not a superAdmin." });

    // S'assurer que companyDetails est un objet
    const existingDetails = user.companyDetails
      ? user.companyDetails.toObject?.() || user.companyDetails
      : {};

    user.companyDetails = {
      ...existingDetails,
      ...companyDetails,
    };

    const updatedUser = await user.save();

    // Retourner un objet user simplifié + token
    res.json({
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
        companyDetails: updatedUser.companyDetails,
      },
      token: generateToken(updatedUser),
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};
const getSuperAdminStats = async (req, res) => {
  try {
    const superAdminId = req.user._id;

    // 1. Trouver tous les admins de ce superAdmin
    const admins = await User.find({
      role: "admin",
      superAdmin: superAdminId,
    }).select("_id");

    const adminIds = admins.map((admin) => admin._id);

    // 2. Trouver tous les drivers liés à ces admins
    const drivers = await User.find({
      role: "driver",
      admin: { $in: adminIds },
    }).select("isApproved");

    const totalDrivers = drivers.length;
    const approvedDrivers = drivers.filter((d) => d.isApproved).length;

    res.json({
      admins: admins.length,
      drivers: totalDrivers,
      approvedUsers: approvedDrivers,
    });
  } catch (err) {
    console.error("Error in superAdmin stats:", err);
    res.status(500).json({ message: "Error retrieving stats" });
  }
};
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        company: updatedUser.company,
        position: updatedUser.position,
        profileImage: updatedUser.profileImage,
      },
      token: generateToken(updatedUser),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ❌ Delete User
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// 🔑 Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save(); // 🔐 déclenche le pre('save') pour hachage

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ➕ Update only profile image
const updateProfileImage = async (req, res) => {
  try {
    console.log(req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
      await user.save();
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        company: user.company,
        position: user.position,
        profileImage: user.profileImage,
      },
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User with this email not found" });

    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.save();

    // Configurer l’envoi de mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "soualhiamariem@gmail.com",
        pass: "dtmrkjmgvatojsws", // ⚠️ Utilise un mot de passe d'application Gmail
      },
    });

    const mailOptions = {
      from: "FleetPulse <your-email@gmail.com>",
      to: email,
      subject: "FleetPulse - Temporary Password",
      text: `Hello ${user.name},\n\nHere is your temporary password: ${tempPassword}\nPlease log in and change it immediately.\n\nFleetPulse Team`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Temporary password sent to your email." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error processing request." });
  }
};
// controllers/userController.js
const getAdminsForSuperAdmin = async (req, res) => {
  try {
    const superAdminId = req.user.id;
    const admins = await User.find({
      role: "admin",
      superAdmin: superAdminId,
    }).select("name email _id");
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admins." });
  }
};

module.exports = {
  getDriversByAdmin,
  getAdmins,
  getUsers,
  getAllUsers,
  approveUser,
  updateCompanyDetails,
  getSuperAdminStats,
  deleteUser,
  changePassword,
  updateProfileImage,
  updateUser,
  forgotPassword,
  getAdminsForSuperAdmin,
};
