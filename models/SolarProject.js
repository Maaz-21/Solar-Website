import mongoose from "mongoose";

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
      pincode: { type: String, default: "" },
    },

    roofPolygon: {
      type: { type: String, enum: ["Polygon"], default: "Polygon" },
      coordinates: { type: [[[Number]]], default: [] },
    },

    obstacles: [
      {
        type: { type: String, enum: ["Polygon"], default: "Polygon" },
        coordinates: { type: [[[Number]]], default: [] },
        label: { type: String, default: "Obstacle" },
      },
    ],

    panelLayout: {
      panels: [
        {
          coordinates: { type: [[[Number]]], default: [] },
          center: { type: [Number], default: [0, 0] },
          orientation: { type: String, enum: ["portrait", "landscape"], default: "portrait" },
          row: { type: Number, default: 0 },
        },
      ],
      panelCount: { type: Number, default: 0 },
      systemSizeKW: { type: Number, default: 0 },
      totalPanelArea: { type: Number, default: 0 },
      roofUtilization: { type: Number, default: 0 },
      panelOrientation: { type: String, default: "portrait" },
    },

    panelSpecs: {
      lengthM: { type: Number, default: 2.2 },
      widthM: { type: Number, default: 1.1 },
      wattage: { type: Number, default: 550 },
      efficiency: { type: Number, default: 0.20 },
    },

    energyReport: {
      dailyGeneration: { type: Number, default: 0 },
      monthlyGeneration: { type: Number, default: 0 },
      yearlyGeneration: { type: Number, default: 0 },
      co2SavingsYearly: { type: Number, default: 0 },
      monthlySavings: { type: Number, default: 0 },
      yearlySavings: { type: Number, default: 0 },
      systemCost: { type: Number, default: 0 },
      paybackYears: { type: Number, default: 0 },
      irradiance: { type: Number, default: 0 },
    },

    roofMetrics: {
      totalArea: { type: Number, default: 0 },
      usableArea: { type: Number, default: 0 },
      orientation: { type: Number, default: 180 },
      tilt: { type: Number, default: 0 },
      setbackDistance: { type: Number, default: 0.5 },
    },

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
