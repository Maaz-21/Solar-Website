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
  },
  { timestamps: true }
);

export default mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);
