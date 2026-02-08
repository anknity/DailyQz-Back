const express = require('express')
const { verifyToken } = require('../middleware/auth')
const {
  getLeaderboard,
  getUserRank,
  getLeaderboardByCategory,
  getLeaderboardCategories
} = require('../controllers/leaderboardController')

const router = express.Router()

/**
 * Leaderboard Routes
 */

// GET /api/leaderboard - Get leaderboard (public)
router.get('/', getLeaderboard)

// GET /api/leaderboard/categories - Get available categories for filtering
router.get('/categories', getLeaderboardCategories)

// GET /api/leaderboard/by-category - Get leaderboard filtered by category
router.get('/by-category', getLeaderboardByCategory)

// GET /api/leaderboard/rank - Get user's rank (requires auth)
router.get('/rank', verifyToken, getUserRank)

module.exports = router
