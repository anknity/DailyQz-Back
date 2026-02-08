const express = require('express')
const { verifyToken } = require('../middleware/auth')
const {
  getProfile,
  updateProfile,
  getStats,
  getTestHistory
} = require('../controllers/userController')
const { db } = require('../config/firebase')

const router = express.Router()

/**
 * User Routes
 * All routes require authentication
 */

// GET /api/users/profile - Get user profile
router.get('/profile', verifyToken, getProfile)

// PUT /api/users/profile - Update user profile
router.put('/profile', verifyToken, updateProfile)

// GET /api/users/stats - Get user statistics
router.get('/stats', verifyToken, getStats)

// GET /api/users/history - Get test history
router.get('/history', verifyToken, getTestHistory)

/**
 * POST /api/users/update-streak
 * Update user streak after any activity (exam, test, DSA, typing, etc.)
 * Uses server timestamps to prevent timezone issues
 */
router.post('/update-streak', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user
    const { activityType } = req.body // 'practice', 'exam', 'dsa', 'competitive', 'school', 'typing'

    const userRef = db.collection('users').doc(uid)
    const userSnap = await userRef.get()

    let userData = {}
    if (!userSnap.exists) {
      userData = { streak: 0, lastTestDate: null, maxStreak: 0 }
      await userRef.set({
        uid,
        streak: 0,
        maxStreak: 0,
        createdAt: new Date()
      }, { merge: true })
    } else {
      userData = userSnap.data()
    }

    const lastTestDate = userData.lastTestDate?.toDate?.() || userData.lastTestDate ? new Date(userData.lastTestDate?.toDate?.() || userData.lastTestDate) : null
    const currentStreak = userData.streak || 0
    const maxStreak = userData.maxStreak || currentStreak

    // Use server time (UTC) for consistency
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let newStreak = currentStreak

    if (!lastTestDate) {
      newStreak = 1
    } else {
      const lastDate = new Date(lastTestDate)
      const lastDateStart = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
      const diffMs = todayStart.getTime() - lastDateStart.getTime()
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        // Same day — keep streak, ensure at least 1
        newStreak = Math.max(currentStreak, 1)
      } else if (diffDays === 1) {
        // Consecutive day — increment
        newStreak = currentStreak + 1
      } else {
        // Skipped days — reset
        newStreak = 1
      }
    }

    const newMaxStreak = Math.max(maxStreak, newStreak)

    await userRef.update({
      streak: newStreak,
      maxStreak: newMaxStreak,
      lastTestDate: now,
      lastActivityType: activityType || 'unknown',
      updatedAt: now
    })

    res.json({
      success: true,
      data: {
        streak: newStreak,
        maxStreak: newMaxStreak,
        activityType: activityType || 'unknown'
      }
    })
  } catch (error) {
    console.error('Error updating streak:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update streak'
    })
  }
})

module.exports = router
