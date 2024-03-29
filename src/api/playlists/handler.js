
class PlaylistHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;
    
        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.getPlaylistByIdHandler = this.getPlaylistByIdHandler.bind(this);
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
        this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
        this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
        this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
        this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
    }

    async postPlaylistHandler(request, h) {
            this._validator.validatePlaylistPayload(request.payload);
            const { name } = request.payload;
            const { id: credentialId } = request.auth.credentials;

            const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

            return h.response({
                status: 'success',
                message: 'Playlist berhasil ditambahkan',
                data: {
                    playlistId,
                },
            }).code(201);
    }

    async getPlaylistsHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._service.getPlaylists(credentialId);

        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async getPlaylistByIdHandler(request) {
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;
            await this._service.verifyPlaylistOwner(id, credentialId);
            const playlist = await this._service.getPlaylistById(id);

            return {
                status: 'success',
                data: {
                    playlist,
                },
            };
    }


    async deletePlaylistByIdHandler(request) {
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;
            await this._service.verifyPlaylistOwner(id, credentialId);
            await this._service.deletePlaylistById(id);

            return {
                status: 'success',
                message: 'Playlist berhasil dihapus',
            };
    }

    async postSongToPlaylistHandler(request, h) {
            this._validator.validatePlaylistSongPayload(request.payload);
            const { playlistId } = request.params;
            const { songId } = request.payload;
            const { id: credentialId } = request.auth.credentials;
            await this._service.verifyPlaylistAccess(playlistId, credentialId);
            await this._service.addSongToPlaylist(playlistId, songId);
            await this._service.addActivity(playlistId, songId, credentialId);

            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan ke playlist',
                }
            );
            response.code(201);
            return response;
    }

    async getSongsFromPlaylistHandler(request) {
        const { playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;
        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        const playlist = await this._service.getSongsFromPlaylist(playlistId);

        return {
            status: 'success',
            data: {
                playlist,
            },
        };
    }

    async deleteSongFromPlaylistHandler(request) {
        
            const { playlistId } = request.params;
            const { songId } = request.payload;
            const { id: credentialId } = request.auth.credentials;
            await this._service.verifyPlaylistAccess(playlistId, credentialId);
            await this._service.deleteSongFromPlaylist(playlistId, songId);
            await this._service.deleteActivity(playlistId, songId, credentialId);

            return {
                status: 'success',
                message: 'Lagu berhasil dihapus dari playlist',
            };
        }

    async getPlaylistActivitiesHandler(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;
    
        await this._service.verifyPlaylistAccess(id, credentialId);
        const activities = await this._service.getPlaylistActivities(id);
    
        const response = h.response({
          status: 'success',
          data: activities
        });
    
        response.code(200);
        return response;
    }

}


module.exports = PlaylistHandler;