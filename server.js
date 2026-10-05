require("dotenv").config();
const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();

app.use(express.json());

console.log("Starting", process.env.APP_NAME);

const DATA_FILE = path.join(__dirname, "data", "tasks.json");

const wrap = (fn) => (req, res, next) =>
  fn(req, res, next).catch(next);

async function loadTasks() {
  try {
    const text = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(text);
  } catch (err) {
    return [];
  }
}

async function saveTasks(data) {
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

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
  const tasks = await loadTasks();
  res.json(tasks);
}));

app.post("/api/tasks", wrap(async (req, res, next) => {
  const trimmed = validateTaskBody(req.body);

  const tasks = await loadTasks();

  const newTask = {
    id: String(Date.now()),
    text: trimmed,
    done: false
  };

  tasks.push(newTask);
  await saveTasks(tasks);

  res.status(201).json(newTask);
}));

app.put("/api/tasks/:id", wrap(async (req, res, next) => {
  const tasks = await loadTasks();

  const task = tasks.find((item) => item.id === req.params.id);

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

  await saveTasks(tasks);

  res.json(task);
}));

app.delete("/api/tasks/:id", wrap(async (req, res) => {
  const tasks = await loadTasks();

  const filtered = tasks.filter(
    (item) => item.id !== req.params.id
  );

  await saveTasks(filtered);

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

