const { db } = require('../config/firebase')

/**
 * Leaderboard Controller
 * Handles leaderboard-related API operations
 */

// Get leaderboard by period (daily, weekly, all-time)
const getLeaderboard = async (req, res, next) => {
  try {
    const { period = 'all-time', limit = 20 } = req.query
    
    let query = db.collection('users')
      .orderBy('totalScore', 'desc')
      .limit(parseInt(limit))

    // For daily/weekly, we need to filter by date
    if (period === 'daily' || period === 'weekly') {
      const now = new Date()
      let startDate

      if (period === 'daily') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else {
        // Start of current week (Sunday)
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
      }

      // Get test results for the period
      const testsSnapshot = await db.collection('testResults')
        .where('createdAt', '>=', startDate)
        .get()

      // Aggregate scores by user
      const userScores = {}
      testsSnapshot.forEach(doc => {
        const data = doc.data()
        if (!userScores[data.userId]) {
          userScores[data.userId] = { score: 0, tests: 0 }
        }
        userScores[data.userId].score += data.score || 0
        userScores[data.userId].tests += 1
      })

      // Get user details
      const userIds = Object.keys(userScores)
      const leaderboard = []

      for (const userId of userIds) {
        const userDoc = await db.collection('users').doc(userId).get()
        if (userDoc.exists) {
          const userData = userDoc.data()
          leaderboard.push({
            id: userId,
            name: userData.name || 'Anonymous',
            photoURL: userData.photoURL || null,
            score: userScores[userId].score,
            testsTaken: userScores[userId].tests,
            streak: userData.streak || 0
          })
        }
      }

      // Sort and limit
      leaderboard.sort((a, b) => b.score - a.score)
      const topUsers = leaderboard.slice(0, parseInt(limit))

      return res.json({
        success: true,
        data: topUsers,
        meta: { period, total: topUsers.length }
      })
    }

    // All-time leaderboard
    const usersSnapshot = await query.get()
    const leaderboard = usersSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || 'Anonymous',
        photoURL: data.photoURL || null,
        score: data.totalScore || 0,
        testsTaken: data.testsTaken || 0,
        streak: data.streak || 0
      }
    })

    res.json({
      success: true,
      data: leaderboard,
      meta: { period, total: leaderboard.length }
    })
  } catch (error) {
    console.error('Error in getLeaderboard:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch leaderboard'
    })
  }
}

// Get user's rank
const getUserRank = async (req, res, next) => {
  try {
    const { uid } = req.user

    // Get user's total score
    const userDoc = await db.collection('users').doc(uid).get()
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    const userScore = userDoc.data().totalScore || 0

    // Count users with higher score
    const higherScoreSnapshot = await db.collection('users')
      .where('totalScore', '>', userScore)
      .count()
      .get()

    const rank = higherScoreSnapshot.data().count + 1

    res.json({
      success: true,
      data: {
        rank,
        totalScore: userScore
      }
    })
  } catch (error) {
    console.error('Error in getUserRank:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch user rank'
    })
  }
}

// Get leaderboard filtered by category
const getLeaderboardByCategory = async (req, res, next) => {
  try {
    const { category, subcategory, period = 'all-time', limit = 20 } = req.query

    if (!category || category === 'all') {
      // Redirect to regular leaderboard for 'all'
      return getLeaderboard(req, res, next)
    }

    // Get test results for the category
    let query = db.collection('testResults')
      .where('category', '==', category)

    if (subcategory && subcategory !== 'all') {
      query = query.where('subcategory', '==', subcategory)
    }

    // Apply period filter
    if (period === 'daily' || period === 'weekly') {
      const now = new Date()
      let startDate

      if (period === 'daily') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else {
        // Start of current week (Sunday)
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
      }

      query = query.where('createdAt', '>=', startDate)
    }

    const testsSnapshot = await query.get()

    // Aggregate scores by user
    const userScores = {}
    testsSnapshot.forEach(doc => {
      const data = doc.data()
      if (!userScores[data.userId]) {
        userScores[data.userId] = { 
          score: 0, 
          tests: 0, 
          bestScore: 0,
          avgScore: 0
        }
      }
      userScores[data.userId].score += data.score || 0
      userScores[data.userId].tests += 1
      userScores[data.userId].bestScore = Math.max(
        userScores[data.userId].bestScore, 
        data.score || 0
      )
    })

    // Calculate averages
    Object.keys(userScores).forEach(userId => {
      userScores[userId].avgScore = Math.round(
        userScores[userId].score / userScores[userId].tests
      )
    })

    // Get user details
    const userIds = Object.keys(userScores)
    const leaderboard = []

    for (const userId of userIds) {
      const userDoc = await db.collection('users').doc(userId).get()
      if (userDoc.exists) {
        const userData = userDoc.data()
        leaderboard.push({
          id: userId,
          name: userData.name || 'Anonymous',
          photoURL: userData.photoURL || null,
          totalScore: userScores[userId].score,
          bestScore: userScores[userId].bestScore,
          avgScore: userScores[userId].avgScore,
          testsTaken: userScores[userId].tests,
          streak: userData.streak || 0
        })
      }
    }

    // Sort by total score and limit
    leaderboard.sort((a, b) => b.totalScore - a.totalScore)
    const topUsers = leaderboard.slice(0, parseInt(limit)).map((user, index) => ({
      ...user,
      rank: index + 1
    }))

    res.json({
      success: true,
      data: topUsers,
      meta: { 
        category, 
        subcategory: subcategory || null,
        period,
        total: topUsers.length 
      }
    })
  } catch (error) {
    console.error('Error in getLeaderboardByCategory:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch leaderboard'
    })
  }
}

// Get available categories for leaderboard
const getLeaderboardCategories = async (req, res, next) => {
  try {
    const categories = [
      { id: 'all', name: 'All Categories' },
      { id: 'web-development', name: 'Web Development', subcategories: [
        { id: 'html-css', name: 'HTML/CSS' },
        { id: 'javascript', name: 'JavaScript' },
        { id: 'react', name: 'React' },
        { id: 'tailwind', name: 'Tailwind CSS' }
      ]},
      { id: 'dsa', name: 'DSA', subcategories: [
        { id: 'arrays', name: 'Arrays' },
        { id: 'linked-lists', name: 'Linked Lists' },
        { id: 'trees', name: 'Trees' },
        { id: 'graphs', name: 'Graphs' },
        { id: 'dynamic-programming', name: 'Dynamic Programming' },
        { id: 'stacks-queues', name: 'Stacks & Queues' },
        { id: 'sorting', name: 'Sorting' },
        { id: 'searching', name: 'Searching' },
        { id: 'recursion', name: 'Recursion' }
      ]},
      { id: 'aptitude', name: 'Aptitude', subcategories: [
        { id: 'quantitative', name: 'Quantitative' },
        { id: 'logical', name: 'Logical Reasoning' },
        { id: 'verbal', name: 'Verbal Ability' },
        { id: 'data-interpretation', name: 'Data Interpretation' }
      ]},
      { id: 'neet', name: 'NEET', subcategories: [
        { id: 'physics', name: 'Physics' },
        { id: 'chemistry-organic', name: 'Organic Chemistry' },
        { id: 'chemistry-inorganic', name: 'Inorganic Chemistry' },
        { id: 'chemistry-physical', name: 'Physical Chemistry' },
        { id: 'biology-botany', name: 'Botany' },
        { id: 'biology-zoology', name: 'Zoology' }
      ]},
      { id: 'artificial-intelligence', name: 'AI & ML' },
      { id: 'data-science', name: 'Data Science' },
      { id: 'networking', name: 'Networking' }
    ]

    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error in getLeaderboardCategories:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch categories'
    })
  }
}

module.exports = {
  getLeaderboard,
  getUserRank,
  getLeaderboardByCategory,
  getLeaderboardCategories
}
