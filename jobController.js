/**
 * Job Description Controller
 */
const JobDescription = require('../models/JobDescription');

// ── POST /api/jobs ────────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    const {
      title, department, location, jobType, salaryRange,
      requiredSkills, niceToHaveSkills, requiredExperience,
      requiredEducation, additionalKeywords, description,
      responsibilities, scoringWeights,
    } = req.body;

    // Parse comma-separated strings if needed
    const parseSkills = (val) => {
      if (Array.isArray(val)) return val.map((s) => s.trim()).filter(Boolean);
      if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const job = await JobDescription.create({
      title,
      department: department || '',
      location: location || 'Remote',
      jobType: jobType || 'Full-time',
      salaryRange,
      requiredSkills: parseSkills(requiredSkills),
      niceToHaveSkills: parseSkills(niceToHaveSkills),
      requiredExperience,
      requiredEducation,
      additionalKeywords: parseSkills(additionalKeywords),
      description: description || '',
      responsibilities: parseSkills(responsibilities),
      scoringWeights: scoringWeights || { skills: 35, experience: 30, education: 15, keywords: 10, ats: 10 },
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Job description created', job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── GET /api/jobs ─────────────────────────────────────────────
exports.getJobs = async (req, res) => {
  try {
    const { isActive, search } = req.query;
    const query = { createdBy: req.user._id };
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.$text = { $search: search };

    const jobs = await JobDescription.find(query).sort('-createdAt').lean();
    res.json({ success: true, total: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/jobs/:id ─────────────────────────────────────────
exports.getJob = async (req, res) => {
  try {
    const job = await JobDescription.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/jobs/:id ─────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    const parseSkills = (val) => {
      if (Array.isArray(val)) return val.map((s) => s.trim()).filter(Boolean);
      if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const updates = { ...req.body };
    if (updates.requiredSkills) updates.requiredSkills = parseSkills(updates.requiredSkills);
    if (updates.additionalKeywords) updates.additionalKeywords = parseSkills(updates.additionalKeywords);
    if (updates.niceToHaveSkills) updates.niceToHaveSkills = parseSkills(updates.niceToHaveSkills);

    const job = await JobDescription.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    res.json({ success: true, message: 'Job updated', job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/jobs/:id ──────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const job = await JobDescription.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    res.json({ success: true, message: 'Job deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
