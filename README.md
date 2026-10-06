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

## Environment

The server reads the `PORT` environment variable for the port it should use.

Start the server with:

```bash
npm start

Then add:

```md
## Running on a host

A host needs three things to run the server:

- Start command: `npm start`
- Port: set the `PORT` environment variable
- Local secrets: use `.env` for local secret values and do not commit them
## Feedback and what I would change next

Person 1 was unsure what the All, Active, and Done filters meant.'
I would make the filter labels more obvious.

Person 2 did not immediately notice how to delete a task.
I would make the delete control more visible and easier to understand.

## Running on a host

Start the server with:

```bash
npm start

## 8. Commit the changes

After everything works:

```bash
git add . && git commit -m "Run like production"

