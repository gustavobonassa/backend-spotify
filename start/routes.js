'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/
const Route = use('Route')

Route.get('/status', () => {
    return "boa"
})
Route.post('sessions', 'SessionController.store').validator('Session')
Route.post('users', 'UserController.store').validator('User')

Route.post('passwords', 'ForgotPasswordController.store').validator('ForgotPassword')
Route.put('passwords', 'ForgotPasswordController.update').validator('ResetPassword')

Route.post('/song', 'SongController.download')
Route.post('/search', 'SongController.search')
Route.get('/playlistdownload/:id', 'PlaylistController.downloadAll')

Route.group(() => {
    Route.delete('/song/:id', 'SongController.destroy')

    Route.get('roles', 'RoleController.index')

    Route.resource('teams', 'TeamController')
        .apiOnly()
        .validator(new Map([[['teams.store', 'teams.update'], ['Team']]]))
    Route.post('invites', 'InviteController.storeInvite').validator('Invite')
    Route.get('teaminvites', 'InviteController.showTeamInvite')
    Route.get('teaminvites/:team_id', 'InviteController.TeamInviteAccept')

    Route.delete('friendinvites', 'FriendController.destroyInvite')
    Route.get('friendinvites', 'FriendController.showFriendInvite')
    Route.post('friendinvites', 'FriendController.storeInvite')
    Route.resource('friend', 'FriendController').apiOnly()

    Route.resource('playlist', 'PlaylistController')
        .apiOnly()
        .validator(new Map([[['playlist.store'], ['Playlist']]]))
}).middleware('auth')

Route.group(() => {

    Route.get('members', 'MemberController.index')
    Route.put('members/:id', 'MemberController.update').middleware('is:administrator')

    Route.post('teaminvites', 'InviteController.storeTeamInvite').validator('Invite').middleware('can:invites_create')

    Route.get('permissions', 'PermissionController.show')
}).middleware(['auth', 'team'])
