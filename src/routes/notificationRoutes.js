const express = require('express');
const router = express.Router();
const supabaseNotificationService = require('../services/supabaseNotificationService');
const { verifyToken } = require('../middleware/auth');

/**
 * @route GET /api/v2/notifications
 * @desc Get user's notifications
 * @access Private
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const filters = {
      type: req.query.type,
      isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const notifications = await supabaseNotificationService.getUserNotifications(userId, filters);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v2/notifications/unread-count
 * @desc Get unread notification count
 * @access Private
 */
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const count = await supabaseNotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/v2/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const notificationId = req.params.id;

    const notification = await supabaseNotificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/v2/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const count = await supabaseNotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: `${count} notifications marked as read`,
      data: { count }
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/v2/notifications/:id
 * @desc Delete a notification
 * @access Private
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const notificationId = req.params.id;

    await supabaseNotificationService.deleteNotification(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/v2/notifications/read
 * @desc Delete all read notifications
 * @access Private
 */
router.delete('/read/all', verifyToken, async (req, res) => {
  try {
    const userId = req.user.supabaseUserId;
    const count = await supabaseNotificationService.deleteReadNotifications(userId);

    res.json({
      success: true,
      message: `${count} read notifications deleted`,
      data: { count }
    });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete read notifications',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v2/notifications (Admin only)
 * @desc Create a notification for a user
 * @access Admin
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { userId, title, message, type, data } = req.body;

    const notification = await supabaseNotificationService.createNotification({
      userId,
      title,
      message,
      type,
      data
    });

    res.status(201).json({
      success: true,
      message: 'Notification created',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v2/notifications/bulk (Admin only)
 * @desc Create notifications for multiple users
 * @access Admin
 */
router.post('/bulk', verifyToken, async (req, res) => {
  try {
    const { userIds, title, message, type, data } = req.body;

    const notifications = await supabaseNotificationService.createBulkNotifications(
      userIds,
      { title, message, type, data }
    );

    res.status(201).json({
      success: true,
      message: `${notifications.length} notifications created`,
      data: { count: notifications.length }
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk notifications',
      error: error.message
    });
  }
});

module.exports = router;
