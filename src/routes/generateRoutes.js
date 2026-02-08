const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const groqService = require('../services/groqService');
const geminiService = require('../services/geminiService');
const openRouterService = require('../services/openRouterService');
const nvidiaService = require('../services/nvidiaService');
const supabaseQuestionService = require('../services/supabaseQuestionService');
const multer = require('multer');
const pdfParse = require('pdf-parse');

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * @route   POST /api/v2/generate/questions
 * @desc    Generate MCQ questions using Groq AI
 * @access  Private (Admin only)
 */
router.post('/questions', verifyToken, async (req, res) => {
  try {
    const { category, subject, difficulty, count, prompt, aiProvider = 'groq', saveToDb = false } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    let questions;
    const questionCount = Math.min(parseInt(count) || 10, 100); // Max 100 questions

    if (aiProvider === 'gemini') {
      // Use Gemini AI
      questions = await geminiService.generateQuestions(
        category,
        subject || 'general',
        difficulty || 'medium',
        questionCount
      );
      // Map Gemini format to standard format
      questions = questions.map(q => ({
        ...q,
        text: q.question,
        generatedBy: 'gemini-ai'
      }));
    } else if (aiProvider === 'openrouter') {
      // Use OpenRouter AI
      questions = await openRouterService.generateQuestions({
        category,
        subcategory: subject,
        difficulty: difficulty || 'medium',
        count: questionCount
      });
    } else if (aiProvider === 'nvidia') {
      // Use NVIDIA NIM AI
      questions = await nvidiaService.generateQuestions({
        category,
        subcategory: subject,
        difficulty: difficulty || 'medium',
        count: questionCount
      });
    } else {
      // Use Groq AI (default)
      questions = await groqService.generateQuestions({
        category,
        subject,
        difficulty: difficulty || 'medium',
        count: questionCount,
        prompt
      });
    }

    // Save to Supabase if requested
    if (saveToDb && questions.length > 0) {
      const formattedQuestions = questions.map(q => ({
        questionText: q.text || q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        subject: q.subject || subject,
        category: q.category || category,
        difficulty: q.difficulty,
        source: aiProvider === 'gemini' ? 'gemini_generated' : 'groq_generated',
        isApproved: false
      }));

      await supabaseQuestionService.bulkAddToQuestionBank(formattedQuestions, {
        source: `${aiProvider}_generated`
      });
    }

    res.json({
      success: true,
      data: questions,
      count: questions.length,
      aiProvider,
      savedToDb: saveToDb
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate questions'
    });
  }
});

/**
 * @route   POST /api/v2/generate/competitive
 * @desc    Generate competitive exam questions using Groq AI and save to Supabase
 * @access  Private (Admin only)
 */
router.post('/competitive', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { category, subject, difficulty = 'medium', count = 10, aiProvider = 'groq' } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    console.log(`🤖 Generating ${count} ${difficulty} questions for ${category}/${subject || 'general'} using ${aiProvider}`);

    let questions;

    if (aiProvider === 'gemini') {
      // Use Gemini AI
      questions = await geminiService.generateQuestions(
        category,
        subject || 'general',
        difficulty,
        Math.min(parseInt(count), 100)
      );
      // Map to standard format
      questions = questions.map(q => ({
        text: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || difficulty,
        category: category,
        subject: subject || 'general'
      }));
    } else if (aiProvider === 'openrouter') {
      // Use OpenRouter AI
      questions = await openRouterService.generateQuestions({
        category,
        subcategory: subject || 'general',
        difficulty,
        count: Math.min(parseInt(count), 100)
      });
      questions = questions.map(q => ({
        text: q.text || q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || difficulty,
        category: category,
        subject: subject || 'general'
      }));
    } else if (aiProvider === 'nvidia') {
      // Use NVIDIA NIM AI
      questions = await nvidiaService.generateQuestions({
        category,
        subcategory: subject || 'general',
        difficulty,
        count: Math.min(parseInt(count), 100)
      });
      questions = questions.map(q => ({
        text: q.text || q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || difficulty,
        category: category,
        subject: subject || 'general'
      }));
    } else {
      // Use Groq AI (default)
      questions = await groqService.generateCompetitiveExamQuestions(
        category,
        subject || 'general',
        difficulty,
        Math.min(parseInt(count), 100)
      );
    }

    // Format and store in Supabase
    const formattedQuestions = questions.map(q => ({
      questionText: q.text || q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      subject: q.subject || subject || 'general',
      category: q.category || category,
      difficulty: q.difficulty || difficulty,
      source: `${aiProvider}_generated`,
      isApproved: false
    }));

    const result = await supabaseQuestionService.bulkAddToQuestionBank(formattedQuestions, {
      source: `${aiProvider}_generated`
    });

    res.json({
      success: true,
      message: `Generated and stored ${questions.length} questions`,
      data: {
        generatedCount: questions.length,
        storedCount: result.length,
        category,
        subject: subject || 'general',
        difficulty,
        aiProvider
      }
    });

  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate questions'
    });
  }
});

/**
 * @route   GET /api/v2/generate/categories
 * @desc    Get all available categories for AI generation
 * @access  Public
 */
router.get('/categories', (req, res) => {
  const groqCategories = Object.entries(groqService.CATEGORY_PROMPTS).map(([id, config]) => ({
    id,
    name: config.base,
    type: config.type,
    subjects: config.subjects
  }));

  res.json({
    success: true,
    data: groqCategories
  });
});

/**
 * @route   POST /api/v2/generate/extract-pdf
 * @desc    Extract questions from uploaded PDF using Groq AI
 * @access  Private (Admin only)
 */
router.post('/extract-pdf', verifyToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required'
      });
    }

    const { category } = req.body;

    // Parse PDF
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text;

    if (!pdfText || pdfText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from PDF or PDF is too short'
      });
    }

    // Extract questions using Groq AI
    const questions = await groqService.extractQuestionsFromPdf(pdfText, category);

    res.json({
      success: true,
      data: questions,
      count: questions.length,
      pdfInfo: {
        pages: pdfData.numpages,
        textLength: pdfText.length
      }
    });

  } catch (error) {
    console.error('Error extracting questions from PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to extract questions from PDF'
    });
  }
});

/**
 * @route   POST /api/v2/generate/dsa-problem
 * @desc    Generate a DSA coding problem using Groq AI
 * @access  Private (Admin only)
 */
router.post('/dsa-problem', verifyToken, async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const problem = await groqService.generateDSAProblem({
      topic,
      difficulty: difficulty || 'medium'
    });

    res.json({
      success: true,
      data: problem
    });

  } catch (error) {
    console.error('Error generating DSA problem:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate DSA problem'
    });
  }
});

module.exports = router;
