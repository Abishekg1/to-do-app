require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Task = require("./models/Task");

const app = express();

console.log("Starting", process.env.APP_NAME);

const PORT = process.env.PORT || 3000;

app.use(express.json());

const wrap = (fn) => (req, res, next) =>
  fn(req, res, next).catch(next);

function validateTaskBody(body) {
  if (!body || typeof body.text !== "string") {
    const err = new Error("Text is required");
    err.status = 400;
    throw err;
  }

  const trimmed = body.text.trim();

  if (trimmed === "") {
    const err = new Error("Text is required");
    err.status = 400;
    throw err;
  }

  return trimmed;
}

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from DoneList" });
});

app.get("/api/tasks", wrap(async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
}));

app.post("/api/tasks", wrap(async (req, res) => {
  const trimmed = validateTaskBody(req.body);

  const task = new Task({
    text: trimmed
  });

  await task.save();

  res.status(201).json(task);
}));

app.put("/api/tasks/:id", wrap(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    const err = new Error("Task not found");
    err.status = 404;
    return next(err);
  }

  if (req.body.text !== undefined) {
    const trimmed = String(req.body.text).trim();

    if (trimmed === "") {
      const err = new Error("Text is required");
      err.status = 400;
      return next(err);
    }

    task.text = trimmed;
  }

  if (req.body.done !== undefined) {
    if (typeof req.body.done !== "boolean") {
      const err = new Error("Done must be a boolean");
      err.status = 400;
      return next(err);
    }

    task.done = req.body.done;
  }

  await task.save();

  res.json(task);
}));

app.delete("/api/tasks/:id", wrap(async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);

  res.json({ ok: true });
}));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "." });
});

app.get("/styles.css", (req, res) => {
  res.sendFile("styles.css", { root: "." });
});

app.get("/app.js", (req, res) => {
  res.sendFile("app.js", { root: "." });
});

app.get("/task.js", (req, res) => {
  res.sendFile("task.js", { root: "." });
});

app.get("/storage.js", (req, res) => {
  res.sendFile("storage.js", { root: "." });
});

app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });
