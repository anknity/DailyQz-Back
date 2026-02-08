const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middleware/auth')
const {
  getExamQuestions,
  submitExam,
  getExamHistory,
  getExamLeaderboard,
  getExamConfig
} = require('../controllers/examController')
const { supabaseAdmin } = require('../config/supabase')

/**
 * Helper function to calculate exam status based on time
 */
const getExamStatus = (startTime, endTime) => {
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  if (now < start) return 'scheduled'
  if (now >= start && now <= end) return 'live'
  return 'completed'
}

/**
 * Exam Routes
 * Routes for the exam section (50 questions, 60 minutes)
 */

// Public route - get exam config
router.get('/config', getExamConfig)

// Protected routes
router.get('/questions', verifyToken, getExamQuestions)
router.post('/submit', verifyToken, submitExam)
router.get('/history', verifyToken, getExamHistory)
router.get('/leaderboard', getExamLeaderboard)

/**
 * Scheduled Exam Routes
 */

// Get all scheduled exams
router.get('/scheduled', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('scheduled_exams')
      .select('*')
      .order('start_time', { ascending: true })

    if (error) throw error

    // Transform to frontend format
    const exams = (data || []).map(exam => ({
      id: exam.id,
      title: exam.title,
      category: exam.category,
      categoryName: exam.category,
      subject: exam.subject,
      description: exam.description,
      questionCount: exam.question_count,
      durationMinutes: exam.duration_minutes,
      startTime: exam.start_time,
      endTime: exam.end_time,
      status: getExamStatus(exam.start_time, exam.end_time),
      isProctored: exam.is_proctored,
      totalParticipants: 0,
      createdBy: exam.created_by
    }))

    res.json({ success: true, data: exams })
  } catch (error) {
    console.error('Error fetching scheduled exams:', error)
    res.json({ success: true, data: [] }) // Return empty array on error
  }
})

// Get random questions from question bank for any test (public route)
router.get('/questions/random', async (req, res) => {
  try {
    const { category, subject, difficulty, count = 20 } = req.query

    let query = supabaseAdmin
      .from('question_bank')
      .select('id, question_text, options, correct_answer, category, subject, difficulty')
      .eq('is_approved', true)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (subject && subject !== 'all') {
      // Use ilike for case-insensitive partial match
      query = query.ilike('subject', `%${subject}%`)
    }
    if (difficulty && difficulty !== 'all' && difficulty !== 'mixed') {
      query = query.eq('difficulty', difficulty)
    }

    const { data, error } = await query

    if (error) throw error

    // Shuffle and take random questions
    const shuffled = (data || []).sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, parseInt(count))

    const questions = selected.map((q, index) => ({
      id: q.id,
      questionId: index + 1,
      text: q.question_text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correctAnswer: q.correct_answer,
      category: q.category,
      subject: q.subject,
      difficulty: q.difficulty
    }))

    console.log(`📚 Fetched ${questions.length} questions for category: ${category || 'all'}, subject: ${subject || 'all'}`)

    res.json({
      success: true,
      data: questions,
      count: questions.length,
      totalAvailable: data?.length || 0
    })
  } catch (error) {
    console.error('Error fetching random questions:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch questions'
    })
  }
})

// Get question bank categories and stats (public)
router.get('/questions/categories', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('question_bank')
      .select('category, subject, difficulty')
      .eq('is_approved', true)

    if (error) throw error

    // Calculate stats
    const categories = {}
    const subjects = {}
    const difficulties = { easy: 0, medium: 0, hard: 0 }

    (data || []).forEach(q => {
      categories[q.category] = (categories[q.category] || 0) + 1
      subjects[q.subject] = (subjects[q.subject] || 0) + 1
      if (q.difficulty) difficulties[q.difficulty]++
    })

    res.json({
      success: true,
      data: {
        total: data?.length || 0,
        categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
        subjects: Object.entries(subjects).map(([name, count]) => ({ name, count })),
        difficulties
      }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch categories'
    })
  }
})

// Create exam from question bank (Admin only)
router.post('/create-from-bank', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      category,
      subject,
      description,
      questionCount = 20,
      durationMinutes = 30,
      startTime,
      endTime,
      isProctored,
      passPercentage,
      difficulty
    } = req.body

    // Validate required fields
    if (!title || !category || !startTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, category, startTime'
      })
    }

    // Fetch random questions from question bank
    let query = supabaseAdmin
      .from('question_bank')
      .select('id, question_text, options, correct_answer, difficulty')
      .eq('is_approved', true)

    if (category !== 'all') {
      query = query.eq('category', category)
    }
    if (subject && subject !== 'all') {
      query = query.eq('subject', subject)
    }
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }

    const { data: bankQuestions, error: fetchError } = await query

    if (fetchError) throw fetchError

    if (!bankQuestions || bankQuestions.length < questionCount) {
      return res.status(400).json({
        success: false,
        error: `Not enough questions in bank. Found ${bankQuestions?.length || 0}, need ${questionCount}`
      })
    }

    // Shuffle and select questions
    const shuffled = bankQuestions.sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, questionCount)

    // Format questions for storage
    const formattedQuestions = selectedQuestions.map((q, index) => ({
      id: index + 1,
      bankId: q.id,
      text: q.question_text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correctAnswer: q.correct_answer,
      explanation: '',
      difficulty: q.difficulty || 'medium'
    }))

    const supabaseUserId = req.user?.supabaseUserId || null

    // Create exam with questions
    const { data: exam, error: examError } = await supabaseAdmin
      .from('scheduled_exams')
      .insert({
        title,
        category,
        subject: subject || 'Mixed',
        description: description || '',
        question_count: formattedQuestions.length,
        duration_minutes: durationMinutes,
        start_time: startTime,
        end_time: endTime,
        is_proctored: isProctored || false,
        passing_score: passPercentage || 40,
        is_active: true,
        created_by: supabaseUserId,
        questions: formattedQuestions
      })
      .select()
      .single()

    if (examError) throw examError

    res.json({
      success: true,
      data: {
        id: exam.id,
        title: exam.title,
        questionCount: formattedQuestions.length,
        startTime: exam.start_time
      }
    })
  } catch (error) {
    console.error('Error creating exam from bank:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create exam'
    })
  }
})

// Create a new scheduled exam (Admin only)
router.post('/create', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      category,
      subject,
      description,
      questionCount,
      durationMinutes,
      startTime,
      endTime,
      isProctored,
      negativeMarking,
      negativeMarkValue,
      passPercentage,
      questions,
      createdBy,
      status
    } = req.body

    // Validate required fields
    if (!title || !category || !startTime || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, category, startTime, questions'
      })
    }

    // Use Supabase user ID (UUID) or null - never use Firebase UID for UUID columns
    const supabaseUserId = req.user?.supabaseUserId || null

    // Format questions for JSONB storage
    const formattedQuestions = questions.map((q, index) => ({
      id: index + 1,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'medium'
    }))

    // Insert exam into database with questions as JSONB
    const { data: exam, error: examError } = await supabaseAdmin
      .from('scheduled_exams')
      .insert({
        title,
        category,
        subject: subject || 'Mixed',
        description: description || '',
        question_count: questions.length,
        duration_minutes: durationMinutes || 30,
        start_time: startTime,
        end_time: endTime,
        is_proctored: isProctored || false,
        passing_score: passPercentage || 40,
        is_active: true,
        created_by: supabaseUserId,
        questions: formattedQuestions
      })
      .select()
      .single()

    if (examError) throw examError

    res.json({
      success: true,
      data: {
        id: exam.id,
        title: exam.title,
        questionCount: questions.length,
        startTime: exam.start_time
      }
    })
  } catch (error) {
    console.error('Error creating exam:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create exam'
    })
  }
})

// Get exam details with questions (for taking the exam)
router.get('/scheduled/:examId', verifyToken, async (req, res) => {
  try {
    const { examId } = req.params

    // Get exam details with questions stored in JSONB
    const { data: exam, error: examError } = await supabaseAdmin
      .from('scheduled_exams')
      .select('*')
      .eq('id', examId)
      .single()

    if (examError) throw examError
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' })
    }

    // Parse questions from JSONB field
    const questions = typeof exam.questions === 'string' 
      ? JSON.parse(exam.questions) 
      : (exam.questions || [])

    res.json({
      success: true,
      data: {
        ...exam,
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          difficulty: q.difficulty
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching exam:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch exam'
    })
  }
})

// Submit exam answers
router.post('/scheduled/:examId/submit', verifyToken, async (req, res) => {
  try {
    const { examId } = req.params
    const { answers, timeSpent } = req.body
    // Only use Supabase UUID - never Firebase UID for UUID columns
    const userId = req.user?.supabaseUserId

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User not found in database. Please complete registration first.'
      })
    }

    // Get exam with questions from JSONB
    const { data: exam, error: examError } = await supabaseAdmin
      .from('scheduled_exams')
      .select('questions')
      .eq('id', examId)
      .single()

    if (examError) throw examError

    // Parse questions from JSONB
    const questions = typeof exam.questions === 'string' 
      ? JSON.parse(exam.questions) 
      : (exam.questions || [])

    // Calculate score
    let correct = 0
    const results = questions.map(q => {
      const userAnswer = answers[q.id]
      const isCorrect = userAnswer === q.correctAnswer
      if (isCorrect) correct++
      return { questionId: q.id, userAnswer, isCorrect }
    })

    const score = Math.round((correct / questions.length) * 100)

    // Save result (use scheduled_exam_id for scheduled exams)
    const { data: result, error: resultError } = await supabaseAdmin
      .from('exam_results')
      .insert({
        scheduled_exam_id: examId,  // For scheduled exams
        user_id: userId,
        score,
        correct_answers: correct,
        wrong_answers: questions.length - correct,
        total_questions: questions.length,
        unanswered: 0,
        accuracy: score,
        time_taken_seconds: timeSpent,
        answers: JSON.stringify(results),
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (resultError) throw resultError

    res.json({
      success: true,
      data: {
        score,
        correct,
        total: questions.length,
        results,
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium'
        }))
      }
    })
  } catch (error) {
    console.error('Error submitting exam:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit exam'
    })
  }
})

// Delete exam (Admin only)
router.delete('/scheduled/:examId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { examId } = req.params

    // Delete exam (questions are stored in JSONB, no separate table)
    const { error } = await supabaseAdmin
      .from('scheduled_exams')
      .delete()
      .eq('id', examId)

    if (error) throw error

    res.json({ success: true, message: 'Exam deleted successfully' })
  } catch (error) {
    console.error('Error deleting exam:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete exam'
    })
  }
})

// Cancel exam (Admin only) - Sets status to cancelled
router.post('/scheduled/:examId/cancel', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { examId } = req.params

    // Update exam status to cancelled
    const { data, error } = await supabaseAdmin
      .from('scheduled_exams')
      .update({ 
        status: 'cancelled',
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', examId)
      .select()

    if (error) throw error

    res.json({ 
      success: true, 
      message: 'Exam cancelled successfully',
      data: data[0]
    })
  } catch (error) {
    console.error('Error cancelling exam:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel exam'
    })
  }
})

// Get user's result for a specific exam
router.get('/scheduled/:examId/result', verifyToken, async (req, res) => {
  try {
    const { examId } = req.params
    // Only use Supabase UUID - never Firebase UID for UUID columns
    const userId = req.user?.supabaseUserId

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User not found in database. Please complete registration first.'
      })
    }

    // Get user's result
    const { data: result, error: resultError } = await supabaseAdmin
      .from('exam_results')
      .select('*')
      .eq('scheduled_exam_id', examId)
      .eq('user_id', userId)
      .single()

    if (resultError || !result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found for this exam'
      })
    }

    // Get exam details with questions
    const { data: exam } = await supabaseAdmin
      .from('scheduled_exams')
      .select('title, questions, category, subject')
      .eq('id', examId)
      .single()

    // Parse questions from exam
    const questions = typeof exam?.questions === 'string'
      ? JSON.parse(exam.questions)
      : (exam?.questions || [])

    // Parse user's answers from result
    let userAnswers = {}
    try {
      const parsedAnswers = typeof result.answers === 'string' ? JSON.parse(result.answers) : (result.answers || [])
      if (Array.isArray(parsedAnswers)) {
        parsedAnswers.forEach(a => {
          userAnswers[a.questionId] = a.userAnswer
        })
      } else {
        userAnswers = parsedAnswers
      }
    } catch (e) {
      console.error('Error parsing answers:', e)
    }

    // Generate AI explanations for questions that lack them
    let questionsWithExplanations = questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'medium'
    }))

    // Try to generate AI explanations for questions without them
    const needsExplanation = questionsWithExplanations.filter(q => !q.explanation)
    if (needsExplanation.length > 0) {
      try {
        const groqService = require('../services/groqService')
        const Groq = require('groq-sdk')
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

        // Batch generate explanations
        const questionsText = needsExplanation.map((q, i) =>
          `Q${i + 1}: ${q.text}\nOptions: ${q.options.map((o, j) => `${String.fromCharCode(65 + j)}) ${o}`).join(', ')}\nCorrect Answer: ${String.fromCharCode(65 + q.correctAnswer)}`
        ).join('\n\n')

        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert tutor. Provide brief, clear explanations for why the correct answer is right. Return ONLY a valid JSON array of explanation strings.' },
            { role: 'user', content: `Provide a brief explanation (2-3 sentences) for each question's correct answer.\n\n${questionsText}\n\nReturn ONLY a JSON array of strings like: ["Explanation for Q1", "Explanation for Q2", ...]` }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 4096
        })

        const responseText = completion.choices[0]?.message?.content || ''
        const jsonMatch = responseText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const explanations = JSON.parse(jsonMatch[0])
          let expIdx = 0
          questionsWithExplanations = questionsWithExplanations.map(q => {
            if (!q.explanation && expIdx < explanations.length) {
              return { ...q, explanation: explanations[expIdx++] }
            }
            return q
          })
        }
      } catch (aiError) {
        console.error('AI explanation generation failed (non-blocking):', aiError.message)
        // Continue without AI explanations
      }
    }

    // Calculate rank and total participants
    const { count: higherScores } = await supabaseAdmin
      .from('exam_results')
      .select('*', { count: 'exact', head: true })
      .eq('scheduled_exam_id', examId)
      .gt('score', result.score)

    const { count: totalParticipants } = await supabaseAdmin
      .from('exam_results')
      .select('*', { count: 'exact', head: true })
      .eq('scheduled_exam_id', examId)

    // Get average and topper scores for comparison
    const { data: allResults } = await supabaseAdmin
      .from('exam_results')
      .select('score')
      .eq('scheduled_exam_id', examId)

    const scores = (allResults || []).map(r => r.score)
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const topperScore = scores.length > 0 ? Math.max(...scores) : 0

    res.json({
      success: true,
      data: {
        examId,
        examTitle: exam?.title,
        score: result.correct_answers,
        totalQuestions: result.total_questions,
        percentage: result.score,
        rank: (higherScores || 0) + 1,
        totalParticipants: totalParticipants || 1,
        timeTaken: result.time_taken_seconds,
        correctAnswers: result.correct_answers,
        wrongAnswers: result.wrong_answers,
        unanswered: result.unanswered || 0,
        submittedAt: result.submitted_at,
        avgScore,
        topperScore,
        questions: questionsWithExplanations,
        userAnswers
      }
    })
  } catch (error) {
    console.error('Error fetching result:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch result'
    })
  }
})

// Get exam leaderboard
router.get('/scheduled/:examId/leaderboard', async (req, res) => {
  try {
    const { examId } = req.params
    const { limit = 50 } = req.query

    // Get exam title
    const { data: exam } = await supabaseAdmin
      .from('scheduled_exams')
      .select('title')
      .eq('id', examId)
      .single()

    // Get all results for this exam, ordered by score
    const { data: results, error } = await supabaseAdmin
      .from('exam_results')
      .select('user_id, score, correct_answers, total_questions, time_taken_seconds, submitted_at')
      .eq('scheduled_exam_id', examId)
      .order('score', { ascending: false })
      .order('time_taken_seconds', { ascending: true })
      .limit(parseInt(limit))

    if (error) throw error

    // Get user details for each result
    const leaderboard = await Promise.all(
      (results || []).map(async (result, index) => {
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, display_name, avatar_url, email, firebase_uid')
          .eq('id', result.user_id)
          .single()

        return {
          rank: index + 1,
          id: user?.firebase_uid || result.user_id,
          userId: result.user_id,
          name: user?.display_name || user?.email?.split('@')[0] || 'Anonymous',
          displayName: user?.display_name || user?.email?.split('@')[0] || 'Anonymous',
          photoURL: user?.avatar_url || null,
          score: result.score,
          bestScore: result.score,
          avgScore: result.score,
          correctAnswers: result.correct_answers,
          totalQuestions: result.total_questions,
          examsCount: 1,
          timeSpent: result.time_taken_seconds,
          submittedAt: result.submitted_at
        }
      })
    )

    res.json({
      success: true,
      data: {
        examId,
        examTitle: exam?.title || 'Exam',
        leaderboard,
        totalParticipants: results?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching exam leaderboard:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch leaderboard'
    })
  }
})

/**
 * Question Bank Routes for Exam Scheduling
 */

// Get questions from question bank for exam creation
router.get('/question-bank', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { category, subject, difficulty, limit = 50, approved = 'true' } = req.query

    let query = supabaseAdmin
      .from('question_bank')
      .select('id, question_text, options, correct_answer, category, subject, difficulty')

    if (approved === 'true') {
      query = query.eq('is_approved', true)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (subject) {
      query = query.eq('subject', subject)
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    query = query.limit(parseInt(limit))

    const { data, error } = await query

    if (error) throw error

    // Transform for frontend
    const questions = (data || []).map(q => ({
      id: q.id,
      text: q.question_text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correctAnswer: q.correct_answer,
      category: q.category,
      subject: q.subject,
      difficulty: q.difficulty
    }))

    res.json({
      success: true,
      data: questions,
      count: questions.length
    })
  } catch (error) {
    console.error('Error fetching question bank:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch questions'
    })
  }
})

// Get random questions from question bank
router.get('/question-bank/random', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { category, subject, difficulty, count = 20 } = req.query

    let query = supabaseAdmin
      .from('question_bank')
      .select('id, question_text, options, correct_answer, category, subject, difficulty')
      .eq('is_approved', true)

    if (category) {
      query = query.eq('category', category)
    }
    if (subject) {
      query = query.eq('subject', subject)
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    const { data, error } = await query

    if (error) throw error

    // Shuffle and take random questions
    const shuffled = (data || []).sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, parseInt(count))

    const questions = selected.map(q => ({
      id: q.id,
      text: q.question_text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correctAnswer: q.correct_answer,
      category: q.category,
      subject: q.subject,
      difficulty: q.difficulty
    }))

    res.json({
      success: true,
      data: questions,
      count: questions.length
    })
  } catch (error) {
    console.error('Error fetching random questions:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch questions'
    })
  }
})

// Get question bank stats
router.get('/question-bank/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('question_bank')
      .select('category, subject, difficulty, is_approved')

    if (error) throw error

    const stats = {
      total: data.length,
      approved: data.filter(q => q.is_approved).length,
      pending: data.filter(q => !q.is_approved).length,
      byCategory: {},
      byDifficulty: { easy: 0, medium: 0, hard: 0 }
    }

    data.forEach(q => {
      const cat = q.category || 'uncategorized'
      if (!stats.byCategory[cat]) {
        stats.byCategory[cat] = { total: 0, approved: 0 }
      }
      stats.byCategory[cat].total++
      if (q.is_approved) stats.byCategory[cat].approved++
      
      const diff = q.difficulty || 'medium'
      stats.byDifficulty[diff] = (stats.byDifficulty[diff] || 0) + 1
    })

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching question bank stats:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stats'
    })
  }
})

/**
 * Proctoring Routes
 */

// Log proctoring violation
router.post('/scheduled/:examId/violation', verifyToken, async (req, res) => {
  try {
    const { examId } = req.params
    const { violationType, timestamp, details } = req.body
    const userId = req.user?.supabaseUserId

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User not authenticated'
      })
    }

    const { data, error } = await supabaseAdmin
      .from('proctoring_logs')
      .insert({
        exam_id: examId,
        user_id: userId,
        event_type: violationType,
        event_data: details || {},
        timestamp: timestamp || new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Get violation count for this exam
    const { count } = await supabaseAdmin
      .from('proctoring_logs')
      .select('*', { count: 'exact', head: true })
      .eq('exam_id', examId)
      .eq('user_id', userId)

    // Get exam max violations
    const { data: exam } = await supabaseAdmin
      .from('scheduled_exams')
      .select('max_violations')
      .eq('id', examId)
      .single()

    const maxViolations = exam?.max_violations || 3
    const shouldDisqualify = count >= maxViolations

    res.json({
      success: true,
      data: {
        logged: true,
        violationCount: count,
        maxViolations,
        shouldDisqualify
      }
    })
  } catch (error) {
    console.error('Error logging violation:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to log violation'
    })
  }
})

// Check if exam is currently live
router.get('/scheduled/:examId/status', async (req, res) => {
  try {
    const { examId } = req.params

    const { data: exam, error } = await supabaseAdmin
      .from('scheduled_exams')
      .select('start_time, end_time, is_active')
      .eq('id', examId)
      .single()

    if (error) throw error
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' })
    }

    const now = new Date()
    const startTime = new Date(exam.start_time)
    const endTime = new Date(exam.end_time)

    let status = 'scheduled'
    let canStart = false
    let timeUntilStart = null
    let timeRemaining = null

    if (now < startTime) {
      status = 'scheduled'
      timeUntilStart = Math.floor((startTime - now) / 1000)
    } else if (now >= startTime && now <= endTime) {
      status = 'live'
      canStart = exam.is_active
      timeRemaining = Math.floor((endTime - now) / 1000)
    } else {
      status = 'completed'
    }

    res.json({
      success: true,
      data: {
        examId,
        status,
        canStart,
        isActive: exam.is_active,
        startTime: exam.start_time,
        endTime: exam.end_time,
        timeUntilStart,
        timeRemaining
      }
    })
  } catch (error) {
    console.error('Error checking exam status:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check exam status'
    })
  }
})

/**
 * Overall Scheduled Exams Leaderboard
 * Aggregates results across all scheduled exams for the global leaderboard
 */
router.get('/scheduled-leaderboard/overall', async (req, res) => {
  try {
    const { limit = 20 } = req.query

    // Get all scheduled exam results
    const { data: results, error } = await supabaseAdmin
      .from('exam_results')
      .select('user_id, score, correct_answers, total_questions, time_taken_seconds, submitted_at')
      .not('scheduled_exam_id', 'is', null)

    if (error) throw error

    // Aggregate results per user
    const userStats = {}
    ;(results || []).forEach(r => {
      if (!userStats[r.user_id]) {
        userStats[r.user_id] = {
          userId: r.user_id,
          examsCount: 0,
          totalScore: 0,
          bestScore: 0,
          scores: [],
          totalTime: 0
        }
      }
      const u = userStats[r.user_id]
      u.examsCount++
      u.totalScore += r.score || 0
      u.bestScore = Math.max(u.bestScore, r.score || 0)
      u.scores.push(r.score || 0)
      u.totalTime += r.time_taken_seconds || 0
    })

    // Convert to array and calculate averages
    let leaderboard = Object.values(userStats).map(u => ({
      ...u,
      avgScore: Math.round(u.totalScore / u.examsCount)
    }))

    // Sort by best score, then avg, then exams count
    leaderboard.sort((a, b) => b.bestScore - a.bestScore || b.avgScore - a.avgScore || b.examsCount - a.examsCount)
    leaderboard = leaderboard.slice(0, parseInt(limit))

    // Fetch user details
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (entry, index) => {
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, display_name, avatar_url, email, firebase_uid')
          .eq('id', entry.userId)
          .single()

        return {
          rank: index + 1,
          id: user?.firebase_uid || entry.userId,
          uid: user?.firebase_uid || entry.userId,
          name: user?.display_name || user?.email?.split('@')[0] || 'Anonymous',
          displayName: user?.display_name || user?.email?.split('@')[0] || 'Anonymous',
          photoURL: user?.avatar_url || null,
          bestScore: entry.bestScore,
          avgScore: entry.avgScore,
          score: entry.bestScore,
          totalScore: entry.totalScore,
          examsCount: entry.examsCount,
          testsCompleted: entry.examsCount
        }
      })
    )

    res.json({
      success: true,
      data: enrichedLeaderboard,
      count: enrichedLeaderboard.length
    })
  } catch (error) {
    console.error('Error fetching scheduled leaderboard:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch scheduled leaderboard'
    })
  }
})

module.exports = router
