const User = require("../models/User");

const createSuperAdmin = async () => {
  const existingSuperAdmin = await User.findOne({ role: "superAdmin" });
  if (!existingSuperAdmin) {
    await User.create({
      name: "Super Admin",
      email: process.env.emailSuper,
      password: process.env.passwordSuper,
      role: "superAdmin",
      isApproved: true,
    });
    console.log("✅ Super Admin created");
  } else {
    console.log("✅ Super Admin already exists");
  }
};

module.exports = createSuperAdmin;
