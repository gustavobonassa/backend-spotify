'use strict'
const Song = use('App/Models/Song')
const fs = require('fs');
const ytdl = require('ytdl-core');
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const cloudinary = require('../../../resources/CloudinaryService');

var requests = [];
var id = -1;
class SongController {
    constructor({ socket, request, auth }) {
        this.socket = socket
        this.request = request
        this.auth = auth
    }
    async onSong(data) {
        //this.socket.broadcastToAll('message', data)
        let video
        let filename = Date.now()
        const filter = (data.type === "mp3") ? 'audioonly' : null;
        video = await ytdl(data.url, { filter: filter, quality: data.quality })
        video.pipe(fs.createWriteStream(`tmp/uploads/${filename}.${data.type}`))
        var infoSong


        await video.on('info', (info) => {
            infoSong = info;
        })
        console.log(infoSong);
        await video.on('progress', (chunkLength, downloaded, total) => {
            //console.log(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
            //let baixando = `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`
            var tempo = moment.duration(parseInt(infoSong.length_seconds), 'seconds').format("m:ss");
            var atualSize = (downloaded / 1024 / 1024).toFixed(2)
            var maxSize = (total / 1024 / 1024).toFixed(2)
            var percent = parseInt((100 * atualSize) / maxSize);

            let baixando = {
                atualSize,
                maxSize,
                audioName: infoSong.title,
                duration: tempo,
                finished: false,
                percent
            }

            var index = requests.findIndex((e) => e.audioName === baixando.audioName);
            if (index === -1) {
                requests.push(baixando);
            } else {
                requests[index] = baixando;
            }
            console.log(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB) Musica: ${baixando.audioName} Duracao: ${baixando.duration}\n`);

            this.socket.emit('message', requests)
        });
        id++
        await video.on('end', () => {
            console.log('terminou de baixar')
            let baixando = {
                audioName: infoSong.title,
                finished: true,
                percent: 100,
                message: 'Salvando na nuvem...'
            }
            var index = requests.findIndex((e) => e.audioName === baixando.audioName);
            if (index === -1) {
                requests.push(baixando);
            } else {
                requests[index] = baixando;
            }
            this.socket.emit('message', requests)

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
                    var tempo = moment.duration(parseInt(infoSong.length_seconds), 'seconds').format("m:ss");
                    Song.create({
                        playlist_id: data.playlist,
                        name: data.name || infoSong.media.song || infoSong.title,
                        url: result.url,
                        type: 'audio',
                        subtype: data.type,
                        publicid: result.public_id,
                        album: infoSong.media.album || null,
                        author: data.artist || infoSong.media.artist || null,
                        thumbnail: infoSong.player_response.videoDetails.thumbnail.thumbnails[0].url,
                        duration: tempo
                    })
                });
            baixando = {
                audioName: infoSong.title,
                finished: true,
                percent: 100,
                message: 'Salvo com sucesso'
            }
            requests[index] = baixando;
            this.socket.emit('message', requests)
        });

    }
}

module.exports = SongController
