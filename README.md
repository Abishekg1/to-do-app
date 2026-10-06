DoneList

A full-stack to-do app. Sign up, log in, add tasks, check them off, and filter them.
Tasks are private to each user and persist through server restarts.

Live demo

[Add your live app URL here]

Stack

Front end: Plain HTML, CSS, and JavaScript

Back end: Node.js and Express

Database: MongoDB with Mongoose

Authentication: bcrypt for password hashing, JWT in an httpOnly cookie, and cookie-parser

Logging: Morgan

Configuration: dotenv

Running on a host

Start the application with:

npm start


The server uses these environment variables:

PORT — the port the server listens on

MONGODB_URI — the MongoDB connection string

JWT_SECRET — the secret used to sign authentication tokens

The app is available at the server's own URL.

How DoneList stores data

DoneList started with localStorage, which saved tasks directly in the user's browser. That was simple, but the data disappeared when the user cleared browser storage and could not be shared between devices.

The next step was a JSON file on the server. This created a single source of truth for a Node process and moved the data outside the browser, but the data could be lost during a redeploy and the file becomes slower and harder to manage as the application grows.

DoneList now uses MongoDB for real persistence. Tasks have a defined structure, can be queried by owner, and remain available after the server restarts.

Each step was necessary because without it, users would lose their tasks when browser storage was cleared, when the server was redeployed, or when the application needed to support persistent per-user data.

Technical choices and trade-offs

Express for the HTTP layer: Express is small, well-known, and straightforward to host. The trade-off is that more application structure and security decisions have to be handled by the developer.

Mongoose on top of MongoDB: Mongoose provides schemas and a clean find/save API instead of requiring raw database queries. The trade-off is an additional abstraction that developers need to understand alongside MongoDB itself.

JWT in an httpOnly cookie for sessions: The application does not need a server-side session table because the cookie carries the user's signed ID. The trade-off is that logging out before a token expires requires an additional strategy such as token revocation or a deny list if the application grows.

User-owned tasks: Every Task carries an owner field set to req.user._id, so database reads, updates, and deletes can be restricted to the logged-in user. The trade-off is that every task operation must enforce ownership correctly, adding some authorization logic to the API.

DoneList -- portfolio note

DoneList is a full-stack task manager that lets people capture tasks, check them off, see what remains, and keep their task list private. It uses Node.js and Express on the server, Mongoose with MongoDB for persistence, JWT in an httpOnly cookie for authentication, and plain HTML, CSS, and JavaScript on the front end. The application includes signup, login, and per-user task ownership so each user only sees and manages their own tasks. The next feature I would add is due dates and reminders so users can turn their task list into a more useful planning tool.

API overview

POST /api/signup — create an account

POST /api/login — log in

POST /api/logout — clear the session

GET /api/me — get the current user

GET /api/tasks — list the logged-in user's tasks

POST /api/tasks — create a task

PUT /api/tasks/:id — update one of the user's tasks

DELETE /api/tasks/:id — delete one of the user's tasks