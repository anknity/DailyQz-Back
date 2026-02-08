const { supabaseAdmin } = require('../config/supabase');

/**
 * Supabase Proctoring Service
 * Handles exam proctoring and violation tracking
 */

class SupabaseProctoringService {
  
  /**
   * Log a proctoring event
   * @param {Object} eventData - Event details
   * @returns {Promise<Object>} Created log entry
   */
  async logEvent(eventData) {
    const {
      userId,
      examId,
      eventType,
      eventData: data,
      violationCount
    } = eventData;

    const { data: logEntry, error } = await supabaseAdmin
      .from('proctoring_logs')
      .insert({
        user_id: userId,
        exam_id: examId,
        event_type: eventType,
        event_data: JSON.stringify(data || {}),
        violation_count: violationCount
      })
      .select()
      .single();

    if (error) throw error;

    // Check if max violations reached
    if (violationCount && violationCount >= await this.getMaxViolations(examId)) {
      await this.disqualifyUser(userId, examId);
    }

    return logEntry;
  }

  /**
   * Get proctoring logs for a user/exam
   * @param {string} userId - User ID
   * @param {string} examId - Exam ID (optional)
   * @returns {Promise<Array>} Proctoring logs
   */
  async getLogs(userId, examId = null) {
    let query = supabaseAdmin
      .from('proctoring_logs')
      .select('*')
      .eq('user_id', userId);

    if (examId) {
      query = query.eq('exam_id', examId);
    }

    query = query.order('timestamp', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return data.map(log => ({
      ...log,
      event_data: typeof log.event_data === 'string' ? JSON.parse(log.event_data) : log.event_data
    }));
  }

  /**
   * Get violation count for user in exam
   * @param {string} userId - User ID
   * @param {string} examId - Exam ID
   * @returns {Promise<number>} Violation count
   */
  async getViolationCount(userId, examId) {
    const { data, error } = await supabaseAdmin
      .from('proctoring_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .in('event_type', [
        'tab_switch',
        'window_blur',
        'fullscreen_exit',
        'face_not_detected',
        'multiple_faces',
        'screenshot_attempt',
        'copy_paste_attempt',
        'right_click_attempt'
      ]);

    if (error) throw error;
    return data?.count || 0;
  }

  /**
   * Disqualify user from exam
   * @param {string} userId - User ID
   * @param {string} examId - Exam ID
   * @returns {Promise<void>}
   */
  async disqualifyUser(userId, examId) {
    // Update exam result
    await supabaseAdmin
      .from('exam_results')
      .update({ is_disqualified: true })
      .eq('user_id', userId)
      .eq('exam_id', examId);

    // Log auto-submit event
    await this.logEvent({
      userId,
      examId,
      eventType: 'auto_submitted',
      eventData: { reason: 'Maximum violations reached' }
    });
  }

  /**
   * Get max violations allowed for exam
   * @param {string} examId - Exam ID
   * @returns {Promise<number>} Max violations
   */
  async getMaxViolations(examId) {
    const { data, error } = await supabaseAdmin
      .from('exams')
      .select('max_violations')
      .eq('id', examId)
      .single();

    if (error) return 3; // Default
    return data.max_violations || 3;
  }

  /**
   * Check if user is disqualified
   * @param {string} userId - User ID
   * @param {string} examId - Exam ID
   * @returns {Promise<boolean>} Is disqualified
   */
  async isUserDisqualified(userId, examId) {
    const { data, error } = await supabaseAdmin
      .from('exam_results')
      .select('is_disqualified')
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .single();

    if (error) return false;
    return data?.is_disqualified || false;
  }

  /**
   * Get proctoring summary for an exam
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} Proctoring summary
   */
  async getExamProctoringummary(examId) {
    const { data: logs } = await supabaseAdmin
      .from('proctoring_logs')
      .select('event_type, user_id')
      .eq('exam_id', examId);

    const summary = {
      totalEvents: logs?.length || 0,
      uniqueUsers: [...new Set(logs?.map(l => l.user_id) || [])].length,
      eventBreakdown: {}
    };

    logs?.forEach(log => {
      summary.eventBreakdown[log.event_type] = 
        (summary.eventBreakdown[log.event_type] || 0) + 1;
    });

    return summary;
  }

  /**
   * Start exam session (log exam started)
   * @param {string} userId - User ID
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} Log entry
   */
  async startExamSession(userId, examId) {
    return await this.logEvent({
      userId,
      examId,
      eventType: 'exam_started',
      eventData: { timestamp: new Date().toISOString() },
      violationCount: 0
    });
  }

  /**
   * End exam session (log exam submitted)
   * @param {string} userId - User ID
   * @param {string} examId - Exam ID
   * @param {Object} submissionData - Submission details
   * @returns {Promise<Object>} Log entry
   */
  async endExamSession(userId, examId, submissionData = {}) {
    return await this.logEvent({
      userId,
      examId,
      eventType: 'exam_submitted',
      eventData: {
        timestamp: new Date().toISOString(),
        ...submissionData
      },
      violationCount: await this.getViolationCount(userId, examId)
    });
  }

  /**
   * Issue warning to user
   * @param {string} userId - User ID
   * @param {string} examId - Exam ID
   * @param {string} reason - Warning reason
   * @returns {Promise<Object>} Log entry
   */
  async issueWarning(userId, examId, reason) {
    const violationCount = await this.getViolationCount(userId, examId);
    
    return await this.logEvent({
      userId,
      examId,
      eventType: 'warning_issued',
      eventData: { 
        reason,
        warningNumber: violationCount + 1
      },
      violationCount: violationCount + 1
    });
  }
}

module.exports = new SupabaseProctoringService();
