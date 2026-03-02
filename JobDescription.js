/**
 * JobDescription Model — Stores job role requirements
 */
const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema(
  {
    // ── Basic Info ────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 chars'],
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote',
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
      default: 'Full-time',
    },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },

    // ── Requirements ──────────────────────────────────────────
    requiredSkills: {
      type: [String],
      required: [true, 'At least one required skill is needed'],
    },
    niceToHaveSkills: [String],
    requiredExperience: {
      type: String,
      enum: ['Fresher (0-1 yr)', '1-3 years', '3-5 years', '5+ years'],
      required: true,
    },
    requiredEducation: {
      type: String,
      required: [true, 'Required education is needed'],
    },
    additionalKeywords: [String],
    description: {
      type: String,
      default: '',
    },
    responsibilities: [String],

    // ── Screening Weights (must sum to 100) ───────────────────
    scoringWeights: {
      skills: { type: Number, default: 35 },
      experience: { type: Number, default: 30 },
      education: { type: Number, default: 15 },
      keywords: { type: Number, default: 10 },
      ats: { type: Number, default: 10 },
    },

    // ── Status ────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    shortlistedCount: {
      type: Number,
      default: 0,
    },

    // ── Created by ────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

jobDescriptionSchema.index({ title: 'text', description: 'text' });
jobDescriptionSchema.index({ createdBy: 1, isActive: 1 });

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
