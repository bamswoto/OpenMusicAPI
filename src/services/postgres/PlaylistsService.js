const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
        throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

    async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal diverifikasi');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

    // async verifyPlaylistAccess(playlistId, userId) {
    //     try {
    //         await this.verifyPlaylistOwner(playlistId, userId);
    //     } catch (error) {
    //         if (error instanceof NotFoundError) {
    //             throw error;
    //         }
    //         try {
    //          await this._collaborationService.verifyCollaborator(playlistId, userId);   
    //         } catch {
    //             throw error;
    //         }
    //     }    
    // }

    // async addSongToPlaylist(playlistId, songId) {
    //     const querySong = {
    //         text: 'select * from songs where id = $1',
    //         values: [songId],
    //     };

    //     const result = await this._pool.query(querySong);
    //     if (!result.rowCount) {
    //         throw new NotFoundError('Lagu gagal ditambahkan ke playlist. Id lagu tidak ditemukan');
    //     }

    //     const id = 'playlistsong-' + nanoid(16);

    //     const query = {
    //         text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
    //         values: [id, playlistId, songId],
    //     };

    //     await this._pool.query(query);

    //     return result.rows[0].id;
    // }

    // async getSongsFromPlaylist(playlistId) {
    //     const playlistQuery = {
    //         text: 'select playlist.id, playlist.name, users.username from playlists inner join users on playlists.owner = users.id where playlists.id = $1',
    //         values: [playlistId],
    //     };

    //     const userQuery = {
    //         text: 'select users.username as username from users inner join playlists on users.id = playlists.owner where playlists.id = $1',
    //         values: [playlistId],
    //     };

    //     const query = {
    //         text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN playlistsongs ON songs.id = playlistsongs.song_id WHERE playlistsongs.playlist_id = $1',
    //         values: [playlistId],
    //     };

    //     const result = await this._pool.query(query);

    //     return result.rows;


    // }
}


module.exports = PlaylistsService;