const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const defimg = "profil1.png";

// Sous-schema pour les conducteurs
const driverDetailsSchema = new mongoose.Schema({
  licenseNumber: {
    type: String,
    unique: true,
    sparse: true, // <-- important : permet d’avoir plusieurs docs avec licenseNumber = null
  },
  hireDate: { type: Date },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  assignedTruckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Truck",
    default: null,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "driver"],
      required: true,
    },
    phone: { type: String },
    company: { type: String },
    position: { type: String },
    isApproved: { type: Boolean, default: false },
    profileImage: { type: String, default: defimg },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.role === "driver";
      },
    },
    driverDetails: {
      type: driverDetailsSchema,
      required: function () {
        return this.role === "driver";
      },
    },
  },
  { timestamps: true }
);

// 🔐 Hash du mot de passe
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
