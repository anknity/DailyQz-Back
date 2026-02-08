const { supabaseAdmin } = require('../config/supabase');

/**
 * Supabase Daily Challenge Service
 * Handles daily challenges and user daily progress
 */

class SupabaseDailyChallengeService {
  
  /**
   * Create a daily challenge
   * @param {Object} challengeData - Challenge details
   * @returns {Promise<Object>} Created challenge
   */
  async createChallenge(challengeData) {
    const {
      challengeDate,
      title,
      description,
      category,
      subject,
      difficulty,
      questionCount,
      questions,
      isActive
    } = challengeData;

    const { data, error } = await supabaseAdmin
      .from('daily_challenges')
      .insert({
        challenge_date: challengeDate || new Date().toISOString().split('T')[0],
        title,
        description,
        category,
        subject,
        difficulty: difficulty || 'mixed',
        question_count: questionCount || 10,
        questions: JSON.stringify(questions || []),
        is_active: isActive !== undefined ? isActive : true
      })
      .select()
      .single();

    if (error) throw error;
    return this.parseChallenge(data);
  }

  /**
   * Get today's challenge
   * @returns {Promise<Object>} Today's challenge
   */
  async getTodaysChallenge() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabaseAdmin
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', today)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.parseChallenge(data) : null;
  }

  /**
   * Get challenge by date
   * @param {string} date - Date string (YYYY-MM-DD)
   * @returns {Promise<Object>} Challenge for that date
   */
  async getChallengeByDate(date) {
    const { data, error } = await supabaseAdmin
      .from('daily_challenges')
      .select('*')
      .eq('challenge_date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.parseChallenge(data) : null;
  }

  /**
   * Get all challenges with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of challenges
   */
  async getChallenges(filters = {}) {
    let query = supabaseAdmin.from('daily_challenges').select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters.startDate) {
      query = query.gte('challenge_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('challenge_date', filters.endDate);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('challenge_date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data.map(c => this.parseChallenge(c));
  }

  /**
   * Get user's daily progress
   * @param {string} userId - User ID
   * @param {string} date - Date (optional, defaults to today)
   * @returns {Promise<Object>} User's progress
   */
  async getUserProgress(userId, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabaseAdmin
      .from('user_daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_date', targetDate)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Update user's daily progress
   * @param {Object} progressData - Progress data
   * @returns {Promise<Object>} Updated progress
   */
  async updateUserProgress(progressData) {
    const {
      userId,
      challengeDate,
      questionsAttempted,
      questionsCorrect,
      score,
      timeSpentSeconds,
      completed
    } = progressData;

    const date = challengeDate || new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('user_daily_progress')
      .upsert({
        user_id: userId,
        challenge_date: date,
        questions_attempted: questionsAttempted,
        questions_correct: questionsCorrect,
        score,
        time_spent_seconds: timeSpentSeconds,
        completed: completed || false,
        completed_at: completed ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,challenge_date'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user's streak info
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Streak information
   */
  async getUserStreak(userId) {
    const { data, error } = await supabaseAdmin
      .from('user_daily_progress')
      .select('challenge_date, completed')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('challenge_date', { ascending: false })
      .limit(365);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { currentStreak: 0, maxStreak: 0, totalDays: 0 };
    }

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < data.length; i++) {
      const challengeDate = new Date(data[i].challenge_date);
      challengeDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (challengeDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate max streak
    let maxStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < data.length; i++) {
      const prevDate = new Date(data[i - 1].challenge_date);
      const currDate = new Date(data[i].challenge_date);
      const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak, currentStreak);

    return {
      currentStreak,
      maxStreak,
      totalDays: data.length
    };
  }

  /**
   * Get leaderboard for daily challenges
   * @param {string} date - Date (optional)
   * @param {number} limit - Number of entries
   * @returns {Promise<Array>} Leaderboard
   */
  async getDailyLeaderboard(date = null, limit = 100) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('user_daily_progress')
      .select(`
        *,
        users (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .eq('challenge_date', targetDate)
      .eq('completed', true)
      .order('score', { ascending: false })
      .order('time_spent_seconds', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }

  /**
   * Parse challenge data
   * @param {Object} challenge - Raw challenge data
   * @returns {Object} Parsed challenge
   */
  parseChallenge(challenge) {
    if (!challenge) return null;
    return {
      ...challenge,
      questions: typeof challenge.questions === 'string' 
        ? JSON.parse(challenge.questions) 
        : challenge.questions
    };
  }
}

module.exports = new SupabaseDailyChallengeService();
