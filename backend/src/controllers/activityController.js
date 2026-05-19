import Activity from '../models/Activity.js';

// Get activities for a project
export const getProjectActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.projectId })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to log activity (we'll use it from other controllers)
export const logActivity = async (projectId, userId, action, description, entityId = null) => {
  try {
    await Activity.create({
      project: projectId,
      user: userId,
      action,
      description,
      entityId
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};