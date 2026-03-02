// routes/resumes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
  uploadResume, getResumes, getResume, deleteResume, updateResume,
} = require('../controllers/resumeController');

router.use(protect);

router.post('/upload', upload.array('resumes', 20), handleUploadError, uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.patch('/:id', updateResume);
router.delete('/:id', deleteResume);

module.exports = router;
