import mysql from 'mysql2'
import dotenv from 'dotenv'
import { create } from 'domain'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getNotes(){
    const [rows] = await pool.query("SELECT * FROM notes")
    return rows
}

const notes = await getNotes()

export async function getNote(id){
    const [result] = await pool.query(
        `SELECT * 
        FROM notes
        WHERE id = ${id}`)

    return result
}

export async function createNote(title, contents){
    const [insert] = await pool.query(`
        INSERT into notes (title, contents)
        VALUES ('${title}', '${contents}')
        `)
        return getNote(insert.insertId)
}

export async function resetNotes(){
    const reset = await pool.query(`
        TRUNCATE TABLE notes;
        `)

        return { success: true, message: "Notes table has been reset"}
}