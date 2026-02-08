const express = require('express');
const router = express.Router();
const supabaseScheduledExamService = require('../services/supabaseScheduledExamService');
const { verifyToken, optionalAuth } = require('../middleware/auth');

/**
 * @route GET /api/v2/scheduled-exams
 * @desc Get all scheduled exams with filters
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      subject: req.query.subject,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      upcoming: req.query.upcoming === 'true',
      past: req.query.past === 'true',
      live: req.query.live === 'true',
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const exams = await supabaseScheduledExamService.getScheduledExams(filters);

    res.json({
      success: true,
      data: exams,
      count: exams.length
    });
  } catch (error) {
    console.error('Error fetching scheduled exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled exams',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/scheduled-exams/upcoming
 * @desc Get upcoming exams
 * @access Public
 */
router.get('/upcoming', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const exams = await supabaseScheduledExamService.getUpcomingExams(limit);

    res.json({
      success: true,
      data: exams,
      count: exams.length
    });
  } catch (error) {
    console.error('Error fetching upcoming exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming exams',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/scheduled-exams/live
 * @desc Get currently live exams
 * @access Public
 */
router.get('/live', async (req, res) => {
  try {
    const exams = await supabaseScheduledExamService.getLiveExams();

    res.json({
      success: true,
      data: exams,
      count: exams.length
    });
  } catch (error) {
    console.error('Error fetching live exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live exams',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/scheduled-exams/:id
 * @desc Get scheduled exam by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const exam = await supabaseScheduledExamService.getScheduledExamById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled exam not found'
      });
    }

    // Get registration count
    const registrationCount = await supabaseScheduledExamService.getRegistrationCount(req.params.id);

    res.json({
      success: true,
      data: {
        ...exam,
        registrationCount
      }
    });
  } catch (error) {
    console.error('Error fetching scheduled exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled exam',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v2/scheduled-exams
 * @desc Create a scheduled exam
 * @access Admin only
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const examData = {
      ...req.body,
      createdBy: req.user.supabaseUserId
    };

    const exam = await supabaseScheduledExamService.createScheduledExam(examData);

    res.status(201).json({
      success: true,
      message: 'Scheduled exam created successfully',
      data: exam
    });
  } catch (error) {
    console.error('Error creating scheduled exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scheduled exam',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/v2/scheduled-exams/:id
 * @desc Update a scheduled exam
 * @access Admin only
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const exam = await supabaseScheduledExamService.updateScheduledExam(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Scheduled exam updated successfully',
      data: exam
    });
  } catch (error) {
    console.error('Error updating scheduled exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scheduled exam',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/v2/scheduled-exams/:id
 * @desc Delete a scheduled exam
 * @access Admin only
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await supabaseScheduledExamService.deleteScheduledExam(req.params.id);

    res.json({
      success: true,
      message: 'Scheduled exam deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scheduled exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete scheduled exam',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v2/scheduled-exams/:id/register
 * @desc Register for a scheduled exam
 * @access Private
 */
router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const examId = req.params.id;

    const registration = await supabaseScheduledExamService.registerForExam(userId, examId);

    res.status(201).json({
      success: true,
      message: 'Successfully registered for exam',
      data: registration
    });
  } catch (error) {
    console.error('Error registering for exam:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to register for exam'
    });
  }
});

/**
 * @route DELETE /api/v2/scheduled-exams/:id/register
 * @desc Cancel registration for a scheduled exam
 * @access Private
 */
router.delete('/:id/register', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const examId = req.params.id;

    await supabaseScheduledExamService.cancelRegistration(userId, examId);

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/scheduled-exams/:id/registration-status
 * @desc Check if user is registered for exam
 * @access Private
 */
router.get('/:id/registration-status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const examId = req.params.id;

    const registration = await supabaseScheduledExamService.checkRegistration(userId, examId);

    res.json({
      success: true,
      data: {
        isRegistered: !!registration,
        registration
      }
    });
  } catch (error) {
    console.error('Error checking registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check registration',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/scheduled-exams/my/registrations
 * @desc Get user's registrations
 * @access Private
 */
router.get('/my/registrations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const filters = {
      status: req.query.status
    };

    const registrations = await supabaseScheduledExamService.getUserRegistrations(userId, filters);

    res.json({
      success: true,
      data: registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/scheduled-exams/:id/registrations
 * @desc Get all registrations for an exam (Admin)
 * @access Admin
 */
router.get('/:id/registrations', verifyToken, async (req, res) => {
  try {
    const examId = req.params.id;
    const registrations = await supabaseScheduledExamService.getExamRegistrations(examId);

    res.json({
      success: true,
      data: registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Error fetching exam registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam registrations',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/v2/scheduled-exams/:id/registration-status
 * @desc Update registration status (start exam, complete, etc.)
 * @access Private
 */
router.put('/:id/registration-status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const examId = req.params.id;
    const { status } = req.body;

    const registration = await supabaseScheduledExamService.updateRegistrationStatus(
      userId, 
      examId, 
      status
    );

    res.json({
      success: true,
      message: 'Registration status updated',
      data: registration
    });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update registration status',
      error: error.message
    });
  }
});

module.exports = router;
