'use strict'

let messages = [];
let key = 0;

class ChatController {
    constructor({ socket, request, auth }) {
        this.socket = socket
        this.request = request
        this.auth = auth
        console.log('connected %s',socket.id)
    }
    onReady(){
        //console.log(this.socket)
        this.socket.emit('carrega', messages)
    }
    onMessage(message) {
        //console.log(this.socket)
        console.log(this.socket.topic)
        messages.push({ ...message, username: this.auth.user.username, key });
        this.socket.broadcastToAll('message', { ...message, username: this.auth.user.username, key })
        key++;
    }

    disconnected(socket){
        console.log('disconnected %s',socket.id)
    }

}

module.exports = ChatController
