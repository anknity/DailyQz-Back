const express = require('express');
const multer = require('multer');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const {
  processPDFAndExtractQuestions,
  generateCompetitiveExamQuestions,
  CATEGORY_PROMPTS
} = require('../services/groqService');
const supabaseQuestionService = require('../services/supabaseQuestionService');
const { db } = require('../config/firebase');
const questionsFromFile = require('../../data/questions');

// Configure multer for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * @route GET /api/competitive/categories
 * @desc Get all available competitive exam categories
 * @access Public
 */
router.get('/categories', (req, res) => {
  const categories = Object.entries(CATEGORY_PROMPTS).map(([id, config]) => ({
    id,
    name: config.base,
    type: config.type,
    subjects: config.subjects
  }));

  res.json({
    success: true,
    data: categories
  });
});

/**
 * @route POST /api/competitive/upload-pdf
 * @desc Upload PDF and extract questions
 * @access Admin only
 */
router.post('/upload-pdf', verifyToken, verifyAdmin, upload.single('pdf'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    const { category, subject } = req.body;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    console.log(`📤 PDF Upload: ${req.file.originalname} (${Math.round(req.file.size / 1024)}KB)`);
    console.log(`📁 Category: ${category}, Subject: ${subject || 'general'}`);

    // Extract questions from PDF
    const questions = await processPDFAndExtractQuestions(
      req.file.buffer,
      category,
      subject || 'general'
    );

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No questions could be extracted from the PDF'
      });
    }

    // Format for Supabase
    const formattedQuestions = questions.map(q => ({
      questionText: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      subject: q.subject,
      category: q.category,
      difficulty: q.difficulty,
      source: 'pdf_upload',
      sourceFile: req.file.originalname,
      isApproved: false
    }));

    // Store in Supabase
    const result = await supabaseQuestionService.bulkAddToQuestionBank(
      formattedQuestions,
      { source: 'pdf_upload', sourceFile: req.file.originalname }
    );

    res.json({
      success: true,
      message: `Successfully extracted and stored ${questions.length} questions`,
      data: {
        extractedCount: questions.length,
        storedCount: result.length,
        category,
        subject: subject || 'general',
        fileName: req.file.originalname,
        questions: questions.map((q, index) => ({
          id: result[index]?.id || `pdf-${Date.now()}-${index}`,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium'
        }))
      }
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    next(error);
  }
});

/**
 * @route POST /api/competitive/generate
 * @desc Generate questions for a competitive exam
 * @access Admin only
 */
router.post('/generate', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const { category, subject, difficulty = 'medium', count = 10 } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    if (!CATEGORY_PROMPTS[category]) {
      return res.status(400).json({
        success: false,
        error: `Invalid category: ${category}. Available: ${Object.keys(CATEGORY_PROMPTS).join(', ')}`
      });
    }

    console.log(`🤖 Generating ${count} ${difficulty} questions for ${category}/${subject || 'general'}`);

    // Generate questions
    const questions = await generateCompetitiveExamQuestions(
      category,
      subject || 'general',
      difficulty,
      Math.min(count, 20) // Limit to 20 at a time
    );

    // Format and store in Supabase
    const formattedQuestions = questions.map(q => ({
      questionText: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      subject: q.subject,
      category: q.category,
      difficulty: q.difficulty,
      source: 'ai_generated',
      isApproved: false
    }));

    const result = await supabaseQuestionService.bulkAddToQuestionBank(
      formattedQuestions,
      { source: 'ai_generated' }
    );

    // Return actual questions with their IDs for immediate use
    res.json({
      success: true,
      message: `Generated and stored ${questions.length} questions`,
      data: {
        generatedCount: questions.length,
        storedCount: result.length,
        category,
        subject: subject || 'general',
        difficulty,
        questions: questions.map((q, index) => ({
          id: result[index]?.id || `gen-${Date.now()}-${index}`,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          difficulty: q.difficulty || difficulty
        }))
      }
    });

  } catch (error) {
    console.error('Question generation error:', error);
    next(error);
  }
});

/**
 * @route GET /api/competitive/questions
 * @desc Get questions with filters
 * @access Protected
 */
router.get('/questions', verifyToken, async (req, res, next) => {
  try {
    const { category, subject, difficulty, approved, limit = 50 } = req.query;

    const filters = {
      limit: parseInt(limit)
    };

    if (category) filters.category = category;
    if (subject) filters.subject = subject;
    if (difficulty) filters.difficulty = difficulty;
    if (approved !== undefined) filters.isApproved = approved === 'true';

    const questions = await supabaseQuestionService.getQuestionsFromBank(filters);

    res.json({
      success: true,
      data: questions,
      meta: {
        total: questions.length,
        filters
      }
    });

  } catch (error) {
    console.error('Get questions error:', error);
    next(error);
  }
});

/**
 * @route GET /api/competitive/questions/random
 * @desc Get random questions for a test from Supabase + Firestore + File
 * @access Public (authentication optional for better UX)
 */
router.get('/questions/random', async (req, res, next) => {
  try {
    const { category, subject, difficulty, count = 20 } = req.query;
    const requestedCount = parseInt(count);
    let allQuestions = [];

    // 1. Fetch from Supabase question_bank
    try {
      const supabaseQuestions = await supabaseQuestionService.getRandomQuestions({
        count: requestedCount * 2, // Get more to have variety
        category,
        subject,
        difficulty,
        onlyApproved: false
      });
      
      allQuestions = supabaseQuestions.map(q => ({
        id: q.id,
        question: q.question_text || q.question,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correctAnswer: q.correct_answer !== undefined ? q.correct_answer : q.correctAnswer,
        difficulty: q.difficulty,
        category: q.category,
        subject: q.subject,
        source: 'supabase'
      }));
    } catch (e) {
      console.warn('Supabase fetch error:', e.message);
    }

    // 2. Fetch from Firestore if we need more questions
    if (allQuestions.length < requestedCount) {
      try {
        let firestoreQuery = db.collection('questions');
        if (category) {
          firestoreQuery = firestoreQuery.where('category', '==', category);
        }
        const firestoreSnapshot = await firestoreQuery.limit(requestedCount).get();
        
        firestoreSnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Check if subject matches (case insensitive)
          if (!subject || (data.subcategory && data.subcategory.toLowerCase().includes(subject.toLowerCase()))) {
            allQuestions.push({
              id: doc.id,
              question: data.question,
              options: data.options,
              correctAnswer: data.correctAnswer,
              difficulty: data.difficulty,
              category: data.category,
              subject: data.subcategory || subject,
              source: 'firestore'
            });
          }
        });
      } catch (e) {
        console.warn('Firestore fetch error:', e.message);
      }
    }

    // 3. Fetch from file if still need more questions
    if (allQuestions.length < requestedCount) {
      const fileQuestions = questionsFromFile
        .filter(q => {
          if (category && q.category !== category) return false;
          if (subject && q.subcategory && !q.subcategory.toLowerCase().includes(subject.toLowerCase())) return false;
          return true;
        })
        .slice(0, requestedCount - allQuestions.length)
        .map((q, i) => ({
          id: `file-${i}-${Date.now()}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          category: q.category,
          subject: q.subcategory || subject,
          source: 'file'
        }));
      
      allQuestions = [...allQuestions, ...fileQuestions];
    }

    // Remove duplicates based on question text
    const uniqueQuestions = allQuestions.filter((q, index, self) =>
      index === self.findIndex(t => t.question && q.question && 
        t.question.toLowerCase().trim() === q.question.toLowerCase().trim())
    );

    // Shuffle and select required count
    const shuffled = uniqueQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, requestedCount);

    if (selectedQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No questions available for ${category}/${subject}. Please ask admin to add questions.`
      });
    }

    res.json({
      success: true,
      data: selectedQuestions,
      meta: {
        total: selectedQuestions.length,
        category,
        subject,
        difficulty,
        sources: {
          supabase: selectedQuestions.filter(q => q.source === 'supabase').length,
          firestore: selectedQuestions.filter(q => q.source === 'firestore').length,
          file: selectedQuestions.filter(q => q.source === 'file').length
        }
      }
    });

  } catch (error) {
    console.error('Get random questions error:', error);
    next(error);
  }
});

/**
 * @route GET /api/competitive/stats
 * @desc Get question statistics
 * @access Admin only
 */
router.get('/stats', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const stats = await supabaseQuestionService.getQuestionStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    next(error);
  }
});

/**
 * @route PUT /api/competitive/questions/:id/approve
 * @desc Approve a question
 * @access Admin only
 */
router.put('/questions/:id/approve', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const question = await supabaseQuestionService.approveQuestion(id, uid);

    res.json({
      success: true,
      message: 'Question approved',
      data: question
    });

  } catch (error) {
    console.error('Approve question error:', error);
    next(error);
  }
});

/**
 * @route POST /api/competitive/questions/bulk-approve
 * @desc Bulk approve pending questions
 * @access Admin only
 */
router.post('/questions/bulk-approve', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { filters = {}, limit } = req.body;

    // Apply limit if provided
    if (limit) {
      filters.limit = limit;
    }

    const result = await supabaseQuestionService.bulkApproveQuestions(uid, filters);

    res.json({
      success: true,
      message: `Successfully approved ${result.count} question(s)`,
      data: {
        count: result.count,
        approvedBy: uid
      }
    });

  } catch (error) {
    console.error('Bulk approve error:', error);
    next(error);
  }
});

/**
 * @route PUT /api/competitive/questions/:id
 * @desc Update a question
 * @access Admin only
 */
router.put('/questions/:id', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const question = await supabaseQuestionService.updateQuestion(id, updates);

    res.json({
      success: true,
      message: 'Question updated',
      data: question
    });

  } catch (error) {
    console.error('Update question error:', error);
    next(error);
  }
});

/**
 * @route DELETE /api/competitive/questions/:id
 * @desc Delete a question
 * @access Admin only
 */
router.delete('/questions/:id', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    await supabaseQuestionService.deleteQuestion(id);

    res.json({
      success: true,
      message: 'Question deleted'
    });

  } catch (error) {
    console.error('Delete question error:', error);
    next(error);
  }
});

/**
 * @route POST /api/competitive/bulk-generate
 * @desc Generate bulk questions for multiple categories
 * @access Admin only
 */
router.post('/bulk-generate', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const { categories, countPerCategory = 10 } = req.body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Categories array is required'
      });
    }

    const results = [];
    
    for (const cat of categories) {
      try {
        console.log(`🤖 Generating for ${cat.category}/${cat.subject || 'general'}...`);
        
        const questions = await generateCompetitiveExamQuestions(
          cat.category,
          cat.subject || 'general',
          cat.difficulty || 'medium',
          Math.min(countPerCategory, 15)
        );

        const formattedQuestions = questions.map(q => ({
          questionText: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          subject: q.subject,
          category: q.category,
          difficulty: q.difficulty,
          source: 'ai_generated',
          isApproved: false
        }));

        const stored = await supabaseQuestionService.bulkAddToQuestionBank(formattedQuestions);

        results.push({
          category: cat.category,
          subject: cat.subject || 'general',
          generated: questions.length,
          stored: stored.length,
          success: true
        });

        // Add delay between categories
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (err) {
        results.push({
          category: cat.category,
          subject: cat.subject || 'general',
          success: false,
          error: err.message
        });
      }
    }

    const totalGenerated = results.filter(r => r.success).reduce((sum, r) => sum + r.generated, 0);
    const totalStored = results.filter(r => r.success).reduce((sum, r) => sum + r.stored, 0);

    res.json({
      success: true,
      message: `Bulk generation complete: ${totalGenerated} questions generated, ${totalStored} stored`,
      data: {
        results,
        totalGenerated,
        totalStored
      }
    });

  } catch (error) {
    console.error('Bulk generate error:', error);
    next(error);
  }
});

/**
 * @route POST /api/competitive/submit-result
 * @desc Submit competitive exam result
 * @access Protected
 */
router.post('/submit-result', verifyToken, async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { category, subject, score, totalQuestions, correctAnswers, timeTaken, answers } = req.body;

    const resultData = {
      userId: uid,
      category,
      subject,
      score,
      totalQuestions,
      correctAnswers,
      timeTaken,
      answers,
      examType: 'competitive',
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    const resultRef = await db.collection('competitiveResults').add(resultData);

    // Update user's competitive stats
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const competitiveStats = userData.competitiveStats || {};
      const categoryStats = competitiveStats[category] || { examsTaken: 0, totalScore: 0, bestScore: 0 };

      categoryStats.examsTaken += 1;
      categoryStats.totalScore += score;
      categoryStats.avgScore = Math.round(categoryStats.totalScore / categoryStats.examsTaken);
      if (score > categoryStats.bestScore) {
        categoryStats.bestScore = score;
      }

      competitiveStats[category] = categoryStats;
      await userRef.update({ competitiveStats });
    }

    res.json({
      success: true,
      message: 'Result saved successfully',
      data: {
        resultId: resultRef.id,
        ...resultData
      }
    });

  } catch (error) {
    console.error('Submit result error:', error);
    next(error);
  }
});

/**
 * @route GET /api/competitive/leaderboard
 * @desc Get competitive exam leaderboard
 * @access Public
 */
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { category, subject, limit = 20 } = req.query;

    let resultsQuery = db.collection('competitiveResults');
    
    if (category && category !== 'all') {
      resultsQuery = resultsQuery.where('category', '==', category);
    }
    if (subject && subject !== 'all') {
      resultsQuery = resultsQuery.where('subject', '==', subject);
    }

    const resultsSnapshot = await resultsQuery.orderBy('score', 'desc').limit(parseInt(limit) * 2).get();

    // Group by user and get best scores
    const userBestScores = {};
    
    for (const doc of resultsSnapshot.docs) {
      const data = doc.data();
      const userId = data.userId;
      
      if (!userBestScores[userId] || data.score > userBestScores[userId].score) {
        userBestScores[userId] = {
          resultId: doc.id,
          score: data.score,
          category: data.category,
          subject: data.subject,
          totalQuestions: data.totalQuestions,
          correctAnswers: data.correctAnswers,
          timeTaken: data.timeTaken,
          createdAt: data.createdAt
        };
      }
    }

    // Get user details
    const leaderboard = [];
    for (const [userId, resultData] of Object.entries(userBestScores)) {
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          leaderboard.push({
            id: userId,
            name: userData.name || userData.displayName || 'Anonymous',
            photoURL: userData.photoURL || null,
            score: resultData.score,
            bestScore: resultData.score,
            category: resultData.category,
            subject: resultData.subject,
            totalQuestions: resultData.totalQuestions,
            correctAnswers: resultData.correctAnswers,
            timeTaken: resultData.timeTaken,
            createdAt: resultData.createdAt
          });
        }
      } catch (e) {
        // Skip users that don't exist
      }
    }

    // Sort and limit
    leaderboard.sort((a, b) => b.score - a.score);
    const topUsers = leaderboard.slice(0, parseInt(limit)).map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    // Find current user's rank if authenticated
    const authHeader = req.headers.authorization;
    let userRank = null;
    if (authHeader) {
      try {
        const admin = require('firebase-admin');
        const token = authHeader.replace('Bearer ', '');
        const decoded = await admin.auth().verifyIdToken(token);
        const userId = decoded.uid;
        const userIndex = leaderboard.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          userRank = {
            rank: userIndex + 1,
            ...leaderboard[userIndex]
          };
        }
      } catch (e) {
        // User not authenticated - ignore
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
        subject: subject || 'all',
        total: topUsers.length
      }
    });

  } catch (error) {
    console.error('Get competitive leaderboard error:', error);
    next(error);
  }
});

/**
 * @route GET /api/competitive/history
 * @desc Get user's competitive exam history
 * @access Protected
 */
router.get('/history', verifyToken, async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { category, limit = 20 } = req.query;

    let historyQuery = db.collection('competitiveResults')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));

    if (category && category !== 'all') {
      historyQuery = historyQuery.where('category', '==', category);
    }

    const historySnapshot = await historyQuery.get();

    const history = historySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: history,
      meta: {
        total: history.length
      }
    });

  } catch (error) {
    console.error('Get history error:', error);
    next(error);
  }
});

module.exports = router;
