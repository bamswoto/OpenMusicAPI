
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class AlbumService{
    constructor(){
        this.albums = [];
    }
    addAlbum({name, year}){
        const id = nanoid(16);
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;
        const newAlbum = {
            id, name, year, insertedAt, updatedAt,
        };
        this.albums.push(newAlbum);
        const isSuccess = this.albums.filter((album) => album.id === id).length > 0;
        if(!isSuccess){
            throw new InvariantError('Album gagal ditambahkan');
        }
        return id;
    }

    getAlbums(){
        return this.albums;
    }

    getAlbumById(id){
        const album = this.albums.filter((n) => n.id === id)[0];
        if(!album){
            throw new NotFoundError('Album tidak ditemukan');
        }
        return album;
    }

    editAlbumById(id, {name, year}){

        const index = this.albums.findIndex((album) => album.id === id);
        if(index === -1){
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
        const updatedAt = new Date().toISOString();
        this.albums[index] = {
            ...this.albums[index],
            name,
            year,
            updatedAt,
        };
    }

    deleteAlbumById(id){
        const index = this.albums.findIndex((album) => album.id === id);
        if(index === -1){
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
        this.albums.splice(index, 1);
    }
}

module.exports = AlbumService;