const {
    PostAuthenticationsPayloadSchema,
    PutAuthenticationsSchema,
    DeleteAuthenticationsSchema,
} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const AuthenticationsValidator = {
    validatePostAuthenticationsPayload: (payload) => {
        const validationResult = PostAuthenticationsPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

    validatePutAuthenticationsPayload: (payload) => {
        const validationResult = PutAuthenticationsSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

    validateDeleteAuthenticationsPayload: (payload) => {
        const validationResult = DeleteAuthenticationsSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
};

module.exports = AuthenticationsValidator;