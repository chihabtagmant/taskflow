const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// GET toutes les tâches d'un projet avec filtrage, recherche et pagination
router.get("/projects/:id/tasks", async (req, res) => {
  try {
    // on commence avec le projet obligatoire
    const filtre = { project: req.params.id };

    // filtre par statut si présent
    if (req.query.status) filtre.status = req.query.status;

    // filtre par priorité si présent
    if (req.query.priority) filtre.priority = req.query.priority;

    // filtre par membre assigné si présent
    if (req.query.assignedTo) filtre.assignedTo = req.query.assignedTo;

    // recherche par mot-clé dans title ou description
    if (req.query.search) {
      filtre.$or = [
        { title:       { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } }
      ];
    }

    // pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip  = (page - 1) * limit;

    const total      = await Task.countDocuments(filtre);
    const tasks      = await Task.find(filtre)
                                 .populate("assignedTo", "fullName email")
                                 .skip(skip)
                                 .limit(limit);
    const totalPages = Math.ceil(total / limit);

    // le PDF oblige de renvoyer exactement ça
    res.json({ data: tasks, total, page, totalPages });

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

module.exports = router;
