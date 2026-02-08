const express = require('express');
const router = express.Router();
const {
  addQuestion,
  bulkAddQuestions,
  getQuestions,
  approveQuestion,
  updateQuestion,
  deleteQuestion,
  getRandomQuestions,
  getQuestionStats,
  searchQuestions,
  getCategories
} = require('../controllers/supabaseQuestionController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * Supabase Question Routes
 * Base path: /api/v2/questions
 */

// Public routes
router.get('/', getQuestions);
router.get('/random', getRandomQuestions);
router.get('/stats', getQuestionStats);
router.get('/search', searchQuestions);
router.get('/categories', getCategories);

// Protected routes (require authentication)
router.use(verifyToken);

router.post('/', addQuestion);
router.post('/bulk', bulkAddQuestions);

// Admin-only routes
router.post('/:questionId/approve', verifyAdmin, approveQuestion);
router.put('/:questionId', verifyAdmin, updateQuestion);
router.delete('/:questionId', verifyAdmin, deleteQuestion);

module.exports = router;
