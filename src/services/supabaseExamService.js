const { supabaseAdmin } = require('../config/supabase');

/**
 * Supabase Exam Service
 * Handles all exam-related database operations
 */

class SupabaseExamService {
  
  /**
   * Create a new exam
   * @param {Object} examData - Exam details
   * @returns {Promise<Object>} Created exam
   */
  async createExam(examData) {
    const {
      title,
      description,
      category, // 'competitive', 'government', 'custom', 'weekly'
      subject,
      difficulty,
      questionCount,
      durationMinutes,
      passingScore,
      startTime,
      endTime,
      isActive,
      isProctored,
      maxViolations,
      createdBy
    } = examData;

    const { data, error } = await supabaseAdmin
      .from('exams')
      .insert({
        title,
        description,
        category,
        subject,
        difficulty,
        question_count: questionCount || 0,
        duration_minutes: durationMinutes || 30,
        passing_score: passingScore || 60,
        start_time: startTime,
        end_time: endTime,
        is_active: isActive !== undefined ? isActive : true,
        is_proctored: isProctored || false,
        max_violations: maxViolations || 3,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Add questions to an exam
   * @param {string} examId - Exam ID
   * @param {Array} questions - Array of question objects
   * @returns {Promise<Array>} Inserted questions
   */
  async addQuestionsToExam(examId, questions) {
    const formattedQuestions = questions.map((q, index) => ({
      exam_id: examId,
      question_text: q.questionText || q.question,
      options: JSON.stringify(q.options),
      correct_answer: q.correctAnswer,
      difficulty: q.difficulty || 'medium',
      subject: q.subject,
      explanation: q.explanation,
      order_index: index
    }));

    const { data, error } = await supabaseAdmin
      .from('exam_questions')
      .insert(formattedQuestions)
      .select();

    if (error) throw error;

    // Update exam question count
    await supabaseAdmin
      .from('exams')
      .update({ question_count: questions.length })
      .eq('id', examId);

    return data;
  }

  /**
   * Get all exams with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of exams
   */
  async getExams(filters = {}) {
    let query = supabaseAdmin.from('exams').select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Get exam by ID
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} Exam details
   */
  async getExamById(examId) {
    const { data, error } = await supabaseAdmin
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get questions for an exam
   * @param {string} examId - Exam ID
   * @returns {Promise<Array>} Exam questions
   */
  async getExamQuestions(examId) {
    const { data, error } = await supabaseAdmin
      .from('exam_questions')
      .select('*')
      .eq('exam_id', examId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    
    // Parse options JSON
    return data.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
  }

  /**
   * Submit exam result
   * @param {Object} resultData - Exam result details
   * @returns {Promise<Object>} Created result
   */
  async submitExamResult(resultData) {
    const {
      userId,
      examId,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unanswered,
      accuracy,
      timeTakenSeconds,
      answers,
      timePerQuestion,
      violationCount,
      isDisqualified,
      startedAt
    } = resultData;

    const { data, error } = await supabaseAdmin
      .from('exam_results')
      .insert({
        user_id: userId,
        exam_id: examId,
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        wrong_answers: wrongAnswers || 0,
        unanswered: unanswered || 0,
        accuracy,
        time_taken_seconds: timeTakenSeconds,
        answers: JSON.stringify(answers),
        time_per_question: JSON.stringify(timePerQuestion),
        violation_count: violationCount || 0,
        is_disqualified: isDisqualified || false,
        started_at: startedAt
      })
      .select()
      .single();

    if (error) {
      // If duplicate, update existing
      if (error.code === '23505') {
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('exam_results')
          .update({
            score,
            correct_answers: correctAnswers,
            wrong_answers: wrongAnswers,
            unanswered: unanswered,
            accuracy,
            time_taken_seconds: timeTakenSeconds,
            answers: JSON.stringify(answers),
            time_per_question: JSON.stringify(timePerQuestion),
            violation_count: violationCount,
            is_disqualified: isDisqualified,
            submitted_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('exam_id', examId)
          .select()
          .single();

        if (updateError) throw updateError;
        return updateData;
      }
      throw error;
    }

    // Update user stats
    await this.updateUserExamStats(userId);

    return data;
  }

  /**
   * Get exam results for a user
   * @param {string} userId - User ID
   * @param {string} examId - Optional exam ID
   * @returns {Promise<Array>} User's exam results
   */
  async getUserExamResults(userId, examId = null) {
    let query = supabaseAdmin
      .from('exam_results')
      .select(`
        *,
        exams (
          title,
          category,
          subject,
          difficulty
        )
      `)
      .eq('user_id', userId);

    if (examId) {
      query = query.eq('exam_id', examId);
    }

    query = query.order('submitted_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Update user exam statistics
   * @param {string} userId - User ID
   */
  async updateUserExamStats(userId) {
    // Get total exams taken
    const { count } = await supabaseAdmin
      .from('exam_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    await supabaseAdmin
      .from('user_stats')
      .upsert({
        user_id: userId,
        total_exams_taken: count,
        last_activity_date: new Date().toISOString().split('T')[0]
      });
  }

  /**
   * Update exam
   * @param {string} examId - Exam ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated exam
   */
  async updateExam(examId, updates) {
    const { data, error } = await supabaseAdmin
      .from('exams')
      .update(updates)
      .eq('id', examId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete exam
   * @param {string} examId - Exam ID
   * @returns {Promise<void>}
   */
  async deleteExam(examId) {
    const { error } = await supabaseAdmin
      .from('exams')
      .delete()
      .eq('id', examId);

    if (error) throw error;
  }

  /**
   * Get exam leaderboard
   * @param {string} examId - Exam ID
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} Top performers
   */
  async getExamLeaderboard(examId, limit = 100) {
    const { data, error } = await supabaseAdmin
      .from('exam_results')
      .select(`
        *,
        users (
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
    return data;
  }
}

module.exports = new SupabaseExamService();
