'use strict'
const Song = use('App/Models/Song')
const fs = require('fs');
const ytdl = require('ytdl-core');
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const cloudinary = require('../../../resources/CloudinaryService');

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
    sendMessage(data) {
        this.socket.emitTo('message', data, [this.socket.id])
    }
    async createSong(data, infoSong, result) {
        var tempo = moment.duration(parseInt(infoSong.player_response.videoDetails.lengthSeconds), 'seconds').format("m:ss");
        try {
            if (data.playlist > 0) {
                await Song.create({
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
    }

    uploadToCloudinary(url, data) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(url, data, (err, url) => {
            if (err) return reject(err);
            return resolve(url);
          })
        });
      }
    async onSong(data) {
        //this.socket.broadcastToAll('message', data)
        let video
        let filename = Date.now()
        const filter = (data.type === "mp3") ? 'audioonly' : null;
        video = await ytdl(data.url, { filter: filter, quality: data.quality })
        video.pipe(fs.createWriteStream(`tmp/uploads/${filename}.${data.type}`))
        const infoSong = await ytdl.getInfo(data.url);
        const audioName = infoSong.player_response.videoDetails.title;

        await video.on('progress', (chunkLength, downloaded, total) => {
            //console.log(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
            //let currentStatus = `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`
            var tempo = moment.duration(parseInt(infoSong.player_response.videoDetails.lengthSeconds), 'seconds').format("m:ss");
            var currentSize = (downloaded / 1024 / 1024).toFixed(2)
            var maxSize = (total / 1024 / 1024).toFixed(2)
            var percent = parseInt((100 * currentSize) / maxSize);

            let currentStatus = {
                currentSize,
                maxSize,
                audioName,
                duration: tempo,
                finished: false,
                percent,
                playlist: data.playlist,
                url: data.url,
            }

            // console.log(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB) Musica: ${currentStatus.audioName} Duracao: ${currentStatus.duration}\n`);

            this.sendMessage(currentStatus);
        });
        await video.on('end', async () => {
            console.log('terminou de baixar')
            let currentStatus = {
                audioName,
                finished: false,
                percent: 100,
                message: 'Salvando na nuvem',
                playlist: data.playlist,
                url: data.url,
            }
            this.sendMessage(currentStatus);
            const url = `tmp/uploads/${filename}.${data.type}`;
            const songData = {
                resource_type: "auto",
                public_id: `songs/${filename}`,
                chunk_size: 6000000,
                format: data.type
            }
            const result = await this.uploadToCloudinary(url, songData)

            // deleta arquivo
            fs.unlinkSync(url)
            console.log('File deleted')
            // salva no banco
            if (result.url && data.playlist) {
                this.createSong(data, infoSong, result)
                currentStatus = {
                    audioName,
                    finished: true,
                    percent: 100,
                    message: 'Salvo com sucesso',
                    playlist: data.playlist,
                    url: data.url,
                }

            } else {
                currentStatus = {
                    audioName,
                    finished: true,
                    percent: 100,
                    message: 'Erro ao salvar a musica na nuvem',
                    playlist: data.playlist,
                    url: data.url,
                }
            }
            this.sendMessage(currentStatus);
        });

    }
}

module.exports = SongController
