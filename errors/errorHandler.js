const {CustomError} = require('./customError')

//Function to send all error messages for the server.
const errorHandlerMiddleware = (err, req, res, next) => {
    //If the the error is an instance of the CustomError class send it as is.
    console.log(err)
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({ msg: err.message })
      }
    //If it is not an instance of that class, send this generic message.
    return res.status(500).json({ msg: 'Something went wrong, please try again' })
    }

module.exports = errorHandlerMiddleware