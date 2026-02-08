const {
  supabaseQuestionService
} = require('../services/supabaseServices');

/**
 * Enhanced Question Controller with Supabase Integration
 * Handles question bank operations
 */

// Add question to bank
const addQuestion = async (req, res, next) => {
  try {
    const {
      questionText,
      options,
      correctAnswer,
      subject,
      category,
      difficulty,
      source
    } = req.body;

    // Only use Supabase UUID - never Firebase UID for UUID columns
    const userId = req.user?.supabaseUserId || null;

    const question = await supabaseQuestionService.addToQuestionBank({
      questionText,
      options,
      correctAnswer,
      subject,
      category,
      difficulty,
      source: source || 'manual',
      approvedBy: userId,
      isApproved: false
    });

    res.status(201).json({
      success: true,
      data: question,
      message: 'Question added to bank successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Bulk add questions
const bulkAddQuestions = async (req, res, next) => {
  try {
    const { questions, metadata } = req.body;

    // Only use Supabase UUID - never Firebase UID for UUID columns
    const userId = req.user?.supabaseUserId || null;

    const addedQuestions = await supabaseQuestionService.bulkAddToQuestionBank(
      questions,
      {
        ...metadata,
        approvedBy: userId
      }
    );

    res.status(201).json({
      success: true,
      data: addedQuestions,
      count: addedQuestions.length,
      message: `${addedQuestions.length} questions added successfully`
    });
  } catch (error) {
    next(error);
  }
};

// Get questions from bank
const getQuestions = async (req, res, next) => {
  try {
    const {
      subject,
      category,
      difficulty,
      isApproved,
      source,
      limit
    } = req.query;

    const filters = {};
    if (subject) filters.subject = subject;
    if (category) filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    if (isApproved !== undefined) filters.isApproved = isApproved === 'true';
    if (source) filters.source = source;
    if (limit) filters.limit = parseInt(limit);

    const questions = await supabaseQuestionService.getQuestionsFromBank(filters);

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    next(error);
  }
};

// Approve question (admin only)
const approveQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    // Only use Supabase UUID - never Firebase UID for UUID columns
    const userId = req.user?.supabaseUserId || null;

    const question = await supabaseQuestionService.approveQuestion(questionId, userId);

    res.json({
      success: true,
      data: question,
      message: 'Question approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update question
const updateQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const updates = req.body;

    const question = await supabaseQuestionService.updateQuestion(questionId, updates);

    res.json({
      success: true,
      data: question,
      message: 'Question updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete question
const deleteQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    await supabaseQuestionService.deleteQuestion(questionId);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get random questions
const getRandomQuestions = async (req, res, next) => {
  try {
    const {
      count = 10,
      subject,
      category,
      difficulty,
      onlyApproved = true
    } = req.query;

    const questions = await supabaseQuestionService.getRandomQuestions({
      count: parseInt(count),
      subject,
      category,
      difficulty,
      onlyApproved: onlyApproved === 'true'
    });

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    next(error);
  }
};

// Get question statistics
const getQuestionStats = async (req, res, next) => {
  try {
    const stats = await supabaseQuestionService.getQuestionStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Search questions
const searchQuestions = async (req, res, next) => {
  try {
    const { q, subject, category } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const filters = {};
    if (subject) filters.subject = subject;
    if (category) filters.category = category;

    const questions = await supabaseQuestionService.searchQuestions(q, filters);

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    next(error);
  }
};

// Get available categories and subjects
const getCategories = async (req, res, next) => {
  try {
    const stats = await supabaseQuestionService.getQuestionStats();

    const categories = Object.keys(stats.byCategory || {}).map(cat => ({
      name: cat,
      count: stats.byCategory[cat]
    }));

    const subjects = Object.keys(stats.bySubject || {}).map(subj => ({
      name: subj,
      count: stats.bySubject[subj]
    }));

    res.json({
      success: true,
      data: {
        categories,
        subjects,
        difficulties: stats.byDifficulty
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addQuestion,
  bulkAddQuestions,
  getQuestions,
  approveQuestion,
  updateQuestion,
  deleteQuestion,
  getRandomQuestions,
  getQuestionStats,
  searchQuestions,
  getCategories
};
