import Activity from '../models/Activity.js';

export const getProjectActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.projectId })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};