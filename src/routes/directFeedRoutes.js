const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const openRouterService = require('../services/openRouterService');
const geminiService = require('../services/geminiService');
const groqService = require('../services/groqService');
const nvidiaService = require('../services/nvidiaService');

/**
 * Direct Feed Routes for Admin Panel
 * Allows direct question feeding to Supabase with AI assistance
 * Base path: /api/v2/direct-feed
 */

// All routes require admin authentication
router.use(verifyToken);
router.use(verifyAdmin);

/**
 * POST /parse-question
 * Parse raw question text using AI
 */
router.post('/parse-question', async (req, res) => {
  try {
    const { rawText, aiProvider = 'openrouter' } = req.body;

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Raw question text is required'
      });
    }

    let parsedQuestion;

    if (aiProvider === 'openrouter') {
      parsedQuestion = await openRouterService.parseQuestion(rawText);
    } else if (aiProvider === 'gemini') {
      // Use Gemini for parsing
      parsedQuestion = await parseWithGemini(rawText);
    } else if (aiProvider === 'nvidia') {
      parsedQuestion = await nvidiaService.parseQuestion(rawText);
    } else {
      // Use Groq for parsing
      parsedQuestion = await parseWithGroq(rawText);
    }

    res.json({
      success: true,
      data: parsedQuestion
    });
  } catch (error) {
    console.error('Parse question error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to parse question'
    });
  }
});

/**
 * POST /validate-question
 * Validate and improve a question using AI
 */
router.post('/validate-question', async (req, res) => {
  try {
    const { question, aiProvider = 'openrouter' } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question object is required'
      });
    }

    let validatedQuestion;

    if (aiProvider === 'openrouter') {
      validatedQuestion = await openRouterService.validateQuestion(question);
    } else if (aiProvider === 'nvidia') {
      validatedQuestion = await nvidiaService.validateQuestion(question);
    } else {
      // Default validation without AI
      validatedQuestion = {
        ...question,
        isValid: true,
        improvements: []
      };
    }

    res.json({
      success: true,
      data: validatedQuestion
    });
  } catch (error) {
    console.error('Validate question error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate question'
    });
  }
});

/**
 * POST /categorize
 * Suggest category for a question using AI
 */
router.post('/categorize', async (req, res) => {
  try {
    const { questionText, aiProvider = 'openrouter' } = req.body;

    if (!questionText) {
      return res.status(400).json({
        success: false,
        error: 'Question text is required'
      });
    }

    let suggestion;

    if (aiProvider === 'openrouter') {
      suggestion = await openRouterService.categorizeQuestion(questionText);
    } else if (aiProvider === 'nvidia') {
      suggestion = await nvidiaService.categorizeQuestion(questionText);
    } else {
      // Default suggestion
      suggestion = {
        category: 'quantitative-aptitude',
        subcategory: 'general',
        confidence: 0.5
      };
    }

    res.json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    console.error('Categorize error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to categorize question'
    });
  }
});

/**
 * POST /generate
 * Generate questions using AI
 */
router.post('/generate', async (req, res) => {
  try {
    const { category, subcategory, difficulty = 'medium', aiProvider = 'openrouter' } = req.body;
    const count = Math.min(parseInt(req.body.count) || 5, 100);

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    console.log(`🤖 [Direct Feed] Generating ${count} ${difficulty} questions for ${category}/${subcategory || 'general'} using ${aiProvider}`);

    let questions;

    if (aiProvider === 'openrouter') {
      questions = await openRouterService.generateQuestions({
        category,
        subcategory: subcategory || 'general',
        difficulty,
        count
      });
    } else if (aiProvider === 'gemini') {
      questions = await geminiService.generateQuestions(category, subcategory || 'general', difficulty, count);
    } else if (aiProvider === 'nvidia') {
      questions = await nvidiaService.generateQuestions({
        category,
        subcategory: subcategory || 'general',
        difficulty,
        count
      });
    } else {
      // Groq
      questions = await groqService.generateQuestions({
        category,
        subject: subcategory || 'general',
        difficulty,
        count
      });
    }

    if (!questions || !Array.isArray(questions)) {
      throw new Error(`AI provider ${aiProvider} returned invalid response`);
    }

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate questions'
    });
  }
});

/**
 * POST /save-question
 * Save a single question to Supabase
 */
router.post('/save-question', async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation, category, subcategory, difficulty } = req.body;

    if (!question || !options || correctAnswer === undefined || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: question, options, correctAnswer, category'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('question_bank')
      .insert({
        question_text: question,
        options: JSON.stringify(options),
        correct_answer: correctAnswer,
        category: category,
        subject: subcategory || 'general',
        difficulty: difficulty || 'medium',
        source: 'direct-feed',
        is_approved: true
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data,
      message: 'Question saved successfully'
    });
  } catch (error) {
    console.error('Save question error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save question'
    });
  }
});

/**
 * POST /save-bulk
 * Save multiple questions to Supabase
 */
router.post('/save-bulk', async (req, res) => {
  try {
    const { questions, category, subcategory, difficulty } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Questions array is required'
      });
    }

    const formattedQuestions = questions.map(q => ({
      question_text: q.question || q.question_text || q.text,
      options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options),
      correct_answer: q.correctAnswer ?? q.correct_answer,
      category: q.category || category,
      subject: q.subcategory || q.subject || subcategory || 'general',
      difficulty: q.difficulty || difficulty || 'medium',
      source: 'direct-feed',
      is_approved: true
    }));

    const { data, error } = await supabaseAdmin
      .from('question_bank')
      .insert(formattedQuestions)
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data,
      count: data.length,
      message: `${data.length} questions saved successfully`
    });
  } catch (error) {
    console.error('Bulk save error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save questions'
    });
  }
});

/**
 * POST /batch-process
 * Process multiple raw questions with AI
 */
router.post('/batch-process', async (req, res) => {
  try {
    const { rawQuestions, aiProvider = 'openrouter' } = req.body;

    if (!rawQuestions || !Array.isArray(rawQuestions)) {
      return res.status(400).json({
        success: false,
        error: 'Raw questions array is required'
      });
    }

    let processedQuestions;

    if (aiProvider === 'openrouter') {
      processedQuestions = await openRouterService.batchProcessQuestions(rawQuestions);
    } else {
      // Simple processing without AI
      processedQuestions = rawQuestions.map(q => ({
        rawText: q,
        status: 'pending',
        needsManualReview: true
      }));
    }

    res.json({
      success: true,
      data: processedQuestions,
      processed: processedQuestions.filter(q => q.status === 'success').length,
      failed: processedQuestions.filter(q => q.status === 'error').length
    });
  } catch (error) {
    console.error('Batch process error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process questions'
    });
  }
});

/**
 * GET /categories
 * Get available categories and subcategories
 */
router.get('/categories', (req, res) => {
  const categories = openRouterService.CATEGORY_PROMPTS;
  
  const formattedCategories = Object.entries(categories).map(([id, config]) => ({
    id,
    name: config.base,
    subcategories: Object.entries(config.subcategories).map(([subId, description]) => ({
      id: subId,
      name: subId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description
    }))
  }));

  res.json({
    success: true,
    data: formattedCategories
  });
});

/**
 * GET /stats
 * Get question bank statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('question_bank')
      .select('category, subject, difficulty, source, is_approved');

    if (error) throw error;

    const stats = {
      total: data.length,
      byCategory: {},
      byDifficulty: { easy: 0, medium: 0, hard: 0 },
      bySource: {},
      approved: data.filter(q => q.is_approved).length,
      pending: data.filter(q => !q.is_approved).length
    };

    data.forEach(q => {
      // By category
      if (q.category) {
        stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
      }
      // By difficulty
      if (q.difficulty) {
        stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
      }
      // By source
      if (q.source) {
        stats.bySource[q.source] = (stats.bySource[q.source] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stats'
    });
  }
});

// Helper functions for other AI providers
async function parseWithGemini(rawText) {
  // Simplified Gemini parsing
  return {
    question: rawText,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
    suggestedCategory: 'quantitative-aptitude',
    suggestedSubcategory: 'general',
    difficulty: 'medium',
    needsManualReview: true
  };
}

async function parseWithGroq(rawText) {
  // Simplified Groq parsing
  return {
    question: rawText,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
    suggestedCategory: 'quantitative-aptitude',
    suggestedSubcategory: 'general',
    difficulty: 'medium',
    needsManualReview: true
  };
}

module.exports = router;
