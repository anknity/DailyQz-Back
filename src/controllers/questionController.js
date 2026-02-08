const { db } = require('../config/firebase')
const questions = require('../../data/questions')

/**
 * Question Controller
 * Handles question-related API operations
 */

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Get random questions based on category and difficulty
const getQuestions = async (req, res, next) => {
  try {
    const { category, difficulty, count = 20 } = req.query
    
    let filteredQuestions = [...questions]

    // Filter by category
    if (category && category !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => q.category === category)
    }

    // Filter by difficulty or apply AI mix (40% easy, 40% medium, 20% hard)
    if (difficulty === 'ai-mix') {
      const easyQuestions = filteredQuestions.filter(q => q.difficulty === 'easy')
      const mediumQuestions = filteredQuestions.filter(q => q.difficulty === 'medium')
      const hardQuestions = filteredQuestions.filter(q => q.difficulty === 'hard')

      const easyCount = Math.floor(count * 0.4)
      const mediumCount = Math.floor(count * 0.4)
      const hardCount = count - easyCount - mediumCount

      filteredQuestions = [
        ...shuffleArray(easyQuestions).slice(0, easyCount),
        ...shuffleArray(mediumQuestions).slice(0, mediumCount),
        ...shuffleArray(hardQuestions).slice(0, hardCount)
      ]
    } else if (difficulty && difficulty !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty)
    }

    // Shuffle and limit
    const shuffledQuestions = shuffleArray(filteredQuestions).slice(0, parseInt(count))

    // Remove correct answers from response (security)
    const questionsForClient = shuffledQuestions.map(({ id, question, options, category, difficulty }) => ({
      id,
      question,
      options: shuffleArray(options), // Shuffle options too
      category,
      difficulty
    }))

    res.json({
      success: true,
      data: questionsForClient,
      meta: {
        total: questionsForClient.length,
        category: category || 'all',
        difficulty: difficulty || 'all'
      }
    })
  } catch (error) {
    next(error)
  }
}

// Verify answers and calculate score
const verifyAnswers = async (req, res, next) => {
  try {
    const { uid } = req.user
    const { answers, category, difficulty, timeSpent } = req.body

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers array is required'
      })
    }

    let correct = 0
    const results = []

    // Check each answer
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId)
      if (question) {
        const isCorrect = question.correctAnswer === answer.selectedOption
        if (isCorrect) correct++
        
        results.push({
          questionId: answer.questionId,
          question: question.question,
          selectedOption: answer.selectedOption,
          correctAnswer: question.correctAnswer,
          isCorrect
        })
      }
    }

    const totalQuestions = answers.length
    const score = Math.round((correct / totalQuestions) * 100)

    // Save test result
    const testResult = {
      userId: uid,
      category: category || 'all',
      difficulty: difficulty || 'ai-mix',
      score,
      correct,
      incorrect: totalQuestions - correct,
      totalQuestions,
      timeSpent: timeSpent || 0,
      results,
      createdAt: new Date()
    }

    const docRef = await db.collection('testResults').add(testResult)

    // Update user stats
    const userRef = db.collection('users').doc(uid)
    const userDoc = await userRef.get()
    
    if (userDoc.exists) {
      const userData = userDoc.data()
      const newTestsTaken = (userData.testsTaken || 0) + 1
      const newTotalScore = (userData.totalScore || 0) + score
      const newAvgScore = Math.round(newTotalScore / newTestsTaken)

      // Calculate streak
      const today = new Date().toDateString()
      const lastTestDate = userData.lastTestDate?.toDate?.()?.toDateString() || null
      let newStreak = userData.streak || 0

      if (lastTestDate !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        
        if (lastTestDate === yesterday.toDateString()) {
          newStreak += 1
        } else if (lastTestDate !== today) {
          newStreak = 1
        }
      }

      await userRef.update({
        testsTaken: newTestsTaken,
        totalScore: newTotalScore,
        avgScore: newAvgScore,
        streak: newStreak,
        lastTestDate: new Date()
      })
    }

    res.json({
      success: true,
      data: {
        testId: docRef.id,
        score,
        correct,
        incorrect: totalQuestions - correct,
        totalQuestions,
        results
      }
    })
  } catch (error) {
    next(error)
  }
}

// Get available categories
const getCategories = async (req, res, next) => {
  try {
    const categories = [...new Set(questions.map(q => q.category))]
    
    const categoryStats = categories.map(category => {
      const categoryQuestions = questions.filter(q => q.category === category)
      return {
        id: category,
        name: category.replace(/-/g, ' '),
        count: categoryQuestions.length,
        difficulties: {
          easy: categoryQuestions.filter(q => q.difficulty === 'easy').length,
          medium: categoryQuestions.filter(q => q.difficulty === 'medium').length,
          hard: categoryQuestions.filter(q => q.difficulty === 'hard').length
        }
      }
    })

    res.json({
      success: true,
      data: categoryStats
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getQuestions,
  verifyAnswers,
  getCategories
}
