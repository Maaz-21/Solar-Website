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
