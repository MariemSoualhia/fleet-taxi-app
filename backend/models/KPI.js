const mongoose = require("mongoose");

const kpiSchema = new mongoose.Schema(
  {
    metricName: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedEntityType",
    },
    relatedEntityType: {
      type: String,
      enum: ["Driver", "Taxi"], // ✅ remplacé "Truck" par "Taxi"
    },
    generatedByUserId: {
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

module.exports = mongoose.model("Kpi", kpiSchema);
