const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/auth')
const {
  verifyAdmin,
  getDashboardStats,
  getAnalytics,
  generateAIQuestions,
  saveGeneratedQuestions,
  uploadQuestions,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
  getAllUsers,
  getCategoriesWithSubcategories,
  bulkDeleteQuestions
} = require('../controllers/adminController')
const { generateDSAProblem, generateQuestions } = require('../services/groqService')
const { supabaseAdmin } = require('../config/supabase')

/**
 * Admin Routes
 * All routes require authentication and admin privileges
 */

// Apply auth middleware to all routes
router.use(verifyToken)
router.use(verifyAdmin)

// Dashboard
router.get('/dashboard', getDashboardStats)

// Analytics (enhanced)
router.get('/analytics', getAnalytics)

// Categories
router.get('/categories', getCategoriesWithSubcategories)

// AI Question Generation
router.post('/generate-questions', generateAIQuestions)
router.post('/save-questions', saveGeneratedQuestions)

// DSA Coding Problem Generation
router.post('/generate-dsa-problem', async (req, res) => {
  try {
    const { topic, difficulty = 'medium' } = req.body

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      })
    }

    const problem = await generateDSAProblem({ topic, difficulty })

    res.json({
      success: true,
      data: problem
    })
  } catch (error) {
    console.error('DSA problem generation error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate DSA problem'
    })
  }
})

// Save DSA Problem to Database
router.post('/save-dsa-problem', async (req, res) => {
  try {
    const { problem, category = 'dsa' } = req.body

    if (!problem) {
      return res.status(400).json({
        success: false,
        error: 'Problem is required'
      })
    }

    // Save to dsa_problems table
    const { data, error } = await supabaseAdmin
      .from('dsa_problems')
      .insert({
        title: problem.title,
        slug: problem.slug || problem.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: problem.description,
        difficulty: problem.difficulty,
        topics: [problem.topic || category],
        examples: problem.examples || [],
        constraints: problem.constraints?.join('\n') || '',
        starter_code: problem.starterCode,
        test_cases: problem.testCases?.filter(tc => !tc.isHidden) || [],
        hidden_test_cases: problem.testCases?.filter(tc => tc.isHidden) || [],
        hints: problem.hints || [],
        solution: problem.solution?.code || '',
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Save DSA problem error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save DSA problem'
    })
  }
})

// Generate Multiple DSA Problems
router.post('/generate-dsa-problems-batch', async (req, res) => {
  try {
    const { topics, difficulty = 'medium', count = 5 } = req.body

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Topics array is required'
      })
    }

    const problems = []
    const errors = []

    for (const topic of topics.slice(0, count)) {
      try {
        const problem = await generateDSAProblem({ topic, difficulty })
        problems.push(problem)
      } catch (err) {
        errors.push({ topic, error: err.message })
      }
    }

    res.json({
      success: true,
      data: {
        generated: problems.length,
        failed: errors.length,
        problems,
        errors
      }
    })
  } catch (error) {
    console.error('Batch DSA generation error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate DSA problems'
    })
  }
})

// Generate DSA MCQ Questions (conceptual questions about algorithms)
router.post('/generate-dsa-mcq', async (req, res) => {
  try {
    const { category = 'dsa', subject, difficulty = 'medium', count = 10 } = req.body

    const questions = await generateQuestions({
      category,
      subject: subject || 'algorithms and data structures',
      difficulty,
      count
    })

    res.json({
      success: true,
      data: questions
    })
  } catch (error) {
    console.error('DSA MCQ generation error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate DSA MCQs'
    })
  }
})

// Question Management
router.get('/questions', getAllQuestions)
router.post('/upload-questions', uploadQuestions)
router.put('/questions/:id', updateQuestion)
router.delete('/questions/:id', deleteQuestion)
router.post('/questions/bulk-delete', bulkDeleteQuestions)

// User Management
router.get('/users', getAllUsers)

module.exports = router
