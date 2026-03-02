/**
 * Resume Controller — Upload, List, View, Delete
 */
const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const { extractText, cleanText, quickExtractSkills } = require('../utils/textExtractor');
const { extractBasicInfo } = require('../utils/groqService');

// ── POST /api/resumes/upload ──────────────────────────────────
// Handles single OR multiple file uploads
exports.uploadResume = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
        const fileType = ext === 'pdf' ? 'pdf' : 'docx';

        // Extract text
        const rawText = await extractText(file.path, fileType);
        const cleanedText = cleanText(rawText);

        if (!cleanedText || cleanedText.length < 50) {
          errors.push({ file: file.originalname, error: 'Could not extract readable text from file.' });
          fs.unlinkSync(file.path); // Remove invalid file
          continue;
        }

        // Quick skill extraction and basic info
        const skills = quickExtractSkills(cleanedText);
        const basicInfo = extractBasicInfo(cleanedText);

        // Derive candidate name from filename as placeholder
        const nameFromFile = path.basename(file.originalname, path.extname(file.originalname))
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .replace(/resume|cv/gi, '')
          .trim() || 'Unknown Candidate';

        const resume = await Resume.create({
          candidateName: nameFromFile,
          email: basicInfo.email,
          phone: basicInfo.phone,
          originalFileName: file.originalname,
          storedFileName: file.filename,
          fileType,
          fileSize: file.size,
          filePath: file.path,
          extractedText: cleanedText,
          extractedSkills: skills,
          status: 'pending',
          uploadedBy: req.user._id,
        });

        results.push({
          _id: resume._id,
          candidateName: resume.candidateName,
          email: resume.email,
          originalFileName: resume.originalFileName,
          fileType: resume.fileType,
          fileSize: resume.fileSize,
          extractedSkills: resume.extractedSkills,
          status: resume.status,
          createdAt: resume.createdAt,
        });
      } catch (fileErr) {
        errors.push({ file: file.originalname, error: fileErr.message });
        // Clean up failed file
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    res.status(201).json({
      success: true,
      message: `${results.length} resume(s) uploaded successfully`,
      uploaded: results,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/resumes ──────────────────────────────────────────
exports.getResumes = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, sort = '-createdAt' } = req.query;
    const query = { uploadedBy: req.user._id };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { candidateName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Resume.countDocuments(query);
    const resumes = await Resume.find(query)
      .select('-extractedText')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      resumes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/resumes/:id ──────────────────────────────────────
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    }).populate('evaluations');

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    res.json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/resumes/:id ───────────────────────────────────
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    // Delete physical file
    if (resume.filePath && fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await resume.deleteOne();

    res.json({ success: true, message: 'Resume deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/resumes/:id ────────────────────────────────────
exports.updateResume = async (req, res) => {
  try {
    const { candidateName, notes, tags } = req.body;
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, uploadedBy: req.user._id },
      { candidateName, notes, tags },
      { new: true, runValidators: true }
    ).select('-extractedText');

    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });
    res.json({ success: true, resume });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
