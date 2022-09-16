//import dotenv from 'dotenv';
require('dotenv').config();
const Hapi = require('@hapi/hapi');
const albums = require('./api/album');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumValidator = require('./validator/albums');

const init = async () => {
    const albumService = new AlbumService();
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register({
        plugin: albums,
        options: {
            service: albumService,
            validator: AlbumValidator,
        },
    });
    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
}

init();