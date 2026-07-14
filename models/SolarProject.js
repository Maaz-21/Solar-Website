import mongoose from "mongoose";

const PolygonSchema = {
  type: { type: String, enum: ["Polygon"], default: "Polygon" },
  coordinates: { type: [[[Number]]], default: [] },
};

const SolarProjectSchema = new mongoose.Schema(
  {
    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },

    location: {
      address: { type: String, default: "" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      pincode: { type: String, default: "" },
      pinConfirmed: { type: Boolean, default: false },
    },

    roofPolygon: PolygonSchema,

    roof: {
      roofType: { type: String, enum: ["flat", "pitched"], default: "flat" },
      tiltDeg: { type: Number, default: 15 }, // mounting tilt (flat) or roof tilt (pitched)
      tiltUserEdited: { type: Boolean, default: false },
      setbackM: { type: Number, default: 0.5 },
    },

    obstacles: [
      {
        polygon: PolygonSchema,
        obstacleType: { type: String, default: "custom" },
        label: { type: String, default: "Obstacle" },
        heightM: { type: Number, default: 1.5 },
      },
    ],

    electricityProfile: {
      mode: { type: String, enum: ["bill", "units", "skipped"], default: "skipped" },
      monthlyBill: { type: Number, default: 0 },
      monthlyUnits: { type: Number, default: 0 },
      tariff: { type: Number, default: 8 },
      coverage: { type: Number, default: 100 },
      evCharging: { type: Boolean, default: false },
      batteryBackup: { type: Boolean, default: false },
      netMetering: { type: Boolean, default: true },
      recommendedKW: { type: Number, default: 0 },
    },

    panelLayout: {
      panels: [
        {
          id: { type: String, default: "" },
          coordinates: { type: [[[Number]]], default: [] },
          center: { type: [Number], default: [0, 0] },
          orientation: { type: String, enum: ["portrait", "landscape"], default: "portrait" },
          row: { type: Number, default: 0 },
          col: { type: Number, default: 0 },
          enabled: { type: Boolean, default: true },
        },
      ],
      panelCount: { type: Number, default: 0 },
      systemSizeKW: { type: Number, default: 0 },
      totalPanelArea: { type: Number, default: 0 },
      roofUtilization: { type: Number, default: 0 },
      panelOrientation: { type: String, default: "portrait" },
      rowPitchM: { type: Number, default: 0 },
    },

    panelSpecs: {
      lengthM: { type: Number, default: 2.2 },
      widthM: { type: Number, default: 1.1 },
      wattage: { type: Number, default: 550 },
      efficiency: { type: Number, default: 0.2 },
    },

    // Full report objects change shape as the engine evolves; store as-is.
    energyReport: { type: mongoose.Schema.Types.Mixed, default: {} },
    roofMetrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    confidence: { type: mongoose.Schema.Types.Mixed, default: {} },

    status: {
      type: String,
      enum: ["draft", "designed", "proposal", "approved"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.models.SolarProject ||
  mongoose.model("SolarProject", SolarProjectSchema);
