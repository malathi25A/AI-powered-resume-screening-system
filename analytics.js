// routes/analytics.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboard, getSkillsAnalytics, getScoreAnalytics } = require('../controllers/analyticsController');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/skills', getSkillsAnalytics);
router.get('/scores', getScoreAnalytics);

module.exports = router;
