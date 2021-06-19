'use strict'

const Playlist = use('App/Models/Playlist')
const Helpers = use('Helpers')
const fs = require('fs');
const cloudinary = require('../../../resources/CloudinaryService');
// const archiver = require('archiver');
// const http = require('http');

class PlaylistController {

    async index({ request, auth }) {
        const { page } = request.get()
        const playlist = await Playlist.query().where('user_id', auth.user.id).with('user').paginate(page)

        return playlist
    }

    zipCloudinary(data) {
        return new Promise((resolve, reject) => {
            cloudinary.utils.download_zip_url({ public_ids: data, resource_type: "auto" }, (err, url) => {
            if (err) return reject(err);
            return resolve(url);
          })
        });
    }

    async downloadAll({ params }) {
        const playlist = await Playlist.findOrFail(params.id)

        await playlist.load('songs')
        const json = playlist.toJSON();
        const songs = []

        for (let i = 0; i < json.songs.length; i++) {
            songs.push(json.songs[i].publicid)
        }
        // eles nao deixam conta gratis usar .zip
        // cloudinary.utils.download_zip_url({ public_ids: songs, resource_type: "auto" }, (err, result) => {
        //     console.log(err,result)
        //     if (err) return (err);
        //     console.log(result);
        //   })
        // const test = await this.zipCloudinary(songs)

        return playlist
    }

    async store({ request, response, auth }) {
        const data = request.only(['title', 'description'])
        let playlist
        const upload = request.file('thumbnail')

        const name = Date.now()
        const fileName = `${name}.${upload.subtype}`
        await upload.move(Helpers.tmpPath('uploads'), {
            name: fileName
        })
        if (!upload.moved()) {
            throw upload.error()
        }

        const result = await cloudinary.uploader.upload(`tmp/uploads/${fileName}`, {
            resource_type: "auto",
            public_id: `thumbnail/${name}`,
            chunk_size: 6000000,
            transformation: [
                { width: 500, height: 500, crop: "limit" }
            ]
        });
        fs.unlinkSync(`tmp/uploads/${fileName}`)
        playlist = await Playlist.create({ ...data, user_id: auth.user.id, thumbnail: result.url })

        return playlist
    }

    async show({ params }) {
        const playlist = await Playlist.findOrFail(params.id)

        await playlist.load('user')
        await playlist.load('songs')

        return playlist
    }

    async update({ params, request }) {
        const playlist = await Playlist.findOrFail(params.id)
        const data = request.only(['title', 'description', 'thumbnail'])

        playlist.merge(data)

        await playlist.save()

        return playlist
    }

    async destroy({ params }) {
        const playlist = await Playlist.findOrFail(params.id)
        await playlist.load('songs')
        const json = playlist.toJSON()
        for (let i = 0; i < json.songs.length; i++) {//nao funciona, falta arrumar, fala q o song e uma funcao
            await cloudinary.uploader.destroy(json.songs[i].publicid, { resource_type: "video" })
        }

        await playlist.delete()
    }
}

module.exports = PlaylistController
