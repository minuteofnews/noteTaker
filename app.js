import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { getNote, getNotes, createNote, resetNotes } from './database.js'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.use(express.json())

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")))

app.get("/notes", asyncHandler(async (req, res) => {
  const notes = await getNotes()
  res.send(notes)
}))

app.get("/notes/:id", asyncHandler(async(req, res, next) => {

  console.log("Request Params:", req.params);
  console.log("Request Query:", req.query); 

  const id = req.query.id
  const note = await getNote(id)
  res.status(200).send(note)

}))

app.post("/notes", asyncHandler(async (req, res) => {
  console.log("Request Body:", req.body)
  const { title, contents } = req.body
  const note = await createNote(title, contents)
  res.send(note)
}))

app.post("/notes/reset", asyncHandler(async(req, res, next) =>{

    const result = await resetNotes()
    res.status(200).send(result)

}))

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Hmm, it did not like that.')
  })

app.listen(8080, () =>{
  console.log('Server is running on port 8080')
  })