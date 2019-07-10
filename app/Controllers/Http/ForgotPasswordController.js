'use strict'

const crypto = require('crypto')
const User = use('App/Models/User')
const Mail = use('Mail')
const moment = use('moment')

class ForgotPasswordController {
    async store ({ request, response }) {
        try {
            const email = request.input('email')
            const user = await User.findByOrFail('email', email)

            user.token = crypto.randomBytes(10).toString('hex')
            user.token_created_at = new Date()
            /*console.log('teste')
            await Mail.send(
                ['emails.forgot_password'],
                { email, link: `${request.input('redirect_url')}?token=${user.token}`, token: user.token },
                message => {
                message
                    .to(user.email)
                    .from('diego@rocketseat.com.br', 'Diego | Rocketseat')
                    .subject('Recuperação de senha')
                }
            )*/

            await user.save()
        } catch (err) {
            return response
                .status(err.status)
                .send({ error: { message: 'Algo não deu certo, esse e-mail existe?' } })
        }
    }
    async update({request, response}){
        try{
            const { token, password } = request.all()

            const user = await User.findByOrFail('token', token)

            const tokenExpired = moment()
                .subtract('2', 'days')
                .isAfter(user.token_created_at)

                if(tokenExpired){
                    return response
                        .status(401)
                        .send({ error: { message: 'O token de recuperação está expirado' } })
                }

                user.token = null
                user.token_created_at = null
                user.password = password

                await user.save()
        }catch (err) {
            return response
                .status(err.status)
                .send({ error: { message: 'Algo deu errado ao resetar sua senha' } })
        }
    }
}

module.exports = ForgotPasswordController
