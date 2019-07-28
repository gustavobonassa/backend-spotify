'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {import('@adonisjs/ignitor/src/Helpers')} */
const Helpers = use('Helpers')

module.exports = {
    /*
    |--------------------------------------------------------------------------
    | Default Connection
    |--------------------------------------------------------------------------
    |
    | Connection defines the default connection settings to be used while
    | interacting with SQL databases.
    |
    */
    connection: Env.get('DB_CONNECTION', process.env.DB_CONNECTION),

    /*
    |--------------------------------------------------------------------------
    | Sqlite
    |--------------------------------------------------------------------------
    |
    | Sqlite is a flat file database and can be a good choice for a development
    | environment.
    |
    | npm i --save sqlite3
    |
    */
    sqlite: {
        client: 'sqlite3',
        connection: {
            filename: Helpers.databasePath(`${Env.get('DB_DATABASE', process.env.DB_DATABASE)}.sqlite`)
        },
        useNullAsDefault: true,
        debug: Env.get('DB_DEBUG', false)
    },

    /*
    |--------------------------------------------------------------------------
    | MySQL
    |--------------------------------------------------------------------------
    |
    | Here we define connection settings for MySQL database.
    |
    | npm i --save mysql
    |
    */
    mysql: {
        client: 'mysql',
        connection: {
            host: Env.get('DB_HOST', process.env.DB_HOST),
            port: Env.get('DB_PORT', process.env.DB_PORT),
            user: Env.get('DB_USER', process.env.DB_USER),
            password: Env.get('DB_PASSWORD', process.env.DB_PASSWORD),
            database: Env.get('DB_DATABASE', process.env.DB_DATABASE)
        },
        debug: Env.get('DB_DEBUG', false)
    },

    /*
    |--------------------------------------------------------------------------
    | PostgreSQL
    |--------------------------------------------------------------------------
    |
    | Here we define connection settings for PostgreSQL database.
    |
    | npm i --save pg
    |
    */
    pg: {
        client: 'pg',
        connection: {
            host: Env.get('DB_HOST', process.env.DB_HOST),
            port: Env.get('DB_PORT', process.env.DB_PORT),
            user: Env.get('DB_USER', process.env.DB_USER),
            password: Env.get('DB_PASSWORD', process.env.DB_PASSWOR),
            database: Env.get('DB_DATABASE', process.env.DB_DATABASE)
        },
        debug: Env.get('DB_DEBUG', false)
    }
}
