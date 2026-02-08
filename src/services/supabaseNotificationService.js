const { supabaseAdmin } = require('../config/supabase');

/**
 * Supabase Notification Service
 * Handles user notifications
 */

class SupabaseNotificationService {
  
  /**
   * Create a notification
   * @param {Object} notificationData - Notification details
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    const {
      userId,
      title,
      message,
      type,
      data
    } = notificationData;

    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        data: JSON.stringify(data || {}),
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    return this.parseNotification(notification);
  }

  /**
   * Create bulk notifications for multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {Object} notificationData - Notification details
   * @returns {Promise<Array>} Created notifications
   */
  async createBulkNotifications(userIds, notificationData) {
    const { title, message, type, data } = notificationData;

    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      data: JSON.stringify(data || {}),
      is_read: false
    }));

    const { data: created, error } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw error;
    return created.map(n => this.parseNotification(n));
  }

  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} User notifications
   */
  async getUserNotifications(userId, filters = {}) {
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.isRead !== undefined) {
      query = query.eq('is_read', filters.isRead);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(50);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data.map(n => this.parseNotification(n));
  }

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return this.parseNotification(data);
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of updated notifications
   */
  async markAllAsRead(userId) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    return data?.length || 0;
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId, userId) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Delete all read notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of deleted notifications
   */
  async deleteReadNotifications(userId) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('is_read', true)
      .select();

    if (error) throw error;
    return data?.length || 0;
  }

  /**
   * Send exam reminder notification
   * @param {string} userId - User ID
   * @param {Object} examData - Exam details
   * @returns {Promise<Object>} Created notification
   */
  async sendExamReminder(userId, examData) {
    return this.createNotification({
      userId,
      title: 'Exam Reminder',
      message: `Your exam "${examData.title}" starts in ${examData.timeUntil}`,
      type: 'exam_reminder',
      data: {
        examId: examData.id,
        startTime: examData.startTime
      }
    });
  }

  /**
   * Send result notification
   * @param {string} userId - User ID
   * @param {Object} resultData - Result details
   * @returns {Promise<Object>} Created notification
   */
  async sendResultNotification(userId, resultData) {
    return this.createNotification({
      userId,
      title: 'Exam Result Available',
      message: `Your result for "${resultData.examTitle}" is now available. Score: ${resultData.score}%`,
      type: 'result_available',
      data: {
        examId: resultData.examId,
        resultId: resultData.resultId,
        score: resultData.score
      }
    });
  }

  /**
   * Send achievement notification
   * @param {string} userId - User ID
   * @param {Object} achievement - Achievement details
   * @returns {Promise<Object>} Created notification
   */
  async sendAchievementNotification(userId, achievement) {
    return this.createNotification({
      userId,
      title: 'Achievement Unlocked! 🏆',
      message: `Congratulations! You've earned "${achievement.name}"`,
      type: 'achievement',
      data: {
        achievementId: achievement.id,
        achievementName: achievement.name,
        icon: achievement.icon,
        points: achievement.points
      }
    });
  }

  /**
   * Send streak notification
   * @param {string} userId - User ID
   * @param {number} streak - Current streak
   * @returns {Promise<Object>} Created notification
   */
  async sendStreakNotification(userId, streak) {
    return this.createNotification({
      userId,
      title: `${streak} Day Streak! 🔥`,
      message: `Amazing! You've maintained a ${streak}-day streak. Keep it going!`,
      type: 'streak',
      data: { streak }
    });
  }

  /**
   * Parse notification data
   * @param {Object} notification - Raw notification
   * @returns {Object} Parsed notification
   */
  parseNotification(notification) {
    if (!notification) return null;
    return {
      ...notification,
      data: typeof notification.data === 'string' 
        ? JSON.parse(notification.data) 
        : notification.data
    };
  }
}

module.exports = new SupabaseNotificationService();
