'use strict'
const Song = use('App/Models/Song')
const fs = require('fs');
const ytdl = require('ytdl-core');
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const cloudinary = require('../../../resources/CloudinaryService');

class SongController {
    constructor ({ socket, request }) {
        this.socket = socket
        this.request = request

    }
    onSong (data){
        //this.socket.broadcastToAll('message', data)
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
            let baixando = `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`
            this.socket.broadcastToAll('message', baixando)
        });
        video.on('end', () => {
            console.log('terminou de baixar')
            this.socket.broadcastToAll('message', 'terminou de baixar, mandando para a nuvem')
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
                this.socket.broadcastToAll('message', 'Salvo na nuvem com sucesso, arquivo deletado do servidor')
        });

    }
}

module.exports = SongController
