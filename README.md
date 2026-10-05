DoneList

DoneList is a simple task-list app where you can add tasks,

mark them as complete, delete them, and filter them by All, Active, or Done. Tasks are saved in the browser using localStorage.

How to Run

Open index.html in a browser, or use the project's preview to run the app.

What I Learned

I learned how to use JavaScript to manage an array of task objects, 
update the DOM, handle button and checkbox events,
filter tasks, and save data with localStorage.


## HTTP requests and responses

A request is what the client sends to a server. It includes a method such as GET or POST, headers with extra information, and sometimes a body containing data.

A response is what the server sends back. It includes a status code describing the result, headers with extra information, and sometimes a body containing data such as JSON.

## REST verbs (GET, POST, PUT/PATCH, DELETE)

- GET = read tasks
- POST = create a task
- PUT/PATCH = update a task
- DELETE = delete a task

Tasks are stored on the server in data/tasks.json.
The server validates incoming task data and returns a 400 JSON error when the data is invalid,
so only valid tasks are saved to tasks.json.

