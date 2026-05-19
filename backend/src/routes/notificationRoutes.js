import express from 'express';
import { protect } from '../middleware/auth.js';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markAsRead);

export default router;