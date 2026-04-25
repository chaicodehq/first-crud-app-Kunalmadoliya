import Todo from "../models/todo.model.js";

export async function createTodo(req, res, next) {
  try {
    const { title, completed, priority, tags, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: { message: "Title is required" } });
    }

    const todo = await Todo.create({
      title,
      completed,
      priority,
      tags,
      dueDate
    });

    return res.status(201).json(todo);
  } catch (error) {
    return res.status(400).json({ error: { message: error.message } });
  }
}

export async function listTodos(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = {};

    if (req.query.completed !== undefined) {
      filter.completed = req.query.completed === "true";
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: "i" };
    }

    const total = await Todo.countDocuments(filter);

    const data = await Todo.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
}

export async function getTodo(req, res, next) {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ error: { message: "Not found" } });
    }

    return res.status(200).json(todo);
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
}

export async function updateTodo(req, res, next) {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ error: { message: "Not found" } });
    }

    return res.status(200).json(todo);
  } catch (error) {
    return res.status(400).json({ error: { message: error.message } });
  }
}

export async function toggleTodo(req, res, next) {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ error: { message: "Not found" } });
    }

    todo.completed = !todo.completed;
    await todo.save();

    return res.status(200).json(todo);
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
}

export async function deleteTodo(req, res, next) {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ error: { message: "Not found" } });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
}