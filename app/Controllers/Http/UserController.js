'use strict'
const User = use('App/Models/User')
const Invite = use('App/Models/Invite')
const Helpers = use('Helpers')
const fs = require('fs');
const cloudinary = require('../../../resources/CloudinaryService');

class UserController {
    async store({ request, response, auth }) {
        const data = request.only(['username', 'email', 'password'])
        const upload = request.file('avatar')

        // const inviteQuery = await Invite.query().where('email', data.email).first()

        // if (!inviteQuery) {
        //     return response.status(401).send({ message: 'Voce nao foi convidado' })
        // }
        const nameFile = Date.now()
        const fileName = `${nameFile}.${upload.subtype}`
        await upload.move(Helpers.tmpPath('uploads'), {
            name: fileName
        })
        console.log("teste")
        if(!upload.moved()){
            throw upload.error()
        }

        const result = await cloudinary.uploader.upload(`tmp/uploads/${fileName}`, {
            resource_type: "auto",
            public_id: `avatars/${nameFile}`,
            chunk_size: 6000000
        })
        fs.unlinkSync(`tmp/uploads/${fileName}`);
        const user = await User.create({ ...data, avatar: result.url})

        const token = await auth.attempt(data.email, data.password)

        return {...token, user}
    }
}

module.exports = UserController
