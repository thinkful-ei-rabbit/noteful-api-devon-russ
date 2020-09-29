const express = require('express')
const xss = require('xss')
const path = require('path')
const NoteService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
  id: note.id,
  name: xss(note.name),
  content: xss(note.content),
  modified: note.modified,
  folderId: note.folderId
})

notesRouter
.route('/')
.get((req, res, next) => {
  NoteService.getAllNotes(
    req.app.get('db')
  )
  .then(notes => {
    res.json(notes.map(serializeNote))
  })
  .catch(next)
})
.post(jsonParser, (req, res, next) => {
  const { name, content } = req.body
  const newNote = { name, content}

  if (name == null) {
    return res.status(400).json({
      error: { message: `Missing name in request body`}
    })
  }

  NoteService.insertNote(
    req.app.get('db'),
    newNote
  )
    .then(note => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${note.id}`))
        .json(serializeNote(note))
    })
    .catch(next)
})

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    NoteService.getById(req.app.get('db'), req.params.note_id)
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })

  .get()

module.exports = notesRouter