import Task from "../models/Task.js";
import Project from "../models/Project.js";
// Get all tasks for a project
export const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignedTo", "fullName email")
      .sort({ priority: -1, dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Create task
export const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      project: req.params.projectId,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignedTo", "fullName email");
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update only status (PATCH)
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate("assignedTo", "fullName email");

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete task
export const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
