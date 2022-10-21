class UploadsHandler {
    constructor(service, validator, albumService) {
        this._service = service;
        this._validator = validator;
        this._albumService = albumService;
    
        this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
    }
    
    async postAlbumCoverHandler(request, h) {
        const { cover } = request.payload;
        const { albumId } = request.params;
        this._validator.validateImageHeaders(cover.hapi.headers);
    
        const filename = await this._service.writeFile(cover, cover.hapi);
        const fileLocation = `${
            request.headers['x-forwarded-proto'] || request.server.info.protocol
          }://${request.info.host}/upload/images/${filename}`;

          
          await this._albumService.addCoverAlbumById(albumId, fileLocation);
    
        const response = h.response({
        status: 'success',
        message: 'Gambar berhasil diunggah',
        data: {
            fileLocation,
        },
        });
        response.code(201);
        return response;
    }
}

module.exports = UploadsHandler;