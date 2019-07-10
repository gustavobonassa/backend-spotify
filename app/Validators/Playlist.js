'use strict'
const Antl = use('Antl')
class Playlist {
    get validateAll(){
        return true
    }
    get rules () {
        return {
            title: 'required',
            description: 'required',
            thumbnail: 'required'
        }
    }
    get messages () {
        return Antl.list('validation')
    }
}

module.exports = Playlist
