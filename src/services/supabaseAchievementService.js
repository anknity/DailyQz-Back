const { supabaseAdmin } = require('../config/supabase');

/**
 * Supabase Achievement Service
 * Handles achievements and user achievements
 */

class SupabaseAchievementService {
  
  /**
   * Get all achievements
   * @returns {Promise<Array>} All achievements
   */
  async getAllAchievements() {
    const { data, error } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .order('points', { ascending: false });

    if (error) throw error;
    return data.map(a => this.parseAchievement(a));
  }

  /**
   * Get achievement by ID
   * @param {string} achievementId - Achievement ID
   * @returns {Promise<Object>} Achievement
   */
  async getAchievementById(achievementId) {
    const { data, error } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (error) throw error;
    return this.parseAchievement(data);
  }

  /**
   * Create a new achievement
   * @param {Object} achievementData - Achievement details
   * @returns {Promise<Object>} Created achievement
   */
  async createAchievement(achievementData) {
    const {
      name,
      description,
      icon,
      category,
      criteria,
      points
    } = achievementData;

    const { data, error } = await supabaseAdmin
      .from('achievements')
      .insert({
        name,
        description,
        icon,
        category,
        criteria: JSON.stringify(criteria),
        points: points || 0
      })
      .select()
      .single();

    if (error) throw error;
    return this.parseAchievement(data);
  }

  /**
   * Get user's achievements
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User's achievements
   */
  async getUserAchievements(userId) {
    const { data, error } = await supabaseAdmin
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data.map(ua => ({
      ...ua,
      achievements: this.parseAchievement(ua.achievements)
    }));
  }

  /**
   * Award achievement to user
   * @param {string} userId - User ID
   * @param {string} achievementId - Achievement ID
   * @returns {Promise<Object>} User achievement record
   */
  async awardAchievement(userId, achievementId) {
    // Check if already awarded
    const { data: existing } = await supabaseAdmin
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (existing) {
      return { alreadyAwarded: true, ...existing };
    }

    const { data, error } = await supabaseAdmin
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId
      })
      .select(`
        *,
        achievements (*)
      `)
      .single();

    if (error) throw error;
    return {
      ...data,
      achievements: this.parseAchievement(data.achievements)
    };
  }

  /**
   * Check and award achievements based on user stats
   * @param {string} userId - User ID
   * @param {Object} userStats - Current user stats
   * @returns {Promise<Array>} Newly awarded achievements
   */
  async checkAndAwardAchievements(userId, userStats) {
    const { data: allAchievements } = await supabaseAdmin
      .from('achievements')
      .select('*');

    const { data: userAchievements } = await supabaseAdmin
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
    const newlyAwarded = [];

    for (const achievement of allAchievements || []) {
      if (earnedIds.has(achievement.id)) continue;

      const criteria = typeof achievement.criteria === 'string' 
        ? JSON.parse(achievement.criteria) 
        : achievement.criteria;

      if (this.checkCriteria(criteria, userStats)) {
        const awarded = await this.awardAchievement(userId, achievement.id);
        if (!awarded.alreadyAwarded) {
          newlyAwarded.push(this.parseAchievement(achievement));
        }
      }
    }

    return newlyAwarded;
  }

  /**
   * Check if criteria is met
   * @param {Object} criteria - Achievement criteria
   * @param {Object} stats - User stats
   * @returns {boolean} Whether criteria is met
   */
  checkCriteria(criteria, stats) {
    if (!criteria || !criteria.type) return false;

    switch (criteria.type) {
      case 'exams_taken':
        return (stats.total_exams_taken || 0) >= criteria.value;
      
      case 'perfect_score':
        return stats.has_perfect_score === true;
      
      case 'streak':
        return (stats.current_streak || 0) >= criteria.value;
      
      case 'dsa_solved':
        return (stats.total_dsa_solved || 0) >= criteria.value;
      
      case 'time_under':
        return stats.fastest_exam_time && stats.fastest_exam_time <= criteria.value;
      
      case 'night_quiz':
        return stats.has_night_quiz === true;
      
      case 'subjects_mastered':
        return (stats.subjects_above_80 || 0) >= criteria.value;
      
      default:
        return false;
    }
  }

  /**
   * Get user's total achievement points
   * @param {string} userId - User ID
   * @returns {Promise<number>} Total points
   */
  async getUserTotalPoints(userId) {
    const achievements = await this.getUserAchievements(userId);
    return achievements.reduce((total, ua) => {
      return total + (ua.achievements?.points || 0);
    }, 0);
  }

  /**
   * Get achievement leaderboard
   * @param {number} limit - Number of entries
   * @returns {Promise<Array>} Leaderboard
   */
  async getAchievementLeaderboard(limit = 100) {
    // Get all user achievements with points
    const { data, error } = await supabaseAdmin
      .from('user_achievements')
      .select(`
        user_id,
        achievements (points),
        users (
          id,
          display_name,
          email,
          avatar_url
        )
      `);

    if (error) throw error;

    // Aggregate points per user
    const userPoints = {};
    for (const ua of data || []) {
      const points = ua.achievements?.points || 0;
      if (!userPoints[ua.user_id]) {
        userPoints[ua.user_id] = {
          userId: ua.user_id,
          user: ua.users,
          totalPoints: 0,
          achievementCount: 0
        };
      }
      userPoints[ua.user_id].totalPoints += points;
      userPoints[ua.user_id].achievementCount++;
    }

    // Sort and return
    return Object.values(userPoints)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
  }

  /**
   * Get achievements by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Achievements in category
   */
  async getAchievementsByCategory(category) {
    const { data, error } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('category', category)
      .order('points', { ascending: false });

    if (error) throw error;
    return data.map(a => this.parseAchievement(a));
  }

  /**
   * Parse achievement data
   * @param {Object} achievement - Raw achievement
   * @returns {Object} Parsed achievement
   */
  parseAchievement(achievement) {
    if (!achievement) return null;
    return {
      ...achievement,
      criteria: typeof achievement.criteria === 'string' 
        ? JSON.parse(achievement.criteria) 
        : achievement.criteria
    };
  }
}

module.exports = new SupabaseAchievementService();
