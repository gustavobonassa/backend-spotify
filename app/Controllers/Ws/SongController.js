'use strict'
const Song = use('App/Models/Song')
const fs = require('fs');
const ytdl = require('ytdl-core');
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const cloudinary = require('../../../resources/CloudinaryService');

var requests = {};

class SongController {
    constructor({ socket, request }) {
        this.socket = socket
        this.request = request

        console.log('A new subscription for room topic', socket.topic)
    }
    onMessage(data) {
        console.log(data);
        this.onSong(data);
    }
    async onSong(data) {
        //this.socket.broadcastToAll('message', data)
        let video
        let filename = Date.now()
        const filter = (data.type === "mp3") ? 'audioonly' : null;
        video = await ytdl(data.url, { filter: filter, quality: data.quality })
        video.pipe(fs.createWriteStream(`tmp/uploads/${filename}.${data.type}`))
        const infoSong = await ytdl.getInfo(data.url);

        await video.on('progress', (chunkLength, downloaded, total) => {
            //console.log(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
            //let baixando = `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`
            var tempo = moment.duration(parseInt(infoSong.player_response.videoDetails.lengthSeconds), 'seconds').format("m:ss");
            var atualSize = (downloaded / 1024 / 1024).toFixed(2)
            var maxSize = (total / 1024 / 1024).toFixed(2)
            var percent = parseInt((100 * atualSize) / maxSize);

            let baixando = {
                atualSize,
                maxSize,
                audioName: infoSong.player_response.videoDetails.title,
                duration: tempo,
                finished: false,
                percent,
                playlist: data.playlist,
                url: data.url,
            }

            console.log(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB) Musica: ${baixando.audioName} Duracao: ${baixando.duration}\n`);

            this.socket.emitTo('message', baixando, [this.socket.id])
        });
        await video.on('end', () => {
            console.log('terminou de baixar')
            let baixando = {
                audioName: infoSong.player_response.videoDetails.title,
                finished: true,
                percent: 100,
                message: 'Salvando na nuvem',
                playlist: data.playlist,
                url: data.url,
            }
            this.socket.emitTo('message', baixando, [this.socket.id])

            cloudinary.uploader.upload(`tmp/uploads/${filename}.${data.type}`, {
                resource_type: "auto",
                public_id: `songs/${filename}`,
                chunk_size: 6000000,
                format: data.type
            },
                function (error, result) {
                    if (error) throw error
                    //console.log(result, error)
                    fs.unlinkSync(`tmp/uploads/${filename}.${data.type}`)
                    console.log('File deleted')
                    var tempo = moment.duration(parseInt(infoSong.player_response.videoDetails.lengthSeconds), 'seconds').format("m:ss");
                    try {
                        if (data.playlist > 0) {
                            Song.create({
                                playlist_id: data.playlist,
                                name: data.name || infoSong.player_response.videoDetails.title,
                                url: result.url,
                                type: 'audio',
                                subtype: data.type,
                                publicid: result.public_id,
                                album: null,
                                author: data.artist || null,
                                thumbnail: infoSong.player_response.videoDetails.thumbnail.thumbnails[0].url,
                                duration: tempo
                            })
                        }

                    } catch (error) {
                        console.log("error")
                    }
                });
            baixando = {
                audioName: infoSong.player_response.videoDetails.title,
                finished: true,
                percent: 100,
                message: 'Salvo com sucesso',
                playlist: data.playlist,
                url: data.url,
            }

            this.socket.emitTo('message', baixando, [this.socket.id])
        });

    }
}

module.exports = SongController
