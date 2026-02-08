const express = require('express');
const router = express.Router();
const supabaseAchievementService = require('../services/supabaseAchievementService');
const { verifyToken, optionalAuth } = require('../middleware/auth');

/**
 * @route GET /api/v2/achievements
 * @desc Get all achievements
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    
    let achievements;
    if (category) {
      achievements = await supabaseAchievementService.getAchievementsByCategory(category);
    } else {
      achievements = await supabaseAchievementService.getAllAchievements();
    }

    res.json({
      success: true,
      data: achievements,
      count: achievements.length
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/achievements/user
 * @desc Get user's achievements
 * @access Private
 */
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const achievements = await supabaseAchievementService.getUserAchievements(userId);
    const totalPoints = await supabaseAchievementService.getUserTotalPoints(userId);

    res.json({
      success: true,
      data: {
        achievements,
        totalPoints,
        count: achievements.length
      }
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user achievements',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/achievements/user/:userId
 * @desc Get specific user's achievements
 * @access Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const achievements = await supabaseAchievementService.getUserAchievements(userId);
    const totalPoints = await supabaseAchievementService.getUserTotalPoints(userId);

    res.json({
      success: true,
      data: {
        achievements,
        totalPoints,
        count: achievements.length
      }
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user achievements',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/achievements/:id
 * @desc Get achievement by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const achievement = await supabaseAchievementService.getAchievementById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    console.error('Error fetching achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v2/achievements
 * @desc Create a new achievement
 * @access Admin only
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const achievement = await supabaseAchievementService.createAchievement(req.body);

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: achievement
    });
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create achievement',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v2/achievements/check
 * @desc Check and award achievements based on user stats
 * @access Private
 */
router.post('/check', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const { userStats } = req.body;

    const newAchievements = await supabaseAchievementService.checkAndAwardAchievements(
      userId,
      userStats
    );

    res.json({
      success: true,
      message: newAchievements.length > 0 
        ? `${newAchievements.length} new achievements unlocked!` 
        : 'No new achievements',
      data: {
        newAchievements,
        count: newAchievements.length
      }
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check achievements',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v2/achievements/award
 * @desc Award a specific achievement to user
 * @access Admin only
 */
router.post('/award', verifyToken, async (req, res) => {
  try {
    const { userId, achievementId } = req.body;

    const result = await supabaseAchievementService.awardAchievement(userId, achievementId);

    if (result.alreadyAwarded) {
      return res.json({
        success: true,
        message: 'Achievement was already awarded',
        data: result
      });
    }

    res.json({
      success: true,
      message: 'Achievement awarded successfully',
      data: result
    });
  } catch (error) {
    console.error('Error awarding achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award achievement',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/achievements/leaderboard
 * @desc Get achievement leaderboard
 * @access Public
 */
router.get('/leaderboard/top', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const leaderboard = await supabaseAchievementService.getAchievementLeaderboard(limit);

    res.json({
      success: true,
      data: leaderboard,
      count: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching achievement leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement leaderboard',
      error: error.message
    });
  }
});

module.exports = router;
