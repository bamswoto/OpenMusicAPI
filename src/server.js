require('dotenv').config();
const Hapi = require('@hapi/hapi');
// albums 
const albums = require('./api/album');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongService = require('./services/postgres/SongService');
const SongValidator = require('./validator/songs');

// users
const users = require('./api/users');
const UserValidator = require('./validator/users');
const UsersService = require('./services/postgres/UserService');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsValidator = require('./validator/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');

const init = async () => {
    const albumService = new AlbumService();
    const songService = new SongService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: albums,
            options: {
                service: albumService,
                validator: AlbumValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songService,
                validator: SongValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UserValidator,
        }
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
}

init();