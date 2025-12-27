import mongoose from "mongoose";

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

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
