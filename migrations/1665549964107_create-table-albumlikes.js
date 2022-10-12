/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('albumlikes', {
        id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
        },
        user_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        },
        album_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        },
    });
};

exports.down = pgm => {
    pgm.dropTable('albumlikes');
};
