const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// GET toutes les tâches d'un projet
router.get("/projects/:id/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id }).populate(
      "assignedTo",
      "name email",
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST créer une tâche
router.post("/tasks", async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      status: req.body.status,
      dueDate: req.body.dueDate,
      project: req.body.project,
      assignedTo: req.body.assignedTo,
    });
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT modifier une tâche
router.put("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE supprimer une tâche
router.delete("/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Tâche supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH mettre à jour le statut uniquement
router.patch("/tasks/:id/status", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true },
    );
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// GET membres d'un projet pour le dropdown
router.get("/projects/:id/members", async (req, res) => {
  try {
    const Project = require("../models/Project");
    const project = await Project.findById(req.params.id).populate(
      "members",
      "name email",
    );
    res.json(project.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
