const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    taxiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taxi",
      required: true,
    },
    startLocation: {
      type: String,
      required: true,
    },
    endLocation: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    distanceDriven: {
      type: Number,
      required: true,
    },
    fuelUsed: {
      type: Number,
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["on-time", "delayed"],
      default: "on-time",
    },
    delayReason: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (this.deliveryStatus === "delayed") {
            return v != null && v.length > 0;
          }
          return true;
        },
        message: "Delay reason required if delivery is delayed",
      },
    },
    tripStatus: {
      type: String,
      enum: ["ongoing", "completed", "cancelled"],
      default: "ongoing",
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

module.exports = mongoose.model("Trip", tripSchema);
