const {
  supabaseExamService,
  supabaseQuestionService
} = require('../services/supabaseServices');

/**
 * Enhanced Exam Controller with Supabase Integration
 * Handles creating, managing, and retrieving exams from Supabase
 */

// Create a new exam
const createExam = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category, // 'competitive', 'government', 'custom', 'weekly'
      subject,
      difficulty,
      questionCount,
      durationMinutes,
      passingScore,
      startTime,
      endTime,
      isActive,
      isProctored,
      maxViolations,
      questions // Array of questions to add
    } = req.body;

    // Only use Supabase UUID - never Firebase UID for UUID columns
    const userId = req.user?.supabaseUserId || null;

    // Create exam
    const exam = await supabaseExamService.createExam({
      title,
      description,
      category,
      subject,
      difficulty,
      questionCount,
      durationMinutes,
      passingScore,
      startTime,
      endTime,
      isActive,
      isProctored,
      maxViolations,
      createdBy: userId
    });

    // Add questions if provided
    if (questions && questions.length > 0) {
      await supabaseExamService.addQuestionsToExam(exam.id, questions);
    }

    res.status(201).json({
      success: true,
      data: exam,
      message: 'Exam created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all exams with filters
const getExams = async (req, res, next) => {
  try {
    const { category, subject, difficulty, isActive } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (subject) filters.subject = subject;
    if (difficulty) filters.difficulty = difficulty;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const exams = await supabaseExamService.getExams(filters);

    res.json({
      success: true,
      data: exams,
      count: exams.length
    });
  } catch (error) {
    next(error);
  }
};

// Get exam by ID
const getExamById = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const exam = await supabaseExamService.getExamById(examId);

    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    next(error);
  }
};

// Get exam questions
const getExamQuestions = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const questions = await supabaseExamService.getExamQuestions(examId);

    // Optionally shuffle questions
    if (req.query.shuffle === 'true') {
      questions.sort(() => Math.random() - 0.5);
    }

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    next(error);
  }
};

// Submit exam result
const submitExamResult = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const {
      answers,
      timePerQuestion,
      timeTakenSeconds,
      violationCount,
      isDisqualified
    } = req.body;

    // Only use Supabase UUID - never Firebase UID for UUID columns
    const userId = req.user?.supabaseUserId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found in database. Please complete registration first.'
      });
    }

    // Get exam questions
    const questions = await supabaseExamService.getExamQuestions(examId);

    // Calculate results
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      
      if (userAnswer === undefined || userAnswer === null) {
        unanswered++;
      } else if (userAnswer === question.correct_answer) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    });

    const totalQuestions = questions.length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Submit result
    const result = await supabaseExamService.submitExamResult({
      userId,
      examId,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unanswered,
      accuracy: accuracy.toFixed(2),
      timeTakenSeconds,
      answers,
      timePerQuestion,
      violationCount: violationCount || 0,
      isDisqualified: isDisqualified || false,
      startedAt: new Date(Date.now() - (timeTakenSeconds * 1000)).toISOString()
    });

    res.json({
      success: true,
      data: {
        ...result,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        unanswered,
        accuracy: parseFloat(accuracy.toFixed(2)),
        score
      },
      message: 'Exam submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user's exam results
const getUserExamResults = async (req, res, next) => {
  try {
    const userId = req.user?.supabaseUserId;
    if (!userId) {
      return res.json({ success: true, data: [], count: 0 });
    }
    const { examId } = req.query;

    const results = await supabaseExamService.getUserExamResults(userId, examId);

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    next(error);
  }
};

// Get exam leaderboard
const getExamLeaderboard = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const leaderboard = await supabaseExamService.getExamLeaderboard(examId, limit);

    res.json({
      success: true,
      data: leaderboard,
      count: leaderboard.length
    });
  } catch (error) {
    next(error);
  }
};

// Update exam (admin only)
const updateExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const updates = req.body;

    const exam = await supabaseExamService.updateExam(examId, updates);

    res.json({
      success: true,
      data: exam,
      message: 'Exam updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete exam (admin only)
const deleteExam = async (req, res, next) => {
  try {
    const { examId } = req.params;

    await supabaseExamService.deleteExam(examId);

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Generate exam from question bank
const generateExamFromBank = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      subject,
      difficulty,
      questionCount,
      durationMinutes
    } = req.body;

    // Only use Supabase UUID - never Firebase UID for UUID columns
    const userId = req.user?.supabaseUserId || null;

    // Get random questions from bank
    const questions = await supabaseQuestionService.getRandomQuestions({
      count: questionCount || 50,
      subject,
      category,
      difficulty,
      onlyApproved: true
    });

    // Create exam
    const exam = await supabaseExamService.createExam({
      title,
      description,
      category: category || 'custom',
      subject,
      difficulty,
      questionCount: questions.length,
      durationMinutes: durationMinutes || 60,
      createdBy: userId
    });

    // Add questions to exam
    await supabaseExamService.addQuestionsToExam(exam.id, questions);

    res.status(201).json({
      success: true,
      data: exam,
      message: `Exam generated with ${questions.length} questions`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  getExamQuestions,
  submitExamResult,
  getUserExamResults,
  getExamLeaderboard,
  updateExam,
  deleteExam,
  generateExamFromBank
};
