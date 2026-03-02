/**
 * Resume Model — Stores uploaded resume metadata & extracted text
 */
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    // ── Candidate Info (auto-extracted) ─────────────────────
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },

    // ── File Info ────────────────────────────────────────────
    originalFileName: {
      type: String,
      required: true,
    },
    storedFileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    fileSize: {
      type: Number, // bytes
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },

    // ── Extracted Content ─────────────────────────────────────
    extractedText: {
      type: String,
      required: true,
    },
    extractedSkills: [String],
    experienceYears: {
      type: Number,
      default: 0,
    },
    educationLevel: {
      type: String,
      default: '',
    },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'evaluated', 'shortlisted', 'rejected'],
      default: 'pending',
    },

    // ── Uploaded by ───────────────────────────────────────────
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Evaluation references ─────────────────────────────────
    evaluations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evaluation',
      },
    ],

    // ── Tags ──────────────────────────────────────────────────
    tags: [String],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────
resumeSchema.index({ candidateName: 'text', email: 'text', extractedText: 'text' });
resumeSchema.index({ uploadedBy: 1, status: 1 });
resumeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
