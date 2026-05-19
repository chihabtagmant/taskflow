import Notification from '../models/Notification.js';

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('project', 'title')
      .populate('relatedTask', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to create notification (we'll call this from other controllers)
export const createNotification = async (userId, projectId, title, message, type, relatedTask = null) => {
  try {
    await Notification.create({
      user: userId,
      project: projectId,
      title,
      message,
      type,
      relatedTask
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};