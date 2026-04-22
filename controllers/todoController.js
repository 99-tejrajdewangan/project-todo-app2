const Todo = require("../models/Todo");
const Project = require("../models/Project");

// @desc    Get all todos for a project
// @route   GET /api/todos/project/:projectId
exports.getProjectTodos = async (req, res) => {
  try {
    const todos = await Todo.find({
      project: req.params.projectId,
      user: req.user.id,
    }).sort("-createdAt");
    res.json({ success: true, data: todos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create todo
// @route   POST /api/todos
exports.createTodo = async (req, res) => {
  try {
    const { project, ...todoData } = req.body;

    // Verify project belongs to user
    const projectExists = await Project.findOne({
      _id: project,
      user: req.user.id,
    });
    if (!projectExists) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // DEBUG: Log incoming data
    console.log("CreateTodo - req.body:", req.body);
    console.log("Extracted todoData:", todoData);
    console.log("Final todo payload:", {
      ...todoData,
      project,
      user: req.user.id,
    });

    // Let Mongoose schema handle validation (title required, trim: true)
    const todo = await Todo.create({
      ...todoData,
      project,
      user: req.user.id,
    });

    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
exports.updateTodo = async (req, res) => {
  try {
    let todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    }

    todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    }

    await todo.deleteOne();
    res.json({ success: true, message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle todo completion
// @route   PUT /api/todos/:id/toggle
exports.toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
