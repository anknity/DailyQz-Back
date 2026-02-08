const express = require('express');
const router = express.Router();
const supabaseSchoolExamService = require('../services/supabaseSchoolExamService');
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

module.exports = router;
