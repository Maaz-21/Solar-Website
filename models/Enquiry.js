import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    city: String,
    pincode: String,
    billRange: String,
    message: String,
    status: { type: String, default: "new" }, // new | contacted | closed

    // Present only when the enquiry comes from the Solar Design Studio —
    // carries the context the sales team needs to follow up. No defaults,
    // so regular contact-form enquiries stay untouched.
    solarDesign: {
      address: String,
      state: String,
      coordinates: { type: [Number], default: undefined }, // [lng, lat]
      monthlyBill: Number,
      monthlyUnits: Number,
      tariff: Number,
      coverage: Number,
      roofAreaM2: Number,
      usableAreaM2: Number,
      systemSizeKW: Number,
      panelCount: Number,
      estimatedAnnualKWh: Number,
      source: String, // e.g. "design-studio"
    },

    replies: [
      {
        subject: String,
        message: String,
        repliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);
