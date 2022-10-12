const mapDBToModel = ({
    id,
    name,
    title,
    year,
    performer,
    genre,
    duration,
    inserted_at,
    updated_at,
    cover,
}) => ({
    id,
    name,
    title,
    year,
    performer,
    genre,
    duration,
    inserted_at,
    updated_at,
    coverUrl: cover,
});

module.exports = { mapDBToModel };