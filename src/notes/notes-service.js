const NoteService = {
  getAllNotes(knex) {
    return knex.select('*').from('noteful_notes')
  },
  insertNote(knex, newNote) {
    return knex
      .insert(newNote)
      .into('noteful_notes')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex
      .from('blogful_notes')
      .select('*')
      .where('id', id)
      .first()
  },
  deleteNotes(knex, id) {
    return knex('blogful_notes').where({ id }).delete()
  },
  updateNotes(knex, id, newNotesFields) {
    return knex('blogful_notes').where({ id }).update(newNotesFields)
  }

}

module.exports = NoteService