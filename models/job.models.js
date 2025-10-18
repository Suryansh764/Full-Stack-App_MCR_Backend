const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobTitle: { 
    type: String, 
    required: true 
  },
  company: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  salary: { 
    type: Number, 
    required: true 
  },
  jobType: { 
    type: String, 
    required: true,
    enum: [
      'Full-time (On-site)',
      'Part-time (On-site)',
      'Full-time (Remote)',
      'Part-time (Remote)'
    ]
  },
  description: { 
    type: String, 
    required: true 
  },
  jobQualifications: { 
    type: [String], 
    required: true 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Job", jobSchema);