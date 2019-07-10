'use strict'

const Invite = use('App/Models/Invite')
const TeamInvite = use('App/Models/TeamInvite')
const UserTeam = use('App/Models/UserTeam')

class InviteController {
    async storeInvite({ request, auth }) {
        const invites = request.input('invites')

        const data = invites.map(email => ({
            email, user_id: auth.user.id
        }))

        await Invite.createMany(data)
    }
    async showTeamInvite({ request, auth }) {

        const invites = await TeamInvite.query().where('email',auth.user.email).fetch()

        return invites
    }
    async storeTeamInvite({ request, auth }) {
        const invites = request.input('invites')

        const data = invites.map(email => ({
            email, user_id: auth.user.id, team_id: request.team.id
        }))

        await TeamInvite.createMany(data)
    }
    async TeamInviteAccept({ params, auth }){
        const invites = await TeamInvite
            .findByOrFail({ email: auth.user.email, team_id: params.team_id })

        await invites.delete()

        await UserTeam.findOrCreate({user_id:auth.user.id,team_id:params.team_id})
    }
}

module.exports = InviteController
