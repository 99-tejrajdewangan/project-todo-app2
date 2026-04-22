const Project = require("../models/Project");
const Todo = require("../models/Todo");

// @desc    Get all projects for user
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort(
      "-createdAt",
    );
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const todos = await Todo.find({
      project: req.params.id,
      user: req.user.id,
    }).sort("-createdAt");

    res.json({ success: true, data: { project, todos } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create project
// @route   POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body || {};

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Project name required" });
    }

    const project = await Project.create({
      name,
      description: description || "",
      color: color || "#3B82F6",
      user: req.user.id,
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    console.error("Create project error:", err);
    console.error("Request body was:", req.body);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    await Todo.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};