import Project from '../models/Project.js';

// @desc    Create new project
export const createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      owner: req.user.id,
      members: [req.user.id]
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects (paginated)
export const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const projects = await Project.find({ 
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    })
    .populate('owner', 'fullName email')
    .populate('members', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Project.countDocuments({
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    });

    res.json({
      data: projects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'fullName email')
      .populate('members', 'fullName email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check permission
    if (!project.owner.equals(req.user.id) && !project.members.some(m => m.equals(req.user.id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.owner.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only owner can update project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('owner', 'fullName email');

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.owner.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Invite member by email
export const inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only owner can invite
    if (!project.owner.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only the project owner can invite members' });
    }

    const userToInvite = await User.findOne({ email: email.toLowerCase() });
    if (!userToInvite) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Prevent duplicate
    if (project.members.includes(userToInvite._id) || project.owner.equals(userToInvite._id)) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push(userToInvite._id);
    await project.save();

    res.json({ 
      message: `${userToInvite.fullName} has been added to the project`,
      project 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove member
export const removeMember = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userIdToRemove = req.params.userId;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.owner.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only the project owner can remove members' });
    }

    project.members = project.members.filter(id => !id.equals(userIdToRemove));
    await project.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};