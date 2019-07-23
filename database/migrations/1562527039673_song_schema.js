'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SongSchema extends Schema {
  up () {
    this.create('songs', (table) => {
      table.increments()
      table.integer('playlist_id')
        .unsigned()
        .references('id')
        .inTable('playlists')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .notNullable()
      table.string('name', 190).notNullable()
      table.string('url', 190).notNullable()
      table.string('publicid', 100).notNullable()
      table.string('thumbnail', 190)
      table.string('genre', 40)
      table.string('author', 40)
      table.string('album', 40)
      table.string('type', 20)
      table.string('subtype', 20)
      table.string('duration', 20)
      table.timestamps()
    })
  }

  down () {
    this.drop('songs')
  }
}

module.exports = SongSchema
