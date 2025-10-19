const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { initializeDatabase } = require("./db/db.connect");
const Job = require("./models/job.models");

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5174",
  "https://full-stack-app-mcr-frontend.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

initializeDatabase()
  .then(() => console.log("Database connected successfully"))
  .catch(err => {
    console.error("Database connection failed", err);
    process.exit(1);
  });

// Test endpoint
app.get("/", (req, res) => {
  res.send("Job Portal Backend is running");
});

// POST: Create a new job
app.post("/api/jobs", async (req, res) => {
  try {
    const {
      jobTitle, company, location, salary, jobType, description, jobQualifications
    } = req.body;

    if (!jobTitle || !company || !location || !salary || !jobType || !description || !jobQualifications) {
      return res.status(400).json({ 
        message: "Missing required fields (jobTitle, company, location, salary, jobType, description, jobQualifications)" 
      });
    }

    // Ensure qualifications is an array
    const qualificationsArray = Array.isArray(jobQualifications) 
      ? jobQualifications 
      : jobQualifications.split("\n").filter(q => q.trim());

    const newJob = new Job({
      jobTitle, 
      company, 
      location, 
      salary: Number(salary), 
      jobType, 
      description, 
      jobQualifications: qualificationsArray
    });

    const savedJob = await newJob.save();
    res.status(201).json({ 
      success: true,
      message: "Job created successfully", 
      data: savedJob 
    });

  } catch (error) {
    console.error("Error creating job:", error);
    console.error("Full error details:", error.stack);
    res.status(500).json({ 
      success: false,
      message: "Failed to create job", 
      error: error.message,
      details: error.errors || error.stack
    });
  }
});

// GET: Fetch all jobs with optional search
app.get("/api/jobs", async (req, res) => {
  try {
    console.log("Fetching all jobs...");
    const search = req.query.search || "";

    const jobs = await Job.find({
      jobTitle: { $regex: search, $options: "i" },
    }).sort({ createdAt: -1 });

    console.log(`Found ${jobs.length} jobs`);
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch jobs",
      error: error.message,
    });
  }
});

// GET: Fetch a single job by ID
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch job details",
      error: error.message,
    });
  }
});

// DELETE: Delete a job by ID (placeholder for now)
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
      data: deletedJob,
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to delete job",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});