import Task from '../models/Task.js';
import Project from '../models/Project.js';
import logActivity from '../utils/logActivity.js';
import Notification from '../models/Notification.js';

// Get tasks with filtering and pagination
export const getFilteredTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, search, page = 1, limit = 10 } = req.query;
    const projectId = req.params.projectId;
    const query = { project: projectId };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tasks = await Task.find(query)
      .populate('assignedTo', 'fullName email')
      .sort({ priority: -1, dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Task.countDocuments(query);
    res.json({
      data: tasks,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create task
export const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      project: req.params.projectId
    });

    // ← LOG ACTIVITY
    await logActivity({
      actionType: 'task_created',
      projectId: req.params.projectId,
      userId: req.user.id,
      details: { taskTitle: task.title }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('assignedTo', 'fullName email');

    // ← LOG ACTIVITY
    await logActivity({
      actionType: 'status_changed',
      projectId: task.project,
      userId: req.user.id,
      details: { taskTitle: task.title, newStatus: status }
    });

    // ← NOTIFY assignee if task has one
    if (task.assignedTo) {
      await Notification.create({
        recipient: task.assignedTo._id,
        message: `Le statut de la tâche "${task.title}" a changé à: ${status}`,
        project: task.project
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign task to user
export const assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { assignedTo }, { new: true })
      .populate('assignedTo', 'fullName email');

    // ← LOG ACTIVITY
    await logActivity({
      actionType: 'task_created',
      projectId: task.project,
      userId: req.user.id,
      details: { taskTitle: task.title, assignedTo }
    });

    // ← NOTIFY the assigned user
    if (assignedTo) {
      await Notification.create({
        recipient: assignedTo,
        message: `Vous avez été assigné à la tâche: "${task.title}"`,
        project: task.project
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get project members
export const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('members', 'fullName email')
      .populate('owner', 'fullName email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const members = [project.owner, ...project.members];
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    // ← LOG ACTIVITY before deleting
    await logActivity({
      actionType: 'task_deleted',
      projectId: task.project,
      userId: req.user.id,
      details: { taskTitle: task.title }
    });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};