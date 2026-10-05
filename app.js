let currentFilter = "all";
let tasks = [];

async function loadTasks() {
  const response = await fetch("/api/tasks");
  tasks = await response.json();
  render();
}

loadTasks();

function buildTaskItem(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;

  checkbox.addEventListener("change", async () => {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        done: checkbox.checked
      })
    });

    await loadTasks();
  });

  const span = document.createElement("span");
  span.textContent = task.text;
  span.className = task.done ? "task-text done" : "task-text";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "×";
  deleteBtn.setAttribute("aria-label", "Delete task");

  deleteBtn.addEventListener("click", async () => {
    await fetch(`/api/tasks/${task.id}`, {
      method: "DELETE"
    });

    await loadTasks();
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);

  return li;
}

function render() {
  const list = document.getElementById("task-list");
  list.textContent = "";

  let visible = tasks;

  if (currentFilter === "active") {
    visible = tasks.filter((task) => !task.done);
  }

  if (currentFilter === "done") {
    visible = tasks.filter((task) => task.done);
  }

  visible.forEach((task) => {
    list.appendChild(buildTaskItem(task));
  });

  const counter = document.getElementById("task-counter");
  const remaining = tasks.filter((task) => !task.done).length;

  counter.textContent =
    remaining === 1 ? "1 task left" : `${remaining} tasks left`;
}

async function addTask(event) {
  event.preventDefault();

  const input = document.getElementById("task-input");
  const text = input.value.trim();

  if (text === "") {
    return;
  }

  input.value = "";

  await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  await loadTasks();
}

const form = document.getElementById("task-form");
form.addEventListener("submit", addTask);

document.getElementById("filters").addEventListener("click", (event) => {
  const filter = event.target.dataset.filter;

  if (!filter) {
    return;
  }

  currentFilter = filter;

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.filter === currentFilter
    );
  });

  render();
});