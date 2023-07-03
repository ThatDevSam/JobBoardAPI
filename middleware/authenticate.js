const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {createCustomError} = require('../errors/customError')

//Middleware that will try to verify the jsonWeb token the client provides, and return the userID.
const auth = async (req, res, next) => {
    //check for the header, and that it is in the correct form.
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return next(createCustomError('Authentication failed', 401))
    }
    //Remove the 'Bearer ' part of the token.
    const token = authHeader.split(' ')[1]

    try {
        //Verify the token the user submited.
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        //Add a user property to the req object that can be used in other parts of the app.
        req.user = {userID:payload.userID, name:payload.name}
        next() //Pass along the new user information to the jobs route.
    } catch (error) {
        return next(createCustomError('Authentication failed', 401))
    }
}

module.exports = auth