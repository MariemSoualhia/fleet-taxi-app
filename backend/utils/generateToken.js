const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
    profileImage: user.profileImage,
    companyDetails: user.companyDetails || null,
    admin: user.admin || null,
    superAdmin: user.superAdmin || null,
    driverDetails: user.driverDetails || null,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
