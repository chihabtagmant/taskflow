import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getFilteredTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  assignTask,
  getProjectMembers
} from '../controllers/taskController.js';

const router = express.Router();

router.use(protect);

// Task routes
router.get('/projects/:projectId/tasks', getFilteredTasks);
router.post('/projects/:projectId/tasks', createTask);

router.patch('/tasks/:id/status', updateTaskStatus);
router.patch('/tasks/:id/assign', assignTask);

router.get('/projects/:projectId/members', getProjectMembers);

router.route('/tasks/:id')
  .delete(deleteTask);

export default router;