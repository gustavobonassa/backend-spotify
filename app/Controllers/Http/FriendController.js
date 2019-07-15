'use strict'
const Friend = use('App/Models/Friend');
const User = use('App/Models/User');
const FriendInvite = use('App/Models/FriendInvite');
class FriendController {
    async storeInvite({ request, auth }) {
        const friend_id = request.input('friend_id')

        await FriendInvite.findOrCreate({ user_id: auth.user.id, friend_id })
    }
    async showFriendInvite({ request, auth }) {
        const user = await User.find(1)
        const invites = user.friendInvite().fetch()


        return invites
    }
    async destroyInvite({ params, response, auth }) {
        const invite = await FriendInvite.query().where({ user_id: params.id, friend_id: auth.user.id }).first()

        await invite.delete()
    }


    async index({ request, response, auth }) {

        const friends = await auth.user.friend().fetch()

        return friends
    }

    async store({ request, response, auth }) {
        const friend_id = request.input('friend_id')

        const invites = await FriendInvite.query()
            .where('friend_id', auth.user.id)
            .andWhere('user_id', friend_id)
            .first()

        if (!invites) {
            return response.status(404).send({ message: 'Convite de amizade não encontrado' })
        }
        await invites.delete()

        await Friend.findOrCreate({ user_id: auth.user.id, friend_id })
        await Friend.findOrCreate({ user_id: friend_id, friend_id: auth.user.id })
    }

    async destroy({ auth, params }) {
        const friend1 = await Friend.query().where({ user_id: auth.user.id, friend_id: params.id }).first()
        const friend2 = await Friend.query().where({ user_id: params.id, friend_id: auth.user.id }).first()
        await friend1.delete()
        await friend2.delete()
    }
}

module.exports = FriendController
