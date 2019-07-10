'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TeamSchema extends Schema {
    up() {
        this.create('teams', (table) => {
            table.increments()
            table.string('name', 190).notNullable()
            table
                .integer('user_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('users')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
            table.string('slug', 190).notNullable().unique()
            table.timestamps()
        })
    }

    down() {
        this.drop('teams')
    }
}

module.exports = TeamSchema
