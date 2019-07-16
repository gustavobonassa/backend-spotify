'use strict'

let messages = [];

class ChatController {
    constructor({ socket, request, auth }) {
        this.socket = socket
        this.request = request
        this.auth = auth
    }
    onReady(){
        console.log(this.socket)
        this.socket.emit('carrega', messages)
    }
    onMessage(message) {
        console.log(this.socket)
        messages.push({ ...message, username: this.auth.user.username });
        this.socket.broadcastToAll('message', { ...message, username: this.auth.user.username })
    }

}

module.exports = ChatController
