const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums/{albumId}/likes',
        handler: handler.postAlbumLikeHandler,
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'GET',
        path: '/albums/{albumId}/likes',
        handler: handler.getAlbumLikesHandler,
        options: {
            auth: 'openmusic_jwt',
        },
    },
];

module.exports = routes;