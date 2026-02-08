const { supabaseAdmin } = require('../config/supabase');

/**
 * Supabase Leaderboard Service
 * Handles leaderboard entries and rankings
 */

class SupabaseLeaderboardService {
  
  /**
   * Update leaderboard entry
   * @param {Object} entryData - Leaderboard entry data
   * @returns {Promise<Object>} Created/updated entry
   */
  async updateLeaderboardEntry(entryData) {
    const {
      userId,
      category, // 'daily', 'exam', 'subject', 'dsa', 'global'
      subcategory,
      score,
      totalAttempts,
      accuracy,
      period // 'daily', 'weekly', 'monthly', 'all_time'
    } = entryData;

    const { data, error } = await supabaseAdmin
      .from('leaderboard_entries')
      .upsert({
        user_id: userId,
        category,
        subcategory,
        score,
        total_attempts: totalAttempts || 1,
        accuracy,
        period: period || 'all_time'
      })
      .select()
      .single();

    if (error) throw error;

    // Recalculate ranks for this category
    await this.recalculateRanks(category, subcategory, period);

    return data;
  }

  /**
   * Get leaderboard
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Leaderboard entries
   */
  async getLeaderboard(filters = {}) {
    const {
      category,
      subcategory,
      period = 'all_time',
      limit = 100
    } = filters;

    let query = supabaseAdmin
      .from('leaderboard_entries')
      .select(`
        *,
        users (
          id,
          display_name,
          email,
          avatar_url
        )
      `);

    if (category) {
      query = query.eq('category', category);
    }
    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }
    query = query.eq('period', period);

    query = query
      .order('rank', { ascending: true })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Get user rank
   * @param {string} userId - User ID
   * @param {string} category - Category
   * @param {string} period - Period
   * @returns {Promise<Object>} User's rank info
   */
  async getUserRank(userId, category, period = 'all_time') {
    const { data, error } = await supabaseAdmin
      .from('leaderboard_entries')
      .select(`
        *,
        users (
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .eq('category', category)
      .eq('period', period)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Recalculate ranks for a category
   * @param {string} category - Category
   * @param {string} subcategory - Subcategory (optional)
   * @param {string} period - Period
   * @returns {Promise<void>}
   */
  async recalculateRanks(category, subcategory = null, period = 'all_time') {
    let query = supabaseAdmin
      .from('leaderboard_entries')
      .select('*')
      .eq('category', category)
      .eq('period', period);

    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }

    query = query.order('score', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Update ranks
    const updates = data.map((entry, index) => ({
      id: entry.id,
      rank: index + 1
    }));

    for (const update of updates) {
      await supabaseAdmin
        .from('leaderboard_entries')
        .update({ rank: update.rank })
        .eq('id', update.id);
    }
  }

  /**
   * Get global leaderboard (top performers across all categories)
   * @param {number} limit - Number of entries
   * @returns {Promise<Array>} Global leaderboard
   */
  async getGlobalLeaderboard(limit = 100) {
    const { data, error } = await supabaseAdmin
      .from('user_stats')
      .select(`
        *,
        users (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .order('ai_skill_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get exam-specific leaderboard
   * @param {string} examId - Exam ID
   * @param {number} limit - Number of entries
   * @returns {Promise<Array>} Exam leaderboard
   */
  async getExamLeaderboard(examId, limit = 100) {
    const { data, error } = await supabaseAdmin
      .from('exam_results')
      .select(`
        *,
        users (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .eq('exam_id', examId)
      .order('score', { ascending: false })
      .order('time_taken_seconds', { ascending: true })
      .limit(limit);

    if (error) throw error;

    // Add rank
    return data.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }

  /**
   * Get subject-wise leaderboard
   * @param {string} subject - Subject name
   * @param {number} limit - Number of entries
   * @returns {Promise<Array>} Subject leaderboard
   */
  async getSubjectLeaderboard(subject, limit = 100) {
    return this.getLeaderboard({
      category: 'subject',
      subcategory: subject,
      limit
    });
  }

  /**
   * Update user's global rank based on AI skill score
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async updateGlobalRank(userId) {
    // Get all users sorted by AI skill score
    const { data: allUsers, error } = await supabaseAdmin
      .from('user_stats')
      .select('user_id, ai_skill_score')
      .order('ai_skill_score', { ascending: false });

    if (error) throw error;

    // Find user's rank
    const userIndex = allUsers.findIndex(u => u.user_id === userId);
    if (userIndex !== -1) {
      await supabaseAdmin
        .from('user_stats')
        .update({ global_rank: userIndex + 1 })
        .eq('user_id', userId);
    }
  }

  /**
   * Calculate and update AI skill score
   * @param {string} userId - User ID
   * @returns {Promise<number>} Calculated skill score
   */
  async calculateAISkillScore(userId) {
    // Get user stats
    const { data: stats } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get exam results
    const { data: examResults } = await supabaseAdmin
      .from('exam_results')
      .select('score, accuracy')
      .eq('user_id', userId);

    if (!stats) return 0;

    // Calculate skill score based on various factors
    const examScore = examResults?.length 
      ? examResults.reduce((sum, r) => sum + r.score, 0) / examResults.length 
      : 0;

    const dsaScore = (
      stats.dsa_easy_solved * 10 +
      stats.dsa_medium_solved * 20 +
      stats.dsa_hard_solved * 40
    );

    const streakBonus = stats.current_streak * 5;

    const skillScore = (examScore * 0.4 + dsaScore * 0.4 + streakBonus * 0.2);

    // Update the score
    await supabaseAdmin
      .from('user_stats')
      .update({ ai_skill_score: skillScore.toFixed(2) })
      .eq('user_id', userId);

    // Update global rank
    await this.updateGlobalRank(userId);

    return skillScore;
  }

  /**
   * Clear old leaderboard entries (maintenance)
   * @param {string} period - Period to clear
   * @returns {Promise<void>}
   */
  async clearOldEntries(period) {
    let cutoffDate;
    const now = new Date();

    switch (period) {
      case 'daily':
        cutoffDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'weekly':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        return; // Don't clear 'all_time'
    }

    await supabaseAdmin
      .from('leaderboard_entries')
      .delete()
      .eq('period', period)
      .lt('calculated_at', cutoffDate.toISOString());
  }
}

module.exports = new SupabaseLeaderboardService();
