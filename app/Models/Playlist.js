'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Playlist extends Model {
    user() {
        return this.belongsTo('App/Models/User')//1 projeto pertence a 1 usuario
    }
    songs() {
        return this.hasMany('App/Models/Song')
    }
}

module.exports = Playlist
