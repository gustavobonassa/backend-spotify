'use strict'

const Song = use('App/Models/Song')
const fs = require('fs');
const ytdl = require('ytdl-core');//baixa video, audio do yt
const searchYt = require('youtube-search');//procura no yt
const cloudinary = require('../../../resources/CloudinaryService');
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");

class YoutubeController {
    async search({ request, response }) {
        const data = request.only(['search', 'maxResults'])
        if(!data.search){
            return response.status(401).send({ message: 'Digite algo' })
        }
        var opts = {
            maxResults: data.maxResults || 5,
            type: 'video',
            key: 'AIzaSyDy1velmfau4ecc3olUVZdMCjww47LGxcc'
        };
        const busca = await searchYt(data.search, opts);
        return busca
    }

    async download({ request, response }) {
        const data = request.only(['url', 'type', 'quality', 'playlist'])
        let video
        let filename = Date.now()
        const filter = (data.type === "mp3") ? 'audioonly' : null;
        video = ytdl(data.url, { filter: filter, quality: data.quality })
        video.pipe(fs.createWriteStream(`tmp/uploads/${filename}.${data.type}`))
        let infoSong
        video.on('info', (info) => {
            infoSong = info
        })
        video.on('progress', (chunkLength, downloaded, total) => {
            console.log(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
        });
        video.on('end', () => {
            console.log('terminou de baixar')
            cloudinary.uploader.upload(`tmp/uploads/${filename}.${data.type}`, {
                resource_type: "auto",
                public_id: `songs/${filename}`,
                chunk_size: 6000000,
                format: data.type
            },
                function (error, result) {
                    if (error) throw error
                    //console.log(result, error)
                    fs.unlink(`tmp/uploads/${filename}.${data.type}`, function (err) {
                        if (err) throw err
                        console.log('File deleted')
                        var tempo = moment.duration(parseInt(infoSong.length_seconds), 'seconds').format("m:ss");
                        Song.create({
                            playlist_id: data.playlist,
                            name: infoSong.title,
                            url: result.url,
                            type: 'audio',
                            subtype: data.type,
                            publicid: result.public_id,
                            album: infoSong.media.album || null,
                            author: infoSong.media.artist || null,
                            thumbnail: infoSong.player_response.videoDetails.thumbnail.thumbnails[0].url,
                            duration: tempo
                        })
                    })
                });
        });
    }
    async destroy({ params, response }) {
        const song = await Song.query().where('id', params.id).first()
        if(!song){
            return response.status(404).send({ message: 'Som não encontrado' })
        }
        await cloudinary.uploader.destroy(song.publicid, {resource_type: "video"})


        await song.delete()
    }
}

module.exports = YoutubeController
