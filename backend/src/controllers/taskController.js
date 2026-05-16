import Task from '../models/Task.js';
import Project from '../models/Project.js';

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
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};