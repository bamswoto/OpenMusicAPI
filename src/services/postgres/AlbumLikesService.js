const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumLikesService {
  constructor( cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLike(albumId, userId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albumlikes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan like');
    }

    await this._cacheService.delete(`albumlikes:${albumId}`);

    return result.rows[0].id;
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM albumlikes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus like');
    }

    await this._cacheService.delete(`albumlikes:${albumId}`);
  }

  async checkAlbumLikes(albumId, userId) {
    const query = {
      text: 'SELECT * FROM albumlikes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    return result.rows.length;
  }

    async getAlbumLikes(albumId) {
        try {
            const result = await this._cacheService.get(`albumlikes:${albumId}`);
            return {
              count: JSON.parse(result),
              source: 'cache',
            };
          } catch (error) {
            const query = {
              text: 'SELECT * FROM albumlikes WHERE album_id = $1',
              values: [albumId],
            };

            const result = await this._pool.query(query);

            if (!result.rowCount) {
              throw new InvariantError('Album tidak memiliki like');
            }
      
            await this._cacheService.set(
              `albumlikes:${albumId}`,
              JSON.stringify(result.rowCount),
            );
      
            return {
              count: result.rowCount,
              source: 'db',
            };
        }
    }

}

module.exports = AlbumLikesService;