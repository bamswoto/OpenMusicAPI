const redis = require('redis');

class CacheService {
    constructor() {
        this._client = redis.createClient({
            socket: {
                host: process.env.REDIS_SERVER,
            },
        });
        this._client.on('error', (error) => {
            console.error(error);
        });

        this._client.connect();
    }

    async set(key, value, expirationInSecond = 1800) {
        this._client.set(key, value, {ex: expirationInSecond});
    }

    async get(key) {
        const result = await this._client.get(key);

        if(result === null) throw new Error('Key tidak ditemukan');

        return result;
    }

    async delete(key) {
        return this._client.del(key);
    }
}

module.exports = CacheService;