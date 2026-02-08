const express = require('express');
const router = express.Router();
const supabaseDailyChallengeService = require('../services/supabaseDailyChallengeService');
const { verifyToken, optionalAuth } = require('../middleware/auth');

/**
 * @route GET /api/v2/daily-challenges/today
 * @desc Get today's challenge
 * @access Public
 */
router.get('/today', async (req, res) => {
  try {
    const challenge = await supabaseDailyChallengeService.getTodaysChallenge();
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'No challenge available for today'
      });
    }

    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('Error fetching today\'s challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s challenge',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/daily-challenges/:date
 * @desc Get challenge by date
 * @access Public
 */
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const challenge = await supabaseDailyChallengeService.getChallengeByDate(date);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'No challenge found for this date'
      });
    }

    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/daily-challenges
 * @desc Get all challenges with filters
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      subject: req.query.subject,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const challenges = await supabaseDailyChallengeService.getChallenges(filters);

    res.json({
      success: true,
      data: challenges,
      count: challenges.length
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v2/daily-challenges
 * @desc Create a new daily challenge
 * @access Admin only
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const challenge = await supabaseDailyChallengeService.createChallenge(req.body);

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: challenge
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create challenge',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/daily-challenges/progress
 * @desc Get user's daily progress
 * @access Private
 */
router.get('/progress', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const date = req.query.date;
    
    const progress = await supabaseDailyChallengeService.getUserProgress(userId, date);

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v2/daily-challenges/progress
 * @desc Update user's daily progress
 * @access Private
 */
router.post('/progress', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const progressData = {
      userId,
      ...req.body
    };

    const progress = await supabaseDailyChallengeService.updateUserProgress(progressData);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: progress
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/daily-challenges/streak
 * @desc Get user's streak info
 * @access Private
 */
router.get('/streak', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const streak = await supabaseDailyChallengeService.getUserStreak(userId);

    res.json({
      success: true,
      data: streak
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streak',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/daily-challenges/leaderboard
 * @desc Get daily challenge leaderboard
 * @access Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const date = req.query.date;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;

    const leaderboard = await supabaseDailyChallengeService.getDailyLeaderboard(date, limit);

    res.json({
      success: true,
      data: leaderboard,
      count: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
});

module.exports = router;
