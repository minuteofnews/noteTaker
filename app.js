//here we put all the express code to create the http server
//express5 has async error handling, allows writing code with async await, that could cause an error
//and we'd be able to handle that error in a single location, makes the code a little easier to write, read, and run
//using the express documentation, you can actually use the code they provide and place into your code

//we also installed nodemon for this app, which allows the server to restart after every change made to app.js
//we installed it with "sudo npm i -D nodemon" then in package.json under scripts we removed the placeholder script
//then added "dev": "npx nodemon app.js"
//then use the command "sudo npm run dev" and now everytime you make a change it restarts the server

//this section will differ from the documentation from express
//we are using the ES modules so this is how you declare things
//we are NOT using CommonJS, where to import express we would say "const express = require('express')
//with ES modules we import things we need, not declare them
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

/*------------------------------------------------------------------------------------------------------------------*/

//we exported these functions in database.js and now we import them here to use them
//the database logic is in database.js and this allows the logic in app.js to stay simple and clean
//separation of concerns, helps keep code maintainable, scalable, and easier to debug
import { getNote, getNotes, createNote, resetNotes } from './database.js'


//instance of app that is created, this is how you intialize an Express app
const app = express()

/*------------------------------------------------------------------------------------------------------------------*/

//here we declare how to get the directory names and filenames of the current module
//this allows us to retrieve files from some directory if a function calls for it
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/*------------------------------------------------------------------------------------------------------------------*/

//web apps will crash if errors are not handled properly, the solution i am using is adding an async wrapper
//this avoids repetition from using "try-catch error" handling
//now we can replace routes with "app.get("/notes/:id", asyncHandler(async (req, res) => {"
//separation of concerns, helps keep code maintainable, scalable, and easier to debug
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/*------------------------------------------------------------------------------------------------------------------*/

//this is a JSON API
//this says that any JSON body will be accepted and passed into req.body object
app.use(express.json())

/*------------------------------------------------------------------------------------------------------------------*/

//when submitting an html form using POST, the browser encodes the form data in a specific format by default
//this format is called "application/x-www-form-urlencoded"
//it converts the form data into a string of key-value pairs, where the keys are the "name" attributes of the input fields, and the values are user-entered data
//the encoding also replaces spaces with + and encodes special characters

//some exploits can executed by double encoding, as a small aside

//since our form was sending form data, and not JSON data, the express.json() was not parsing the body of the request
//until we added this bit of code

//html forms, by default, send data in a specific URL-encoded format
//this piece of code here translate it and turns it into a JavaScript object
app.use(express.urlencoded({ extended: true }));

/*------------------------------------------------------------------------------------------------------------------*/

//this is middleware that tells Express to serve all files in public directory as static files
//it is used in conjuction with the above declarations with filename and dirname
app.use(express.static(path.join(__dirname, "public")))

/*------------------------------------------------------------------------------------------------------------------*/

// //since we use middleware to map out public, we don't need this, but this is how we would serve indivdual files
// //you would use an absolute path like this, replacing index.html with some file name, like hello.html
// //res.sendFile(path.join(__dirname, "<directory>", "<file>"));
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"))
// });

/*------------------------------------------------------------------------------------------------------------------*/

//this is a GET route to "get" the lists of notes
//we add the async keyword here to make it a async callback function, meaning it waits until it gets a response
//we get the notes from the database, then send it back
//get() defines a router handler for HTTP GET requests

/*
keep in mind that /notes is just some arbitrary route that is defined here
whenever the app gets a GET request to this route it executes this function
*/

/*
(req, res) => {...} this is an arrow function that serves as the route handler
req : this is the request object it contains information about the incoming HTTP request, such as headers, query parameters, and router parameters
res : this is the response object, it is used to send the response back to the client
these are built in objects in Express routes and are handled automatically, just know they will always happen
*/

/*
there are many res methods
  res.send(data) sends a reponse(can be text, JSON, etc) sort of like the catch all
  res.json(object) sends a JSON response
  res.status(code) sends the HTTP status code
  res.redirect(url) redirects to another page
  res.sendFile(path) serves a file(like index.html)
*/
app.get("/notes", asyncHandler(async (req, res) => {
  const notes = await getNotes()
  res.send(notes)
}))

/*------------------------------------------------------------------------------------------------------------------*/

/*
here we create the logic to get 1 note
req.params is an object that contains the route parameters captured by Express
req.params.id accesses the value of the "id" route parameter
req.params.id is an inherent property you can call when you define a route with a ":id" parameter or any other named parameter
Express AUTOMATICALLY populates the req.params object based on the route definition
for example if you had app.get(/fruit/:type) you could access the req.params.type property because express makes it for you
*/
app.get("/notes/:id", asyncHandler(async(req, res, next) => {

  console.log("Request Params:", req.params); // Should show { id: "123" }
  console.log("Request Query:", req.query); // If using query params, will show { id: "123" }

  const id = req.query.id
  const note = await getNote(id)
  res.status(200).send(note)

}))

/*------------------------------------------------------------------------------------------------------------------*/

/*
here we define how to put notes into the database
it grabs the data from the HTTP request and send it to the database and tells it to create a note
calling createNote returns the note ID of the newly created note
*/
app.post("/notes", asyncHandler(async (req, res) => {
  console.log("Request Body:", req.body)
  const { title, contents } = req.body
  const note = await createNote(title, contents)
  res.send(note)
}))

/*------------------------------------------------------------------------------------------------------------------*/

/* 
this middleware for resetting the database
*/

app.post("/notes/reset", asyncHandler(async(req, res, next) =>{

    const result = await resetNotes()
    res.status(200).send(result)

}))

/*------------------------------------------------------------------------------------------------------------------*/

/*
this piece of code when used in express is called MIDDLEWARE, a function or series of functions that intercept incoming http requests
they modify the request or response objects, perform logging, handle authentication, parse request bodies, and more
MIDDLEWARE allows you to add resuable functionality to your app and chain operations
app.use() are functions that intercept every incoming request
error handling middleware should typically be place after all other route handles and middleware in Express app
this ensures that it catches any errors that occur in the preceding middleware or routes
*/
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('EUH!')
  })

/*------------------------------------------------------------------------------------------------------------------*/

//app refers to an instance of your Express app
//listen() is a method provided by Express app ojbect, its purpose is to start the server and make it listen
//for incoming network connections on the specified port and host(if provided)
//tells OS to bind the specified port and start accepting connections

//the () => {console.log(...)} is the second argument passed to app.listen()
//this function is a callback function, a function that is passed as an argument to another function and is executed
//AFTER the first function has completed its task
//so here the callback function is called after the server has successfully started listening on the specified port

//starting a server involves asynchronous operations, the listen() method does not block the execution of the rest of the code
//while it is waiting for connections
//the callback function allows you to execute code AFTER the asynchronous operator(server startup) has finished

//express.js and node.js are build on an event-driven architecture
//listen() method triggers and event when the server starts listening
//the callback function is essentially an event handler that is executed when that event occurs
app.listen(8080, () =>{
  console.log('Server is running on port 8080')
  })