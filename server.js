require("dotenv").config();
const express = require("express");

const app = express();

console.log("Starting", process.env.APP_NAME);

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from DoneList" });
});

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
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
