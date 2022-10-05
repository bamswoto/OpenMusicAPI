const ClientError = require("./ClientError");

class AuthorizationError extends ClientError {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

module.exports = AuthorizationError;