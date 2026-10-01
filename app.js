import { makeTask } from './task.js';
import { loadTasks, saveTasks } from './storage.js';

fetch("/")
  .then(res => res.json())
  .then(data => console.log(data));


let currentFilter = 'all';


const tasks = loadTasks();
saveTasks(tasks);

function buildTaskItem(task, index) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.dataset.id = index;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.done;

  checkbox.addEventListener('change', () => {
    tasks[index].done = checkbox.checked;
    saveTasks(tasks);
    render();
  });

  const span = document.createElement('span');
  span.textContent = task.text;
  span.className = task.done ? 'task-text done' : 'task-text';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '×';
  deleteBtn.setAttribute('aria-label', 'Delete task');

  deleteBtn.addEventListener('click', () => {
    tasks.splice(index, 1);
    saveTasks(tasks);
    render();
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);

  return li;
}

function render() {
  const list = document.getElementById('task-list');
  list.textContent = '';
  let visible = tasks;
  if (currentFilter === 'active') visible = tasks.filter(t => !t.done);
  if (currentFilter === 'done')   visible = tasks.filter(t => t.done);

  visible.forEach((task, index) => {
    list.appendChild(buildTaskItem(task, tasks.indexOf(task)));
  });

  const counter = document.getElementById('task-counter');
  const remaining = tasks.filter(t => !t.done).length;
  counter.textContent =
    remaining === 1 ? '1 task left' : `${remaining} tasks left`;
}

function addTask(event) {
  event.preventDefault();

  const input = document.getElementById('task-input');
  const text = input.value.trim();

  if (text === '') return;

  tasks.push(makeTask(text));
  input.value = '';

  saveTasks(tasks);
  render();
}

const form = document.getElementById('task-form');
form.addEventListener('submit', addTask);
document.getElementById('filters').addEventListener('click', (event) => {
  const filter = event.target.dataset.filter;
  if (!filter) return;
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.filter === currentFilter);
  });
  render();
});
