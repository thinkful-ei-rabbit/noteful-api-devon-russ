const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeNotesArray, makeMaliciousNotes } = require('./notes.fixtures')

describe('Notes Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE noteful_notes RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE noteful_notes RESTART IDENTITY CASCADE'))

  describe.only(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
        .get(`/api/notes`)
        .expect(200, [])
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray();

      beforeEach('insert notes', () => {
        return db
        .into('noteful_notes')
        .insert(testNotes)
        
      })

      it('responds with 200 and all of the notes', ()=> {
        return supertest(app)
        .get('/api/notes')
        .expect(200, testNotes)        
      })
    })

    context(`Given an XSS attack note`, () => {
      const { maliciousNote, expectedNote } = makeMaliciousNotes()

      beforeEach('insert malicious note', () => {
        return db
        .into('noteful_notes')
        .insert([maliciousNote])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
        .get(`/api/notes`)
        .expect(200)
        .expect(res => {
          expect(res.body[0].name).to.eql(expectedNote.name)
          expect(res.body[0].content).to.eql(expectedNote.content)
        })
      })
    })

    
  })
})