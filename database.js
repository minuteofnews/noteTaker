//npm init -y creates a package.json file that manages dependencies
//it helps streamline the app when it runs for the first time it creates package-lock.json
//this allows other users to know how it was ran on and allows others to copy the settings so they can run it
//it seems you might need to install libraries everytime when creating a web app

//this file houses all the database logic, sql statements, etc.

//all functions have export prefix to allow integration to an express app and use them in a different file

//this allows wrapping the pool in a promise-based interface
//promise() is explained below when "const pool" is declared
//query(), execute() will return a promise
import mysql from 'mysql2'

//.env file will never commit to git in source code and everyone else will have to have their own version
//we're gonna use the library dotenv, and then initialize it
import dotenv from 'dotenv'
import { create } from 'domain'
dotenv.config()

// //creates a pool of resusable connections
// const pool = mysql.createPool({
//     host: '127.0.0.1',
//     user: 'root',
//     password: '',
//     database: 'notes_app'
// }).promise()

//hides information while also being contextually aware of these variables depending on whoever is running this app
//make code more secure and flexible

//promise() is an object representing the eventual completion (or failure) of an asynchronous operation and its resulting value
//it provides a structured way to deal with tasks that do not finish immediately, like fetching data from a server or reading a file
//promises help avoid "callback hell", where nested callbacks make code difficult to read 
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

// //this returns a query in the form of an array with json
// const result = await pool.query("SELECT * FROM notes")
// const row = result[0]
// console.log(result)

// //destructuring assignment of the above
// const [rows] = await pool.query("SELECT * FROM notes")
// console.log(result)

//wrapped the above code into an async function, now we can call this function to return all notes
export async function getNotes(){
    const [rows] = await pool.query("SELECT * FROM notes")
    return rows
}

const notes = await getNotes()

//in this function we use a template string, TILDE, template literal is what this is called
//there can be two versions of this one concatenates the id to the query, allowing for SQLi
//note we also destructure result here, if we didn't it would return meta data
//note here the return, this function returns an array, that's not great
//so we return the first element of the array, so we don't get an array
export async function getNote(id){
    const [result] = await pool.query(
        `SELECT * 
        FROM notes
        WHERE id = ${id}`)
    return result
}

// //this version uses parameterized values and prevents SQLi
// //this is called a prepared statement, we are sending the SQL and the value completely separately
// async function getNote(id){
//     const [result] = await pool.query(
//         `SELECT * 
//         FROM notes
//         WHERE id = ?`, [id])
//     return result
// }

// const note = await getNote(1)

//here we have the createNote function
//note that "pool.query" is used for any SQL commands SELECT, INSERT, UPDATE, DELETE, w.e.
//this is another instance of note validating user input data, trusting it, and concatenating the data into our SQL command
export async function createNote(title, contents){
    const [insert] = await pool.query(`
        INSERT into notes (title, contents)
        VALUES ('${title}', '${contents}')
        `)
        return getNote(insert.insertId)
}

//this piece of code creates a note everytime the database starts up
//const insert = await createNote('test', 'test')

// //here is a version of createNote using a parameterized query, SQL and data are sent separately and mySQL handles it
// //this prevents SQLi
// //when passing in more than one variable into a parameterized query, use an array to pass them
// //they must appear in order of the question marks
// async function createNote(title, content){
//     const insert = pool.query(`
//         INSERT into notes_app (title, content)
//         VALUES(?, ?)
//         `, [title, content])
//         return insert
// }

//**CREATE A FUNCTION THAT RESETS THE DATABASE**
//**THEN HAVE IT BE CALLED FROM CLICKING A LINK**
//**FIRST PASS IDEA IS TO CREATE app.get THEN DROP TABLE, AND CREATE TABLE WITH THE SAME PARAMETERS */

//simple function to reset the table
//truncate is the cleanest way to do it, it removes all rows and resets auto-increment IDs
//we use query here because the method is the all in one command for executing SQL
export async function resetNotes(){
    const reset = await pool.query(`
        TRUNCATE TABLE notes;
        `)

        //this always returns true, but if we got here, it must have worked
        //if there ever is an error, the asyncHandler will catch it in app.js
        //so we don't need a try-catch nest here
        return { success: true, message: "Notes table has been reset"}
}

//reenable this to test getNotes on server startup
//console.log(notes)

//reenable this to test getNote on server startup
//console.log(note)

//reenable this when you want to insert test note everytime the server starts
//console.log(insert)