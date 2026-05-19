import express from 'express';
import { protect } from '../middleware/auth.js';
import { getProjectActivities } from '../controllers/activityController.js';

const router = express.Router();

router.use(protect);
router.get('/projects/:projectId/activities', getProjectActivities);

export default router;