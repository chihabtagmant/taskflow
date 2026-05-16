import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  inviteMember,      // new
  removeMember       // new
} from '../controllers/projectController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createProject)
  .get(getProjects);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

// New routes for members
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);

export default router;