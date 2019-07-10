'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PlaylistSchema extends Schema {
    up () {
        this.create('playlists', (table) => {
        table.increments()
        table.integer('user_id')
            .unsigned()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('SET NULL')
        table.string('title', 190).notNullable()
        table.text('description').notNullable()
        table.string('thumbnail', 190).notNullable()
        table.timestamps()
        })
    }

    down () {
        this.drop('playlists')
    }
}

module.exports = PlaylistSchema
