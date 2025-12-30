import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

const FaqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "general" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Faq = mongoose.models.Faq || mongoose.model("Faq", FaqSchema);

const faqData = [
  {
    category: "General",
    question: "What is the lifespan of a rooftop solar system?",
    answer: "Most rooftop solar systems last 25 years or more. Solar panels typically come with a 25-year performance warranty, while inverters may need replacement after 8–12 years."
  },
  {
    category: "General",
    question: "Will solar work during power cuts?",
    answer: "Standard grid-connected systems switch off during power cuts for safety. With battery backup or hybrid systems, limited power can be used during outages."
  },
  {
    category: "Installation & Maintenance",
    question: "Can installing solar damage my roof?",
    answer: "No. When installed correctly using non-invasive mounting and proper waterproofing techniques, solar panels do not damage the roof."
  },
  {
    category: "Installation & Maintenance",
    question: "Does a solar system require regular maintenance?",
    answer: "Maintenance is minimal. Occasional panel cleaning and basic system checks are sufficient to ensure optimal performance."
  },
  {
    category: "Installation & Maintenance",
    question: "Is solar suitable for non-concrete roofs?",
    answer: "Yes. Solar systems can be installed on metal sheets, tiled roofs, and other structures using customized mounting solutions."
  },
  {
    category: "Cost, Savings & Subsidy",
    question: "How much can I save on my electricity bill?",
    answer: "Savings depend on system size and usage, but many households reduce their electricity bills by 70–90% after switching to solar."
  },
  {
    category: "Cost, Savings & Subsidy",
    question: "Are government subsidies available?",
    answer: "Yes. Rooftop solar systems are eligible for MNRE subsidies, subject to capacity and location. We assist with the complete subsidy process."
  },
  {
    category: "Cost, Savings & Subsidy",
    question: "How long does it take to recover the cost?",
    answer: "Most rooftop solar systems recover their cost within 4–6 years through electricity bill savings."
  },
];

async function seedFaqs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await Faq.deleteMany({});
    console.log("Cleared existing FAQs");

    await Faq.insertMany(faqData);
    console.log("Seeded FAQs successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding FAQs:", error);
    process.exit(1);
  }
}

seedFaqs();
