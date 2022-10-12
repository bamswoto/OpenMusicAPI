class getAlbumLikesHandler{
    constructor(service, albumService) {
        this._service = service;
        this._albumService = albumService;
        this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
        this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);    
    }

    async postAlbumLikeHandler(request, h) {
        const {albumId} = request.params;
        const {id: userId} = request.auth.credentials;

        await this._albumService.checkAlbum(albumId);
        const liked = await this._service.checkAlbumLikes(albumId, userId);

        if (liked == 0) {
            const likedId = await this._service.addAlbumLike(albumId, userId);

            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan ke daftar lagu favorit',
                data: {
                    likedId,
                },
            });
            response.code(201);
            return response;
        }

        await this._service.deleteAlbumLike(albumId, userId);

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil dihapus dari daftar lagu favorit',
        });
        response.code(201);
        return response;
    }

    async getAlbumLikesHandler(request, h) {
        const { albumId } = request.params;

      const data = await this._service.getAlbumLikes(albumId);
      const likes = data.count;

      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      response.header('X-Data-Source', data.source);
      response.code(200);
      return response;
    }
}

module.exports = getAlbumLikesHandler;