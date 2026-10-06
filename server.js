require("dotenv").config();

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./models/User");

const express = require("express");
const mongoose = require("mongoose");
const Task = require("./models/Task");
const bcrypt = require("bcrypt");

const app = express();

console.log("Starting", process.env.APP_NAME);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

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

// Authentication middleware
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.session;

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }
}

// Hello
app.get("/api/hello", (req, res) => {
  res.json({
    message: "Hello from DoneList"
  });
});

// Get current user's tasks
app.get(
  "/api/tasks",
  requireAuth,
  wrap(async (req, res) => {
    const tasks = await Task.find({
      owner: req.user._id
    });

    res.json(tasks);
  })
);

// Create task
app.post(
  "/api/tasks",
  requireAuth,
  wrap(async (req, res) => {
    const trimmed = validateTaskBody(req.body);

    const task = new Task({
      text: trimmed,
      owner: req.user._id
    });

    await task.save();

    res.status(201).json(task);
  })
);

// Signup
app.post(
  "/api/signup",
  wrap(async (req, res) => {
    const { email, password } = req.body;

    const user = new User({
      email,
      password
    });

    try {
      await user.save();
    } catch (err) {
      if (err.code === 11000) {
        err.status = 409;
        err.message = "Email already exists";
      }

      throw err;
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET
    );

    res.cookie("session", token, {
      httpOnly: true
    });

    res.status(201).json({
      id: user.id,
      email: user.email
    });
  })
);

// Login
app.post(
  "/api/login",
  wrap(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
      email
    });

    if (!user) {
      const err = new Error(
        "Invalid email or password"
      );
      err.status = 401;
      throw err;
    }

    const ok = await bcrypt.compare(
      password,
      user.password
    );

    if (!ok) {
      const err = new Error(
        "Invalid email or password"
      );
      err.status = 401;
      throw err;
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET
    );

    res.cookie("session", token, {
      httpOnly: true
    });

    res.json({
      id: user.id,
      email: user.email
    });
  })
);

// Current logged-in user
app.get(
  "/api/me",
  requireAuth,
  (req, res) => {
    res.json({
      id: req.user.id,
      email: req.user.email
    });
  }
);

// Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("session");
  res.status(204).end();
});

// Update task
app.put(
  "/api/tasks/:id",
  requireAuth,
  wrap(async (req, res, next) => {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      const err = new Error("Task not found");
      err.status = 404;
      return next(err);
    }

    if (req.body.text !== undefined) {
      const trimmed = String(
        req.body.text
      ).trim();

      if (trimmed === "") {
        const err = new Error(
          "Text is required"
        );
        err.status = 400;
        return next(err);
      }

      task.text = trimmed;
    }

    if (req.body.done !== undefined) {
      if (
        typeof req.body.done !== "boolean"
      ) {
        const err = new Error(
          "Done must be a boolean"
        );
        err.status = 400;
        return next(err);
      }

      task.done = req.body.done;
    }

    await task.save();

    res.json(task);
  })
);

// Delete task
app.delete(
  "/api/tasks/:id",
  requireAuth,
  wrap(async (req, res, next) => {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!deletedTask) {
      const err = new Error("Task not found");
      err.status = 404;
      return next(err);
    }

    res.json({
      ok: true
    });
  })
);

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile("index.html", {
    root: "."
  });
});

// Serve CSS
app.get("/styles.css", (req, res) => {
  res.sendFile("styles.css", {
    root: "."
  });
});

// Serve app.js
app.get("/app.js", (req, res) => {
  res.sendFile("app.js", {
    root: "."
  });
});

// Serve task.js
app.get("/task.js", (req, res) => {
  res.sendFile("task.js", {
    root: "."
  });
});

// Serve storage.js
app.get("/storage.js", (req, res) => {
  res.sendFile("storage.js", {
    root: "."
  });
});

// 404 handler
app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(
      "MongoDB connection failed:",
      err
    );
  });
