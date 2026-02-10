const express = require('express');
const router = express.Router();
const supabaseSchoolExamService = require('../services/supabaseSchoolExamService');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, optionalAuth } = require('../middleware/auth');

/**
 * @route GET /api/v2/school-exams
 * @desc Get school exams with filters
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      classLevel: req.query.classLevel || req.query.class,
      stream: req.query.stream,
      subject: req.query.subject,
      chapter: req.query.chapter,
      topic: req.query.topic,
      examType: req.query.examType,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const exams = await supabaseSchoolExamService.getSchoolExams(filters);

    res.json({
      success: true,
      data: exams,
      count: exams.length
    });
  } catch (error) {
    console.error('Error fetching school exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch school exams',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/school-exams/curriculum
 * @desc Get curriculum structure
 * @access Public
 */
router.get('/curriculum', async (req, res) => {
  try {
    const curriculum = await supabaseSchoolExamService.getCurriculumStructure();

    res.json({
      success: true,
      data: curriculum
    });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch curriculum',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/school-exams/class/:classLevel
 * @desc Get exams by class level
 * @access Public
 */
router.get('/class/:classLevel', async (req, res) => {
  try {
    const { classLevel } = req.params;
    const exams = await supabaseSchoolExamService.getExamsByClass(classLevel);

    res.json({
      success: true,
      data: exams,
      count: exams.length
    });
  } catch (error) {
    console.error('Error fetching class exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class exams',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/school-exams/class/:classLevel/subjects
 * @desc Get available subjects for a class
 * @access Public
 */
router.get('/class/:classLevel/subjects', async (req, res) => {
  try {
    const { classLevel } = req.params;
    const subjects = await supabaseSchoolExamService.getSubjectsForClass(classLevel);

    res.json({
      success: true,
      data: subjects,
      count: subjects.length
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/school-exams/class/:classLevel/subject/:subject
 * @desc Get exams by class and subject
 * @access Public
 */
router.get('/class/:classLevel/subject/:subject', async (req, res) => {
  try {
    const { classLevel, subject } = req.params;
    const exams = await supabaseSchoolExamService.getExamsBySubject(classLevel, subject);

    res.json({
      success: true,
      data: exams,
      count: exams.length
    });
  } catch (error) {
    console.error('Error fetching subject exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject exams',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/school-exams/class/:classLevel/subject/:subject/chapters
 * @desc Get available chapters for a subject
 * @access Public
 */
router.get('/class/:classLevel/subject/:subject/chapters', async (req, res) => {
  try {
    const { classLevel, subject } = req.params;
    const chapters = await supabaseSchoolExamService.getChaptersForSubject(classLevel, subject);

    res.json({
      success: true,
      data: chapters,
      count: chapters.length
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chapters',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/school-exams/:id
 * @desc Get school exam by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const exam = await supabaseSchoolExamService.getSchoolExamById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'School exam not found'
      });
    }

    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error fetching school exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch school exam',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v2/school-exams
 * @desc Create a school exam
 * @access Admin only
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const exam = await supabaseSchoolExamService.createSchoolExam(req.body);

    res.status(201).json({
      success: true,
      message: 'School exam created successfully',
      data: exam
    });
  } catch (error) {
    console.error('Error creating school exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create school exam',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/v2/school-exams/:id
 * @desc Update a school exam
 * @access Admin only
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const exam = await supabaseSchoolExamService.updateSchoolExam(req.params.id, req.body);

    res.json({
      success: true,
      message: 'School exam updated successfully',
      data: exam
    });
  } catch (error) {
    console.error('Error updating school exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update school exam',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/v2/school-exams/:id
 * @desc Delete a school exam
 * @access Admin only
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await supabaseSchoolExamService.deleteSchoolExam(req.params.id);

    res.json({
      success: true,
      message: 'School exam deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting school exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete school exam',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v2/school-exams/submit-result
 * @desc Submit school/college exam result for leaderboard
 * @access Protected
 */
router.post('/submit-result', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { 
      classLevel, stream, subject, score, totalQuestions, 
      correctAnswers, wrongAnswers, unanswered, timeTaken, 
      testTitle, displayName, photoURL 
    } = req.body;

    if (!classLevel || !subject || score === undefined || !totalQuestions) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: classLevel, subject, score, totalQuestions'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('school_exam_results')
      .insert({
        firebase_uid: uid,
        display_name: displayName || 'Anonymous',
        photo_url: photoURL || null,
        class_level: String(classLevel),
        stream: stream || null,
        subject,
        score: parseFloat(score),
        total_questions: parseInt(totalQuestions),
        correct_answers: parseInt(correctAnswers) || 0,
        wrong_answers: parseInt(wrongAnswers) || 0,
        unanswered: parseInt(unanswered) || 0,
        time_taken_seconds: parseInt(timeTaken) || null,
        test_title: testTitle || null
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'School exam result saved successfully',
      data
    });
  } catch (error) {
    console.error('Error saving school exam result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save school exam result',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/school-exams/leaderboard
 * @desc Get school/college leaderboard - best scores per user
 * @access Public
 * @query classLevel - Filter by class (1-12)
 * @query subject - Filter by subject
 * @query limit - Number of results (default 20)
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { classLevel, subject, limit = 20 } = req.query;

    // Build a query to get best score per user
    // We use a raw RPC or just query all and aggregate in JS
    let query = supabaseAdmin
      .from('school_exam_results')
      .select('*')
      .order('score', { ascending: false });

    if (classLevel && classLevel !== 'all') {
      query = query.eq('class_level', String(classLevel));
    }
    if (subject && subject !== 'all') {
      query = query.eq('subject', subject);
    }

    // Fetch more to aggregate per user
    query = query.limit(parseInt(limit) * 5);

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate best scores per user
    const userBest = {};
    for (const result of (data || [])) {
      const uid = result.firebase_uid;
      if (!userBest[uid] || result.score > userBest[uid].score) {
        userBest[uid] = {
          id: uid,
          name: result.display_name || 'Anonymous',
          displayName: result.display_name || 'Anonymous',
          photoURL: result.photo_url,
          bestScore: parseFloat(result.score),
          score: parseFloat(result.score),
          classLevel: result.class_level,
          subject: result.subject,
          totalQuestions: result.total_questions,
          correctAnswers: result.correct_answers,
          timeTaken: result.time_taken_seconds,
          testTitle: result.test_title,
          testsCompleted: 0,
          totalScore: 0,
          submittedAt: result.submitted_at
        };
      }
      userBest[uid].testsCompleted += 1;
      userBest[uid].totalScore += parseFloat(result.score);
    }

    // Calculate averages and sort
    const leaderboard = Object.values(userBest)
      .map(u => ({
        ...u,
        avgScore: u.testsCompleted > 0 ? Math.round(u.totalScore / u.testsCompleted) : 0
      }))
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, parseInt(limit))
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));

    // Find current user rank if auth header present
    let userRank = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const admin = require('firebase-admin');
        const token = authHeader.replace('Bearer ', '');
        const decoded = await admin.auth().verifyIdToken(token);
        const userId = decoded.uid;
        
        const allUsers = Object.values(userBest)
          .sort((a, b) => b.bestScore - a.bestScore);
        const userIndex = allUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          userRank = {
            rank: userIndex + 1,
            ...allUsers[userIndex]
          };
        }
      } catch (e) {
        // Not authenticated or invalid token
      }
    }

    res.json({
      success: true,
      data: {
        leaderboard,
        userRank
      },
      meta: {
        classLevel: classLevel || 'all',
        subject: subject || 'all',
        total: leaderboard.length
      }
    });
  } catch (error) {
    console.error('Error fetching school leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch school leaderboard',
      error: error.message
    });
  }
});

module.exports = router;
