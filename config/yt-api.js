const Env = use('Env')

module.exports = {
    type: 'video',
    key: Env.get('YT_API', process.env.YT_API)
}
