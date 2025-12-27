import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const MONGO_URI = process.env.MONGO_URI;

const ProjectSchema = new mongoose.Schema(
  {
    title: String,
    location: String,
    capacity: String, // e.g. "6 kW"
    description: String,
    images: [String],
    type: String, // residential | commercial
  },
  { timestamps: true }
);
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

async function test() {
  try {
    console.log("Testing DB connection...");
    console.log("URI:", MONGO_URI ? "Found" : "Missing");
    
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      family: 4,
    };

    await mongoose.connect(MONGO_URI, opts);
    console.log("DB Connected.");
    
    console.log("Fetching projects...");
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects.`);
    
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

test();
