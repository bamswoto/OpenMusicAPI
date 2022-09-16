const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class AlbumsService{
    constructor(){
        this._pool = new Pool();
    }

    async addAlbum({name, year}){
        const id = nanoid(16);
        const created_at = new Date().toISOString();
        const updated_at = created_at;

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, year, created_at, updated_at],
        };

        const result = await this._pool.query(query);

        if(!result.rows[0].id){
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getAlbums(){
        const result = await this._pool.query('SELECT id, name, year FROM albums');
        return result.rows;
    }

    async getAlbumById(id){
        // const query = {
        //     text: 'SELECT a.id, a.name, a.year, b.title FROM albums as a INNER JOIN songs as b ON a.id = b.albumid WHERE a.id = $1',
        //     values: [id],
        // };
        // const result = await this._pool.query(query);
        // if(!result.rows.length){
        //     throw new NotFoundError('Album tidak ditemukan');
        // }
        // return result.rows[0];
        const query = {
            text: 'SELECT id, name, year FROM albums WHERE id = $1',
            values: [id],
        };

        const queryLagu = {
            text: 'SELECT id, title, performer FROM songs WHERE albumid = $1',
            values: [id],
        }

        const result = await this._pool.query(query);
        const resultLagu = await this._pool.query(queryLagu);

        if (!result.rows.length) {
            throw new NotFoundError("Album tidak ditemukan");
        }

        return { ...result.rows[0], songs: resultLagu.rows };
    }

    async editAlbumById(id, {name, year}){
        const updated_at = new Date().toISOString();
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updated_at, id],
        };
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id){
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = AlbumsService;