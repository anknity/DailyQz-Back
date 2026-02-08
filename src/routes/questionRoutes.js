const express = require('express')
const { verifyToken } = require('../middleware/auth')
const {
  getQuestions,
  verifyAnswers,
  getCategories
} = require('../controllers/questionController')

const router = express.Router()

/**
 * Question Routes
 */

// GET /api/questions - Get random questions (public for testing, can add auth)
router.get('/', getQuestions)

// POST /api/questions/verify - Verify answers and get score (requires auth)
router.post('/verify', verifyToken, verifyAnswers)

// GET /api/questions/categories - Get available categories
router.get('/categories', getCategories)

module.exports = router
