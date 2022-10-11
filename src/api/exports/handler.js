
class ExportsHandler {
    constructor(service, validator, playlistsService) {
        this._service = service;
        this._validator = validator;
        this._playlistsService = playlistsService;

        this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    }

    async postExportPlaylistHandler(request, h) {
        this._validator.validateExportPlaylistPayload(request.payload);

        const { playlistId } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
        
        const message ={
            playlistId,
            targetEmail: request.payload.targetEmail,
        };

        await this._service.sendMessage('export:playlists', JSON.stringify(message));

        return h.response({
            status: 'success',
            message: 'Permintaan Anda dalam antrean',
        }).code(201);
    }
}

module.exports = ExportsHandler;