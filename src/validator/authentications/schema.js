const Joi = require('joi');

const PostAuthenticationsPayloadSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

const PutAuthenticationsSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

const DeleteAuthenticationsSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

module.exports = { PostAuthenticationsPayloadSchema, PutAuthenticationsSchema, DeleteAuthenticationsSchema };