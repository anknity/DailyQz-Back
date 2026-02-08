const { db } = require('../config/firebase')
const questions = require('../../data/questions')

/**
 * Exam Controller
 * Handles exam-related API operations (50 questions, 60 minutes)
 */

// Exam configuration
const EXAM_CONFIG = {
  TOTAL_QUESTIONS: 50,
  TIME_LIMIT_MINUTES: 60,
  DIFFICULTY: 'medium', // Medium level questions for exam
  MIN_QUESTIONS_PER_CATEGORY: 5
}

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Get exam questions (medium difficulty, mixed categories)
const getExamQuestions = async (req, res, next) => {
  try {
    const { category, subcategory } = req.query
    
    // Use the flat questions array (same as questionController)
    let filteredQuestions = [...questions]

    // Filter by category if specified
    if (category && category !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => q.category === category)
    }

    // Filter by subcategory if specified
    if (subcategory && subcategory !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => q.subcategory === subcategory)
    }

    // Get medium difficulty questions primarily
    const mediumQuestions = filteredQuestions.filter(q => q.difficulty === 'medium')
    const easyQuestions = filteredQuestions.filter(q => q.difficulty === 'easy')
    const hardQuestions = filteredQuestions.filter(q => q.difficulty === 'hard')

    // Exam mix: 70% medium, 20% easy, 10% hard
    const mediumCount = Math.floor(EXAM_CONFIG.TOTAL_QUESTIONS * 0.7)
    const easyCount = Math.floor(EXAM_CONFIG.TOTAL_QUESTIONS * 0.2)
    const hardCount = EXAM_CONFIG.TOTAL_QUESTIONS - mediumCount - easyCount

    let examQuestions = [
      ...shuffleArray(mediumQuestions).slice(0, mediumCount),
      ...shuffleArray(easyQuestions).slice(0, easyCount),
      ...shuffleArray(hardQuestions).slice(0, hardCount)
    ]

    // If we don't have enough questions, fill with whatever is available
    if (examQuestions.length < EXAM_CONFIG.TOTAL_QUESTIONS) {
      const remaining = EXAM_CONFIG.TOTAL_QUESTIONS - examQuestions.length
      const usedIds = new Set(examQuestions.map(q => q.id))
      const additionalQuestions = filteredQuestions
        .filter(q => !usedIds.has(q.id))
        .slice(0, remaining)
      examQuestions = [...examQuestions, ...additionalQuestions]
    }

    // Shuffle final questions
    const shuffledExamQuestions = shuffleArray(examQuestions).slice(0, EXAM_CONFIG.TOTAL_QUESTIONS)

    // Remove correct answers from response (security)
    // NOTE: Don't shuffle options - need to preserve indices for answer checking
    const questionsForClient = shuffledExamQuestions.map(({ id, question, options, category, difficulty, subcategory }) => ({
      id,
      question,
      options, // Keep original order to match correctAnswer index
      category,
      difficulty,
      subcategory: subcategory || null
    }))

    // Generate unique exam ID
    const examId = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    res.json({
      success: true,
      data: {
        questions: questionsForClient,
        examId: examId
      },
      meta: {
        total: questionsForClient.length,
        category: category || 'all',
        subcategory: subcategory || null,
        examConfig: {
          timeLimit: EXAM_CONFIG.TIME_LIMIT_MINUTES,
          totalQuestions: EXAM_CONFIG.TOTAL_QUESTIONS
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

// Submit exam and calculate results
const submitExam = async (req, res, next) => {
  try {
    const { uid } = req.user
    const { answers, category, subcategory, timeSpent } = req.body

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers array is required'
      })
    }

    // Use the flat questions array (same as questionController)
    let correct = 0
    const results = []

    // Check each answer
    for (const answer of answers) {
      // Convert questionId to number for comparison (frontend sends as string)
      const questionId = typeof answer.questionId === 'string' ? parseInt(answer.questionId, 10) : answer.questionId
      const question = questions.find(q => q.id === questionId)
      
      if (question) {
        const isCorrect = question.correctAnswer === answer.selectedOption
        if (isCorrect) correct++
        
        results.push({
          questionId: questionId,
          question: question.question,
          options: question.options,
          selectedOption: answer.selectedOption,
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: question.explanation || null
        })
      } else {
        // Question not found - log for debugging
        console.warn(`Question not found for ID: ${answer.questionId} (type: ${typeof answer.questionId})`)
        results.push({
          questionId: answer.questionId,
          question: 'Question not found',
          options: [],
          selectedOption: answer.selectedOption,
          correctAnswer: -1,
          isCorrect: false,
          explanation: null
        })
      }
    }

    const totalQuestions = answers.length
    const score = Math.round((correct / totalQuestions) * 100)

    // Calculate grade
    let grade = 'F'
    if (score >= 90) grade = 'A+'
    else if (score >= 80) grade = 'A'
    else if (score >= 70) grade = 'B+'
    else if (score >= 60) grade = 'B'
    else if (score >= 50) grade = 'C'
    else if (score >= 40) grade = 'D'

    // Save exam result
    const examResult = {
      userId: uid,
      type: 'exam',
      category: category || 'all',
      subcategory: subcategory || null,
      score,
      grade,
      correct,
      incorrect: totalQuestions - correct,
      totalQuestions,
      timeSpent: timeSpent || 0,
      maxTime: EXAM_CONFIG.TIME_LIMIT_MINUTES * 60,
      results,
      createdAt: new Date()
    }

    const docRef = await db.collection('examResults').add(examResult)

    // Update user exam stats
    const userRef = db.collection('users').doc(uid)
    const userDoc = await userRef.get()
    
    if (userDoc.exists) {
      const userData = userDoc.data()
      const newExamsTaken = (userData.examsTaken || 0) + 1
      const newTotalExamScore = (userData.totalExamScore || 0) + score
      const newAvgExamScore = Math.round(newTotalExamScore / newExamsTaken)
      const bestExamScore = Math.max(userData.bestExamScore || 0, score)

      await userRef.update({
        examsTaken: newExamsTaken,
        totalExamScore: newTotalExamScore,
        avgExamScore: newAvgExamScore,
        bestExamScore,
        lastExamDate: new Date()
      })
    }

    res.json({
      success: true,
      data: {
        examId: docRef.id,
        score,
        grade,
        correctAnswers: correct,
        incorrectAnswers: totalQuestions - correct,
        unanswered: 0,
        totalQuestions,
        timeSpent: timeSpent || 0,
        results,
        passed: score >= 50
      }
    })
  } catch (error) {
    next(error)
  }
}

// Get exam history for user
const getExamHistory = async (req, res, next) => {
  try {
    const { uid } = req.user
    const limit = parseInt(req.query.limit) || 10

    let examsSnapshot
    try {
      // Try with orderBy first
      examsSnapshot = await db
        .collection('examResults')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get()
    } catch (indexError) {
      // If index doesn't exist, fallback to query without orderBy
      console.warn('Firestore index not found, using fallback query:', indexError.message)
      examsSnapshot = await db
        .collection('examResults')
        .where('userId', '==', uid)
        .limit(limit)
        .get()
    }

    const exams = examsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }))

    // Sort in memory if we didn't use orderBy
    exams.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
      return dateB - dateA
    })

    res.json({
      success: true,
      data: exams
    })
  } catch (error) {
    console.error('Error fetching exam history:', error)
    next(error)
  }
}

// Get exam leaderboard
const getExamLeaderboard = async (req, res, next) => {
  try {
    const { category, limit = 20 } = req.query

    let examsSnapshot
    try {
      let query = db.collection('examResults')
        .orderBy('score', 'desc')
        .limit(parseInt(limit))

      if (category && category !== 'all') {
        query = query.where('category', '==', category)
      }

      examsSnapshot = await query.get()
    } catch (indexError) {
      // Fallback without orderBy if index doesn't exist
      console.warn('Firestore index not found for leaderboard, using fallback:', indexError.message)
      let query = db.collection('examResults').limit(parseInt(limit) * 2)
      
      if (category && category !== 'all') {
        query = query.where('category', '==', category)
      }
      
      examsSnapshot = await query.get()
    }

    // Group by user and get best scores
    const userBestScores = {}
    
    for (const doc of examsSnapshot.docs) {
      const data = doc.data()
      const userId = data.userId
      
      if (!userBestScores[userId] || data.score > userBestScores[userId].score) {
        userBestScores[userId] = {
          examId: doc.id,
          score: data.score,
          grade: data.grade,
          category: data.category,
          createdAt: data.createdAt
        }
      }
    }

    // Get user details
    const leaderboard = []
    for (const [userId, examData] of Object.entries(userBestScores)) {
      const userDoc = await db.collection('users').doc(userId).get()
      if (userDoc.exists) {
        const userData = userDoc.data()
        leaderboard.push({
          id: userId,
          name: userData.name || 'Anonymous',
          photoURL: userData.photoURL || null,
          score: examData.score,
          bestScore: examData.score, // Alias for frontend compatibility
          grade: examData.grade,
          category: examData.category,
          examsTaken: userData.examsTaken || 0,
          avgScore: userData.avgExamScore || 0
        })
      }
    }

    // Sort and limit
    leaderboard.sort((a, b) => b.score - a.score)
    const topUsers = leaderboard.slice(0, parseInt(limit)).map((user, index) => ({
      ...user,
      rank: index + 1
    }))

    // Find current user's rank if authenticated
    const authHeader = req.headers.authorization
    let userRank = null
    if (authHeader) {
      try {
        const admin = require('firebase-admin')
        const token = authHeader.replace('Bearer ', '')
        const decoded = await admin.auth().verifyIdToken(token)
        const userId = decoded.uid
        const userIndex = leaderboard.findIndex(u => u.id === userId)
        if (userIndex !== -1) {
          userRank = {
            rank: userIndex + 1,
            ...leaderboard[userIndex]
          }
        }
      } catch (e) {
        // User not authenticated or token invalid - ignore
      }
    }

    res.json({
      success: true,
      data: {
        leaderboard: topUsers,
        userRank
      },
      meta: {
        category: category || 'all',
        total: topUsers.length
      }
    })
  } catch (error) {
    next(error)
  }
}

// Get exam config
const getExamConfig = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: EXAM_CONFIG
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getExamQuestions,
  submitExam,
  getExamHistory,
  getExamLeaderboard,
  getExamConfig,
  EXAM_CONFIG
}
