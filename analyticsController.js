const Resume = require('../models/Resume');
const Evaluation = require('../models/Evaluation');
const JobDescription = require('../models/JobDescription');

// ── GET /api/analytics/dashboard ─────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalResumes, totalEvaluations, shortlistedCount, activeJobs, recentEvaluations] = await Promise.all([
      Resume.countDocuments({ uploadedBy: userId }),
      Evaluation.countDocuments({ evaluatedBy: userId }),
      Evaluation.countDocuments({ evaluatedBy: userId, shortlisted: true }),
      JobDescription.countDocuments({ createdBy: userId, isActive: true }),
      Evaluation.find({ evaluatedBy: userId })
        .populate('resume', 'candidateName email fileType')
        .populate('job', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Average score
    const avgResult = await Evaluation.aggregate([
      { $match: { evaluatedBy: userId } },
      { $group: { _id: null, avg: { $avg: '$scores.overall' } } },
    ]);
    const avgScore = avgResult[0] ? Math.round(avgResult[0].avg) : 0;

    // Recommendation counts
    const recAgg = await Evaluation.aggregate([
      { $match: { evaluatedBy: userId } },
      { $group: { _id: '$recommendation', count: { $sum: 1 } } },
    ]);
    const strongFitCount      = recAgg.find(r => r._id === 'Strong Fit')?.count || 0;
    const moderateFitCount    = recAgg.find(r => r._id === 'Moderate Fit')?.count || 0;
    const notRecommendedCount = recAgg.find(r => r._id === 'Not Recommended')?.count || 0;

    // Score distribution buckets 0-25, 26-50, 51-75, 76-100
    const scoreDist = await Evaluation.aggregate([
      { $match: { evaluatedBy: userId } },
      {
        $bucket: {
          groupBy: '$scores.overall',
          boundaries: [0, 26, 51, 76, 101],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);
    const scoreDistribution = [
      { range: '0–25',  count: scoreDist.find(s => s._id === 0)?.count  || 0 },
      { range: '26–50', count: scoreDist.find(s => s._id === 26)?.count || 0 },
      { range: '51–75', count: scoreDist.find(s => s._id === 51)?.count || 0 },
      { range: '76–100',count: scoreDist.find(s => s._id === 76)?.count || 0 },
    ];

    res.json({
      success: true,
      totalResumes,
      totalEvaluations,
      shortlistedCount,
      activeJobs,
      avgScore,
      strongFitCount,
      moderateFitCount,
      notRecommendedCount,
      scoreDistribution,
      recentEvaluations,
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/analytics/skills ─────────────────────────────────
exports.getSkillsAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const matched = await Evaluation.aggregate([
      { $match: { evaluatedBy: userId } },
      { $unwind: '$matchedSkills' },
      { $group: { _id: '$matchedSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Format as { skill, count } for frontend BarChart
    const skills = matched.map(s => ({ skill: s._id, count: s.count }));

    res.json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/analytics/scores ─────────────────────────────────
exports.getScoreAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const scoreByRole = await Evaluation.aggregate([
      { $match: { evaluatedBy: userId } },
      { $lookup: { from: 'jobdescriptions', localField: 'job', foreignField: '_id', as: 'jobData' } },
      { $unwind: '$jobData' },
      {
        $group: {
          _id: '$jobData.title',
          avgScore: { $avg: '$scores.overall' },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgScore: -1 } },
    ]);

    res.json({ success: true, scoreByRole });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
