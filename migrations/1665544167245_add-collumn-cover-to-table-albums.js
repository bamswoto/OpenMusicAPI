
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumn('albums', {
        cover: {
        type: 'VARCHAR(1000)',
        },
    });
};

exports.down = pgm => {
    pgm.dropColumn('cover');
};
