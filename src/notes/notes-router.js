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

module.exports = notesRouter