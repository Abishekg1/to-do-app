let currentFilter = "all";
let tasks = [];

const authUI = document.getElementById("auth-ui");
const taskUI = document.getElementById("task-ui");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const logoutButton = document.getElementById("logout-button");
const authMessage = document.getElementById("auth-message");


async function checkAuth() {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) {
      showLoggedOut();
      return;
    }

    showLoggedIn();

    await loadTasks();
  } catch (error) {
    console.error("Authentication check failed:", error);
    showLoggedOut();
  }
}


function showLoggedOut() {
  authUI.hidden = false;
  taskUI.hidden = true;
}


function showLoggedIn() {
  authUI.hidden = true;
  taskUI.hidden = false;
}


async function loadTasks() {
  const response = await fetch("/api/tasks");

  if (response.status === 401) {
    showLoggedOut();
    return;
  }

  if (!response.ok) {
    console.error("Failed to load tasks");
    return;
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    console.error("Expected an array of tasks");
    return;
  }

  tasks = data;
  render();
}
    


function buildTaskItem(task) {
  const li = document.createElement("li");

  li.className = "task-item";
  li.dataset.id = task.id;

  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.checked = task.done;

  checkbox.addEventListener("change", async () => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        done: checkbox.checked
      })
    });

    if (!response.ok) {
      return;
    }

    await loadTasks();
  });


  const span = document.createElement("span");

  span.textContent = task.text;
  span.className = task.done
    ? "task-text done"
    : "task-text";


  const deleteBtn = document.createElement("button");

  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "×";
  deleteBtn.setAttribute(
    "aria-label",
    "Delete task"
  );


  deleteBtn.addEventListener("click", async () => {
    const response = await fetch(
      `/api/tasks/${task.id}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      return;
    }

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
    visible = tasks.filter(
      (task) => !task.done
    );
  }


  if (currentFilter === "done") {
    visible = tasks.filter(
      (task) => task.done
    );
  }


  visible.forEach((task) => {
    list.appendChild(
      buildTaskItem(task)
    );
  });


  const counter =
    document.getElementById("task-counter");

  const remaining = tasks.filter(
    (task) => !task.done
  ).length;


  counter.textContent =
    remaining === 1
      ? "1 task left"
      : `${remaining} tasks left`;
}


async function addTask(event) {
  event.preventDefault();

  const input =
    document.getElementById("task-input");

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  const response = await fetch(
    "/api/tasks",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text
      })
    }
  );


  if (!response.ok) {
    return;
  }

  input.value = "";

  await loadTasks();
}


async function login(event) {
  event.preventDefault();

  authMessage.textContent = "";

  const formData =
    new FormData(loginForm);


  const response = await fetch(
    "/api/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password")
      })
    }
  );


  if (!response.ok) {
    const data = await response.json();

    authMessage.textContent =
      data.error || "Login failed";

    return;
  }

  window.location.reload();
}


async function signup(event) {
  event.preventDefault();

  authMessage.textContent = "";

  const formData =
    new FormData(signupForm);


  const response = await fetch(
    "/api/signup",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password")
      })
    }
  );


  if (!response.ok) {
    const data = await response.json();

    authMessage.textContent =
      data.error || "Signup failed";

    return;
  }

  window.location.reload();
}


async function logout() {
  const response = await fetch(
    "/api/logout",
    {
      method: "POST"
    }
  );

  if (!response.ok) {
    return;
  }

  window.location.reload();
}


loginForm.addEventListener(
  "submit",
  login
);


signupForm.addEventListener(
  "submit",
  signup
);


logoutButton.addEventListener(
  "click",
  logout
);


const form =
  document.getElementById("task-form");

form.addEventListener(
  "submit",
  addTask
);


document
  .getElementById("filters")
  .addEventListener("click", (event) => {

    const filter =
      event.target.dataset.filter;

    if (!filter) {
      return;
    }

    currentFilter = filter;


    document
      .querySelectorAll(".filter-btn")
      .forEach((button) => {

        button.classList.toggle(
          "active",
          button.dataset.filter === currentFilter
        );
      });


    render();
  });


// IMPORTANT:
// Check authentication first.
// Do NOT call loadTasks() directly.
checkAuth();
