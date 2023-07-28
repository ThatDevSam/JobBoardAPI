const { StatusCodes } = require('http-status-codes');
const CustomError = require('./customError');

class UnauthorizedError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

module.exports = UnauthorizedError;