import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Define Schemas inline to avoid import issues with Next.js specific code in models if any
// Although models seem pure mongoose, let's be safe and redefine or try to import.
// Importing might fail if models import other things.
// Let's try importing first, if it fails I'll inline.
// Actually, let's just inline them to be 100% sure it works as a standalone script.

const BlogSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    content: String,
    image: String,
    category: String,
    author: String,
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

const ProjectSchema = new mongoose.Schema(
  {
    title: String,
    location: String,
    capacity: String,
    description: String,
    images: [String],
    type: String, // residential | commercial
  },
  { timestamps: true }
);
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

const sampleBlogs = [
  {
    title: "The Future of Solar Energy in India",
    slug: "future-of-solar-energy-india",
    content: "Solar energy is rapidly growing in India...",
    image: "/images/blog1.jpg",
    category: "Industry News",
    author: "Admin",
    published: true
  },
  {
    title: "Top 5 Benefits of Rooftop Solar",
    slug: "top-5-benefits-rooftop-solar",
    content: "1. Cost Savings\n2. Environmental Impact...",
    image: "/images/blog2.jpg",
    category: "Tips",
    author: "Admin",
    published: true
  },
  {
    title: "Understanding Solar Subsidies",
    slug: "understanding-solar-subsidies",
    content: "The government offers various subsidies...",
    image: "/images/blog3.jpg",
    category: "Policy",
    author: "Admin",
    published: false
  }
];

const sampleProjects = [
  {
    title: "Residential Solar Plant in Pune",
    location: "Pune, Maharashtra",
    capacity: "5 kW",
    description: "A high-efficiency residential solar setup.",
    images: ["/images/project1.jpg"],
    type: "residential"
  },
  {
    title: "Commercial Solar Installation",
    location: "Mumbai, Maharashtra",
    capacity: "50 kW",
    description: "Powering a large commercial complex.",
    images: ["/images/project2.jpg"],
    type: "commercial"
  },
  {
    title: "Farmhouse Solar System",
    location: "Nashik, Maharashtra",
    capacity: "10 kW",
    description: "Off-grid solution for a farmhouse.",
    images: ["/images/project3.jpg"],
    type: "residential"
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional, be careful)
    // await Blog.deleteMany({});
    // await Project.deleteMany({});

    // Insert Blogs
    for (const blog of sampleBlogs) {
      const exists = await Blog.findOne({ slug: blog.slug });
      if (!exists) {
        await Blog.create(blog);
        console.log(`Created blog: ${blog.title}`);
      } else {
        console.log(`Blog already exists: ${blog.title}`);
      }
    }

    // Insert Projects
    for (const project of sampleProjects) {
      const exists = await Project.findOne({ title: project.title });
      if (!exists) {
        await Project.create(project);
        console.log(`Created project: ${project.title}`);
      } else {
        console.log(`Project already exists: ${project.title}`);
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
