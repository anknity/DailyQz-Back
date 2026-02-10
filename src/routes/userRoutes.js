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

/* ═══════════════════════════════════════════════════
   IN-MEMORY FEEDBACK STORE (auto-deletes after 24h)
   ═══════════════════════════════════════════════════ */
const feedbackStore = [] // { id, uid, name, email, subject, message, createdAt }
const FEEDBACK_TTL = 24 * 60 * 60 * 1000 // 24 hours in ms

// Cleanup expired feedback every 30 minutes
setInterval(() => {
  const now = Date.now()
  while (feedbackStore.length > 0 && now - feedbackStore[0].createdAt > FEEDBACK_TTL) {
    feedbackStore.shift()
  }
}, 30 * 60 * 1000)

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

/**
 * POST /api/users/feedback
 * Submit a suggestion / feedback message (stored in memory, auto-deletes after 24h)
 */
router.post('/feedback', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user
    const { subject, message, category } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message is required' })
    }

    // Get user info from Firebase
    let userName = 'Anonymous'
    let userEmail = ''
    try {
      const userSnap = await db.collection('users').doc(uid).get()
      if (userSnap.exists) {
        const userData = userSnap.data()
        userName = userData.name || userData.displayName || 'Anonymous'
        userEmail = userData.email || ''
      }
    } catch (e) { /* ignore */ }

    const feedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      uid,
      name: userName,
      email: userEmail,
      subject: subject || 'suggestion',
      category: category || 'general',
      message: message.trim(),
      createdAt: Date.now()
    }

    feedbackStore.push(feedback)

    // Keep max 200 items to prevent memory issues
    if (feedbackStore.length > 200) {
      feedbackStore.splice(0, feedbackStore.length - 200)
    }

    res.json({ success: true, message: 'Feedback submitted successfully' })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    res.status(500).json({ success: false, error: 'Failed to submit feedback' })
  }
})

/**
 * GET /api/users/feedback
 * Admin only: Get all feedback/suggestions (not expired)
 */
router.get('/feedback', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user

    // Check if user is admin
    const userSnap = await db.collection('users').doc(uid).get()
    const userData = userSnap.exists ? userSnap.data() : {}
    const isAdmin = userData.email === 'nityanand666.nk@gmail.com' || userData.isAdmin

    if (!isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }

    // Purge expired items before returning
    const now = Date.now()
    while (feedbackStore.length > 0 && now - feedbackStore[0].createdAt > FEEDBACK_TTL) {
      feedbackStore.shift()
    }

    // Return newest first
    const sortedFeedback = [...feedbackStore].reverse()

    res.json({
      success: true,
      data: sortedFeedback,
      count: sortedFeedback.length
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch feedback' })
  }
})

/**
 * DELETE /api/users/feedback/:id
 * Admin only: Delete a specific feedback item
 */
router.delete('/feedback/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user
    const { id } = req.params

    // Check if user is admin
    const userSnap = await db.collection('users').doc(uid).get()
    const userData = userSnap.exists ? userSnap.data() : {}
    const isAdmin = userData.email === 'nityanand666.nk@gmail.com' || userData.isAdmin

    if (!isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }

    const index = feedbackStore.findIndex(f => f.id === id)
    if (index !== -1) {
      feedbackStore.splice(index, 1)
    }

    res.json({ success: true, message: 'Feedback deleted' })
  } catch (error) {
    console.error('Error deleting feedback:', error)
    res.status(500).json({ success: false, error: 'Failed to delete feedback' })
  }
})

module.exports = router
