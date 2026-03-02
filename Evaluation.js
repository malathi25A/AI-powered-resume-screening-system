/**
 * Evaluation Model — Stores AI evaluation results
 */
const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────────────
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
      required: true,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── AI Scores (0–100) ─────────────────────────────────────
    scores: {
      overall: { type: Number, min: 0, max: 100, required: true },
      skills: { type: Number, min: 0, max: 100, required: true },
      experience: { type: Number, min: 0, max: 100, required: true },
      education: { type: Number, min: 0, max: 100, required: true },
      keywords: { type: Number, min: 0, max: 100, required: true },
      ats: { type: Number, min: 0, max: 100, required: true },
    },

    // ── AI Recommendation ─────────────────────────────────────
    recommendation: {
      type: String,
      enum: ['Strong Fit', 'Moderate Fit', 'Not Recommended'],
      required: true,
    },
    shortlisted: {
      type: Boolean,
      default: false,
    },

    // ── Skills Analysis ───────────────────────────────────────
    matchedSkills: [String],
    missingSkills: [String],
    extraSkills: [String],

    // ── AI Generated Text ─────────────────────────────────────
    summary: {
      type: String,
      required: true,
    },
    strengths: [String],
    improvements: [String],
    experienceAnalysis: {
      type: String,
      default: '',
    },
    educationAnalysis: {
      type: String,
      default: '',
    },
    atsIssues: [String],

    // ── Raw AI Response (for debugging) ──────────────────────
    rawGeminiResponse: {
      type: String,
      select: false,
    },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },

    // ── HR Notes ──────────────────────────────────────────────
    hrNotes: {
      type: String,
      default: '',
    },
    interviewScheduled: {
      type: Boolean,
      default: false,
    },
    interviewDate: Date,
  },
  {
    timestamps: true,
  }
);

evaluationSchema.index({ resume: 1, job: 1 }, { unique: true });
evaluationSchema.index({ job: 1, 'scores.overall': -1 });
evaluationSchema.index({ shortlisted: 1, recommendation: 1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);
