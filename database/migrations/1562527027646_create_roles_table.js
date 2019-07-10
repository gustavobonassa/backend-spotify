'use strict'

const Schema = use('Schema')

class RolesTableSchema extends Schema {
    up() {
        this.create('roles', table => {
            table.increments()
            table.string('slug', 190).notNullable().unique()
            table.string('name', 190).notNullable().unique()
            table.text('description').nullable()
            table.timestamps()
        })
    }

    down() {
        this.drop('roles')
    }
}

module.exports = RolesTableSchema
