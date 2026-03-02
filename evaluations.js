// routes/evaluations.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  runEvaluation, getEvaluations, getEvaluation,
  toggleShortlist, updateNotes,
} = require('../controllers/evaluationController');

router.use(protect);
router.post('/run', runEvaluation);
router.get('/', getEvaluations);
router.get('/:id', getEvaluation);
router.patch('/:id/shortlist', toggleShortlist);
router.patch('/:id/notes', updateNotes);

module.exports = router;
