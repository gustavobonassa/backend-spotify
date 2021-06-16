'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Playlist extends Model {
    user() {
        return this.belongsTo('App/Models/User')
    }
    songs() {
        return this.hasMany('App/Models/Song')
    }
}

module.exports = Playlist
