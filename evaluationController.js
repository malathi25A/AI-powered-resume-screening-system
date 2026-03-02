/**
 * Evaluation Controller
 * Handles AI-powered resume evaluation using Google Gemini
 */
const Evaluation = require('../models/Evaluation');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const { evaluateResume } = require('../utils/groqService');
const { sendShortlistNotification, sendEvaluationComplete } = require('../utils/emailService');

// ── POST /api/evaluations/run ─────────────────────────────────
// Run AI evaluation on selected resumes for a job
exports.runEvaluation = async (req, res) => {
  try {
    const { jobId, resumeIds, weights } = req.body;

    if (!jobId || !resumeIds || !Array.isArray(resumeIds) || !resumeIds.length) {
      return res.status(400).json({
        success: false,
        message: 'jobId and resumeIds array are required.',
      });
    }

    // Fetch job description
    const job = await JobDescription.findOne({ _id: jobId, createdBy: req.user._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    // Apply custom weights from frontend if provided
    if (weights && typeof weights === 'object') {
      job.scoringWeights = {
        skills:     weights.skills     ?? job.scoringWeights.skills,
        experience: weights.experience ?? job.scoringWeights.experience,
        education:  weights.education  ?? job.scoringWeights.education,
        keywords:   weights.keywords   ?? job.scoringWeights.keywords,
        ats:        weights.ats        ?? job.scoringWeights.ats,
      };
    }

    // Fetch resumes
    const resumes = await Resume.find({
      _id: { $in: resumeIds },
      uploadedBy: req.user._id,
    });

    if (!resumes.length) {
      return res.status(404).json({ success: false, message: 'No resumes found.' });
    }

    const results = [];
    const errors = [];

    // ── Evaluate each resume with Gemini ──────────────────────
    for (const resume of resumes) {
      try {
        // Check if evaluation already exists
        const existing = await Evaluation.findOne({ resume: resume._id, job: job._id });
        if (existing) {
          results.push({ resumeId: resume._id, evaluationId: existing._id, cached: true });
          continue;
        }

        // Call Google Gemini AI
        const aiResult = await evaluateResume(resume.extractedText, job);

        // Save evaluation to DB
        const evaluation = await Evaluation.create({
          resume: resume._id,
          job: job._id,
          evaluatedBy: req.user._id,
          scores: aiResult.scores,
          recommendation: aiResult.recommendation,
          matchedSkills: aiResult.matchedSkills || [],
          missingSkills: aiResult.missingSkills || [],
          extraSkills: aiResult.extraSkills || [],
          summary: aiResult.summary || '',
          strengths: aiResult.strengths || [],
          improvements: aiResult.improvements || [],
          experienceAnalysis: aiResult.experienceAnalysis || '',
          educationAnalysis: aiResult.educationAnalysis || '',
          atsIssues: aiResult.atsIssues || [],
          rawGeminiResponse: aiResult.rawResponse || '',
          status: 'completed',
          shortlisted: aiResult.recommendation === 'Strong Fit',
        });

        // Update resume with extracted candidate info from Gemini
        await Resume.findByIdAndUpdate(resume._id, {
          candidateName: aiResult.candidateName || resume.candidateName,
          email: aiResult.email || resume.email,
          phone: aiResult.phone || resume.phone,
          location: aiResult.location || resume.location,
          experienceYears: aiResult.experienceYears || 0,
          educationLevel: aiResult.educationLevel || '',
          extractedSkills: aiResult.extractedSkills || resume.extractedSkills,
          status: evaluation.shortlisted ? 'shortlisted' : 'evaluated',
          $addToSet: { evaluations: evaluation._id },
        });

        // Update job stats
        await JobDescription.findByIdAndUpdate(job._id, {
          $inc: {
            applicationsCount: 1,
            ...(evaluation.shortlisted ? { shortlistedCount: 1 } : {}),
          },
        });

        results.push({
          resumeId: resume._id,
          evaluationId: evaluation._id,
          candidateName: aiResult.candidateName,
          scores: aiResult.scores,
          recommendation: aiResult.recommendation,
          shortlisted: evaluation.shortlisted,
        });
      } catch (evalErr) {
        console.error(`Evaluation failed for ${resume._id}:`, evalErr.message);
        errors.push({ resumeId: resume._id, error: evalErr.message });
      }
    }

    // Send email notification
    const shortlistedCount = results.filter((r) => r.shortlisted).length;
    if (results.length > 0) {
      await sendEvaluationComplete(req.user.email, job.title, results.length, shortlistedCount);
    }

    res.json({
      success: true,
      message: `Evaluated ${results.length} resume(s) using Google Gemini AI`,
      results,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/evaluations ──────────────────────────────────────
exports.getEvaluations = async (req, res) => {
  try {
    const { jobId, recommendation, shortlisted, page = 1, limit = 50 } = req.query;
    const query = { evaluatedBy: req.user._id };

    if (jobId) query.job = jobId;
    if (recommendation) query.recommendation = recommendation;
    if (shortlisted !== undefined) query.shortlisted = shortlisted === 'true';

    const total = await Evaluation.countDocuments(query);
    const evaluations = await Evaluation.find(query)
      .populate('resume', 'candidateName email phone fileType originalFileName experienceYears educationLevel')
      .populate('job', 'title department requiredSkills requiredExperience')
      .sort({ 'scores.overall': -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, total, evaluations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/evaluations/:id ──────────────────────────────────
exports.getEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({
      _id: req.params.id,
      evaluatedBy: req.user._id,
    })
      .populate('resume', '-extractedText')
      .populate('job')
      .select('+rawGeminiResponse');

    if (!evaluation) return res.status(404).json({ success: false, message: 'Evaluation not found.' });
    res.json({ success: true, evaluation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/evaluations/:id/shortlist ──────────────────────
exports.toggleShortlist = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({
      _id: req.params.id,
      evaluatedBy: req.user._id,
    }).populate('resume', 'candidateName').populate('job', 'title');

    if (!evaluation) return res.status(404).json({ success: false, message: 'Evaluation not found.' });

    evaluation.shortlisted = !evaluation.shortlisted;
    await evaluation.save();

    // Update resume status
    await Resume.findByIdAndUpdate(evaluation.resume._id, {
      status: evaluation.shortlisted ? 'shortlisted' : 'evaluated',
    });

    // Send email notification when shortlisted
    if (evaluation.shortlisted) {
      await sendShortlistNotification(
        req.user.email,
        evaluation.resume.candidateName,
        evaluation.job.title,
        evaluation.scores.overall,
        evaluation.recommendation
      );
    }

    res.json({
      success: true,
      message: evaluation.shortlisted ? 'Candidate shortlisted!' : 'Removed from shortlist.',
      shortlisted: evaluation.shortlisted,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/evaluations/:id/notes ─────────────────────────
exports.updateNotes = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOneAndUpdate(
      { _id: req.params.id, evaluatedBy: req.user._id },
      { hrNotes: req.body.hrNotes, interviewScheduled: req.body.interviewScheduled, interviewDate: req.body.interviewDate },
      { new: true }
    );
    if (!evaluation) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, evaluation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
