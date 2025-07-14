const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const defimg = "profil1.png";

// 🔹 Sous-schema pour les conducteurs
const driverDetailsSchema = new mongoose.Schema({
  licenseNumber: {
    type: String,
    unique: true,
    sparse: true,
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

// 🔹 Sous-schema pour les sociétés (superAdmin uniquement)
const companyDetailsSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyAddress: { type: String },
  companyEmail: { type: String },
  companyPhone: { type: String },
  website: { type: String },
  description: { type: String },
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
    profileImage: { type: String, default: defimg },
    isApproved: { type: Boolean, default: false },

    // 🔸 Si superAdmin
    companyDetails: {
      type: companyDetailsSchema,
      required: function () {
        return this.role === "superAdmin";
      },
    },

    // 🔸 Si admin
    superAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.role === "admin";
      },
    },

    // 🔸 Si driver
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

// 🔐 Hash du mot de passe avant enregistrement
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Vérification du mot de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
