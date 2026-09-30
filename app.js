const greeting = "Hello from DoneList!";
console.log(greeting);
const tasks=[];
function makeTask(text){
    return{
        text:text,
        done:false
    };
}
function buildTaskItem(task) {
  const li = document.createElement('li');
  li.className = 'task-item';

  const span = document.createElement('span');
  span.textContent = task.text;

  li.appendChild(span);

  return li;
}

function render() {
  const list = document.getElementById('task-list');
  list.textContent = '';

  tasks.forEach((task) => {
    list.appendChild(buildTaskItem(task));
  });
}


function addTask(event) {
  event.preventDefault();

  const input = document.getElementById('task-input');
  const text = input.value.trim();

  if (text === '') return;

  tasks.push(makeTask(text));
  input.value = '';
  render();
}

const form = document.getElementById('task-form');
form.addEventListener('submit', addTask);

form.addEventListener('submit', addTask);
render();
