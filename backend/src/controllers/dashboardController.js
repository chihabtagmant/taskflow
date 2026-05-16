import Project from '../models/Project.js';
import Task from '../models/Task.js';

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Number of active projects
    const activeProjects = await Project.countDocuments({
      $or: [{ owner: userId }, { members: userId }],
      status: 'actif'
    });

    // Tasks assigned to the user
    const assignedTasks = await Task.countDocuments({ assignedTo: userId });

    // Completed tasks
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'terminé'
    });

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'terminé' }
    });

    // Recent tasks in progress (sorted by priority then due date)
    const inProgressTasks = await Task.find({
      assignedTo: userId,
      status: 'en cours'
    })
    .populate('project', 'title')
    .sort({ priority: -1, dueDate: 1 })
    .limit(5);

    res.json({
      activeProjects,
      assignedTasks,
      completedTasks,
      overdueTasks,
      inProgressTasks
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};