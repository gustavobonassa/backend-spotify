'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class InviteSchema extends Schema {
    up() {
        this.create('invites', (table) => {
            table.increments()
            table.integer('user_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('users')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
            table.string('email', 190).notNullable()
            table.timestamps()
        })
    }

    down() {
        this.drop('invites')
    }
}

module.exports = InviteSchema
