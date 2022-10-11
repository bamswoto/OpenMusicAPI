const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
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
      text: 'SELECT playlists.id, playlists.name, users.username AS username FROM playlists LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id LEFT JOIN users ON users.id = playlists.owner WHERE playlists.owner = $1 OR collaborations.user_id = $1 GROUP BY (playlists.id, users.username)',
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
      text: 'SELECT owner FROM playlists WHERE id = $1',
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

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
             await this._collaborationsService.verifyCollaborator(playlistId, userId);   
            } catch {
                throw error;
            }
        }    
    }

    async addSongToPlaylist(playlistId, songId) {
        const querySong = {
            text: 'select * from songs where id = $1',
            values: [songId],
        };

        const result = await this._pool.query(querySong);
        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal ditambahkan ke playlist. Id lagu tidak ditemukan');
        }

        const id = 'playlistsong-' + nanoid(16);

        const query = {
            text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        await this._pool.query(query);

    }

    async getSongsFromPlaylist(playlistId) {
      const playlistQuery = {
        text: 'SELECT playlists.id, playlists.name, users.username FROM playlistsongs INNER JOIN playlists ON playlistsongs.playlist_id = playlists.id INNER JOIN users ON playlists.owner = users.id WHERE playlist_id = $1 LIMIT 1',
        values: [playlistId]
      };
  
      const userQuery = {
        text: 'SELECT username FROM users INNER JOIN playlists ON playlists.owner = users.id WHERE playlists.id = $1 LIMIT 1',
        values: [playlistId]
      };
  
      const songQuery = {
        text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN playlistsongs ON playlistsongs.song_id = songs.id WHERE playlist_id = $1',
        values: [playlistId]
      };
  
      const resultPlaylist = await this._pool.query(playlistQuery);
      const resultUser = await this._pool.query(userQuery);
      const resultSongs = await this._pool.query(songQuery);
  
      if (!resultPlaylist.rows.length) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }

      const { id, name } = resultPlaylist.rows[0];
      const { username } = resultUser.rows[0];
      const songs = resultSongs.rows;

      return {
        id,
        name,
        username,
        songs
      };


    }

    async deleteSongFromPlaylist(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Lagu gagal dihapus dari playlist');
        }
    }

    async addActivity(playlistId, songId, userId) {
      const songQuery = {
        text: 'SELECT title FROM songs WHERE id = $1',
        values: [songId]
      };
  
      const resultSong = await this._pool.query(songQuery);
      const title = resultSong.rows[0].title;
  
      const userQuery = {
        text: 'SELECT username FROM users WHERE id = $1',
        values: [userId]
      };
  
      const resultUser = await this._pool.query(userQuery);
      const username = resultUser.rows[0].username;
  
      const idActivity = 'activity-' + nanoid(16);
      const timeActivity = new Date().toISOString();
  
      const activityQuery = {
        text: 'INSERT INTO playlist_activities (id, playlist_id, song_id, user_id, action, time) VALUES ($1, $2, $3, $4, $5, $6)',
        values: [idActivity, playlistId, title, username, 'add', timeActivity]
      };
  
      await this._pool.query(activityQuery);
    }
  
    async deleteActivity(playlistId, songId, userId) {
      const songQuery = {
        text: 'SELECT title FROM songs WHERE id = $1',
        values: [songId]
      };
  
      const resultSong = await this._pool.query(songQuery);
      const title = resultSong.rows[0].title;
  
      const queryUser = {
        text: 'SELECT username FROM users WHERE id = $1',
        values: [userId]
      };
  
      const resultUser = await this._pool.query(queryUser);
      const username = resultUser.rows[0].username;
  
      const idActivity = 'activity-' + nanoid(16);
      const timeActivity = new Date().toISOString();
  
      const activityQuery = {
        text: 'INSERT INTO playlist_activities (id, playlist_id, song_id, user_id, action, time) VALUES ($1, $2, $3, $4, $5, $6)',
        values: [idActivity, playlistId, title, username, 'delete', timeActivity]
      };
  
      await this._pool.query(activityQuery);
    }
  
    async getPlaylistActivities(playlistId) {
      const query = {
        text: 'SELECT * FROM playlist_activities WHERE playlist_id = $1',
        values: [playlistId]
      };
  
      const result = await this._pool.query(query);
  
      if (!result.rows.length) {
        throw new NotFoundError('Tidak ada aktivitas');
      }
  
      const resultMap = result.rows.map(row => {
        return {
          username: row.user_id,
          title: row.song_id,
          action: row.action,
          time: row.time
        };
      });
  
      return {
        playlistId: playlistId,
        activities: resultMap
      };
    }
}


module.exports = PlaylistsService;