const { supabaseAdmin } = require('../config/supabase');

/**
 * Supabase User Service
 * Handles user management and statistics
 */

class SupabaseUserService {
  
  /**
   * Create or sync user from Firebase
   * @param {Object} userData - User data from Firebase
   * @returns {Promise<Object>} Created/updated user
   */
  async syncUser(userData) {
    const {
      firebaseUid,
      supabaseUid,
      email,
      phone,
      displayName,
      avatarUrl,
      role
    } = userData;

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          email,
          phone,
          display_name: displayName,
          avatar_url: avatarUrl,
          role: role || existingUser.role
        })
        .eq('firebase_uid', firebaseUid)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new user
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          firebase_uid: firebaseUid,
          supabase_uid: supabaseUid,
          email,
          phone,
          display_name: displayName,
          avatar_url: avatarUrl,
          role: role || 'user'
        })
        .select()
        .single();

      if (error) throw error;

      // Initialize user stats
      await this.initializeUserStats(data.id);

      return data;
    }
  }

  /**
   * Initialize user statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created stats
   */
  async initializeUserStats(userId) {
    const { data, error } = await supabaseAdmin
      .from('user_stats')
      .insert({
        user_id: userId,
        total_exams_taken: 0,
        total_dsa_solved: 0,
        dsa_easy_solved: 0,
        dsa_medium_solved: 0,
        dsa_hard_solved: 0,
        current_streak: 0,
        max_streak: 0,
        ai_skill_score: 0,
        last_activity_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // Ignore duplicate key error
    return data;
  }

  /**
   * Get user by Firebase UID
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<Object>} User data
   */
  async getUserByFirebaseUid(firebaseUid) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        user_stats (*)
      `)
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        user_stats (*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User stats
   */
  async getUserStats(userId) {
    const { data, error } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUserProfile(userId, updates) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update user streak
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated stats
   */
  async updateUserStreak(userId) {
    const { data: stats } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!stats) return null;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = stats.last_activity_date;
    
    let currentStreak = stats.current_streak;
    let maxStreak = stats.max_streak;

    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, no change
        return stats;
      } else if (diffDays === 1) {
        // Consecutive day
        currentStreak += 1;
      } else {
        // Streak broken
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }

    const { data, error } = await supabaseAdmin
      .from('user_stats')
      .update({
        current_streak: currentStreak,
        max_streak: maxStreak,
        last_activity_date: today
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all users (admin only)
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers(filters = {}) {
    let query = supabaseAdmin
      .from('users')
      .select(`
        *,
        user_stats (*)
      `);

    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} role - New role ('guest', 'user', 'admin')
   * @returns {Promise<Object>} Updated user
   */
  async updateUserRole(userId, role) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user activity summary
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Activity summary
   */
  async getUserActivitySummary(userId) {
    // Get exam results
    const { data: examResults } = await supabaseAdmin
      .from('exam_results')
      .select('*')
      .eq('user_id', userId);

    // Get DSA submissions
    const { data: dsaSubmissions } = await supabaseAdmin
      .from('dsa_submissions')
      .select('*')
      .eq('user_id', userId);

    // Get stats
    const { data: stats } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    return {
      stats,
      totalExams: examResults?.length || 0,
      totalDsaSubmissions: dsaSubmissions?.length || 0,
      avgExamScore: examResults?.length 
        ? examResults.reduce((sum, r) => sum + r.score, 0) / examResults.length 
        : 0,
      recentActivity: {
        exams: examResults?.slice(0, 5) || [],
        dsa: dsaSubmissions?.slice(0, 5) || []
      }
    };
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  }
}

module.exports = new SupabaseUserService();
