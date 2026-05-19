import express from 'express';
import Activity from '../models/Activity.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// GET /api/projects/:id/activities
router.get('/projects/:id/activities', protect, async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;