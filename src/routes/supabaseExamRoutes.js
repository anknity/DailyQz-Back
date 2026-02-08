const express = require('express');
const router = express.Router();
const {
  createExam,
  getExams,
  getExamById,
  getExamQuestions,
  submitExamResult,
  getUserExamResults,
  getExamLeaderboard,
  updateExam,
  deleteExam,
  generateExamFromBank
} = require('../controllers/supabaseExamController');
const { verifyToken } = require('../middleware/auth');

/**
 * Supabase Exam Routes
 * Base path: /api/v2/exams
 */

// Public routes
router.get('/', getExams);
router.get('/:examId', getExamById);
router.get('/:examId/questions', getExamQuestions);
router.get('/:examId/leaderboard', getExamLeaderboard);

// Protected routes (require authentication)
router.use(verifyToken);

router.post('/', createExam);
router.post('/generate', generateExamFromBank);
router.post('/:examId/submit', submitExamResult);
router.get('/results/my-results', getUserExamResults);
router.put('/:examId', updateExam);
router.delete('/:examId', deleteExam);

module.exports = router;
