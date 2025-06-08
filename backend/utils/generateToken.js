const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.emal, role: user.role }, // Tu peux ajouter d'autres infos si besoin
    process.env.JWT_SECRET,
    {
      expiresIn: "30d", // durée de validité du token
    }
  );
};

module.exports = generateToken;
