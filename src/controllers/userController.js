const { db } = require('../config/firebase')

/**
 * User Controller
 * Handles user-related API operations
 */

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const { uid } = req.user
    const userDoc = await db.collection('users').doc(uid).get()

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      data: { id: userDoc.id, ...userDoc.data() }
    })
  } catch (error) {
    next(error)
  }
}

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const { uid } = req.user
    const { name } = req.body

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Name must be at least 2 characters'
      })
    }

    await db.collection('users').doc(uid).update({
      name: name.trim(),
      updatedAt: new Date()
    })

    res.json({
      success: true,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    next(error)
  }
}

// Get user statistics
const getStats = async (req, res, next) => {
  try {
    const { uid } = req.user
    const userDoc = await db.collection('users').doc(uid).get()

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    const userData = userDoc.data()

    res.json({
      success: true,
      data: {
        testsTaken: userData.testsTaken || 0,
        totalScore: userData.totalScore || 0,
        avgScore: userData.avgScore || 0,
        streak: userData.streak || 0,
        lastTestDate: userData.lastTestDate || null
      }
    })
  } catch (error) {
    next(error)
  }
}

// Get user test history
const getTestHistory = async (req, res, next) => {
  try {
    const { uid } = req.user
    const limit = parseInt(req.query.limit) || 10

    const testsSnapshot = await db
      .collection('testResults')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    const tests = testsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    res.json({
      success: true,
      data: tests
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getStats,
  getTestHistory
}
