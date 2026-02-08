const { supabaseAdmin } = require('../config/supabase');

/**
 * Supabase Scheduled Exam Service
 * Handles scheduled/live exams and registrations
 */

class SupabaseScheduledExamService {
  
  /**
   * Create a scheduled exam
   * @param {Object} examData - Exam details
   * @returns {Promise<Object>} Created exam
   */
  async createScheduledExam(examData) {
    const {
      title,
      description,
      category,
      subject,
      difficulty,
      questionCount,
      durationMinutes,
      startTime,
      endTime,
      registrationDeadline,
      maxParticipants,
      isActive,
      isProctored,
      maxViolations,
      passingScore,
      instructions,
      questions,
      createdBy
    } = examData;

    const { data, error } = await supabaseAdmin
      .from('scheduled_exams')
      .insert({
        title,
        description,
        category,
        subject,
        difficulty: difficulty || 'medium',
        question_count: questionCount || 30,
        duration_minutes: durationMinutes || 60,
        start_time: startTime,
        end_time: endTime,
        registration_deadline: registrationDeadline,
        max_participants: maxParticipants,
        is_active: isActive !== undefined ? isActive : true,
        is_proctored: isProctored || false,
        max_violations: maxViolations || 3,
        passing_score: passingScore || 60,
        instructions,
        questions: JSON.stringify(questions || []),
        created_by: createdBy
      })
      .select()
      .single();

    if (error) throw error;
    return this.parseExam(data);
  }

  /**
   * Get all scheduled exams with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of scheduled exams
   */
  async getScheduledExams(filters = {}) {
    let query = supabaseAdmin.from('scheduled_exams').select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters.upcoming) {
      query = query.gte('start_time', new Date().toISOString());
    }
    if (filters.past) {
      query = query.lt('end_time', new Date().toISOString());
    }
    if (filters.live) {
      const now = new Date().toISOString();
      query = query.lte('start_time', now).gte('end_time', now);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('start_time', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data.map(e => this.parseExam(e));
  }

  /**
   * Get upcoming exams
   * @param {number} limit - Number of exams
   * @returns {Promise<Array>} Upcoming exams
   */
  async getUpcomingExams(limit = 10) {
    return this.getScheduledExams({
      upcoming: true,
      isActive: true,
      limit
    });
  }

  /**
   * Get live exams (currently running)
   * @returns {Promise<Array>} Live exams
   */
  async getLiveExams() {
    return this.getScheduledExams({
      live: true,
      isActive: true
    });
  }

  /**
   * Get scheduled exam by ID
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} Exam details
   */
  async getScheduledExamById(examId) {
    const { data, error } = await supabaseAdmin
      .from('scheduled_exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (error) throw error;
    return this.parseExam(data);
  }

  /**
   * Update scheduled exam
   * @param {string} examId - Exam ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated exam
   */
  async updateScheduledExam(examId, updates) {
    const updateData = { ...updates };
    
    if (updates.questions) {
      updateData.questions = JSON.stringify(updates.questions);
    }

    const { data, error } = await supabaseAdmin
      .from('scheduled_exams')
      .update(updateData)
      .eq('id', examId)
      .select()
      .single();

    if (error) throw error;
    return this.parseExam(data);
  }

  /**
   * Register user for exam
   * @param {string} userId - User ID
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} Registration record
   */
  async registerForExam(userId, examId) {
    // Check exam exists and registration is open
    const exam = await this.getScheduledExamById(examId);
    
    if (!exam.is_active) {
      throw new Error('Exam is not active');
    }

    if (exam.registration_deadline && new Date() > new Date(exam.registration_deadline)) {
      throw new Error('Registration deadline has passed');
    }

    // Check max participants
    if (exam.max_participants) {
      const count = await this.getRegistrationCount(examId);
      if (count >= exam.max_participants) {
        throw new Error('Exam is full');
      }
    }

    const { data, error } = await supabaseAdmin
      .from('scheduled_exam_registrations')
      .insert({
        user_id: userId,
        exam_id: examId,
        status: 'registered'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Already registered for this exam');
      }
      throw error;
    }
    return data;
  }

  /**
   * Get user's registrations
   * @param {string} userId - User ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} User's registrations
   */
  async getUserRegistrations(userId, filters = {}) {
    let query = supabaseAdmin
      .from('scheduled_exam_registrations')
      .select(`
        *,
        scheduled_exams (*)
      `)
      .eq('user_id', userId);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('registered_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data.map(r => ({
      ...r,
      scheduled_exams: this.parseExam(r.scheduled_exams)
    }));
  }

  /**
   * Check if user is registered for exam
   * @param {string} userId - User ID
   * @param {string} examId - Exam ID
   * @returns {Promise<Object|null>} Registration record or null
   */
  async checkRegistration(userId, examId) {
    const { data, error } = await supabaseAdmin
      .from('scheduled_exam_registrations')
      .select('*')
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Update registration status
   * @param {string} userId - User ID
   * @param {string} examId - Exam ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated registration
   */
  async updateRegistrationStatus(userId, examId, status) {
    const { data, error } = await supabaseAdmin
      .from('scheduled_exam_registrations')
      .update({ status })
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get registration count for exam
   * @param {string} examId - Exam ID
   * @returns {Promise<number>} Registration count
   */
  async getRegistrationCount(examId) {
    const { count, error } = await supabaseAdmin
      .from('scheduled_exam_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('exam_id', examId);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Get registered users for exam
   * @param {string} examId - Exam ID
   * @returns {Promise<Array>} Registered users
   */
  async getExamRegistrations(examId) {
    const { data, error } = await supabaseAdmin
      .from('scheduled_exam_registrations')
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
      .order('registered_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Cancel registration
   * @param {string} userId - User ID
   * @param {string} examId - Exam ID
   * @returns {Promise<void>}
   */
  async cancelRegistration(userId, examId) {
    const { error } = await supabaseAdmin
      .from('scheduled_exam_registrations')
      .delete()
      .eq('user_id', userId)
      .eq('exam_id', examId);

    if (error) throw error;
  }

  /**
   * Delete scheduled exam
   * @param {string} examId - Exam ID
   * @returns {Promise<void>}
   */
  async deleteScheduledExam(examId) {
    const { error } = await supabaseAdmin
      .from('scheduled_exams')
      .delete()
      .eq('id', examId);

    if (error) throw error;
  }

  /**
   * Parse exam data
   * @param {Object} exam - Raw exam data
   * @returns {Object} Parsed exam
   */
  parseExam(exam) {
    if (!exam) return null;
    return {
      ...exam,
      questions: typeof exam.questions === 'string' 
        ? JSON.parse(exam.questions) 
        : exam.questions
    };
  }
}

module.exports = new SupabaseScheduledExamService();
