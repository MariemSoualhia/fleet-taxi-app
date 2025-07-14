const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendNotification = require("../utils/sendNotification");
const sendEmail = require("../utils/sendEmail");
const generatePassword = require("generate-password");
// 🔐 Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isApproved) {
        return res
          .status(403)
          .json({ message: "Your account is not yet approved." });
      }

      res.json({
        user: user,
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// 🧑‍💼 SuperAdmin crée un admin
exports.registerAdmin = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Admin already exists" });

    const superAdminId = req.user._id;

    // Generate a random password
    const randomPassword = generatePassword.generate({
      length: 10,
      numbers: true,
      symbols: false,
      uppercase: true,
      lowercase: true,
      strict: true,
    });

    // Create the admin account
    const admin = await User.create({
      name,
      email,
      password: randomPassword,
      phone,
      role: "admin",
      isApproved: true,
      superAdmin: superAdminId,
    });

    // Send welcome email
    const subject = "👋 Welcome to FleetPulse - Your Admin Account";

    const message = `
Hi ${name},

Your admin account has been successfully created on FleetPulse.

🔐 Login credentials:
- Email: ${email}
- Password: ${randomPassword}
- Role: Admin

✅ Your account is already approved. You can log in immediately and start managing your drivers.

🔁 We highly recommend changing your password after your first login for security reasons.

If you have any questions or need assistance, feel free to reach out to your Super Admin.

Best regards,  
FleetPulse Team
    `;

    await sendEmail(email, subject, message);

    res.status(201).json({
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        superAdmin: admin.superAdmin,
      },
      token: generateToken(admin),
    });
  } catch (error) {
    console.error("❌ Error registering admin:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🚗 Admin crée un driver
exports.registerDriver = async (req, res) => {
  const { name, email, phone, driverDetails } = req.body;
  const adminId = req.user._id;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Driver already exists" });

    // Générer un mot de passe aléatoire
    const randomPassword = generatePassword.generate({
      length: 10,
      numbers: true,
      symbols: false,
      uppercase: true,
      lowercase: true,
      strict: true,
    });

    // Création du driver lié à l’admin
    const driver = await User.create({
      name,
      email,
      password: randomPassword,
      phone,
      role: "driver",
      admin: adminId,
      isApproved: false,
      driverDetails,
    });

    // Trouver le superAdmin lié à cet admin
    const adminUser = await User.findById(adminId).select("superAdmin");
    if (adminUser && adminUser.superAdmin) {
      await sendNotification(
        adminUser.superAdmin,
        `🚗 New driver "${name}" has requested account approval.`
      );
    }

    // Envoyer l'email au nouveau driver
    const subject = "🚗 Welcome to FleetPulse - Driver Registration";
    const message = `
Hi ${name},

Your driver account has been successfully created on FleetPulse.

🔐 Login credentials:
- Email: ${email}
- Password: ${randomPassword}
- Role: Driver

However, please note that your account is currently pending approval by a Super Admin. You will be notified once your account is activated.

📍 In the meantime, feel free to reach out to your admin if you have any questions.

Thank you,  
The FleetPulse Team
    `;

    await sendEmail(email, subject, message);

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
    console.error("❌ Error registering driver:", error);
    res.status(500).json({ message: error.message });
  }
};

// Pour tout le monde via /register
exports.registerUser = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      role,
      isApproved: false,
    });
    // 🔔 Notify super admin
    const superAdmin = await User.findOne({ role: "superAdmin" });
    if (superAdmin) {
      await sendNotification(
        superAdmin._id,
        `New ${role} "${name}" has requested account approval.`
      );
    }

    res.status(201).json({ message: "Account created, waiting for approval." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerSuperAdmin = async (req, res) => {
  const { name, email, password, phone, companyDetails } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newSuperAdmin = await User.create({
      name,
      email,
      password,
      phone,
      role: "superAdmin",
      isApproved: false,
      companyDetails, // stocker les détails de la société
    });

    // 🔔 Envoi d'email au propriétaire de la plateforme
    const platformOwnerEmail = "wissalb904@gmail.com";
    const subject = "🟢 New Super Admin Registration Request";

    const message = `
A new super admin has requested access:

👤 Name: ${name}
📧 Email: ${email}
📞 Phone: ${phone}

🏢 Company Information:
- Name: ${companyDetails?.companyName || "N/A"}
- Email: ${companyDetails?.companyEmail || "N/A"}
- Phone: ${companyDetails?.companyPhone || "N/A"}
- Address: ${companyDetails?.companyAddress || "N/A"}
- Website: ${companyDetails?.website || "N/A"}
- Description: ${companyDetails?.description || "N/A"}

Please review and approve this request in the admin panel.
`;

    await sendEmail(platformOwnerEmail, subject, message);

    res.status(201).json({
      message:
        "Super admin account request submitted. You will be contacted after approval.",
    });
  } catch (error) {
    console.error("❌ Error registering super admin:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.registerDriverBySuperAdmin = async (req, res) => {
  const { name, email, phone, adminId, driverDetails } = req.body;
  const superAdminId = req.user._id;

  try {
    // Vérifier que l'admin appartient bien à ce super admin
    const admin = await User.findOne({
      _id: adminId,
      role: "admin",
      superAdmin: superAdminId,
    });
    if (!admin) {
      return res
        .status(403)
        .json({
          message:
            "Unauthorized: Admin not found or not under your supervision.",
        });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Driver already exists" });

    const randomPassword = generatePassword.generate({
      length: 10,
      numbers: true,
      symbols: false,
      uppercase: true,
      lowercase: true,
      strict: true,
    });

    const driver = await User.create({
      name,
      email,
      password: randomPassword,
      phone,
      role: "driver",
      admin: adminId,
      isApproved: true, // ✅ auto-approbation par le super admin
      driverDetails,
    });

    const subject = "🚗 Welcome to FleetPulse - Driver Account";
    const message = `
Hi ${name},

Your driver account has been successfully created on FleetPulse.

🔐 Login credentials:
- Email: ${email}
- Password: ${randomPassword}
- Role: Driver

✅ Your account has already been approved by the Super Admin.

You may now log in and start using the platform.

Thank you,  
The FleetPulse Team
    `;

    await sendEmail(email, subject, message);

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
    console.error("❌ Error registering driver by super admin:", error);
    res.status(500).json({ message: error.message });
  }
};
