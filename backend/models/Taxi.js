// models/Taxi.js
const mongoose = require("mongoose");

const taxiSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },
    plateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    fuelType: {
      type: String,
      enum: ["diesel", "electric", "hybrid", "other"],
      default: "diesel",
    },
    capacity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "inMaintenance"],
      default: "available",
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    superAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Taxi", taxiSchema);
